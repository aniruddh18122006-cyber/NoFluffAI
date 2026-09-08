import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function AudioPlayer({
  audioUrl,
  isFallback,
  storyText,
  isLoadingAudio,
  onInterrupt,
  onNarrationEnded
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const speechSynthRef = useRef(null);
  const speechTimerRef = useRef(null);
  const estimatedDurationRef = useRef(30);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Stop any playing audio on chapter change or unmount
  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Autoplay and setup when chapter audio arrives
  useEffect(() => {
    stopAllAudio();

    if (isFallback && storyText) {
      const wordCount = storyText.split(/\s+/).length;
      const estimatedSecs = Math.max(10, Math.round((wordCount / 130) * 60));
      setDuration(estimatedSecs);
      estimatedDurationRef.current = estimatedSecs;

      // Autoplay fallback speech after brief delay
      const timer = setTimeout(() => {
        startBrowserSpeech();
      }, 350);
      return () => clearTimeout(timer);
    } else if (audioUrl) {
      // Setup HTML Audio
      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(err => {
            console.log('[AudioPlayer] Autoplay was prevented by browser policy. Click Play to listen.');
            setIsPlaying(false);
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }

    return () => {
      stopAllAudio();
    };
  }, [audioUrl, isFallback, storyText]);

  // Handle Rime Audio events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (onNarrationEnded) onNarrationEnded();
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (isLoadingAudio) return;

    if (isPlaying) {
      // Pause
      if (!isFallback && audioRef.current) {
        audioRef.current.pause();
      } else if (isFallback && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        if (speechTimerRef.current) clearInterval(speechTimerRef.current);
      }
      setIsPlaying(false);
    } else {
      // Play
      if (!isFallback && audioRef.current) {
        audioRef.current.play().catch(err => {
          console.warn('Playback error:', err);
        });
        setIsPlaying(true);
      } else if (isFallback) {
        startBrowserSpeech();
      }
    }
  };

  // Browser Speech Synthesis fallback
  const startBrowserSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(storyText);
    utterance.rate = 0.95;
    utterance.pitch = 0.95;
    utterance.volume = isMuted ? 0 : volume;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('George'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      speechTimerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          if (next >= estimatedDurationRef.current) {
            return estimatedDurationRef.current;
          }
          return next;
        });
      }, 1000);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
      if (onNarrationEnded) onNarrationEnded();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
    };

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Explicit Interruption Action
  const handleInterrupt = () => {
    stopAllAudio();
    if (onInterrupt) {
      onInterrupt();
    }
  };

  // Replay from beginning
  const handleReplay = () => {
    stopAllAudio();
    setTimeout(() => {
      togglePlay();
    }, 150);
  };

  // Scrub time slider
  const handleScrub = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (!isFallback && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Volume slider
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume || 1;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  return (
    <div className="audio-player-card" role="region" aria-label="Audio Story Narration Player">
      {!isFallback && audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Top row: Rime Transparency & Voice Badge */}
      <div className="audio-top-row">
        <div className="audio-badge-container">
          <span className="audio-badge" title={isFallback ? "Browser speech synthesis fallback" : "Primary Spoken Output via Rime AI"}>
            <Sparkles size={13} color="#E0BD72" />
            <span>
              {isFallback
                ? 'ARCANE VOICE (Browser Voice Fallback)'
                : 'ARCANE VOICE — Powered by Rime (Model: mist | Speaker: marsh)'}
            </span>
          </span>
        </div>

        {/* Animated waveform bars & Interruption Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isPlaying && (
            <button
              className="btn-interrupt"
              onClick={handleInterrupt}
              aria-label="Interrupt Narration"
              title="Interrupt story narration immediately to speak your choice"
            >
              <Zap size={14} />
              <span>Interrupt & Speak</span>
            </button>
          )}

          <div className="waveform-container" aria-hidden="true">
            <div className={`waveform-bar ${isPlaying ? 'active' : ''}`} />
            <div className={`waveform-bar ${isPlaying ? 'active' : ''}`} />
            <div className={`waveform-bar ${isPlaying ? 'active' : ''}`} />
            <div className={`waveform-bar ${isPlaying ? 'active' : ''}`} />
            <div className={`waveform-bar ${isPlaying ? 'active' : ''}`} />
          </div>
        </div>
      </div>

      {/* Center controls & scrubber */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
        <div className="audio-controls">
          <button
            className="btn-audio-play"
            onClick={togglePlay}
            disabled={isLoadingAudio}
            aria-label={isPlaying ? 'Pause Narration' : 'Play Narration'}
            title={isPlaying ? 'Pause Narration' : 'Play Narration'}
          >
            {isPlaying ? <Pause size={20} fill="#0B0713" /> : <Play size={20} fill="#0B0713" style={{ marginLeft: 2 }} />}
          </button>

          <button
            className="btn-audio-icon"
            onClick={handleReplay}
            disabled={isLoadingAudio}
            aria-label="Replay Narration"
            title="Replay narration from start"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Scrub timeline */}
        <div className="audio-timeline-row" style={{ flex: 1 }}>
          <span className="time-display">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="scrub-slider"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleScrub}
            disabled={isFallback}
            aria-label="Audio scrubber slider"
          />
          <span className="time-display">{formatTime(duration)}</span>
        </div>

        {/* Volume controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            className="btn-audio-icon"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ width: 60, accentColor: '#C9A45C', cursor: 'pointer' }}
            aria-label="Narration volume"
          />
        </div>
      </div>
    </div>
  );
}
