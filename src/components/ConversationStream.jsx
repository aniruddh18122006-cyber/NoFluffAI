import React, { useEffect, useRef } from 'react';
import { MessageSquare, Volume2, User, Sparkles, Copy, Check, Trash2, Cpu, Zap } from 'lucide-react';

export default function ConversationStream({
  messages = [],
  onReplayAudio,
  onClearConversation
}) {
  const scrollRef = useRef(null);
  const [copiedId, setCopiedId] = React.useState(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="conversation-stream-panel" role="region" aria-label="Live conversation stream">
      {/* Panel Top Header */}
      <div className="stream-header">
        <div className="stream-title-group">
          <MessageSquare size={16} color="#45E0D0" />
          <span className="stream-title">LIVE CONVERSATION</span>
          <span className="message-count-badge">{messages.length}</span>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            className="btn-clear-stream"
            onClick={onClearConversation}
            title="Clear conversation log"
            aria-label="Clear conversation history"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Messages Stream Feed */}
      <div className="stream-scroll-area" ref={scrollRef} aria-live="polite">
        {messages.length === 0 ? (
          <div className="stream-empty-state">
            <Sparkles size={24} color="#8B7CFF" />
            <p className="empty-title">Speak or type to Echoes</p>
            <p className="empty-subtitle">Your dialogue, voice decisions, and memory updates will chronicle here.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isLast = index === messages.length - 1;
            const role = msg.role || msg.speaker || 'system';
            const isUser = role === 'user';
            const isAI = role === 'ai' || role === 'narrator';
            const isInterruption = role === 'interruption';
            const isMemory = role === 'memory';
            const isEvent = role === 'event';
            const isControl = role === 'control';
            const isError = role === 'error';
            const isSystem = role === 'system' || (!isUser && !isAI && !isInterruption && !isMemory && !isEvent && !isControl && !isError);

            if (isInterruption) {
              return (
                <div key={msg.id || index} className="message-bubble bubble-system" style={{ borderColor: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)' }}>
                  <Zap size={14} color="#F59E0B" />
                  <span className="system-text" style={{ color: '#FDE68A', fontWeight: 600 }}>{msg.text}</span>
                  <time className="msg-time">{msg.timestamp}</time>
                </div>
              );
            }

            if (isMemory) {
              return (
                <div key={msg.id || index} className="message-bubble bubble-system" style={{ borderColor: '#8B7CFF', background: 'rgba(139, 124, 255, 0.12)' }}>
                  <Cpu size={14} color="#8B7CFF" />
                  <span className="system-text" style={{ color: '#DDD6FE' }}>{msg.text}</span>
                  <time className="msg-time">{msg.timestamp}</time>
                </div>
              );
            }

            if (isEvent) {
              return (
                <div key={msg.id || index} className="message-bubble bubble-system" style={{ borderColor: '#45E0D0', background: 'rgba(69, 224, 208, 0.1)' }}>
                  <Sparkles size={14} color="#45E0D0" />
                  <span className="system-text" style={{ color: '#A7F3D0', fontWeight: 600 }}>{msg.text}</span>
                  <time className="msg-time">{msg.timestamp}</time>
                </div>
              );
            }

            if (isControl) {
              return (
                <div key={msg.id || index} className="message-bubble bubble-system" style={{ borderColor: '#38BDF8', background: 'rgba(56, 189, 248, 0.1)' }}>
                  <Cpu size={14} color="#38BDF8" />
                  <span className="system-text" style={{ color: '#BAE6FD' }}>{msg.text}</span>
                  <time className="msg-time">{msg.timestamp}</time>
                </div>
              );
            }

            if (isError) {
              return (
                <div key={msg.id || index} className="message-bubble bubble-system" style={{ borderColor: '#F87171', background: 'rgba(248, 113, 113, 0.1)' }}>
                  <Cpu size={14} color="#F87171" />
                  <span className="system-text" style={{ color: '#FECACA' }}>{msg.text}</span>
                  <time className="msg-time">{msg.timestamp}</time>
                </div>
              );
            }

            if (isSystem) {
              return (
                <div key={msg.id || index} className="message-bubble bubble-system">
                  <Cpu size={13} color="#8B7CFF" />
                  <span className="system-text">{msg.text}</span>
                  <time className="msg-time">{msg.timestamp}</time>
                </div>
              );
            }

            return (
              <div
                key={msg.id || index}
                className={`message-bubble ${isUser ? 'bubble-user' : 'bubble-ai'} ${isLast ? 'bubble-newest' : ''}`}
              >
                <div className="bubble-meta">
                  <div className="speaker-badge">
                    {isUser ? (
                      <>
                        <User size={12} color="#45E0D0" />
                        <span className="badge-name user-name">YOU</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} color="#8B7CFF" />
                        <span className="badge-name ai-name">ECHOES</span>
                      </>
                    )}
                  </div>

                  <div className="bubble-actions">
                    <time className="msg-time">{msg.timestamp}</time>
                    <button
                      type="button"
                      className="btn-bubble-action"
                      onClick={() => handleCopy(msg.id || index, msg.text)}
                      title="Copy text"
                    >
                      {copiedId === (msg.id || index) ? <Check size={12} color="#57E6A5" /> : <Copy size={12} />}
                    </button>
                    {isAI && onReplayAudio && (
                      <button
                        type="button"
                        className="btn-bubble-action"
                        onClick={() => onReplayAudio(msg.text)}
                        title="Replay spoken narration"
                      >
                        <Volume2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="bubble-text">
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
