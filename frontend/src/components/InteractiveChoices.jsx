import React from 'react';
import { Compass, Check, Sparkles } from 'lucide-react';

export default function InteractiveChoices({
  choices = [],
  matchedChoiceId = null,
  detectedVoiceText = null,
  onSelectChoice,
  disabled = false
}) {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="interactive-choices-card" role="region" aria-label="Branching choices">
      <div className="choices-header-row">
        <div className="choices-title">
          <Compass size={15} color="#45E0D0" />
          <span>YOUR CHOICES</span>
        </div>
        <span className="choices-sub-notice">Speak naturally — you don't need to click</span>
      </div>

      {detectedVoiceText && (
        <div className="detected-voice-tag" role="status">
          <Sparkles size={12} color="#57E6A5" />
          <span>VOICE MATCH: "{detectedVoiceText}"</span>
        </div>
      )}

      <div className="choices-grid-stack">
        {choices.map((choice, index) => {
          const choiceId = choice.id || String.fromCharCode(65 + index);
          const isMatched = matchedChoiceId === choiceId || matchedChoiceId === choice.id;

          return (
            <button
              key={choice.id || index}
              type="button"
              className={`choice-pill-item ${isMatched ? 'voice-matched' : ''}`}
              onClick={() => onSelectChoice(choice)}
              disabled={disabled}
              aria-label={`Choice ${index + 1}: ${choice.text}`}
            >
              <span className="choice-index-num">
                {isMatched ? <Check size={12} color="#080B14" /> : String(index + 1).padStart(2, '0')}
              </span>
              <span className="choice-title-text">{choice.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
