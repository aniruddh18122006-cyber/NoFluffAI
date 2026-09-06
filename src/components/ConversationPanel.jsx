import React, { useEffect, useRef } from 'react';
import { MessageSquare, Volume2, User, Sparkles } from 'lucide-react';

export default function ConversationPanel({ transcript = [] }) {
  const scrollRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <aside className="console-panel conversation-panel" aria-label="Live conversation transcript">
      <div className="panel-header">
        <div className="panel-header-title">
          <MessageSquare size={16} color="#E0BD72" />
          <span>LIVE CONVERSATION</span>
        </div>
        <div className="live-feed-badge">
          <span className="live-pulse-dot" />
          <span>REC</span>
        </div>
      </div>

      <div className="conversation-feed" ref={scrollRef} aria-live="polite">
        {transcript.length === 0 ? (
          <div className="empty-feed-placeholder">
            <Sparkles size={20} color="#796894" />
            <span>The archives are quiet. Begin your tale to start the conversation transcript.</span>
          </div>
        ) : (
          transcript.map((msg, index) => {
            const isNarrator = msg.speaker === 'narrator';

            return (
              <div
                key={msg.id || index}
                className={`transcript-entry ${isNarrator ? 'entry-narrator' : 'entry-user'}`}
              >
                <div className="entry-meta">
                  <div className="speaker-tag">
                    {isNarrator ? (
                      <>
                        <Volume2 size={13} color="#E0BD72" />
                        <span className="speaker-name">NARRATOR</span>
                      </>
                    ) : (
                      <>
                        <User size={13} color="#6EE7B7" />
                        <span className="speaker-name user-name">USER</span>
                      </>
                    )}
                  </div>
                  <time className="entry-timestamp">{msg.timestamp || '00:00'}</time>
                </div>

                <div className="entry-body">
                  {isNarrator ? (
                    <blockquote className="narrator-quote">
                      "{msg.text}"
                    </blockquote>
                  ) : (
                    <div className="user-command">
                      "{msg.text}"
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
