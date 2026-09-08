import React from 'react';
import { Compass } from 'lucide-react';

export default function ChoiceButtons({ choices = [], onSelectChoice, disabled = false }) {
  if (!choices || choices.length === 0) {
    return null;
  }

  return (
    <section className="choices-container" aria-label="Story choices">
      <div className="choices-heading">
        <Compass size={18} color="#E0BD72" />
        <span>WHAT WILL YOU DO?</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {choices.map((choice, index) => {
          const runeChar = choice.id || String.fromCharCode(65 + index); // A, B, C...

          return (
            <button
              key={choice.id || index}
              className="choice-btn"
              onClick={() => onSelectChoice(choice)}
              disabled={disabled}
              aria-label={`Choice ${runeChar}: ${choice.text}`}
            >
              <span className="choice-rune" aria-hidden="true">✦ {runeChar}.</span>
              <span className="choice-text">{choice.text}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
