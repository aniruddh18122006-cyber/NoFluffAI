import React from 'react';
import { Mic, Cpu, Radio, Globe, Brain } from 'lucide-react';

export default function AIStateBar({
  voiceState = 'idle',
  isRimeActive = true,
  isAIThinking = false,
  selectedLanguage = 'auto',
  memoryCount = 0
}) {
  const isListening = voiceState === 'listening';
  const isSpeaking = voiceState === 'speaking';
  const isInterrupted = voiceState === 'interrupted';

  return (
    <section className="ai-state-bar-container" aria-label="System status telemetry">
      <div className="state-bar-track">
        {/* Voice Input */}
        <div className="state-cell">
          <div className="state-cell-header">
            <Mic size={12} color="#45E0D0" />
            <span className="state-cell-title">VOICE INPUT</span>
          </div>
          <div className="state-cell-value">
            <span className={`state-dot ${isListening ? 'listening' : isInterrupted ? 'interrupted' : 'ready'}`} />
            <span>{isListening ? 'LISTENING' : isInterrupted ? 'INTERRUPTED' : 'READY'}</span>
          </div>
        </div>

        {/* AI Agent */}
        <div className="state-cell">
          <div className="state-cell-header">
            <Cpu size={12} color="#8B7CFF" />
            <span className="state-cell-title">AI</span>
          </div>
          <div className="state-cell-value">
            <span className={`state-dot ${isAIThinking || voiceState === 'thinking' ? 'thinking' : 'ready'}`} />
            <span>{isAIThinking || voiceState === 'thinking' ? 'THINKING' : 'READY'}</span>
          </div>
        </div>

        {/* Rime TTS */}
        <div className="state-cell">
          <div className="state-cell-header">
            <Radio size={12} color="#45E0D0" />
            <span className="state-cell-title">RIME TTS</span>
          </div>
          <div className="state-cell-value">
            <span className={`state-dot ${isSpeaking ? 'speaking' : isRimeActive ? 'ready' : 'offline'}`} />
            <span>{isSpeaking ? 'SPEAKING' : isRimeActive ? 'READY' : 'FALLBACK'}</span>
          </div>
        </div>

        {/* Language */}
        <div className="state-cell">
          <div className="state-cell-header">
            <Globe size={12} color="#45E0D0" />
            <span className="state-cell-title">LANGUAGE</span>
          </div>
          <div className="state-cell-value">
            <span className="state-dot ready" />
            <span className="text-uppercase">{selectedLanguage || 'AUTO'}</span>
          </div>
        </div>

        {/* Memory */}
        <div className="state-cell">
          <div className="state-cell-header">
            <Brain size={12} color="#8B7CFF" />
            <span className="state-cell-title">MEMORY</span>
          </div>
          <div className="state-cell-value">
            <span className="state-dot ready" />
            <span>ACTIVE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
