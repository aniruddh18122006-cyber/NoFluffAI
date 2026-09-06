import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import storyRoutes from './routes/story.js';
import ttsRoutes from './routes/tts.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      openai: Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key')),
      rime: Boolean(process.env.RIME_API_KEY && !process.env.RIME_API_KEY.includes('your_rime_api_key'))
    }
  });
});

// API Routes
app.use('/api/story', storyRoutes);
app.use('/api/tts', ttsRoutes);

// Optional: Serve static build in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // In dev mode, Vite serves the frontend
      res.status(200).send('Echoes of the Arcane Backend is running. Access the frontend via Vite dev server.');
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'Echoes encountered an unexpected disturbance. Please speak again.',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`✦ ECHOES — AI Voice Storyteller backend active on http://localhost:${PORT}`);
  console.log(`✦ Health check ready at http://localhost:${PORT}/api/health`);
});
