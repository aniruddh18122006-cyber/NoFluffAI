import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

/**
 * Intelligent matcher to link spoken phrases with available choices
 */
function matchSpokenTextToChoice(spokenText, choices) {
  if (!spokenText || !choices || choices.length === 0) return null;

  const normalizedSpoken = spokenText.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const spokenWords = normalizedSpoken.split(/\s+/).filter(w => w.length > 1);

  // 1. Check for direct Choice ID or Ordinal Match ("Option A", "Choice B", "First", "Second", etc.)
  const ordinalMap = {
    'first': 0, 'one': 0, '1': 0, '1st': 0,
    'second': 1, 'two': 1, '2': 1, '2nd': 1,
    'third': 2, 'three': 2, '3': 2, '3rd': 2,
    'fourth': 3, 'four': 3, '4': 3, '4th': 3
  };

  for (const [word, index] of Object.entries(ordinalMap)) {
    if (normalizedSpoken.includes(`option ${word}`) || 
        normalizedSpoken.includes(`choice ${word}`) ||
        normalizedSpoken === word ||
        normalizedSpoken.includes(`number ${word}`)) {
      if (choices[index]) return choices[index];
    }
  }

  // Check for letter matches: "option a", "choice a", "letter a", or just "a"
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i];
    const letter = (choice.id || String.fromCharCode(65 + i)).toLowerCase();
    
    // Explicit phrases like "option a", "choice b"
    if (normalizedSpoken.includes(`option ${letter}`) || 
        normalizedSpoken.includes(`choice ${letter}`) || 
        normalizedSpoken === letter) {
      return choice;
    }
  }

  // 2. Score choices based on word overlap and substring matches
  let bestScore = 0;
  let bestMatch = null;

  for (const choice of choices) {
    const normalizedChoice = choice.text.toLowerCase().replace(/[^\w\s]/g, '');
    const choiceWords = normalizedChoice.split(/\s+/).filter(w => w.length > 1);

    // Direct substring match
    if (normalizedChoice.includes(normalizedSpoken) || normalizedSpoken.includes(normalizedChoice)) {
      return choice;
    }

    // Keyword overlap count
    let matchCount = 0;
    for (const word of spokenWords) {
      if (choiceWords.some(cw => cw.includes(word) || word.includes(cw))) {
        matchCount++;
      }
    }

    const score = matchCount / Math.max(spokenWords.length, 1);
    if (score > bestScore && matchCount >= 1) {
      bestScore = score;
      bestMatch = choice;
    }
  }

  // Require reasonable confidence
  if (bestScore >= 0.25 || spokenWords.length === 1) {
    return bestMatch;
  }

  return null;
}

export default function VoiceInteraction({
  choices = [],
  onSelectChoice,
  disabled = false,
  isInterrupted = false,
  onResetInterrupted
}) {
  // States: 'ready' | 'listening' | 'processing' | 'understood' | 'unrecognized'
  const [status, setStatus] = useState('ready');
  const [transcript, setTranscript] = useState('');
  const [matchedChoiceText, setMatchedChoiceText] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus('listening');
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      setStatus('processing');

      // Attempt to match choice
      const match = matchSpokenTextToChoice(speechResult, choices);

      if (match) {
        setMatchedChoiceText(match.text);
        setStatus('understood');

        // Allow user to see "Choice heard" feedback before proceeding
        setTimeout(() => {
          onSelectChoice(match);
        }, 900);
      } else {
        setStatus('unrecognized');
      }
    };

    recognition.onerror = (event) => {
      console.warn('[Speech Recognition] Notice:', event.error);
      if (event.error === 'no-speech') {
        setStatus('unrecognized');
      } else {
        setStatus('ready');
      }
    };

    recognition.onend = () => {
      // If we were listening and got no results
      setStatus((current) => {
        if (current === 'listening') return 'unrecognized';
        return current;
      });
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch (e) {}
    };
  }, [choices, onSelectChoice]);

  // Handle triggered interruption
  useEffect(() => {
    if (isInterrupted && recognitionRef.current && !disabled) {
      startListening();
      if (onResetInterrupted) onResetInterrupted();
    }
  }, [isInterrupted, disabled]);

  const startListening = () => {
    if (!recognitionRef.current || disabled) return;

    try {
      setTranscript('');
      setMatchedChoiceText('');
      recognitionRef.current.abort();
      recognitionRef.current.start();
    } catch (err) {
      // In case it was already running
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 100);
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setStatus('ready');
  };

  return (
    <div className="voice-interaction-card" role="region" aria-label="Voice choice interaction">
      <div className="voice-card-header">
        <div className="voice-title-group">
          <span className="voice-section-title">✦ SPEAK YOUR CHOICE ✦</span>
          <span className="voice-subtext">Voice-native interactive choice mechanism</span>
        </div>

        {isInterrupted && (
          <div className="interrupted-badge" role="status">
            <Zap size={14} />
            <span>Narration Interrupted</span>
          </div>
        )}
      </div>

      <div className="voice-controls-row">
        {/* Main Microphone Button */}
        <button
          className={`mic-orb-btn ${status === 'listening' ? 'listening' : ''} ${status === 'understood' ? 'success' : ''}`}
          onClick={status === 'listening' ? stopListening : startListening}
          disabled={disabled || !isSupported}
          aria-label={status === 'listening' ? 'Stop listening' : 'Speak your choice'}
          title="Click to speak your choice"
        >
          {status === 'listening' ? (
            <div className="mic-pulse-rings">
              <span className="ring ring-1" />
              <span className="ring ring-2" />
              <Mic size={30} color="#FF5252" />
            </div>
          ) : (
            <Mic size={28} color="#0B0713" />
          )}
        </button>

        {/* State Status Feedback */}
        <div className="voice-status-content">
          {status === 'ready' && (
            <div className="voice-status-ready">
              <span className="status-main-label">Ready for Voice Command</span>
              <span className="status-hint">
                Press the microphone or say your choice: <br />
                <em>"Option A"</em>, <em>"{choices[0]?.text?.slice(0, 32)}..."</em>
              </span>
            </div>
          )}

          {status === 'listening' && (
            <div className="voice-status-listening">
              <span className="status-main-label pulse-red">🔴 Listening to your voice...</span>
              <span className="status-hint">Speak your decision now</span>
            </div>
          )}

          {status === 'processing' && (
            <div className="voice-status-processing">
              <Sparkles size={16} className="spin-slow" color="#E0BD72" />
              <span className="status-main-label">Divining your words...</span>
            </div>
          )}

          {status === 'understood' && (
            <div className="voice-status-understood">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6EE7B7' }}>
                <CheckCircle2 size={18} />
                <span className="status-main-label">Choice Understood!</span>
              </div>
              <span className="status-matched-choice">"{matchedChoiceText}"</span>
            </div>
          )}

          {status === 'unrecognized' && (
            <div className="voice-status-unrecognized">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FCA5A5' }}>
                <AlertCircle size={16} />
                <span className="status-main-label">Could not discern your choice</span>
              </div>
              <span className="status-hint">
                Heard: "{transcript || '(silence)'}". <br />
                Try saying <em>"Option A"</em>, <em>"Option B"</em>, or click a choice below.
              </span>
            </div>
          )}

          {!isSupported && (
            <div className="voice-unsupported-note">
              Web Speech recognition is not available on this browser. Please use the clickable choices below.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
