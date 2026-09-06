import React from 'react';
import { Scroll, Bookmark } from 'lucide-react';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export default function FocusedStoryCard({
  title = '',
  chapter = 1,
  text = '',
  isEnding = false
}) {
  const romanChapter = ROMAN[chapter - 1] || chapter;

  return (
    <article className="focused-story-card" aria-label={`Chapter ${chapter}: ${title}`}>
      {/* Decorative Gilded Corners */}
      <span className="card-corner corner-tl" aria-hidden="true" />
      <span className="card-corner corner-tr" aria-hidden="true" />
      <span className="card-corner corner-bl" aria-hidden="true" />
      <span className="card-corner corner-br" aria-hidden="true" />

      <header className="card-header">
        <div className="chapter-kicker">
          <Bookmark size={13} color="#C9A45C" />
          <span>{isEnding ? '✦ CLIMAX & RESOLUTION ✦' : `✦ CHAPTER ${romanChapter} ✦`}</span>
        </div>
        <h2 className="card-title">{title || 'The Unfolding Legend'}</h2>
      </header>

      <div className="card-narrative-text">
        {text}
      </div>
    </article>
  );
}
