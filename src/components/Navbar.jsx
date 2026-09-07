import React, { useState, useRef, useEffect } from 'react';
import { Radio, Cpu, Mic, Palette, Brain, RefreshCw, Settings, Globe, History, Menu, X, ChevronDown } from 'lucide-react';

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
  onOpenHistory,
  onNewTale,
  inStory = false
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

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
      <div className="navbar-right-col" ref={menuRef}>
        {/* RIME Status */}
        <div className="nav-status-pill" title={rimeStatus === 'active' ? 'Rime TTS audio is active' : rimeStatus === 'fallback' ? 'Browser voice fallback is active' : 'Rime TTS configuration status'}>
          <span className={`pill-dot-indicator ${isRimeSpeaking ? 'speaking' : rimeStatus === 'active' ? 'active' : rimeStatus === 'fallback' || rimeStatus === 'error' ? 'offline' : isRimeActive ? 'configured' : 'offline'}`} />
          <span className="pill-title">RIME</span>
        </div>

        {/* AI Status */}
        <div className="nav-status-pill" title="Gemini 3.5 Flash Lite & Pitch Analysis">
          <span className={`pill-dot-indicator ${isAIThinking ? 'thinking' : 'active'}`} />
          <span className="pill-title">GEMINI</span>
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
            <option value="en">English (EN)</option>
            <option value="es">Español (ES)</option>
            <option value="fr">Français (FR)</option>
            <option value="de">Deutsch (DE)</option>
            <option value="hi">हिन्दी (HI)</option>
            <option value="ja">日本語 (JA)</option>
          </select>
        </div>

        {/* Action Controls & Top-Right Menu Cluster */}
        <div className="navbar-btn-group">
          <button
            type="button"
            className="btn-icon-tool"
            onClick={onOpenThemeModal}
            title="Aurora Themes"
            aria-label="Theme selector"
          >
            <Palette size={15} color="#8B7CFF" />
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

          {/* Top-Right Menu Trigger (History, Settings, Brain Cluster) */}
          <button
            type="button"
            className={`btn-icon-tool header-menu-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Menu: History, Settings & AI Engine"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={16} color="#45E0D0" /> : <Menu size={16} color="#45E0D0" />}
          </button>
        </div>

        {/* Expandable Top-Right Menu */}
        {isMenuOpen && (
          <div className="header-menu-dropdown" role="menu">
            <button
              type="button"
              className="header-menu-item"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenHistory?.();
              }}
              role="menuitem"
            >
              <History size={16} color="#8B7CFF" />
              <div className="header-menu-item-info">
                <span className="header-menu-item-title">Session History</span>
                <span className="header-menu-item-desc">Browse local pitch transcripts</span>
              </div>
            </button>

            <button
              type="button"
              className="header-menu-item"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenSettingsModal?.();
              }}
              role="menuitem"
            >
              <Settings size={16} color="#45E0D0" />
              <div className="header-menu-item-info">
                <span className="header-menu-item-title">Experience Settings</span>
                <span className="header-menu-item-desc">Text size, animations, subtitles</span>
              </div>
            </button>

            <div className="header-menu-divider" />

            {/* AI / Brain Info Section */}
            <div className="header-menu-telemetry">
              <div className="telemetry-header">
                <Brain size={15} color="#B8B4FF" />
                <span>AI ENGINE & RIME TELEMETRY</span>
              </div>
              <div className="telemetry-line">
                <span className="telemetry-key">Model:</span>
                <span className="telemetry-value">gemini-3.5-flash-lite</span>
              </div>
              <div className="telemetry-line">
                <span className="telemetry-key">Rime TTS:</span>
                <span className="telemetry-value">
                  {isRimeSpeaking ? 'Speaking' : rimeStatus === 'active' ? 'Active (coda)' : isRimeActive ? 'Configured' : 'Fallback'}
                </span>
              </div>
              <div className="telemetry-line">
                <span className="telemetry-key">Voices:</span>
                  <span className="telemetry-value">Masonry (Stern) / Eyre (Friendly)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
