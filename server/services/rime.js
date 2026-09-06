import dotenv from 'dotenv';
dotenv.config();

/**
 * Synthesize speech using the Rime TTS API
 * POST https://users.rime.ai/v1/rime-tts
 */
export async function synthesizeSpeech(text, options = {}) {
  const apiKey = process.env.RIME_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_rime_api_key')) {
    console.log('[Rime Service] No API key configured. Frontend will use browser voice synthesis fallback.');
    return {
      fallback: true,
      reason: 'RIME_API_KEY not configured in backend environment.'
    };
  }

  const {
    speaker = 'marsh', // Deep, resonant, storyteller voice
    modelId = 'mist',
    samplingRate = 22050,
    speedAlpha = 0.95, // Slightly deliberate, immersive storytelling pace
    lang = 'en',
    signal
  } = options;

  const supportedLanguages = new Set(['en', 'de', 'es', 'fr', 'hi', 'ja']);
  if (lang && lang !== 'auto' && !supportedLanguages.has(lang)) {
    return {
      fallback: true,
      reason: `Rime language '${lang}' is not supported by this application.`
    };
  }

  try {
    const payload = {
      speaker,
      text,
      modelId,
      samplingRate,
      speedAlpha
    };

    if (lang && lang !== 'auto' && lang !== 'en') {
      payload.lang = lang;
    }

    // Rime API REST call
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 30000);
    const combinedSignal = signal
      ? AbortSignal.any([signal, timeoutController.signal])
      : timeoutController.signal;

    const response = await fetch('https://users.rime.ai/v1/rime-tts', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mp3',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: combinedSignal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`[Rime Service] API returned status ${response.status}: ${errorBody}`);
      return {
        fallback: true,
        reason: `Rime API responded with status ${response.status}`
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('audio/')) {
      const responseBody = await response.text();
      console.warn(`[Rime Service] Unexpected content type ${contentType}: ${responseBody}`);
      return {
        fallback: true,
        reason: 'Rime API returned a non-audio response.'
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return {
        fallback: true,
        reason: 'Rime API returned an empty audio response.'
      };
    }

    return {
      fallback: false,
      contentType,
      audioBuffer: buffer
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('[Rime Service] Network or synthesis failure:', error.message);
    return {
      fallback: true,
      reason: error.message
    };
  }
}
