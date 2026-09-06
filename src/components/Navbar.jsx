import React from 'react';
import { Radio, Cpu, Mic, Palette, Brain, RefreshCw, Settings, Globe } from 'lucide-react';

export default function Navbar({
  isRimeActive = true,
  rimeStatus = 'unknown',
  isRimeSpeaking = false,
  isAIThinking = false,
  isListening = false,
  selectedLanguage = 'auto',
  onChangeLanguage,
  onOpenSettingsModal,
  onOpenThemeModal,
  onOpenMemoryModal,
  onNewTale,
  inStory = false
}) {
  const getLanguageLabel = (code) => {
    switch (code) {
      case 'hi': return 'HI';
      case 'es': return 'ES';
      case 'fr': return 'FR';
      case 'de': return 'DE';
      case 'ja': return 'JA';
      case 'en': return 'EN';
      default: return 'AUTO';
    }
  };

  return (
    <header className="echoes-navbar" role="banner">
      {/* Left: Brand & Subtitle */}
      <div className="navbar-brand-col">
        <div className="brand-logo-gem">
          <span className="gem-dot" />
        </div>
        <div className="brand-text-block">
          <div className="brand-title-main">ECHOES</div>
          <div className="brand-subtitle-sub">AI VOICE STORYTELLER</div>
        </div>
      </div>

      {/* Center: Live Session Indicator */}
      <div className="navbar-center-col">
        <div className="live-session-capsule">
          <span className="session-pulse-dot" />
          <span className="session-text">LIVE SESSION</span>
        </div>
      </div>

      {/* Right: Telemetry & Navigation */}
      <div className="navbar-right-col">
        {/* RIME Status */}
        <div className="nav-status-pill" title={rimeStatus === 'active' ? 'Rime TTS audio is active' : rimeStatus === 'fallback' ? 'Browser voice fallback is active' : 'Rime TTS configuration status'}>
          <span className={`pill-dot-indicator ${isRimeSpeaking ? 'speaking' : rimeStatus === 'active' ? 'active' : rimeStatus === 'fallback' || rimeStatus === 'error' ? 'offline' : isRimeActive ? 'configured' : 'offline'}`} />
          <span className="pill-title">RIME</span>
        </div>

        {/* AI Status */}
        <div className="nav-status-pill" title="OpenAI Narrative & Story Memory">
          <span className={`pill-dot-indicator ${isAIThinking ? 'thinking' : 'active'}`} />
          <span className="pill-title">AI</span>
        </div>

        {/* VOICE INPUT Status */}
        <div className="nav-status-pill" title="Voice Input & Speech Recognition">
          <span className={`pill-dot-indicator ${isListening ? 'listening' : 'active'}`} />
          <span className="pill-title">VOICE INPUT</span>
        </div>

        {/* Language Selector */}
        <div className="nav-lang-capsule" title="Language Configuration">
          <Globe size={13} color="#45E0D0" />
          <select
            className="nav-lang-select"
            value={selectedLanguage}
            onChange={(e) => onChangeLanguage && onChangeLanguage(e.target.value)}
            aria-label="Language selector"
          >
            <option value="auto">Language: AUTO</option>
            <option value="en">English (EN)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="es">Español (ES)</option>
            <option value="fr">Français (FR)</option>
            <option value="de">Deutsch (DE)</option>
            <option value="ja">日本語 (JA)</option>
          </select>
        </div>

        {/* Action Controls: Settings, Theme, Memory, Reset */}
        <div className="navbar-btn-group">
          <button
            type="button"
            className="btn-icon-tool"
            onClick={onOpenSettingsModal}
            title="Experience Settings"
            aria-label="Settings"
          >
            <Settings size={15} color="#45E0D0" />
          </button>

          <button
            type="button"
            className="btn-icon-tool"
            onClick={onOpenThemeModal}
            title="Aurora Themes"
            aria-label="Theme selector"
          >
            <Palette size={15} color="#8B7CFF" />
          </button>

          <button
            type="button"
            className="btn-icon-tool"
            onClick={onOpenMemoryModal}
            title="AI Story Memory"
            aria-label="Story memory inspector"
          >
            <Brain size={15} color="#B8B4FF" />
          </button>

          {inStory && (
            <button
              type="button"
              className="btn-icon-tool text-danger"
              onClick={onNewTale}
              title="Start New Story"
              aria-label="Start new story"
            >
              <RefreshCw size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
