import express from 'express';
import { synthesizeSpeech } from '../ridhima-integration/rime.js';
function getDefaultTimeScaleForPersona(persona) {
  const key = String(persona || '').toLowerCase();
  if (key === 'stern') return 0.95;
  if (key === 'friendly') return 1.05;
  return 1.0;
}

const router = express.Router();

/**
 * POST /api/tts
 * Convert story chapter text to audio narration
 */
router.post('/', async (req, res) => {
  const requestController = new AbortController();
  const abortRequest = () => requestController.abort();
  req.once('aborted', abortRequest);
  res.once('close', () => {
    if (!res.writableEnded) requestController.abort();
  });

  try {
    const { text, language, timeScaleFactor , speaker, persona } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '' || text.length > 12000) {
      return res.status(400).json({
        success: false,
        message: 'Narration text is required and must be 12000 characters or fewer.'
      });
    }

    if (timeScaleFactor !== undefined && (!Number.isFinite(Number(timeScaleFactor)) || Number(timeScaleFactor) < 0.8 || Number(timeScaleFactor) > 1.2)) {
  return res.status(400).json({
    success: false,
    message: 'timeScaleFactor must be a number between 0.8 and 1.2.'
  });
}
    const resolvedTimeScaleFactor = timeScaleFactor !== undefined
  ? Number(timeScaleFactor)
  : getDefaultTimeScaleForPersona(persona);
   
    const result = await synthesizeSpeech(text, { lang: language, timeScaleFactor, speaker, signal: requestController.signal });

    if (result.fallback) {
      // Return JSON signaling frontend to activate Web Speech API fallback
      return res.status(200).json({
        fallback: true,
        message: result.reason || 'Rime API not configured. Utilizing browser narration.'
      });
    }

    // Return binary audio stream
    res.set({
      'Content-Type': result.contentType || 'audio/mp3',
      'Content-Length': result.audioBuffer.length,
      'Cache-Control': 'no-cache'
    });

    return res.send(result.audioBuffer);
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    console.error('[TTS Route] Error synthesizing speech:', error);
    return res.status(200).json({
      fallback: true,
      message: 'Failed to reach Rime TTS. Utilizing browser voice fallback.'
    });
  }
});

export default router;
