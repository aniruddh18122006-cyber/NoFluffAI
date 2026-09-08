import React from 'react';

export default function StoryProgress({ chapter = 1, maxEstimatedChapters = 5, isEnding = false }) {
  const steps = Array.from({ length: maxEstimatedChapters }, (_, i) => i + 1);

  return (
    <div className="progress-bar-container" aria-label={`Chapter ${chapter} of estimated ${maxEstimatedChapters}`}>
      {steps.map((num, idx) => {
        const isCompleted = num < chapter || isEnding;
        const isActive = num === chapter && !isEnding;

        return (
          <React.Fragment key={num}>
            <div 
              className={`progress-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              title={`Chapter ${num}`}
            />
            {idx < steps.length - 1 && (
              <div className={`progress-connector ${isCompleted ? 'active' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
