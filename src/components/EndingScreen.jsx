import React, { useEffect } from 'react';
import { Sparkles, BookOpen, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EndingScreen({ title, chapter, text, storyHistory = [], onRestart }) {
  useEffect(() => {
    // Launch celebratory stardust burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C9A45C', '#E0BD72', '#FAF3E0', '#7B42BC']
      });
    } catch (e) {
      // Ignore if canvas-confetti is not loaded
    }
  }, []);

  return (
    <div className="ending-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-primary)' }}>
        <Award size={28} />
        <span style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
          Tale Concluded
        </span>
      </div>

      <h1 className="ending-banner">✦ THE END ✦</h1>

      <p style={{ fontFamily: 'var(--font-story)', fontSize: '1.25rem', color: 'var(--gold-light)', fontStyle: 'italic' }}>
        "Your choices shaped this legend."
      </p>

      {/* Parchment with final resolution */}
      <div className="parchment-container" style={{ margin: 0 }}>
        <div className="parchment-corner corner-tl" />
        <div className="parchment-corner corner-tr" />
        <div className="parchment-corner corner-bl" />
        <div className="parchment-corner corner-br" />

        <div className="story-header">
          <div className="story-chapter-label">✦ THE FINAL CHAPTER ✦</div>
          <h2 className="story-title">{title}</h2>
        </div>

        <div className="story-body">
          {text}
        </div>
      </div>

      {/* Chronicle of Choices made */}
      {storyHistory.length > 0 && (
        <div style={{
          width: '100%',
          maxWidth: '820px',
          background: 'rgba(26, 15, 46, 0.6)',
          border: '1px solid rgba(201, 164, 92, 0.25)',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'left'
        }}>
          <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold-light)', fontSize: '1rem', marginBottom: '1rem', letterSpacing: '0.08em' }}>
            ✦ YOUR CHRONICLED PATH
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {storyHistory.map((item, idx) => (
              <li key={idx} style={{ fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>Ch. {item.chapter}:</span>
                <span>{item.selectedChoice?.text || "The journey began"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Restart CTA */}
      <button 
        className="btn-primary-tale" 
        onClick={onRestart}
        style={{ marginTop: '1rem' }}
        aria-label="Begin a New Tale"
      >
        <RotateCcw size={20} />
        <span>Begin a New Tale</span>
      </button>
    </div>
  );
}
