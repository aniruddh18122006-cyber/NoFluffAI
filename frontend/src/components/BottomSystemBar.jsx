import React from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Cpu, Mic } from 'lucide-react';

export default function BottomSystemBar({
  isRimeActive = true,
  isRimeNarrating = false,
  isGeneratingStory = false,
  isListening = false,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  volume = 1,
  isMuted = false,
  chapter = 1,
  maxChapters = 6,
  onTogglePlay,
  onScrub,
  onVolumeChange,
  onToggleMute
}) {
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Real Chapter Progress Calculation
  const progressPercent = Math.min(100, Math.round(((chapter - 1) / (maxChapters - 1 || 5)) * 100));
  const totalBlocks = 10;
  const filledBlocks = Math.min(totalBlocks, Math.round((progressPercent / 100) * totalBlocks));
  const progressBlocks = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <footer className="bottom-system-bar" role="contentinfo" aria-label="System telemetry and audio bar">
      {/* Left: System Status Telemetry */}
      <div className="system-telemetry-group">
        {/* Rime TTS Status */}
        <div className="telemetry-pill" title="Rime TTS Spoken Output Provider">
          <Radio size={12} color={isRimeActive ? '#E0BD72' : '#F87171'} />
          <span className="telemetry-name">RIME TTS</span>
          <span className={`telemetry-dot ${isRimeNarrating ? 'dot-narrating' : isRimeActive ? 'dot-active' : 'dot-offline'}`} />
          <span className="telemetry-state">
            {isRimeNarrating ? 'NARRATING' : isRimeActive ? 'ACTIVE' : 'UNAVAILABLE'}
          </span>
        </div>

        {/* Gemini LLM Status */}
          <div className="telemetry-pill" title="Gemini Investor Intelligence">
           <Cpu size={12} color="#C9A45C" />
            <span className="telemetry-name">GEMINI</span>
          <span className={`telemetry-dot ${isGeneratingStory ? 'dot-working' : 'dot-active'}`} />
          <span className="telemetry-state">
         {isGeneratingStory ? 'DIVINING' : 'READY'}
        </span>
       </div>

        {/* Voice Input Status */}
        <div className="telemetry-pill" title="Web Speech Recognition Input">
          <Mic size={12} color={isListening ? '#F87171' : '#6EE7B7'} />
          <span className="telemetry-name">VOICE INPUT</span>
          <span className={`telemetry-dot ${isListening ? 'dot-listening' : 'dot-active'}`} />
          <span className="telemetry-state">
            {isListening ? 'LISTENING' : 'READY'}
          </span>
        </div>
      </div>

      {/* Center: Audio Timeline & Playback Control */}
      <div className="audio-telemetry-group">
        <button
          type="button"
          className="btn-system-audio-toggle"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause narration audio' : 'Play narration audio'}
        >
          {isPlaying ? <Pause size={13} fill="#0B0713" /> : <Play size={13} fill="#0B0713" />}
        </button>

        <span className="audio-timestamp">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <input
          type="range"
          className="system-audio-scrubber"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={onScrub}
          aria-label="Audio scrubber slider"
        />

        <div className="volume-control-mini">
          <button
            type="button"
            className="btn-volume-icon"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
          <input
            type="range"
            className="system-volume-slider"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={onVolumeChange}
            aria-label="Audio volume"
          />
        </div>
      </div>

      {/* Right: Calculated Chapter Progression */}
      <div className="chapter-progress-group">
        <span className="chapter-progress-label">CHAPTER PROGRESS</span>
        <span className="chapter-progress-blocks" aria-label={`${progressPercent}% completed`}>
          {progressBlocks} {progressPercent}%
        </span>
      </div>
    </footer>
  );
}
