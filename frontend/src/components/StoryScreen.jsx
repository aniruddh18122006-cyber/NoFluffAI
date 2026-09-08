import React, { useState, useEffect, useRef } from 'react';
import VoiceCore from './VoiceCore';
import ConversationStream from './ConversationStream';
import StoryCard from './StoryCard';
import InteractiveChoices from './InteractiveChoices';
import VoiceInputBar from './VoiceInputBar';
import StoryMemoryModal from './StoryMemoryModal';
import ThemeModal from './ThemeModal';
import SettingsModal from './SettingsModal';
import AIStateBar from './AIStateBar';
import EndingScreen from './EndingScreen';
import { fetchTTSAudio } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

/**
 * Intelligent fuzzy / keyword matcher for choices
 */
function matchSpokenTextToChoice(spokenText, choices) {
  if (!spokenText || !choices || choices.length === 0) return null;

  const normalized = spokenText.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const spokenWords = normalized.split(/\s+/).filter(w => w.length > 1);

  // Ordinal & Number matches
  const ordinalMap = {
    first: 0, one: 0, '1': 0, '1st': 0,
    second: 1, two: 1, '2': 1, '2nd': 1,
    third: 2, three: 2, '3': 2, '3rd': 2,
    fourth: 3, four: 3, '4': 3, '4th': 3
  };

  for (const [word, index] of Object.entries(ordinalMap)) {
    if (
      normalized.includes(`option ${word}`) ||
      normalized.includes(`choice ${word}`) ||
      normalized === word ||
      normalized.includes(`number ${word}`)
    ) {
      if (choices[index]) return choices[index];
    }
  }

  // Letter matches ("option a", "a", etc.)
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i];
    const letter = (choice.id || String.fromCharCode(65 + i)).toLowerCase();
    if (
      normalized.includes(`option ${letter}`) ||
      normalized.includes(`choice ${letter}`) ||
      normalized === letter
    ) {
      return choice;
    }
  }

  // Keyword overlap
  let bestScore = 0;
  let bestMatch = null;

  for (const choice of choices) {
    const normChoice = choice.text.toLowerCase().replace(/[^\w\s]/g, '');
    const choiceWords = normChoice.split(/\s+/).filter(w => w.length > 1);

    if (normChoice.includes(normalized) || normalized.includes(normChoice)) {
      return choice;
    }

    let matchCount = 0;
    for (const w of spokenWords) {
      if (choiceWords.some(cw => cw.includes(w) || w.includes(cw))) {
        matchCount++;
      }
    }

    const score = matchCount / Math.max(spokenWords.length, 1);
    if (score > bestScore && matchCount >= 1) {
      bestScore = score;
      bestMatch = choice;
    }
  }

  if (bestScore >= 0.25 || spokenWords.length === 1) {
    return bestMatch;
  }

  return null;
}

function getDeliverySpeed(text, baseSpeed) {
  const tenseMarkers = /danger|attack|run|urgent|chase|shadow|alarm|threat|panic|hurry|escape|pursue/i;
  return tenseMarkers.test(text) ? Math.min(baseSpeed, 0.88) : baseSpeed;
}

export default function StoryScreen({
  story,
  storyHistory,
  memory,
  transcript,
  onUserMessage,
  onSelectChoice,
  onUpdateMemory,
  onRestart,
  isProcessingChoice,
  aiLatencyMs,
  selectedLanguage = 'auto',
  onChangeLanguage,
  isThemeModalOpen,
  isMemoryModalOpen,
  isSettingsModalOpen,
  onCloseThemeModal,
  onCloseMemoryModal,
  onCloseSettingsModal,
  onVoiceStateChange,
  onRimeStatusChange,
  onOpenMemoryModal
}) {
  const { setTheme, settings, updateSettings } = useTheme();

  // Voice Core state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted' | 'error'
  const [voiceState, setVoiceState] = useState('thinking');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [detectedVoiceText, setDetectedVoiceText] = useState(null);
  const [matchedChoiceId, setMatchedChoiceId] = useState(null);

  // Audio State & Latency
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRimeActive, setIsRimeActive] = useState(false);
  const [ttsLatencyMs, setTtsLatencyMs] = useState(null);

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const ttsRequestGenerationRef = useRef(0);
  const interruptionHandledRef = useRef(false);
  const voiceStateRef = useRef(voiceState);
  voiceStateRef.current = voiceState;

  // Notify parent (App.jsx) whenever voiceState changes — used by Navbar
  useEffect(() => {
    if (onVoiceStateChange) onVoiceStateChange(voiceState);
  }, [voiceState, onVoiceStateChange]);

  // Map language code to speech recognition lang string
  const getRecognitionLang = (lang) => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'es': return 'es-ES';
      case 'fr': return 'fr-FR';
      case 'de': return 'de-DE';
      case 'ja': return 'ja-JP';
      case 'en':
      case 'auto':
      default: return 'en-US';
    }
  };

  // Safe starter for speech recognition
  const startRecognitionSafe = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.abort();
    } catch (e) {}
    try {
      recognitionRef.current.start();
    } catch (e) {
      // If already started or browser busy, ignore
    }
  };

  // Stop all active audio and cancel pending requests
  const stopAudio = () => {
    ttsRequestGenerationRef.current += 1;
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {}
      abortControllerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const replaceAudioUrl = (nextUrl) => {
    if (audioUrlRef.current && audioUrlRef.current !== nextUrl) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
    audioUrlRef.current = nextUrl || null;
    setAudioUrl(nextUrl);
  };

  // 1. Initialize Speech Recognition with continuous stream & interim results
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Echoes Voice] Web SpeechRecognition is not supported in this browser.');
      onUserMessage({
        systemFeedback: 'Notice: Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge for native voice speech-to-text, or use the text input below.'
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getRecognitionLang(selectedLanguage);

    recognition.onstart = () => {
      // When recognition begins, set listening if not speaking or thinking
      if (voiceStateRef.current !== 'speaking' && voiceStateRef.current !== 'thinking') {
        setVoiceState('listening');
      }
    };

    recognition.onspeechstart = () => {
      // True interruption: If user speaks while Rime audio is actively playing, interrupt immediately!
      if (voiceStateRef.current === 'speaking' && !interruptionHandledRef.current) {
        interruptionHandledRef.current = true;
        stopAudio();
        setVoiceState('interrupted');
        onUserMessage({ isInterruption: true });
        setTimeout(() => {
          setVoiceState('listening');
        }, 180);
      }
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const liveText = (interim || final).trim();
      if (liveText) {
        setLiveTranscript(liveText);
      }

      // True interruption trigger on interim speech while Rime is speaking
      if (voiceStateRef.current === 'speaking' && !interruptionHandledRef.current) {
        interruptionHandledRef.current = true;
        stopAudio();
        setVoiceState('interrupted');
        onUserMessage({ isInterruption: true });
        setTimeout(() => {
          setVoiceState('listening');
        }, 180);
      }

      if (final && final.trim()) {
        const speechResult = final.trim();
        setDetectedVoiceText(speechResult);
        setLiveTranscript('');
        handleUserInput(speechResult);
        interruptionHandledRef.current = false;
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        console.warn('[Speech Recognition] Microphone permission denied');
        setVoiceState('error');
        onUserMessage({
          systemFeedback: 'Microphone permission was denied. Please allow microphone access in your browser address bar to speak naturally.'
        });
      } else if (event.error === 'no-speech') {
        // Normal pause in user speech
      } else {
        console.warn('[Speech Recognition] Notice:', event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we should be listening or primed during speech
      if (voiceStateRef.current === 'listening') {
        setTimeout(() => {
          if (voiceStateRef.current === 'listening') {
            startRecognitionSafe();
          }
        }, 150);
      } else if (voiceStateRef.current === 'speaking') {
        setTimeout(() => {
          if (voiceStateRef.current === 'speaking') {
            startRecognitionSafe();
          }
        }, 200);
      }
    };

    recognitionRef.current = recognition;

    // Start recognition initially
    startRecognitionSafe();

    return () => {
      try {
        recognition.abort();
      } catch (e) {}
    };
  }, [selectedLanguage]);

  // Keyboard shortcut listener for instantaneous interruption
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.key === 'Escape') && voiceState === 'speaking') {
        e.preventDefault();
        handleInterrupt();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceState]);

  // 2. Handle Audio Narration when new Chapter or AI Speech arrives
  useEffect(() => {
    let isCancelled = false;
    setDetectedVoiceText(null);
    setMatchedChoiceId(null);
    setLiveTranscript('');

    const speechText = story?.speechText || story?.narrative || story?.text;
    if (!speechText) return;

    const synthesizeAudio = async () => {
      setVoiceState('thinking');
      stopAudio();
      interruptionHandledRef.current = false;

      const requestGeneration = ttsRequestGenerationRef.current;
      abortControllerRef.current = new AbortController();

      try {
        const res = await fetchTTSAudio(speechText, {
          language: selectedLanguage,
          speedAlpha: getDeliverySpeed(speechText, settings.narrationSpeed || 0.95),
          signal: abortControllerRef.current.signal
        });

        if (isCancelled || requestGeneration !== ttsRequestGenerationRef.current) return;

        setTtsLatencyMs(res.latencyMs);

        if (res.fallback) {
          onRimeStatusChange?.('fallback');
          setIsRimeActive(false);
          replaceAudioUrl(null);
          onUserMessage({
            systemFeedback: res.message || 'Rime TTS API unconfigured/offline. Utilizing browser voice narration fallback.'
          });
          playFallbackSpeech(speechText, requestGeneration);
        } else {
          onRimeStatusChange?.('active');
          setIsRimeActive(true);
          replaceAudioUrl(res.audioUrl);
        }
      } catch (err) {
        if (!isCancelled && err.name !== 'AbortError') {
          console.warn('[Voice Pipeline] Synthesis error:', err);
          onRimeStatusChange?.('error');
          setIsRimeActive(false);
          replaceAudioUrl(null);
          setVoiceState('idle');
        }
      }
    };

    synthesizeAudio();

    return () => {
      isCancelled = true;
      stopAudio();
    };
  }, [story?.chapter, story?.speechText, story?.narrative, selectedLanguage, settings.narrationSpeed]);

  useEffect(() => () => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  // Browser SpeechSynthesis Fallback
  const playFallbackSpeech = (text, requestGeneration = ttsRequestGenerationRef.current) => {
    if (!('speechSynthesis' in window)) {
      setVoiceState('idle');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.narrationSpeed || 0.95;

    // Set voice language
    if (selectedLanguage && selectedLanguage !== 'auto') {
      utterance.lang = getRecognitionLang(selectedLanguage);
    }

    utterance.onstart = () => {
      if (requestGeneration !== ttsRequestGenerationRef.current) return;
      setVoiceState('speaking');
      startRecognitionSafe();
    };

    utterance.onend = () => {
      if (requestGeneration !== ttsRequestGenerationRef.current) return;
      handleAudioEnded();
    };

    utterance.onerror = () => {
      if (requestGeneration !== ttsRequestGenerationRef.current) return;
      setVoiceState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Autoplay Rime Audio
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setVoiceState('speaking');
            // Prime speech recognition for live voice interruption while audio is playing!
            startRecognitionSafe();
          })
          .catch(err => {
            console.log('[Echoes Voice] Autoplay policy prevented immediate playback. Click to speak or play.');
            setVoiceState('idle');
          });
      }
    }
  }, [audioUrl]);

  const handleAudioEnded = () => {
    const requestGeneration = ttsRequestGenerationRef.current;
    setVoiceState('idle');
    // When narration finishes, automatically enter LISTENING mode so user speaks naturally!
    setTimeout(() => {
      if (voiceStateRef.current === 'idle' && requestGeneration === ttsRequestGenerationRef.current) {
        setVoiceState('listening');
        startRecognitionSafe();
      }
    }, 350);
  };

  // 3. User Input Orchestration (Voice or Text)
  const handleUserInput = (inputText) => {
    if (!inputText || inputText.trim() === '') return;

    // Check if user is speaking while audio is actively playing -> Live Interruption!
    if (voiceState === 'speaking') {
      stopAudio();
      setVoiceState('interrupted');
    } else {
      setVoiceState('thinking');
    }

    const lower = inputText.toLowerCase().trim();

    // Check for Safe Client Actions:
    // A. Theme Commands
    const themes = ['aurora', 'midnight', 'ocean', 'violet', 'emerald', 'sunset'];
    for (const t of themes) {
      if (lower.includes(`${t} theme`) || lower.includes(`switch to ${t}`) || lower.includes(`change to ${t}`) || (t === 'violet' && lower.includes('more purple'))) {
        setTheme(t);
        onUserMessage({
          userInput: inputText,
          systemFeedback: `Theme switched to ${t.toUpperCase()}`
        });
        setVoiceState('idle');
        return;
      }
    }

    if (lower === 'pause' || lower === 'pause narration' || lower === 'stop' || lower === 'stop speaking' || lower === 'quiet') {
      stopAudio();
      setVoiceState('idle');
      onUserMessage({ userInput: inputText, systemFeedback: 'Narration stopped. Say continue or speak a new request.' });
      return;
    }

    if (lower === 'continue' || lower === 'continue narration' || lower === 'listen') {
      handleStartListening();
      onUserMessage({ userInput: inputText, systemFeedback: 'Listening for your next request.' });
      return;
    }

    if (lower === 'repeat' || lower === 'repeat that' || lower === 'replay') {
      const text = story?.speechText || story?.narrative || story?.text;
      if (text) handleReplayNarration(text);
      return;
    }

    if (lower === 'show memory' || lower === 'open memory' || lower.includes('what is in my memory')) {
      onOpenMemoryModal?.();
      onUserMessage({ userInput: inputText, systemFeedback: 'Story memory opened.' });
      setVoiceState('idle');
      return;
    }

    if (lower === 'start a new story' || lower === 'start new story' || lower === 'start over' || lower === 'restart story') {
      onRestart();
      return;
    }

    // B. Language Commands
    const langMap = { hindi: 'hi', spanish: 'es', french: 'fr', german: 'de', japanese: 'ja', english: 'en' };
    for (const [langName, code] of Object.entries(langMap)) {
      if (lower.includes(`change language to ${langName}`) || lower.includes(`speak in ${langName}`) || lower.includes(`switch to ${langName}`)) {
        if (onChangeLanguage) onChangeLanguage(code);
        onUserMessage({
          userInput: inputText,
          systemFeedback: `Language changed to ${langName.toUpperCase()}`
        });
        setVoiceState('idle');
        return;
      }
    }

    // C. Settings Commands
    if (lower.includes('larger text') || lower.includes('make the text larger') || lower.includes('bigger text')) {
      updateSettings({ fontSize: 'large' });
      onUserMessage({ userInput: inputText, systemFeedback: 'Text size set to LARGE' });
      setVoiceState('idle');
      return;
    }
    if (lower.includes('normal text') || lower.includes('smaller text')) {
      updateSettings({ fontSize: 'normal' });
      onUserMessage({ userInput: inputText, systemFeedback: 'Text size set to NORMAL' });
      setVoiceState('idle');
      return;
    }
    if (lower.includes('turn animations off') || lower.includes('disable animations') || lower.includes('reduce motion')) {
      updateSettings({ animations: false });
      onUserMessage({ userInput: inputText, systemFeedback: 'Visual animations REDUCED' });
      setVoiceState('idle');
      return;
    }
    if (lower.includes('turn animations on') || lower.includes('enable animations')) {
      updateSettings({ animations: true });
      onUserMessage({ userInput: inputText, systemFeedback: 'Visual animations ENABLED' });
      setVoiceState('idle');
      return;
    }

    // D. Narrative Choice Match
    const choiceMatch = matchSpokenTextToChoice(inputText, story?.choices || []);
    if (choiceMatch) {
      setMatchedChoiceId(choiceMatch.id || choiceMatch.text);
      onSelectChoice(choiceMatch, inputText);
      return;
    }

    // E. Natural Dialogue / Memory Mutation Command
    onUserMessage({ userInput: inputText });
  };

  // 4. Live Interruption Handler
  const handleInterrupt = () => {
    stopAudio();
    setVoiceState('interrupted');

    // Instantly activate microphone to listen to user's new request
    setTimeout(() => {
      try {
        setDetectedVoiceText(null);
        recognitionRef.current?.abort();
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('[Interruption] Auto-mic activation:', e);
      }
    }, 150);
  };

  const handleStartListening = () => {
    stopAudio();
    try {
      setDetectedVoiceText(null);
      recognitionRef.current?.abort();
      recognitionRef.current?.start();
    } catch (e) {
      try {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  const handleStopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setVoiceState('idle');
  };

  const handleReplayNarration = (text) => {
    stopAudio();
    setVoiceState('thinking');
    const requestGeneration = ttsRequestGenerationRef.current;
    abortControllerRef.current = new AbortController();
    fetchTTSAudio(text, {
      language: selectedLanguage,
      speedAlpha: getDeliverySpeed(text, settings.narrationSpeed || 0.95),
      signal: abortControllerRef.current.signal
    }).then((res) => {
      if (requestGeneration !== ttsRequestGenerationRef.current) return;
      if (!res.fallback && res.audioUrl) {
        onRimeStatusChange?.('active');
        setIsRimeActive(true);
        replaceAudioUrl(res.audioUrl);
      } else {
        onRimeStatusChange?.('fallback');
        setIsRimeActive(false);
        playFallbackSpeech(text, requestGeneration);
      }
    }).catch((err) => {
      if (err.name !== 'AbortError' && requestGeneration === ttsRequestGenerationRef.current) {
        setVoiceState('idle');
      }
    });
  };

  if (story?.isEnding) {
    return (
      <div className="ending-screen-wrapper">
        <EndingScreen
          title={story.title}
          chapter={story.chapter}
          text={story.narrative || story.text}
          storyHistory={storyHistory}
          onRestart={onRestart}
        />
      </div>
    );
  }

  return (
    <div className="echoes-main-viewport">
      {/* Hidden Audio Element for Rime Stream */}
      {isRimeActive && audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
        />
      )}

      {/* Main Workspace Layout */}
      <div className="echoes-workspace-grid">
        {/* Left Column: Live Conversation Stream */}
        <aside className="workspace-column column-conversation">
          <ConversationStream
            messages={transcript}
            onReplayAudio={handleReplayNarration}
            onClearConversation={() => onUserMessage({ clearTranscript: true })}
          />
        </aside>

        {/* Center/Right Column: Core Voice Agent Centerpiece & Story */}
        <main className="workspace-column column-voice-core" role="main">
          {/* Central Voice Core */}
          <div className="voice-core-hero-section">
            <VoiceCore
              state={voiceState}
              isRimeActive={isRimeActive}
              onOrbClick={voiceState === 'speaking' ? handleInterrupt : handleStartListening}
            />

            {/* Subtitles Overlay Banner (If Enabled) */}
            {settings.subtitles && voiceState === 'speaking' && (
              <div className="voice-subtitles-caption" role="status" aria-live="polite">
                <span>"{story?.speechText || story?.narrative}"</span>
              </div>
            )}
          </div>

          {/* Current Story Card */}
          <StoryCard
            title={story?.title}
            chapter={story?.chapter}
            narrative={story?.narrative || story?.text}
            isEnding={story?.isEnding}
          />

          {/* Available Narrative Choices */}
          <InteractiveChoices
            choices={story?.choices}
            matchedChoiceId={matchedChoiceId}
            detectedVoiceText={detectedVoiceText}
            onSelectChoice={onSelectChoice}
            disabled={isProcessingChoice}
          />

          {/* Multimodal Input Bar (Voice Primary + Text Fallback) */}
          <VoiceInputBar
            isListening={voiceState === 'listening'}
            isSpeaking={voiceState === 'speaking'}
            isThinking={voiceState === 'thinking' || isProcessingChoice}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onInterrupt={handleInterrupt}
            onSendText={handleUserInput}
            selectedLanguage={selectedLanguage}
            onChangeLanguage={onChangeLanguage}
            aiLatencyMs={aiLatencyMs}
            ttsLatencyMs={ttsLatencyMs}
            liveTranscript={liveTranscript}
          />

          {/* Live AI State Bar */}
          <AIStateBar
            voiceState={voiceState}
            isRimeActive={isRimeActive}
            isAIThinking={isProcessingChoice}
            selectedLanguage={selectedLanguage}
            memoryCount={Object.keys(memory || {}).length}
          />
        </main>
      </div>

      {/* Theme Selection Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={onCloseThemeModal}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={onCloseSettingsModal}
      />

      {/* Story Memory Inspector Modal */}
      <StoryMemoryModal
        isOpen={isMemoryModalOpen}
        onClose={onCloseMemoryModal}
        memory={memory}
        onClearMemory={() => onUpdateMemory({ clear: true })}
        onStartNewStory={onRestart}
      />
    </div>
  );
}
