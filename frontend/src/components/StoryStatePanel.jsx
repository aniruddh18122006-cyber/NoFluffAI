import React from 'react';
import { Compass, Check, Sparkles, History, Radio } from 'lucide-react';

export default function StoryStatePanel({
  title = '',
  chapter = 1,
  maxChapters = 6,
  storyHistory = [],
  choices = [],
  matchedChoiceId = null,
  detectedVoiceText = null,
  onSelectChoice,
  disabled = false
}) {
  const chapterFormatted = String(chapter).padStart(2, '0');
  const maxFormatted = String(maxChapters).padStart(2, '0');

  return (
    <aside className="console-panel story-state-panel" aria-label="Story state and choices">
      <div className="panel-header">
        <div className="panel-header-title">
          <Compass size={16} color="#E0BD72" />
          <span>STORY STATE</span>
        </div>
        <div className="chapter-badge">
          <span>{chapterFormatted} / {maxFormatted}</span>
        </div>
      </div>

      <div className="story-state-content">
        {/* Story Metadata Box */}
        <div className="state-meta-box">
          <div className="meta-label">CURRENT CHRONICLE</div>
          <div className="meta-title">{title || 'The Unwritten Path'}</div>
        </div>

        {/* Narrative Journey Path (Breadcrumbs) */}
        {storyHistory.length > 0 && (
          <div className="narrative-path-section">
            <div className="section-label">
              <History size={13} color="#C9A45C" />
              <span>NARRATIVE PATH</span>
            </div>
            <ol className="path-timeline">
              {storyHistory.map((step, idx) => (
                <li key={idx} className="path-timeline-item">
                  <span className="path-dot" />
                  <div className="path-text">
                    <span className="path-chapter">Ch.{step.chapter}:</span>
                    <span className="path-choice">{step.selectedChoice?.text || 'Tale Began'}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Available Choices Section */}
        <div className="choices-section">
          <div className="section-label">
            <Radio size={13} color="#E0BD72" />
            <span>AVAILABLE CHOICES (VOICE PRIMARY)</span>
          </div>

          {/* Real-time Voice Detection Banner */}
          {detectedVoiceText && (
            <div className="voice-detection-banner" role="status">
              <div className="detection-header">
                <Sparkles size={13} color="#6EE7B7" />
                <span>VOICE DETECTED</span>
              </div>
              <div className="detected-phrase">"{detectedVoiceText}"</div>
            </div>
          )}

          {/* Choice Cards */}
          <div className="choices-stack">
            {choices && choices.length > 0 ? (
              choices.map((choice, index) => {
                const choiceId = choice.id || String.fromCharCode(65 + index);
                const isMatched = matchedChoiceId === choiceId || matchedChoiceId === choice.id;

                return (
                  <button
                    key={choice.id || index}
                    type="button"
                    className={`state-choice-card ${isMatched ? 'voice-highlighted' : ''}`}
                    onClick={() => onSelectChoice(choice)}
                    disabled={disabled}
                    aria-label={`Choice ${choiceId}: ${choice.text}`}
                  >
                    <div className="choice-number-badge">
                      {isMatched ? <Check size={14} color="#0B0713" /> : `${index + 1}.`}
                    </div>
                    <div className="choice-description">
                      <span className="choice-letter-tag">OPTION {choiceId}</span>
                      <span className="choice-content-text">{choice.text}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="empty-choices-note">
                ✦ Tale has reached its resolution. No further decisions are required.
              </div>
            )}
          </div>

          <div className="voice-hint-footer">
            <span>Tip: Say <em>"Option 1"</em>, <em>"Option A"</em>, or the choice words directly.</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
