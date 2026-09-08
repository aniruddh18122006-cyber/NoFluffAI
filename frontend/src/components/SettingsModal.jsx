import React from 'react';
import { Settings, X, Type, Play, Eye, Sliders, Volume2, Sparkles, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsModal({ isOpen, onClose, selectedLanguage = 'en', onChangeLanguage }) {
  const { settings, updateSettings } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title-group">
            <Settings size={18} color="#45E0D0" />
            <h3 id="settings-modal-title" className="modal-title">EXPERIENCE SETTINGS</h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="memory-info-text">
            Configure your interface, typography, spoken voice cadence, and live subtitles.
          </p>

          <div className="settings-list">
            {/* Language Selector */}
            <div className="settings-row">
              <div className="settings-label-group">
                <Globe size={16} color="#45E0D0" />
                <div>
                  <div className="settings-name">Interface Language</div>
                  <div className="settings-desc">Display language for UI headers, buttons, and badges</div>
                </div>
              </div>
              <div className="settings-control-group">
                <select
                  className="nav-lang-select"
                  value={selectedLanguage}
                  onChange={(e) => onChangeLanguage?.(e.target.value)}
                  aria-label="Interface language selector"
                  style={{ minWidth: '140px', padding: '0.4rem 0.6rem', borderRadius: '8px' }}
                >
                  <option value="en">English (EN)</option>
                  <option value="es">Español (ES)</option>
                  <option value="fr">Français (FR)</option>
                  <option value="de">Deutsch (DE)</option>
                  <option value="hi">हिन्दी (HI)</option>
                  <option value="ja">日本語 (JA)</option>
                </select>
              </div>
            </div>
            {/* Font Size Option */}
            <div className="settings-row">
              <div className="settings-label-group">
                <Type size={16} color="#45E0D0" />
                <div>
                  <div className="settings-name">Text Size</div>
                  <div className="settings-desc">Adjust story typography for optimal reading comfort</div>
                </div>
              </div>
              <div className="settings-control-group">
                <button
                  type="button"
                  className={`btn-setting-toggle ${settings.fontSize === 'normal' ? 'active' : ''}`}
                  onClick={() => updateSettings({ fontSize: 'normal' })}
                >
                  Normal
                </button>
                <button
                  type="button"
                  className={`btn-setting-toggle ${settings.fontSize === 'large' ? 'active' : ''}`}
                  onClick={() => updateSettings({ fontSize: 'large' })}
                >
                  Large
                </button>
              </div>
            </div>

            {/* Animations Toggle */}
            <div className="settings-row">
              <div className="settings-label-group">
                <Sparkles size={16} color="#8B7CFF" />
                <div>
                  <div className="settings-name">Visual Animations</div>
                  <div className="settings-desc">Aurora wave rings, particle field, and waveform motion</div>
                </div>
              </div>
              <div className="settings-control-group">
                <button
                  type="button"
                  className={`btn-setting-toggle ${settings.animations ? 'active' : ''}`}
                  onClick={() => updateSettings({ animations: true })}
                >
                  Enabled
                </button>
                <button
                  type="button"
                  className={`btn-setting-toggle ${!settings.animations ? 'active' : ''}`}
                  onClick={() => updateSettings({ animations: false })}
                >
                  Reduced
                </button>
              </div>
            </div>

            {/* Narration Speed */}
            <div className="settings-row">
              <div className="settings-label-group">
                <Volume2 size={16} color="#45E0D0" />
                <div>
                  <div className="settings-name">Narration Pace</div>
                  <div className="settings-desc">Rime voice cadence and spoken rhythm</div>
                </div>
              </div>
              <div className="settings-control-group">
                <button
                  type="button"
                  className={`btn-setting-toggle ${settings.narrationSpeed <= 0.88 ? 'active' : ''}`}
                  onClick={() => updateSettings({ narrationSpeed: 0.85 })}
                >
                  0.85x
                </button>
                <button
                  type="button"
                  className={`btn-setting-toggle ${settings.narrationSpeed > 0.88 && settings.narrationSpeed < 1.1 ? 'active' : ''}`}
                  onClick={() => updateSettings({ narrationSpeed: 0.95 })}
                >
                  0.95x
                </button>
                <button
                  type="button"
                  className={`btn-setting-toggle ${settings.narrationSpeed >= 1.1 ? 'active' : ''}`}
                  onClick={() => updateSettings({ narrationSpeed: 1.15 })}
                >
                  1.15x
                </button>
              </div>
            </div>

            {/* Subtitles Toggle */}
            <div className="settings-row">
              <div className="settings-label-group">
                <Eye size={16} color="#8B7CFF" />
                <div>
                  <div className="settings-name">Live Subtitles & Captions</div>
                  <div className="settings-desc">Show spoken text banner beneath the voice core</div>
                </div>
              </div>
              <div className="settings-control-group">
                <button
                  type="button"
                  className={`btn-setting-toggle ${settings.subtitles ? 'active' : ''}`}
                  onClick={() => updateSettings({ subtitles: true })}
                >
                  On
                </button>
                <button
                  type="button"
                  className={`btn-setting-toggle ${!settings.subtitles ? 'active' : ''}`}
                  onClick={() => updateSettings({ subtitles: false })}
                >
                  Off
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
