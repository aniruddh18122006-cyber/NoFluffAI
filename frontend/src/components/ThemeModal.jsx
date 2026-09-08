import React from 'react';
import { Palette, X, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeModal({ isOpen, onClose }) {
  const { theme, setTheme, themes } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="theme-modal-title">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title-group">
            <Palette size={18} color="#45E0D0" />
            <h3 id="theme-modal-title" className="modal-title">AURORA COLOR THEMES</h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="memory-info-text">
            Choose your visual environment, or switch themes anytime by voice (e.g. <em>"Change to Ocean theme"</em>).
          </p>

          <div className="theme-grid">
            {Object.values(themes).map((t) => {
              const isCurrent = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-selection-card ${isCurrent ? 'active' : ''}`}
                  onClick={() => setTheme(t.id)}
                >
                  <div className="theme-preview-palette" style={{ background: t.bg }}>
                    <span className="palette-accent" style={{ background: t.accentPrimary }} />
                    <span className="palette-accent" style={{ background: t.accentSecondary }} />
                  </div>
                  <div className="theme-meta">
                    <span className="theme-name">{t.name}</span>
                    {isCurrent && <Check size={14} color="#45E0D0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
