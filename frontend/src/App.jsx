import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import StoryScreen from './components/StoryScreen';
import InvestorScreen from './components/InvestorScreen';
import LoadingScreen from './components/LoadingScreen';
import ParticleBackground from './components/ParticleBackground';
import SettingsModal from './components/SettingsModal';
import ThemeModal from './components/ThemeModal';
import StoryMemoryModal from './components/StoryMemoryModal';
import { startStory, continueStory, fetchHealth } from './utils/api';

function AppContent() {
  const { setTheme, updateSettings } = useTheme();

  const [screen, setScreen] = useState(() => {
    try {
      return localStorage.getItem('echoes_screen') || 'landing';
    } catch {
      return 'landing';
    }
  });

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try {
      return localStorage.getItem('echoes_language') || 'auto';
    } catch {
      return 'auto';
    }
  });

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [error, setError] = useState(null);
  const [aiLatencyMs, setAiLatencyMs] = useState(null);

  // Modals state
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Real-time voice state from StoryScreen — used by Navbar
  const [storyVoiceState, setStoryVoiceState] = useState('idle');
  const [rimeRuntimeStatus, setRimeRuntimeStatus] = useState('unknown');

  // Persistent Story Memory
  const [memory, setMemory] = useState(() => {
    try {
      const saved = localStorage.getItem('echoes_story_memory');
      return saved ? JSON.parse(saved) : {
        currentChapter: 1,
        character: "The Seeker",
        location: "Oakhaven Archives",
        importantObjects: ["Celestial Astrolabe", "Serpent Key", "Pulsing Grimoire"],
        relationships: ["The Silent Scribes"],
        choicesMade: [],
        storyFacts: ["Azure flame burns in the archives", "Archives contain the Codices of the First Dawn"],
        previousUserInstructions: []
      };
    } catch {
      return {
        currentChapter: 1,
        character: "The Seeker",
        location: "Oakhaven Archives",
        importantObjects: ["Celestial Astrolabe", "Serpent Key", "Pulsing Grimoire"],
        relationships: ["The Silent Scribes"],
        choicesMade: [],
        storyFacts: ["Azure flame burns in the archives", "Archives contain the Codices of the First Dawn"],
        previousUserInstructions: []
      };
    }
  });

  // Persistent Story State
  const [story, setStory] = useState(() => {
    try {
      const saved = localStorage.getItem('echoes_current_story');
      return saved ? JSON.parse(saved) : {
        title: '',
        chapter: 0,
        narrative: '',
        speechText: '',
        choices: [],
        isEnding: false,
        isDemoFallback: false
      };
    } catch {
      return {
        title: '',
        chapter: 0,
        narrative: '',
        speechText: '',
        choices: [],
        isEnding: false,
        isDemoFallback: false
      };
    }
  });

  const [storyHistory, setStoryHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('echoes_story_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent Conversation Transcript
  const [transcript, setTranscript] = useState(() => {
    try {
      const saved = localStorage.getItem('echoes_transcript');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [investorTranscript, setInvestorTranscript] = useState(() => {
    return [];
  });
  const [investorCategory, setInvestorCategory] = useState(() => {
    try { return localStorage.getItem('investor_category') || ''; } catch { return ''; }
  });
  const [investorFocus, setInvestorFocus] = useState('Balanced Mix');
  const [investorPersona, setInvestorPersona] = useState(() => {
    try { return localStorage.getItem('investor_persona') || 'stern'; } catch { return 'stern'; }
  });
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [demoPitch, setDemoPitch] = useState('');

  const [isProcessingChoice, setIsProcessingChoice] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const storyAbortRef = React.useRef(null);
  const storyRequestGenerationRef = React.useRef(0);

  const getCurrentTimeStr = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('echoes_screen', screen);
      localStorage.setItem('echoes_language', selectedLanguage);
      localStorage.setItem('echoes_story_memory', JSON.stringify(memory));
      localStorage.setItem('echoes_current_story', JSON.stringify(story));
      localStorage.setItem('echoes_story_history', JSON.stringify(storyHistory));
      localStorage.setItem('echoes_transcript', JSON.stringify(transcript));
      if (investorCategory) localStorage.setItem('investor_category', investorCategory);
      else localStorage.removeItem('investor_category');
      localStorage.setItem('investor_focus', investorFocus);
      localStorage.setItem('investor_persona', investorPersona);
    } catch (e) {}
  }, [screen, selectedLanguage, memory, story, storyHistory, transcript, investorTranscript, investorCategory, investorPersona, investorFocus]);

  // Initial Health Check
  useEffect(() => {
    fetchHealth().then(setHealthStatus);
  }, []);

  const appendTranscript = (roleOrSpeaker, text, extraMeta = {}) => {
    const newMsg = {
      id: Date.now() + Math.random(),
      speaker: roleOrSpeaker,
      role: roleOrSpeaker,
      text,
      timestamp: getCurrentTimeStr(),
      ...extraMeta
    };
    setTranscript((prev) => [...prev, newMsg]);
  };

  // Execute safe structured AI actions (No arbitrary JS execution)
  const executeSafeAction = (action) => {
    if (!action || !action.type) return;
    const { type, payload } = action;

    switch (type) {
      case 'change_theme':
        if (payload) {
          setTheme(payload);
          appendTranscript('control', `Theme switched to ${String(payload).toUpperCase()}`);
        }
        break;

      case 'change_language':
        if (payload) {
          setSelectedLanguage(payload);
          appendTranscript('control', `Spoken language switched to ${String(payload).toUpperCase()}`);
        }
        break;

      case 'change_text_size':
        if (payload === 'large' || payload === 'normal') {
          updateSettings({ fontSize: payload });
          appendTranscript('control', `Text size set to ${payload.toUpperCase()}`);
        }
        break;

      case 'change_narration_speed':
        if (typeof payload === 'number') {
          updateSettings({ narrationSpeed: payload });
          appendTranscript('control', `Narration pace adjusted to ${payload}x`);
        }
        break;

      case 'toggle_subtitles':
        updateSettings({ subtitles: Boolean(payload) });
        appendTranscript('control', `Live subtitles ${payload ? 'ENABLED' : 'DISABLED'}`);
        break;

      case 'toggle_animations':
        updateSettings({ animations: Boolean(payload) });
        appendTranscript('control', `Visual animations ${payload ? 'ENABLED' : 'REDUCED'}`);
        break;

      case 'remember_fact':
        if (payload) {
          setMemory((prev) => {
            const clean = String(payload).trim();
            const existingFacts = Array.isArray(prev.storyFacts) ? prev.storyFacts : [];
            const existingObjs = Array.isArray(prev.importantObjects) ? prev.importantObjects : [];
            const nextFacts = existingFacts.includes(clean) ? existingFacts : [...existingFacts, clean];
            const lower = clean.toLowerCase();
            const nextObjs = (lower.includes('key') || lower.includes('astrolabe') || lower.includes('grimoire') || lower.includes('relic') || lower.includes('stone') || lower.includes('sword') || lower.includes('book'))
              ? (existingObjs.includes(clean) ? existingObjs : [...existingObjs, clean])
              : existingObjs;
            return { ...prev, storyFacts: nextFacts, importantObjects: nextObjs };
          });
          appendTranscript('memory', `Memory stored: "${payload}" recorded into chronicle.`);
        }
        break;

      case 'delete_memory':
        if (payload) {
          const target = (typeof payload === 'object' ? payload.target : payload) || '';
          setMemory((prev) => {
            const query = target.toLowerCase();
            return {
              ...prev,
              storyFacts: (prev.storyFacts || []).filter(f => !f.toLowerCase().includes(query)),
              importantObjects: (prev.importantObjects || []).filter(o => !o.toLowerCase().includes(query))
            };
          });
          appendTranscript('memory', `Memory cleared: "${target}" removed from chronicle.`);
        }
        break;

      case 'start_new_story':
        appendTranscript('event', 'Starting new adventure by voice command.');
        handleRestartTale();
        break;

      default:
        console.warn('[Safe Action] Unrecognized action type:', type);
    }
  };

  const handleStartInvestor = (category, prefilledPitch = '', persona = 'stern', focus = 'Balanced Mix') => {
    storyRequestGenerationRef.current += 1;
    storyAbortRef.current?.abort();
    setInvestorCategory(category);
    setInvestorPersona(persona);
    setInvestorFocus(focus);
    setDemoPitch(prefilledPitch);
    setInvestorTranscript([]);
    try { localStorage.removeItem('investor_transcript'); } catch (e) {}
    setError(null);
    setLoading(true);
    setLoadingMessage('Session started');
    window.setTimeout(() => {
      setLoading(false);
      setLoadingMessage(null);
      setScreen('investor');
    }, 650);
  };

  // Start new tale
  const handleStartStory = async () => {
    setError(null);
    setLoading(true);
    setLoadingMessage('AI Investor Pitch Coach is preparing...');

    const requestGeneration = ++storyRequestGenerationRef.current;
    if (storyAbortRef.current) {
      try { storyAbortRef.current.abort(); } catch (e) {}
    }
    storyAbortRef.current = new AbortController();

    try {
      const { story: initialStory, latencyMs } = await startStory(
        selectedLanguage !== 'auto' ? selectedLanguage : 'en',
        storyAbortRef.current.signal
      );
      if (requestGeneration !== storyRequestGenerationRef.current) return;
      setAiLatencyMs(latencyMs);

      const updatedStory = {
        title: initialStory.title,
        chapter: initialStory.chapter,
        narrative: initialStory.narrative || initialStory.text,
        speechText: initialStory.speechText || initialStory.narrative || initialStory.text,
        choices: initialStory.choices || [],
        isEnding: Boolean(initialStory.isEnding),
        isDemoFallback: Boolean(initialStory.isDemoFallback)
      };

      setStory(updatedStory);
      setStoryHistory([]);

      if (initialStory.initialMemory) {
        setMemory(initialStory.initialMemory);
      }

      // Initialize transcript with story event and opening narrative
      setTranscript([
        {
          id: Date.now(),
          speaker: 'event',
          role: 'event',
          text: `✦ Tale begins: "${updatedStory.title}" (Chapter 1)`,
          timestamp: getCurrentTimeStr()
        },
        {
          id: Date.now() + 1,
          speaker: 'ai',
          role: 'ai',
          text: updatedStory.speechText || updatedStory.narrative,
          timestamp: getCurrentTimeStr()
        }
      ]);

      setScreen('story');
    } catch (err) {
      if (requestGeneration === storyRequestGenerationRef.current && err.name !== 'AbortError') {
        console.error('Failed to start story:', err);
        setError('The investor coach is momentarily quiet. Please speak again.');
      }
    } finally {
      if (requestGeneration === storyRequestGenerationRef.current) {
        setLoading(false);
        setLoadingMessage(null);
      }
    }
  };

  // Process user speech or text message
  const handleUserMessage = async ({ userInput, clearTranscript, systemFeedback, isInterruption }) => {
    if (clearTranscript) {
      setTranscript([]);
      try {
        localStorage.removeItem('echoes_transcript');
      } catch (e) {}
      return;
    }

    if (systemFeedback) {
      appendTranscript('system', systemFeedback);
      return;
    }

    if (isInterruption) {
      appendTranscript('interruption', '✦ Interruption: Narration halted by user speech');
      storyRequestGenerationRef.current += 1;
      if (storyAbortRef.current) {
        try { storyAbortRef.current.abort(); } catch (e) {}
      }
    }

    if (!userInput || userInput.trim() === '') return;

    // Append user's voice/text input to transcript
    appendTranscript('user', userInput);
    setIsProcessingChoice(true);
    setError(null);

    // Save history snapshot
    const updatedHistory = [
      ...storyHistory,
      {
        chapter: story.chapter,
        narrative: story.narrative,
        userInput
      }
    ];
    setStoryHistory(updatedHistory);

    if (storyAbortRef.current) {
      try { storyAbortRef.current.abort(); } catch (e) {}
    }
    const requestGeneration = ++storyRequestGenerationRef.current;
    storyAbortRef.current = new AbortController();

    try {
      const { story: nextStory, latencyMs } = await continueStory({
        title: story.title,
        chapter: story.chapter,
        storyHistory: updatedHistory,
        userInput,
        memory,
        language: selectedLanguage !== 'auto' ? selectedLanguage : 'en',
        signal: storyAbortRef.current.signal
      });
      if (requestGeneration !== storyRequestGenerationRef.current) return;

      setAiLatencyMs(latencyMs);

      // Check if memory updated
      if (nextStory.memory) {
        setMemory(nextStory.memory);
        if (nextStory.memory.character && nextStory.memory.character !== memory.character) {
          appendTranscript('memory', `Protagonist identity recorded: ${nextStory.memory.character}`);
        }
        if (nextStory.memory.location && nextStory.memory.location !== memory.location) {
          appendTranscript('memory', `New location reached: ${nextStory.memory.location}`);
        }
      }

      // Execute safe action if provided
      if (nextStory.action) {
        executeSafeAction(nextStory.action);
      }

      const updatedStory = {
        title: nextStory.title || story.title,
        chapter: nextStory.chapter,
        narrative: nextStory.narrative || nextStory.text,
        speechText: nextStory.speechText || nextStory.narrative || nextStory.text,
        choices: nextStory.choices || [],
        isEnding: Boolean(nextStory.isEnding),
        isDemoFallback: Boolean(nextStory.isDemoFallback)
      };

      setStory(updatedStory);

      // Record chapter event and AI spoken response
      if (updatedStory.chapter !== story.chapter) {
        appendTranscript('event', `✦ Chapter ${updatedStory.chapter} begins`);
      }
      appendTranscript('ai', updatedStory.speechText || updatedStory.narrative);
    } catch (err) {
      if (requestGeneration === storyRequestGenerationRef.current && err.name !== 'AbortError') {
        console.error('Failed to continue story:', err);
        setError('The investor coach encountered an unexpected disturbance. Please speak again.');
        appendTranscript('error', 'Arcane disturbance: could not complete spoken path.');
      }
    } finally {
      if (requestGeneration === storyRequestGenerationRef.current) {
        setIsProcessingChoice(false);
      }
    }
  };

  // Process choice selection
  const handleSelectChoice = async (choice, speechText) => {
    if (isProcessingChoice) return;

    const userText = speechText || choice.text;
    appendTranscript('user', userText);
    setIsProcessingChoice(true);
    setError(null);

    const updatedHistory = [
      ...storyHistory,
      {
        chapter: story.chapter,
        narrative: story.narrative,
        selectedChoice: choice,
        userInput: userText
      }
    ];
    setStoryHistory(updatedHistory);

    if (storyAbortRef.current) {
      try { storyAbortRef.current.abort(); } catch (e) {}
    }
    const requestGeneration = ++storyRequestGenerationRef.current;
    storyAbortRef.current = new AbortController();

    try {
      const { story: nextStory, latencyMs } = await continueStory({
        title: story.title,
        chapter: story.chapter,
        storyHistory: updatedHistory,
        selectedChoice: choice,
        userInput: userText,
        memory,
        language: selectedLanguage !== 'auto' ? selectedLanguage : 'en',
        signal: storyAbortRef.current.signal
      });
      if (requestGeneration !== storyRequestGenerationRef.current) return;

      setAiLatencyMs(latencyMs);

      if (nextStory.memory) {
        setMemory(nextStory.memory);
      }

      if (nextStory.action) {
        executeSafeAction(nextStory.action);
      }

      const updatedStory = {
        title: nextStory.title || story.title,
        chapter: nextStory.chapter,
        narrative: nextStory.narrative || nextStory.text,
        speechText: nextStory.speechText || nextStory.narrative || nextStory.text,
        choices: nextStory.choices || [],
        isEnding: Boolean(nextStory.isEnding),
        isDemoFallback: Boolean(nextStory.isDemoFallback)
      };

      setStory(updatedStory);
      if (updatedStory.chapter !== story.chapter) {
        appendTranscript('event', `✦ Chapter ${updatedStory.chapter} begins`);
      }
      appendTranscript('ai', updatedStory.speechText || updatedStory.narrative);
    } catch (err) {
      if (requestGeneration === storyRequestGenerationRef.current && err.name !== 'AbortError') {
        console.error('Failed to continue story:', err);
        setError('The investor coach could not understand the path. Please try speaking again.');
        appendTranscript('error', 'The investor coach could not understand the selected path.');
      }
    } finally {
      if (requestGeneration === storyRequestGenerationRef.current) {
        setIsProcessingChoice(false);
      }
    }
  };

  // Memory management
  const handleUpdateMemory = ({ clear }) => {
    if (clear) {
      const resetMemory = {
        currentChapter: 1,
        character: "The Seeker",
        location: "Oakhaven Archives",
        importantObjects: [],
        relationships: [],
        choicesMade: [],
        storyFacts: [],
        previousUserInstructions: []
      };
      setMemory(resetMemory);
      appendTranscript('memory', 'Story memory was reset.');
    }
  };

  // Restart tale
  const handleRestartTale = () => {
    storyRequestGenerationRef.current += 1;
    if (storyAbortRef.current) {
      try { storyAbortRef.current.abort(); } catch (e) {}
      storyAbortRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setStory({
      title: '',
      chapter: 0,
      narrative: '',
      speechText: '',
      choices: [],
      isEnding: false,
      isDemoFallback: false
    });
    setStoryHistory([]);
    setTranscript([]);
    setInvestorTranscript([]);
    try { localStorage.removeItem('investor_transcript'); } catch (e) {}
    try { localStorage.removeItem('investor_category'); } catch (e) {}
    setDemoPitch('');
    setError(null);
    setScreen('landing');
  };

  const isRimeConnected = Boolean(healthStatus?.services?.rime);
  const isLLMReady = Boolean(healthStatus?.services?.gemini || true);

  return (
    <div className="echoes-app-container">
      <ParticleBackground />

      <Navbar
        isRimeActive={isRimeConnected}
        rimeStatus={rimeRuntimeStatus}
        isRimeSpeaking={storyVoiceState === 'speaking'}
        isAIThinking={isProcessingChoice || storyVoiceState === 'thinking'}
        isListening={storyVoiceState === 'listening'}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={(lang) => setSelectedLanguage(lang)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenMemoryModal={() => setIsMemoryModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        rimeVoice="astra"
        onNewTale={handleRestartTale}
        inStory={screen === 'story'}
      />

      <div className="echoes-workspace-body">
        {loading ? (
          <LoadingScreen customMessage={loadingMessage} />
        ) : screen === 'landing' ? (
          <LandingPage
            onStart={(category, persona, focus) => handleStartInvestor(category, '', persona, focus)}
            isLoading={loading}
            selectedLanguage={selectedLanguage === 'auto' ? 'en' : selectedLanguage}
            onChangeLanguage={(lang) => setSelectedLanguage(lang)}
          />
        ) : screen === 'investor' ? (
          <InvestorScreen
            category={investorCategory}
            messages={investorTranscript}
            initialPitch={demoPitch}
            onMessagesChange={setInvestorTranscript}
            onRestart={handleRestartTale}
            onBack={handleRestartTale}
            selectedLanguage={selectedLanguage === 'auto' ? 'en' : selectedLanguage}
            persona={investorPersona}
            focus={investorFocus}
            onVoiceStateChange={setStoryVoiceState}
            onRimeStatusChange={setRimeRuntimeStatus}
            isHistoryOpen={isHistoryModalOpen}
            setIsHistoryOpen={setIsHistoryModalOpen}
          />
        ) : (
          <StoryScreen
            story={story}
            storyHistory={storyHistory}
            memory={memory}
            transcript={transcript}
            onUserMessage={handleUserMessage}
            onSelectChoice={handleSelectChoice}
            onUpdateMemory={handleUpdateMemory}
            onRestart={handleRestartTale}
            isProcessingChoice={isProcessingChoice}
            aiLatencyMs={aiLatencyMs}
            selectedLanguage={selectedLanguage}
            onChangeLanguage={(lang) => setSelectedLanguage(lang)}
            isThemeModalOpen={isThemeModalOpen}
            isMemoryModalOpen={isMemoryModalOpen}
            isSettingsModalOpen={isSettingsModalOpen}
            onCloseThemeModal={() => setIsThemeModalOpen(false)}
            onCloseMemoryModal={() => setIsMemoryModalOpen(false)}
            onCloseSettingsModal={() => setIsSettingsModalOpen(false)}
            onVoiceStateChange={setStoryVoiceState}
            onRimeStatusChange={setRimeRuntimeStatus}
            onOpenMemoryModal={() => setIsMemoryModalOpen(true)}
          />
        )}
      </div>

      {/* Standalone Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen && screen !== 'story'}
        onClose={() => setIsSettingsModalOpen(false)}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={(lang) => setSelectedLanguage(lang)}
      />
      {screen !== 'story' && (
        <>
          <ThemeModal
            isOpen={isThemeModalOpen}
            onClose={() => setIsThemeModalOpen(false)}
          />
          <StoryMemoryModal
            isOpen={isMemoryModalOpen}
            onClose={() => setIsMemoryModalOpen(false)}
            memory={memory}
            onClearMemory={() => handleUpdateMemory({ clear: true })}
            onStartNewStory={handleRestartTale}
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
