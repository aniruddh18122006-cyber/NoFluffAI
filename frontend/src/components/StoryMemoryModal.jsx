import React from 'react';
import { Brain, X, Trash2, ShieldCheck, Sparkles, BookOpen, RefreshCw } from 'lucide-react';

export default function StoryMemoryModal({
  isOpen,
  onClose,
  memory = {},
  onClearMemory,
  onStartNewStory
}) {
  if (!isOpen) return null;

  const {
    character = 'Not specified',
    location = 'Unknown',
    importantObjects = [],
    relationships = [],
    storyFacts = [],
    choicesMade = [],
    previousUserInstructions = []
  } = memory;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="memory-modal-title">
      <div className="modal-content memory-modal-box">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Brain size={18} color="#45E0D0" />
            <h3 id="memory-modal-title" className="modal-title">AI STORY MEMORY</h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body memory-grid">
          <p className="memory-info-text">
            The app dynamically stores important story facts, character identities, and key objects as you speak. You can also modify memory naturally by voice (e.g. <em>"My character name is Maya"</em> or <em>"Remember the dragon is Ember"</em>).
          </p>

          <div className="memory-cards-container">
            {/* Protagonist & Location Card */}
            <div className="memory-card">
              <div className="memory-card-label">PROTAGONIST IDENTITY</div>
              <div className="memory-card-value highlight-cyan">{character}</div>
            </div>

            <div className="memory-card">
              <div className="memory-card-label">CURRENT LOCATION</div>
              <div className="memory-card-value">{location}</div>
            </div>

            {/* Inventory Objects */}
            <div className="memory-card full-width">
              <div className="memory-card-label">DISCOVERED OBJECTS &amp; RELICS</div>
              <div className="memory-tag-list">
                {importantObjects && importantObjects.length > 0 ? (
                  importantObjects.map((obj, i) => (
                    <span key={i} className="memory-tag cyan">
                      ✦ {obj}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-italics">No objects currently cataloged.</span>
                )}
              </div>
            </div>

            {/* Story Facts & Lore */}
            <div className="memory-card full-width">
              <div className="memory-card-label">ESTABLISHED STORY FACTS</div>
              <ul className="memory-facts-list">
                {storyFacts && storyFacts.length > 0 ? (
                  storyFacts.map((fact, i) => (
                    <li key={i} className="memory-fact-item">
                      <Sparkles size={12} color="#8B7CFF" />
                      <span>{fact}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-italics">No additional facts established yet.</li>
                )}
              </ul>
            </div>

            {/* Choices Made */}
            {choicesMade && choicesMade.length > 0 && (
              <div className="memory-card full-width">
                <div className="memory-card-label">CHOICES MADE</div>
                <ul className="memory-facts-list">
                  {choicesMade.map((choice, i) => (
                    <li key={i} className="memory-fact-item">
                      <BookOpen size={12} color="#45E0D0" />
                      <span>{typeof choice === 'string' ? choice : JSON.stringify(choice)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* User Instructions / Remembered facts */}
            {previousUserInstructions && previousUserInstructions.length > 0 && (
              <div className="memory-card full-width">
                <div className="memory-card-label">YOUR REMEMBERED INSTRUCTIONS</div>
                <ul className="memory-facts-list">
                  {previousUserInstructions.map((instr, i) => (
                    <li key={i} className="memory-fact-item">
                      <ShieldCheck size={12} color="#FFD700" />
                      <span>{instr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-danger-text"
            onClick={onClearMemory}
            title="Reset active story memory"
          >
            <Trash2 size={14} />
            <span>Reset Memory</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onStartNewStory}
            >
              <RefreshCw size={14} />
              <span>Start New Story</span>
            </button>
            <button type="button" className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
