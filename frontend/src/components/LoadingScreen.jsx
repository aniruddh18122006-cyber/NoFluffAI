import React, { useState, useEffect } from 'react';

const MYSTICAL_MESSAGES = [
  "Opening the ancient tome...",
  "Summoning the storyteller...",
  "Lighting the candles...",
  "Listening to the whispers of the arcane...",
  "Unfurling the enchanted parchment...",
  "Divining the paths of destiny...",
  "Awakening the forgotten legends..."
];

export default function LoadingScreen({ customMessage }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (customMessage) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MYSTICAL_MESSAGES.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [customMessage]);

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="arcane-spinner" aria-hidden="true">
        <div className="spinner-ring-outer" />
        <div className="spinner-ring-inner" />
        <div className="spinner-core" />
      </div>

      <div className="loading-text">
        ✦ {customMessage || MYSTICAL_MESSAGES[messageIndex]} ✦
      </div>
    </div>
  );
}
