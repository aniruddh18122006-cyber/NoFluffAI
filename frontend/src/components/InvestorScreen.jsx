import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Brain, CheckCircle2, History, Mic, Square, Volume2, X } from 'lucide-react';
import { analyzeInvestor, fetchTTSAudio } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { getTranslation } from '../utils/translations';

const DEMO_PITCH = 'We are building a marketplace for local fitness classes. We have 50,000 users and we will monetize with ads. We do not have paying customers yet, but the market is huge and there is no real competition.';

const stateLabels = {
  idle: 'Ready for your pitch',
  listening: 'Listening',
  processing: 'Processing',
  understanding: 'Understanding',
  speaking: 'Investor responding',
  waiting: 'Waiting for your answer',
  error: 'Needs attention'
};

export { DEMO_PITCH };

export default function InvestorScreen({
  category,
  initialPitch = '',
  messages = [],
  onMessagesChange,
  onRestart,
  onBack,
  selectedLanguage = 'en',
  persona = 'stern',
  focus = 'Balanced Mix',
  onVoiceStateChange,
  onRimeStatusChange,
  isHistoryOpen = false,
  setIsHistoryOpen
}) {
  const { settings } = useTheme();
  const [voiceState, setVoiceState] = useState('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [typedText, setTypedText] = useState(initialPitch);
  const [error, setError] = useState('');
  const [ttsUrl, setTtsUrl] = useState(null);
  const [isRimeActive, setIsRimeActive] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState('');
  const questionCount = messages.filter((message) => message.role === 'investor' && !message.isConclusion).length;
  const hasConclusion = messages.some((message) => message.isConclusion);
  const [sessionComplete, setSessionComplete] = useState(hasConclusion);
  const [sessionHistory, setSessionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('echoes_investor_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [localHistoryOpen, setLocalHistoryOpen] = useState(false);
  const effectiveHistoryOpen = setIsHistoryOpen ? isHistoryOpen : localHistoryOpen;
  const setEffectiveHistoryOpen = setIsHistoryOpen || setLocalHistoryOpen;
  const [selectedHistorySession, setSelectedHistorySession] = useState(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const submittingRef = useRef(false);
  const requestGenerationRef = useRef(0);
  const abortRef = useRef(null);
  const audioRef = useRef(null);
  const ttsUrlRef = useRef(null);
  const finalQuestionNumberRef = useRef(hasConclusion ? 6 : 0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceFrameRef = useRef(null);
  const silenceStartedAtRef = useRef(null);
  const detectedSpeechRef = useRef(false);
  const messagesRef = useRef(messages);
  const savedSessionSignatureRef = useRef(null);

  const voiceSpeaker = String(persona).toLowerCase() === 'friendly' ? 'luna' : 'astra';
  const rimeSupportedLanguages = new Set(['en', 'es', 'fr', 'de', 'ja', 'hi', 'pt', 'ar', 'it']);
  const hasRimeLanguageFallback = !rimeSupportedLanguages.has(String(selectedLanguage).toLowerCase().split('-')[0]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => onVoiceStateChange?.(voiceState), [voiceState, onVoiceStateChange]);

  const addMessage = (role, text) => {
    onMessagesChange([...messages, { id: `${Date.now()}-${role}`, role, text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const saveSession = (messagesToSave) => {
    if (!messagesToSave?.length) return;
    const signature = messagesToSave.map((message) => message.id).join('|');
    if (savedSessionSignatureRef.current === signature) return;
    const session = {
      id: `${Date.now()}-${Math.random()}`,
      date: new Date().toISOString(),
      category,
      persona,
      focus,
      messages: messagesToSave
    };
    setSessionHistory((previous) => {
      const nextHistory = [session, ...previous];
      try { localStorage.setItem('echoes_investor_history', JSON.stringify(nextHistory)); } catch (storageError) { /* local history is best effort */ }
      return nextHistory;
    });
    savedSessionSignatureRef.current = signature;
  };

  const stopAudio = () => {
    requestGenerationRef.current += 1;
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
    if (ttsUrlRef.current) {
      URL.revokeObjectURL(ttsUrlRef.current);
      ttsUrlRef.current = null;
    }
    setTtsUrl(null);
    setCurrentSpeakingText('');
  };

  const speakInvestor = async (text, generation) => {
    try {
      setCurrentSpeakingText(text);
      abortRef.current = new AbortController();
     const result = await fetchTTSAudio(text, {
     language: selectedLanguage,
     speaker: voiceSpeaker,
     persona,
       signal: abortRef.current.signal
   });
      if (generation !== requestGenerationRef.current) return;
      if (result.fallback) {
        onRimeStatusChange?.('error');
        setIsRimeActive(false);
        setError(`Rime could not speak the investor question. ${result.message || 'Check the Rime connection and try again.'}`);
        setVoiceState('error');
        return;
      }
      onRimeStatusChange?.('active');
      setIsRimeActive(true);
      ttsUrlRef.current = result.audioUrl;
      setTtsUrl(result.audioUrl);
    } catch (ttsError) {
      if (ttsError.name !== 'AbortError') {
        onRimeStatusChange?.('error');
        setError(`Rime could not speak the investor question. ${ttsError.message || 'Check the Rime connection and try again.'}`);
        setVoiceState('error');
      }
    }
  };

  const finishInvestorTurn = (generation) => {
    if (generation !== requestGenerationRef.current) return;
    if (finalQuestionNumberRef.current >= 6) {
      saveSession(messagesRef.current);
      setSessionComplete(true);
      setVoiceState('idle');
      setCurrentSpeakingText('');
      releaseMicrophone();
      return;
    }
    setCurrentSpeakingText('');
    setVoiceState('waiting');
  };

  const blobToBase64 = async (blob) => {
    const buffer = await blob.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
    return window.btoa(binary);
  };

  const submitFounderMessage = async (rawText, audioPayload = null) => {
    const founderText = rawText.trim();
    if ((!founderText && !audioPayload) || submittingRef.current) return;

    const isConclusionTurn = questionCount >= 5;

    submittingRef.current = true;
    setError('');
    stopAudio();
    setVoiceState('processing');
    setLiveTranscript('');

    const requestGeneration = ++requestGenerationRef.current;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const founderMessage = { id: `${Date.now()}-founder`, role: 'founder', text: founderText || 'Transcribing founder recording...', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const history = [...messages, founderMessage];
    onMessagesChange(history);

    try {
      setVoiceState('understanding');
      const result = await analyzeInvestor({
        category,
        conversationHistory: messages,
        latestFounderMessage: founderText,
        audioBase64: audioPayload?.audioBase64 || null,
        audioMimeType: audioPayload?.audioMimeType || null,
        persona,
        focus,
        isConclusion: isConclusionTurn,
        signal: abortRef.current.signal
      });
      if (requestGeneration !== requestGenerationRef.current) return;
      const resolvedFounderText = result.transcript || founderText;
      const resolvedHistory = history.map((message) => (
        message.id === founderMessage.id ? { ...message, text: resolvedFounderText } : message
      ));
      const nextQuestionNumber = questionCount + 1;
      const nextMessages = [
        ...resolvedHistory,
        { id: `${Date.now()}-understanding`, role: 'understanding', text: result.cleanedText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: `${Date.now()}-investor`, role: 'investor', text: result.investorResponse, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), observations: result.keyObservations, isConclusion: isConclusionTurn }
      ];
      onMessagesChange(nextMessages);
      if (isConclusionTurn) {
        saveSession(nextMessages);
        finalQuestionNumberRef.current = 6;
      } else {
        finalQuestionNumberRef.current = nextQuestionNumber;
      }
      setVoiceState('speaking');
      await speakInvestor(result.investorResponse, requestGeneration);
    } catch (requestError) {
      if (requestError.name !== 'AbortError' && requestGeneration === requestGenerationRef.current) {
        setError(requestError.message);
        setVoiceState('error');
      }
    } finally {
      submittingRef.current = false;
    }
  };

  const releaseMicrophone = () => {
    if (silenceFrameRef.current) cancelAnimationFrame(silenceFrameRef.current);
    silenceFrameRef.current = null;
    silenceStartedAtRef.current = null;
    analyserRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  };

  const monitorSilence = (recorder, analyser, volumeData) => {
    if (recorder.state !== 'recording') return;
    analyser.getByteTimeDomainData(volumeData);
    let sumSquares = 0;
    for (let index = 0; index < volumeData.length; index += 1) {
      const amplitude = (volumeData[index] - 128) / 128;
      sumSquares += amplitude * amplitude;
    }
    const volume = Math.sqrt(sumSquares / volumeData.length);
    const now = performance.now();
    if (volume > 0.025) {
      detectedSpeechRef.current = true;
      silenceStartedAtRef.current = null;
    } else if (detectedSpeechRef.current) {
      silenceStartedAtRef.current ??= now;
      if (now - silenceStartedAtRef.current >= 2000) {
        setVoiceState('processing');
        recorder.stop();
        return;
      }
    }
    silenceFrameRef.current = requestAnimationFrame(() => monitorSilence(recorder, analyser, volumeData));
  };

  const handleRecordingError = (message) => {
    releaseMicrophone();
    recordingChunksRef.current = [];
    setError(message);
    setLiveTranscript('');
    setVoiceState('idle');
  };

  const startListening = async () => {
    stopAudio();
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      handleRecordingError('Live microphone recording is not supported in this browser. Use the text field and Send to continue.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
        .find((type) => MediaRecorder.isTypeSupported(type)) || '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recordingChunksRef.current = [];
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      detectedSpeechRef.current = false;
      recorder.ondataavailable = (event) => {
        if (event.data?.size) recordingChunksRef.current.push(event.data);
      };
      recorder.onerror = () => handleRecordingError('The microphone recorder failed. No answer was submitted. Please try again or use text input.');
      recorder.onstart = () => {
        setLiveTranscript('Recording... Press Stop / Finish Speaking when your answer is complete.');
        setVoiceState('listening');
        monitorSilence(recorder, analyser, new Uint8Array(analyser.fftSize));
      };
      recorder.onstop = async () => {
        const recordedMimeType = recorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(recordingChunksRef.current, { type: recordedMimeType });
        releaseMicrophone();
        recordingChunksRef.current = [];
        if (!audioBlob.size) {
          handleRecordingError('No microphone audio was captured. Nothing was submitted. Please try again.');
          return;
        }
        try {
          setVoiceState('processing');
          setLiveTranscript('Transcribing your recording...');
          const audioBase64 = await blobToBase64(audioBlob);
          await submitFounderMessage('', { audioBase64, audioMimeType: recordedMimeType });
        } catch (error) {
          handleRecordingError('The recording could not be sent. No answer was submitted. Please try again.');
        }
      };
      recorder.start(1000);
    } catch (error) {
      const message = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError'
        ? 'Microphone permission was denied. Allow microphone access and try Speak again.'
        : `Microphone could not start${error?.message ? `: ${error.message}` : '.'} No answer was submitted.`;
      handleRecordingError(message);
    }
  };

  const stopListening = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;
    setVoiceState('processing');
    recorder.stop();
  };

  const resetSession = () => {
    saveSession(messagesRef.current);
    stopAudio();
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    releaseMicrophone();
    recordingChunksRef.current = [];
    submittingRef.current = false;
    finalQuestionNumberRef.current = 0;
    setSessionComplete(false);
    setLiveTranscript('');
    setTypedText('');
    setError('');
    setVoiceState('idle');
    onRestart?.();
  };

  const submitTypedMessage = () => {
    const submittedText = typedText;
    if (!submittedText.trim()) return;
    setTypedText('');
    submitFounderMessage(submittedText);
  };

  useEffect(() => () => {
    try {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    } catch (cleanupError) { /* ignore unmount cleanup */ }
    releaseMicrophone();
    stopAudio();
  }, []);

  useEffect(() => {
    if (!ttsUrl || !audioRef.current) return;
    const audio = audioRef.current;
    audio.play().then(() => setVoiceState('speaking')).catch(() => {
      setError('Investor audio could not autoplay. Use the replay control to play the question.');
      finishInvestorTurn(requestGenerationRef.current);
    });
  }, [ttsUrl]);

  const t = getTranslation(selectedLanguage);

  const stateLabels = {
    idle: t.readyForPitch,
    listening: t.listening,
    processing: t.processing,
    understanding: t.understanding,
    speaking: t.speaking,
    waiting: t.waiting,
    error: t.needsAttention
  };

  return (
    <main className="echoes-main-viewport investor-session" role="main">
      {ttsUrl && <audio ref={audioRef} src={ttsUrl} onEnded={() => finishInvestorTurn(requestGenerationRef.current)} />}
      <section className="investor-header-panel">
        <div>
          <button type="button" className="investor-back-button" onClick={onBack} title="Return to pitch selection"><ArrowLeft size={16} /> {t.back}</button>
          <div className="welcome-sub-kicker">{t.coachTitle} • {persona === 'friendly' ? t.friendlyPersona : t.sternPersona}</div>
          <h1>{t.categoryLabels?.[category] || category}</h1>
          <p>
            {persona === 'friendly'
              ? t.friendlyInvestorIntro
              : t.sternInvestorIntro}
          </p>
        </div>
        <div>
          <div className="investor-progress">{hasConclusion ? 'Review Complete' : t.questionOf(Math.min(questionCount + 1, 5), 5)}</div>
          <div className={`investor-state-badge state-${voiceState}`}><span />{stateLabels[voiceState]}</div>
        </div>
      </section>

      {hasRimeLanguageFallback && (
        <div className="history-local-note" role="status">
          Rime does not support this language selection for the configured voice, so spoken investor responses will use English.
        </div>
      )}

      {/* Synced Live Subtitles & Captions Overlay during Audio Playback */}
      {settings.subtitles && voiceState === 'speaking' && currentSpeakingText && (
        <div className="investor-subtitles-bar" role="status" aria-live="polite">
          <Volume2 size={16} className="subtitles-icon" />
          <div className="subtitles-body">
            <span className="subtitles-persona-kicker">{persona === 'friendly' ? t.friendlyPersona : t.sternPersona}:</span>
            <span className="subtitles-text">{currentSpeakingText}</span>
          </div>
        </div>
      )}

      <section className="investor-transcript-panel" aria-label="Pitch conversation">
        {messages.length === 0 ? <div className="investor-empty"><Brain size={28} /><p>{t.emptyPitchHelper}</p></div> : messages.filter((message) => message.role !== 'understanding').map((message) => (
          <article className={`investor-message investor-${message.role} ${message.isConclusion ? 'investor-conclusion' : ''}`} key={message.id}>
            <div className="investor-message-label">
              {message.isConclusion
                ? 'INVESTOR (FINAL CONCLUSION)'
                : message.role === 'founder'
                  ? t.founderLabel
                  : message.role === 'understanding'
                    ? t.aiUnderstandingLabel
                    : t.investorLabel} <time>{message.timestamp}</time>
            </div>
            <p>{message.text}</p>
            {message.observations?.length > 0 && <small>{message.observations.join(' | ')}</small>}
            {message.role === 'investor' && <button type="button" className="btn-bubble-action" onClick={() => speakInvestor(message.text, requestGenerationRef.current)} title="Replay investor response"><Volume2 size={14} /></button>}
          </article>
        ))}
      </section>
      {liveTranscript && <div className="investor-live-transcript"><Mic size={15} /> <strong>{t.founderLabel}:</strong> {liveTranscript}</div>}
      {error && <div className="investor-error" role="alert"><AlertCircle size={16} />{error}</div>}
      <section className="investor-input-panel">
        <textarea value={typedText} onChange={(event) => setTypedText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitTypedMessage(); } }} placeholder={t.typePlaceholder} aria-label="Founder pitch or answer" disabled={voiceState === 'processing' || voiceState === 'understanding' || sessionComplete} />
        <div className="investor-input-actions">
          <button type="button" className={`btn-primary-mic ${voiceState === 'listening' ? 'listening' : ''}`} onClick={voiceState === 'listening' ? stopListening : startListening} disabled={voiceState === 'processing' || voiceState === 'understanding' || sessionComplete}>
            {voiceState === 'listening' ? <><Square size={16} /> {t.stopSpeaking}</> : <><Mic size={16} /> {t.speak}</>}
          </button>
          <button type="button" className="btn-send-message investor-send" onClick={submitTypedMessage} disabled={!typedText.trim() || voiceState === 'processing' || voiceState === 'understanding' || sessionComplete}><CheckCircle2 size={16} /> {t.send}</button>
          <button type="button" className="btn-new-session" onClick={resetSession} title="Start a new investor session" aria-label="Start a new investor session">{t.newSession}</button>
        </div>
      </section>

      {effectiveHistoryOpen && (
        <div className="history-overlay" role="dialog" aria-modal="true" aria-label="Session history">
          <section className="history-panel">
            <div className="history-panel-header">
              <div><span className="welcome-sub-kicker">{t.localArchive}</span><h2>{t.sessionHistory}</h2></div>
              <button type="button" className="btn-icon-tool" onClick={() => setEffectiveHistoryOpen(false)} aria-label="Close session history" title="Close history"><X size={17} /></button>
            </div>
            <p className="history-local-note">{t.historyNote}</p>
            {selectedHistorySession ? (
              <div className="history-transcript-view">
                <button type="button" className="history-back-button" onClick={() => setSelectedHistorySession(null)}><ArrowLeft size={14} /> {t.allSessions}</button>
                <h3>{selectedHistorySession.category} {selectedHistorySession.persona ? `(${selectedHistorySession.persona.toUpperCase()})` : ''}</h3>
                <time>{new Date(selectedHistorySession.date).toLocaleString()}</time>
                {selectedHistorySession.messages.filter((message) => message.role !== 'understanding').map((message) => <article className={`investor-message investor-${message.role}`} key={message.id}><div className="investor-message-label">{message.role === 'founder' ? t.founderLabel : t.investorLabel} <time>{message.timestamp}</time></div><p>{message.text}</p></article>)}
              </div>
            ) : (
              <div className="history-list">
                {sessionHistory.length === 0 ? <p className="history-empty">{t.noCompletedSessions}</p> : sessionHistory.map((session) => <button type="button" className="history-list-item" key={session.id} onClick={() => setSelectedHistorySession(session)}><span><strong>{session.category} {session.persona ? `• ${session.persona.toUpperCase()}` : ''}</strong><small>{new Date(session.date).toLocaleString()}</small></span><ArrowLeft size={15} className="history-open-icon" /></button>)}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}