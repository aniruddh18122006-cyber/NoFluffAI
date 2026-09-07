import React, { useState } from 'react';
import { Mic, Radio, Cpu, Sparkles, Brain, Zap, Globe, ArrowRight, FlaskConical, ShieldAlert, HeartHandshake } from 'lucide-react';
import { getTranslation } from '../utils/translations';

const categories = ['Consumer App', 'B2B SaaS', 'Marketplace'];

export default function LandingPage({ onStart, onDemo, isLoading, selectedLanguage = 'en' }) {
  const [selectedPersona, setSelectedPersona] = useState('stern');
  const t = getTranslation(selectedLanguage);

  return (
    <div className="echoes-welcome-screen" role="main">
      {/* Top Tagline Badge */}
      <div className="welcome-tagline-capsule">
        <span className="welcome-pulse-emerald" />
        <span>{t.tagline}</span>
      </div>

      {/* Hero Title */}
      <div className="welcome-hero-header">
        <h1 className="welcome-main-title">{t.coachTitle}</h1>
        <div className="welcome-sub-kicker">{t.coachSubtitle}</div>
        <p className="welcome-narrative-tag">
          {t.sayThePitch}
        </p>
        <p className="welcome-invitation-text">
          {t.chooseContext}
        </p>
      </div>

      {/* Persona Selection Panel */}
      <div className="persona-selection-card">
        <div className="persona-header-kicker">{t.personaTitle}</div>
        <p className="persona-subtext">{t.selectPersonaHelp}</p>
        <div className="persona-buttons-row">
          <button
            type="button"
            className={`persona-choice-btn ${selectedPersona === 'stern' ? 'active' : ''}`}
            onClick={() => setSelectedPersona('stern')}
            aria-pressed={selectedPersona === 'stern'}
          >
            <div className="persona-choice-icon">
              <ShieldAlert size={20} color={selectedPersona === 'stern' ? '#45E0D0' : '#8993A7'} />
            </div>
            <div className="persona-choice-info">
              <div className="persona-name">{t.sternPersona}</div>
              <div className="persona-desc">{t.sternDesc}</div>
            </div>
          </button>

          <button
            type="button"
            className={`persona-choice-btn ${selectedPersona === 'friendly' ? 'active' : ''}`}
            onClick={() => setSelectedPersona('friendly')}
            aria-pressed={selectedPersona === 'friendly'}
          >
            <div className="persona-choice-icon">
              <HeartHandshake size={20} color={selectedPersona === 'friendly' ? '#45E0D0' : '#8993A7'} />
            </div>
            <div className="persona-choice-info">
              <div className="persona-name">{t.friendlyPersona}</div>
              <div className="persona-desc">{t.friendlyDesc}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Central Welcome Voice Core */}
      <div className="welcome-core-display">
        <div className="aurora-ring ring-outer idle" />
        <div className="aurora-ring ring-middle idle" />
        <div className="aurora-ring ring-inner idle" />

        <button
          type="button"
          className="welcome-core-sphere"
          onClick={() => onStart(categories[0], selectedPersona)}
          disabled={isLoading}
          aria-label="Choose a pitch category"
          title="Click to start talking"
        >
          <div className="orb-aurora-glow" />
          <div className="sphere-icon-group">
            <Sparkles size={46} color="#45E0D0" className="symbol-cyan-glow" />
            <span className="welcome-orb-cta">{t.chooseCategory}</span>
          </div>
        </button>
      </div>

      {/* Primary Initiation Action */}
      <div className="welcome-cta-group">
        <button
          type="button"
          className="btn-welcome-start"
          onClick={() => onStart(categories[0], selectedPersona)}
          disabled={isLoading}
          aria-label="Start talking"
        >
          <Mic size={22} color="#080B14" />
          <span>{isLoading ? 'CONNECTING...' : `${t.startWithConsumer} (${selectedPersona === 'friendly' ? t.friendlyPersona : t.sternPersona})`}</span>
        </button>
        <p className="welcome-cta-subtext">
          {t.pitchSubtext}
        </p>
      </div>

      <div className="pitch-category-picker" aria-label="Choose pitch category">
        {categories.map((category) => (
          <button type="button" className="pitch-category-button" key={category} onClick={() => onStart(category, selectedPersona)}>
            <span>{category}</span><ArrowRight size={16} />
          </button>
        ))}
        <button type="button" className="pitch-category-button demo" onClick={() => onDemo('Marketplace', 'We are building a marketplace for local fitness classes. We have 50,000 users and we will monetize with ads. We do not have paying customers yet, but the market is huge and there is no real competition.', selectedPersona)}>
          <span><FlaskConical size={16} /> {t.challengeDemo}</span><ArrowRight size={16} />
        </button>
      </div>

      {/* Feature Capability Badges */}
      <div className="welcome-badges-row">
        <div className="welcome-pill-badge">
          <Radio size={13} color="#45E0D0" />
          <span>RIME VOICE ({selectedPersona === 'friendly' ? 'EYRE' : 'MASONRY'})</span>
        </div>
        <div className="welcome-pill-badge">
          <Cpu size={13} color="#8B7CFF" />
          <span>GEMINI 3.5 FLASH LITE</span>
        </div>
        <div className="welcome-pill-badge">
          <Globe size={13} color="#45E0D0" />
          <span>{selectedLanguage.toUpperCase()}</span>
        </div>
        <div className="welcome-pill-badge">
          <Zap size={13} color="#F59E0B" />
          <span>LIVE RECORDING</span>
        </div>
        <div className="welcome-pill-badge">
          <Brain size={13} color="#8B7CFF" />
          <span>5-QUESTION REVIEW</span>
        </div>
      </div>
    </div>
  );
}
