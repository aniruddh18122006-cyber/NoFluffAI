import express from 'express';
import { generateInitialStory, continueStory } from '../services/openai.js';

const router = express.Router();

/**
 * POST /api/story/start
 * Starts a new interactive voice tale session
 */
router.post('/start', async (req, res) => {
  try {
    const { language = 'en' } = req.body || {};
    const story = await generateInitialStory(language);
    return res.status(200).json({
      success: true,
      story
    });
  } catch (error) {
    console.error('[Story Route] Error in /start:', error);
    return res.status(500).json({
      success: false,
      message: 'Echoes is momentarily quiet. Please speak or tap to awaken the tale.',
      error: error.message
    });
  }
});

/**
 * POST /api/story/continue
 * Continues story with choice, user voice input, memory context, and language
 */
router.post('/continue', async (req, res) => {
  try {
    const {
      title,
      chapter,
      storyHistory,
      selectedChoice,
      userInput,
      memory,
      language = 'en'
    } = req.body || {};

    if (!selectedChoice && (!userInput || userInput.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'No voice command or choice was provided to proceed.'
      });
    }

    const story = await continueStory({
      title,
      chapter,
      storyHistory: Array.isArray(storyHistory) ? storyHistory : [],
      selectedChoice,
      userInput,
      memory: memory || {},
      language
    });

    return res.status(200).json({
      success: true,
      story
    });
  } catch (error) {
    console.error('[Story Route] Error in /continue:', error);
    return res.status(500).json({
      success: false,
      message: 'Echoes encountered an arcane disturbance. Please try speaking again.',
      error: error.message
    });
  }
});

export default router;
