import React from 'react';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export default function StoryText({ title, chapter = 1, text = '', isEnding = false }) {
  const romanChapter = ROMAN_NUMERALS[chapter - 1] || chapter;

  return (
    <div className="parchment-container">
      {/* Decorative Golden Corner Accents */}
      <div className="parchment-corner corner-tl" />
      <div className="parchment-corner corner-tr" />
      <div className="parchment-corner corner-bl" />
      <div className="parchment-corner corner-br" />

      <header className="story-header">
        <div className="story-chapter-label">
          {isEnding ? "✦ CLIMAX & RESOLUTION ✦" : `✦ CHAPTER ${romanChapter} ✦`}
        </div>
        <h2 className="story-title">{title || "The Unfolding Tale"}</h2>
      </header>

      <div className="story-body">
        {text}
      </div>
    </div>
  );
}
