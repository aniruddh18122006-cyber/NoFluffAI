import React from 'react';
import { Mic, Volume2, Sparkles, AlertCircle, Zap } from 'lucide-react';

export default function VoiceCore({ state = 'idle', isRimeActive = true, onOrbClick }) {
  return (
    <div className="voice-core-container" aria-label={`Voice Core state: ${state}`}>
      {/* Concentric Aurora Wave Rings */}
      <div className={`aurora-ring ring-outer ${state}`} />
      <div className={`aurora-ring ring-middle ${state}`} />
      <div className={`aurora-ring ring-inner ${state}`} />

      {/* Central Living Voice Sphere */}
      <button
        type="button"
        className={`voice-core-orb ${state}`}
        onClick={onOrbClick}
        aria-label={`Voice Core state: ${state}. Click to interact.`}
        title={state === 'speaking' ? 'Click to interrupt' : 'Click to talk to the investor coach'}
      >
        <div className="orb-aurora-glow" />

        <div className="orb-center-content">
          {state === 'idle' && (
            <div className="orb-symbol-stack">
              <Sparkles size={38} className="symbol-cyan-glow" />
              <span className="orb-state-tag">✦ READY</span>
              <span className="orb-sub-tag">"Talk to the investor coach"</span>
            </div>
          )}

          {state === 'listening' && (
            <div className="orb-symbol-stack">
              <div className="listening-pulse-dot" />
              <span className="orb-state-tag tag-listening">● LISTENING</span>
              <span className="orb-sub-tag">Speak naturally...</span>
            </div>
          )}

          {state === 'thinking' && (
            <div className="orb-symbol-stack">
              <Sparkles size={38} className="symbol-spin-violet" />
              <span className="orb-state-tag tag-thinking">✦ THINKING</span>
              <span className="orb-sub-tag">Divining words...</span>
            </div>
          )}

          {state === 'speaking' && (
            <div className="orb-symbol-stack">
              <div className="speaking-waveform-bars" aria-hidden="true">
                <span className="bar bar-1" />
                <span className="bar bar-2" />
                <span className="bar bar-3" />
                <span className="bar bar-4" />
                <span className="bar bar-5" />
                <span className="bar bar-6" />
                <span className="bar bar-7" />
              </div>
              <span className="orb-state-tag tag-speaking">◉ SPEAKING</span>
              <span className="orb-sub-tag">{isRimeActive ? 'Rime Spoken Audio' : 'Voice Narration'}</span>
            </div>
          )}

          {state === 'interrupted' && (
            <div className="orb-symbol-stack">
              <span className="symbol-pause">Ⅱ</span>
              <span className="orb-state-tag tag-interrupted">INTERRUPTED</span>
              <span className="orb-sub-tag">Listening again...</span>
            </div>
          )}

          {state === 'error' && (
            <div className="orb-symbol-stack">
              <AlertCircle size={36} color="#F87171" />
              <span className="orb-state-tag tag-error">! ISSUE</span>
              <span className="orb-sub-tag">Voice Connection Issue</span>
            </div>
          )}
        </div>
      </button>

      {/* State Telemetry Capsule */}
      <div className="voice-core-pill">
        <span className={`core-pill-dot ${state}`} />
        <span className="core-pill-label">
          {state === 'idle' && 'READY ✦ "TALK TO INVESTOR COACH"'}
          {state === 'listening' && 'CAPTURING NATURAL SPEECH'}
          {state === 'thinking' && 'PROCESSING INTENT & LORE'}
          {state === 'speaking' && (isRimeActive ? 'RIME TTS SPOKEN OUTPUT ACTIVE' : 'VOICE NARRATION ACTIVE')}
          {state === 'interrupted' && 'SPEECH INTERRUPTED — LISTENING FOR NEW REQUEST'}
          {state === 'error' && 'CONNECTION NOTICE'}
        </span>
      </div>
    </div>
  );
}
