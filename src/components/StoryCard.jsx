import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';

export default function StoryCard({
  title = '',
  chapter = 1,
  narrative = '',
  isEnding = false
}) {
  const chapterFormatted = String(chapter).padStart(2, '0');

  return (
    <article className="story-focus-card" aria-label={`Story Chapter ${chapter}: ${title}`}>
      <span className="focus-card-corner corner-tl" aria-hidden="true" />
      <span className="focus-card-corner corner-tr" aria-hidden="true" />
      <span className="focus-card-corner corner-bl" aria-hidden="true" />
      <span className="focus-card-corner corner-br" aria-hidden="true" />

      <header className="focus-card-header">
        <div className="focus-card-meta-row">
          <span className="current-story-badge">CURRENT STORY</span>
          <div className="chapter-pill-tag">
            <Bookmark size={12} color="#45E0D0" />
            <span>{isEnding ? 'CLIMAX' : `CHAPTER ${chapterFormatted}`}</span>
          </div>
        </div>
        <h2 className="focus-card-title">{title || 'The Whispering Door'}</h2>
      </header>

      <div className="focus-card-body">
        {narrative}
      </div>
    </article>
  );
}
