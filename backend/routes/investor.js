import express from 'express';
import { analyzeInvestorPitch, transcribeInvestorAudio } from '../ridhima-integration/investor.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  const { category, conversationHistory, latestFounderMessage, audioBase64, audioMimeType, persona, isConclusion } = req.body || {};
  let founderMessage = latestFounderMessage ? String(latestFounderMessage).trim() : '';

  if (audioBase64) {
    try {
      founderMessage = await transcribeInvestorAudio({ audioBase64, audioMimeType });
    } catch (error) {
      console.error('[Investor Route] Audio transcription failed:', error.message);
      const status = error.code === 'GEMINI_NOT_CONFIGURED' ? 503 : 502;
      return res.status(status).json({
        success: false,
        message: error.code === 'GEMINI_NOT_CONFIGURED'
          ? 'Gemini is not configured. Investor analysis is unavailable.'
          : 'Gemini could not transcribe the founder recording. No answer was submitted.'
      });
    }
  }

  if (!founderMessage) {
    return res.status(400).json({ success: false, message: 'A founder pitch or answer is required.' });
  }

  try {
    const result = await analyzeInvestorPitch({
      category,
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
      latestFounderMessage: founderMessage,
      persona,
      isConclusion: Boolean(isConclusion)
    });
    return res.json({ success: true, transcript: founderMessage, ...result });
  } catch (error) {
    console.error('[Investor Route] Analysis failed:', error.message);
    const status = error.code === 'GEMINI_NOT_CONFIGURED' ? 503 : 502;
    return res.status(status).json({
      success: false,
      message: error.code === 'GEMINI_NOT_CONFIGURED'
        ? 'Gemini is not configured. Investor analysis is unavailable.'
        : 'Gemini could not analyze this pitch. No investor response was generated.'
    });
  }
});

export default router;