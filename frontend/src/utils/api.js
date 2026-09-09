/**
 * Frontend API Utility for AI Investor Pitch Coach
 * Includes real latency measurement tracking (no fake metrics).
 */

export async function fetchHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check responded with non-200');
    return await res.json();
  } catch (error) {
    console.warn('[API] Health check failed:', error);
    return null;
  }
}

export async function startStory(language = 'en', signal = null) {
  const t0 = performance.now();
  const res = await fetch('/api/story/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language }),
    signal
  });

  const durationMs = Math.round(performance.now() - t0);

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'The story failed to start. Please try again.');
  }

  const data = await res.json();
  return {
    story: data.story,
    latencyMs: durationMs
  };
}

export async function continueStory({
  title,
  chapter,
  storyHistory,
  selectedChoice,
  userInput,
  memory,
  language = 'en',
  signal = null
}) {
  const t0 = performance.now();
  const res = await fetch('/api/story/continue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      chapter,
      storyHistory,
      selectedChoice,
      userInput,
      memory,
      language
    }),
    signal
  });

  const durationMs = Math.round(performance.now() - t0);

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'The investor coach could not understand the path. Please try speaking again.');
  }

  const data = await res.json();
  return {
    story: data.story,
    latencyMs: durationMs
  };
}

export async function analyzeInvestor({ category, conversationHistory, latestFounderMessage = '', audioBase64 = null, audioMimeType = null, persona = 'stern', focus = 'Balanced Mix', isConclusion = false, signal = null }) {
  const t0 = performance.now();
  const res = await fetch('/api/investor/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, conversationHistory, latestFounderMessage, audioBase64, audioMimeType, persona, focus, isConclusion }),
    signal
  });

  const latencyMs = Math.round(performance.now() - t0);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Investor analysis failed.');
  return { ...data, latencyMs };
}

export async function fetchTTSAudio(text, options = {}) {
  const { language = 'en', speaker = 'astra', persona, signal } = options;
  const t0 = performance.now();
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language, speaker, persona }),
      signal
    });

    const durationMs = Math.round(performance.now() - t0);
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await res.json();
      return {
        fallback: true,
        message: data.message || (res.ok ? 'Rime audio is unavailable.' : `Audio server responded with status ${res.status}.`),
        latencyMs: durationMs
      };
    }

    if (!res.ok) {
      return {
        fallback: true,
        message: 'Audio server responded with error',
        latencyMs: durationMs
      };
    }

    if (!contentType.includes('audio/')) {
      return {
        fallback: true,
        message: `Audio server returned unexpected content type: ${contentType || 'unknown'}.`,
        latencyMs: durationMs
      };
    }

    const blob = await res.blob();
    if (blob.size === 0) {
      return {
        fallback: true,
        message: 'Audio server returned an empty response.',
        latencyMs: durationMs
      };
    }
    const audioUrl = URL.createObjectURL(blob);
    return {
      fallback: false,
      audioUrl,
      latencyMs: durationMs
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    const durationMs = Math.round(performance.now() - t0);
    console.warn('[API] TTS synthesis failed, using voice fallback:', error);
    return {
      fallback: true,
      message: error.message,
      latencyMs: durationMs
    };
  }
}
