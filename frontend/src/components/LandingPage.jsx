import React, { useState } from 'react';
import { Radio, Cpu, Brain, Globe, ArrowRight, ShieldAlert, HeartHandshake } from 'lucide-react';
import { getTranslation } from '../utils/translations';

const categories = ['Consumer App', 'B2B SaaS', 'Marketplace'];
const focusOptions = [
  'Market & Competition',
  'Product & Traction',
  'Business Model & Financials',
  'Team & Execution',
  'Vision & Strategy',
  'Balanced Mix'
];

export default function LandingPage({ onStart, isLoading, selectedLanguage = 'en' }) {
  const [selectedPersona, setSelectedPersona] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('Balanced Mix');
  const [currentStep, setCurrentStep] = useState(1);
  const t = getTranslation(selectedLanguage);
  const canStart = Boolean(selectedPersona && selectedCategory);
  const startInterview = () => {
    if (!canStart || isLoading) return;
    onStart(selectedCategory, selectedPersona, selectedFocus);
  };

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

      <div className="persona-selection-card">
        <div className="onboarding-step-indicator" aria-label={t.onboardingStep(currentStep)}> {t.onboardingStep(currentStep)} </div>
        {currentStep === 1 && <div className="onboarding-step">
          <div className="persona-header-kicker">{t.chooseInvestor}</div>
          <p className="persona-subtext">{t.selectPersonaHelp}</p>
          <div className="persona-buttons-row">
            <button type="button" className={`persona-choice-btn ${selectedPersona === 'friendly' ? 'active' : ''}`} onClick={() => setSelectedPersona('friendly')} aria-pressed={selectedPersona === 'friendly'}>
              <div className="persona-choice-icon"><HeartHandshake size={24} color={selectedPersona === 'friendly' ? '#45E0D0' : '#8993A7'} /></div>
              <div className="persona-choice-info"><div className="persona-name">{t.friendlyPersona}</div><div className="persona-desc">{t.friendlyDesc}</div></div>
            </button>
            <button type="button" className={`persona-choice-btn ${selectedPersona === 'stern' ? 'active' : ''}`} onClick={() => setSelectedPersona('stern')} aria-pressed={selectedPersona === 'stern'}>
              <div className="persona-choice-icon"><ShieldAlert size={24} color={selectedPersona === 'stern' ? '#45E0D0' : '#8993A7'} /></div>
              <div className="persona-choice-info"><div className="persona-name">{t.sternPersona}</div><div className="persona-desc">{t.sternDesc}</div></div>
            </button>
          </div>
        </div>}
        {currentStep === 2 && <div className="onboarding-step">
          <div className="persona-header-kicker">CHOOSE YOUR BUSINESS TYPE</div>
          <p className="persona-subtext">{selectedPersona === 'friendly' ? t.friendlyPersona : t.sternPersona} selected. Choose the market context for this review.</p>
          <div className="selection-options category-options">
            {categories.map((category) => {
              const description = category === 'Consumer App' ? t.consumerBusinessDesc : category === 'B2B SaaS' ? t.saasBusinessDesc : t.marketplaceBusinessDesc;
              return <button type="button" className={`selection-choice-btn ${selectedCategory === category ? 'active' : ''}`} key={category} onClick={() => setSelectedCategory(category)} aria-pressed={selectedCategory === category}><span className="selection-choice-copy"><strong>{t.categoryLabels[category]}</strong><small>{description}</small></span>{selectedCategory === category ? <span className="selection-selected-check" aria-hidden="true">✓</span> : <ArrowRight size={16} />}</button>;
            })}
          </div>
        </div>}
        {currentStep === 3 && <div className="onboarding-step">
          <div className="persona-header-kicker">QUESTION FOCUS</div>
          <p className="persona-subtext">{selectedCategory} selected. Choose the theme that should shape most of the five questions.</p>
          <div className="selection-options focus-options">
            {focusOptions.map((focus) => <button type="button" className={`selection-choice-btn ${selectedFocus === focus ? 'active' : ''}`} key={focus} onClick={() => setSelectedFocus(focus)} aria-pressed={selectedFocus === focus}><span>{focus}</span></button>)}
          </div>
        </div>}
        <div className="onboarding-step-actions">
          {currentStep > 1 && <button type="button" className="onboarding-back-button" onClick={() => setCurrentStep((step) => step - 1)}>BACK</button>}
          {currentStep < 3 && <button type="button" className="onboarding-next-button" onClick={() => setCurrentStep((step) => step + 1)} disabled={currentStep === 1 ? !selectedPersona : !selectedCategory}>{t.next} <ArrowRight size={16} /></button>}
        </div>
      </div>

      {/* Central Welcome Voice Core */}
      {currentStep === 3 && <div className="welcome-core-display">
        <div className="aurora-ring ring-outer idle" />
        <div className="aurora-ring ring-middle idle" />
        <div className="aurora-ring ring-inner idle" />

        <button
          type="button"
          className="welcome-core-sphere"
          onClick={() => currentStep === 3 && startInterview()}
          disabled={isLoading || currentStep !== 3 || !canStart}
          aria-label="Start investor interview"
          title="Complete the onboarding steps to start"
        >
          <div className="orb-aurora-glow" />
          <span className="welcome-orb-cta">START</span>
        </button>
      </div>}

      {/* Primary Initiation Action */}
      <div className="welcome-cta-group">
        <p className="welcome-cta-subtext">
          {t.pitchSubtext}
        </p>
      </div>

      {/* Feature Capability Badges */}
      <div className="welcome-badges-row">
        <div className="welcome-pill-badge">
          <Radio size={13} color="#45E0D0" />
          <span>{t.rimeStatus}</span>
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
          <Brain size={13} color="#8B7CFF" />
          <span>5-QUESTION REVIEW</span>
        </div>
      </div>
    </div>
  );
}
