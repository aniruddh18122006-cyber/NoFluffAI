import React from 'react';
import { Mic, Radio, Cpu, Sparkles, Brain, Zap, Globe } from 'lucide-react';

export default function LandingPage({ onStart, isLoading }) {
  return (
    <div className="echoes-welcome-screen" role="main">
      {/* Top Tagline Badge */}
      <div className="welcome-tagline-capsule">
        <span className="welcome-pulse-emerald" />
        <span>AN INTERACTIVE STORY THAT LISTENS, REMEMBERS, AND CHANGES WITH YOU</span>
      </div>

      {/* Hero Title */}
      <div className="welcome-hero-header">
        <h1 className="welcome-main-title">ECHOES</h1>
        <div className="welcome-sub-kicker">AI VOICE STORYTELLER</div>
        <p className="welcome-narrative-tag">
          "Don't read the story. Live it."
        </p>
        <p className="welcome-invitation-text">
          Talk to your story.
        </p>
      </div>

      {/* Central Welcome Voice Core */}
      <div className="welcome-core-display">
        <div className="aurora-ring ring-outer idle" />
        <div className="aurora-ring ring-middle idle" />
        <div className="aurora-ring ring-inner idle" />

        <button
          type="button"
          className="welcome-core-sphere"
          onClick={onStart}
          disabled={isLoading}
          aria-label="Start talking to Echoes"
          title="Click to start talking"
        >
          <div className="orb-aurora-glow" />
          <div className="sphere-icon-group">
            <Sparkles size={46} color="#45E0D0" className="symbol-cyan-glow" />
            <span className="welcome-orb-cta">✦ TALK TO ECHOES</span>
          </div>
        </button>
      </div>

      {/* Primary Initiation Action */}
      <div className="welcome-cta-group">
        <button
          type="button"
          className="btn-welcome-start"
          onClick={onStart}
          disabled={isLoading}
          aria-label="Start talking"
        >
          <Mic size={22} color="#080B14" />
          <span>{isLoading ? 'CONNECTING TO ECHOES...' : '🎙 START TALKING'}</span>
        </button>
        <p className="welcome-cta-subtext">
          Speak naturally. Echoes listens, remembers, and responds.
        </p>
      </div>

      {/* Feature Capability Badges */}
      <div className="welcome-badges-row">
        <div className="welcome-pill-badge">
          <Radio size={13} color="#45E0D0" />
          <span>RIME VOICE</span>
        </div>
        <div className="welcome-pill-badge">
          <Cpu size={13} color="#8B7CFF" />
          <span>AI STORY ENGINE</span>
        </div>
        <div className="welcome-pill-badge">
          <Globe size={13} color="#45E0D0" />
          <span>MULTILINGUAL</span>
        </div>
        <div className="welcome-pill-badge">
          <Zap size={13} color="#F59E0B" />
          <span>LIVE INTERRUPTION</span>
        </div>
        <div className="welcome-pill-badge">
          <Brain size={13} color="#8B7CFF" />
          <span>STORY MEMORY</span>
        </div>
      </div>
    </div>
  );
}
