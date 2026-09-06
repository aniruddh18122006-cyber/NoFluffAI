import React, { useState } from 'react';
import { Mic, Send, Zap, Globe, Gauge } from 'lucide-react';

export default function VoiceInputBar({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  liveTranscript = '',
  onStartListening,
  onStopListening,
  onInterrupt,
  onSendText,
  selectedLanguage = 'auto',
  onChangeLanguage,
  aiLatencyMs = null,
  ttsLatencyMs = null
}) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText || inputText.trim() === '' || isThinking) return;
    onSendText(inputText.trim());
    setInputText('');
  };

  const handleVoiceButtonClick = () => {
    if (isSpeaking) {
      // User clicks mic while AI is speaking -> instant interruption!
      onInterrupt();
    } else if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="voice-input-bar-container" role="region" aria-label="Voice and text input dock">
      {/* Upper Telemetry Strip: Real Measured Metrics & Language */}
      <div className="input-telemetry-row">
        <div className="telemetry-item">
          <Globe size={13} color="#45E0D0" />
          <span className="telemetry-label">LANGUAGE:</span>
          <select
            className="language-select-dropdown"
            value={selectedLanguage}
            onChange={(e) => onChangeLanguage(e.target.value)}
            aria-label="Select spoken language"
          >
            <option value="auto">AUTO (Default)</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="es">Español (Spanish)</option>
            <option value="fr">Français (French)</option>
            <option value="de">Deutsch (German)</option>
            <option value="ja">日本語 (Japanese)</option>
          </select>
        </div>

        {/* Real measured performance metrics (zero fake numbers) */}
        {(aiLatencyMs !== null || ttsLatencyMs !== null) && (
          <div className="telemetry-item real-latency-badge" title="Measured pipeline response time">
            <Gauge size={13} color="#8B7CFF" />
            <span>
              {aiLatencyMs !== null && `AI: ${(aiLatencyMs / 1000).toFixed(2)}s`}
              {aiLatencyMs !== null && ttsLatencyMs !== null && ' | '}
              {ttsLatencyMs !== null && `RIME AUDIO: ${(ttsLatencyMs / 1000).toFixed(2)}s`}
            </span>
          </div>
        )}
      </div>

      {/* Live Transcript Strip */}
      {liveTranscript && (
        <div className="live-transcript-strip" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(69, 224, 208, 0.08)',
          border: '1px solid rgba(69, 224, 208, 0.25)',
          borderRadius: '6px',
          padding: '0.4rem 0.75rem',
          fontSize: '0.8rem',
          color: 'var(--accent-primary)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#57E6A5',
            boxShadow: '0 0 8px #57E6A5'
          }} />
          <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>HEARING:</span>
          <span style={{ fontStyle: 'italic', color: 'var(--text-main)', flex: 1 }}>"{liveTranscript}"</span>
        </div>
      )}

      {/* Main Multimodal Input Bar */}
      <div className="input-dock-row">
        {/* PRIMARY MICROPHONE ACTION BUTTON */}
        <button
          type="button"
          className={`btn-primary-mic ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking-interrupt' : ''}`}
          onClick={handleVoiceButtonClick}
          disabled={isThinking}
          aria-label={isSpeaking ? 'Interrupt AI and speak' : isListening ? 'Stop listening' : 'Start speaking'}
          title={isSpeaking ? 'Click to interrupt' : isListening ? 'Click to stop' : 'Click to speak'}
        >
          {isSpeaking ? (
            <div className="mic-action-content">
              <Zap size={20} color="#080B14" />
              <span>INTERRUPT</span>
            </div>
          ) : isListening ? (
            <div className="mic-action-content">
              <span className="mic-red-pulse" />
              <span>LISTENING...</span>
            </div>
          ) : (
            <div className="mic-action-content">
              <Mic size={20} color="#080B14" />
              <span>SPEAK</span>
            </div>
          )}
        </button>

        {/* Fallback Text Input Form */}
        <form className="text-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-text-input"
            placeholder="Speak or type to Echoes..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isThinking}
            aria-label="Text message to Echoes"
          />
          <button
            type="submit"
            className="btn-send-message"
            disabled={!inputText.trim() || isThinking}
            aria-label="Send text message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
