# AI Investor Pitch Coach

AI Investor Pitch Coach lets founders rehearse a pitch with a simulated investor. The founder chooses a business context, investor persona, and optional focus area, then submits a pitch and answers five follow-up questions. Gemini generates the next question from the founder's pitch and conversation history. Rime provides spoken investor responses when its API key is configured.

## Product Flow

1. Choose a category: `Consumer App`, `B2B SaaS`, or `Marketplace`.
2. Choose an investor persona:
   - **Friendly Investor**: Dana, a warm and constructive investor. Rime speaker: `luna`.
   - **Stern Investor**: Marcus, a skeptical and direct investor. Rime speaker: `astra`.
3. Submit the pitch by typing or recording it.
4. Answer the investor's questions by typing or recording each answer.
5. Gemini asks exactly five investor questions, then returns an in-character conclusion.

The investor prompt asks one question at a time, reacts to the founder's actual claims, and avoids repeating topics already covered. The selected business context influences the areas explored, such as customers, competition, pricing, retention, distribution, or marketplace liquidity.

## Architecture

```
React/Vite frontend
        |
        | POST /api/investor/analyze
        v
Node/Express backend -> Gemini (analysis and audio transcription)
        |
        | POST /api/tts
        v
Rime TTS (modelId: coda) -> audio/wav
```

The Gemini integration is in `backend/ridhima-integration/investor.js`. It uses model `gemini-3.5-flash-lite` for investor analysis and recorded-audio transcription. The Rime integration is in `backend/ridhima-integration/rime.js`; it posts to `https://users.rime.ai/v1/rime-tts` with `modelId: coda`. The frontend selects `luna` for Friendly and `astra` for Stern and sends that speaker to `/api/tts`.

When Rime is unavailable, `/api/tts` returns a fallback response and the frontend reports the unavailable audio state. No API key is stored in the frontend.

## Requirements

- Node.js with npm
- A Gemini API key for investor analysis and recorded-audio transcription
- A Rime API key for spoken investor responses

Create `frontend/.env` from `.env.example` and provide:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
RIME_API_KEY=your_rime_api_key_here
```

Do not commit `.env` or API keys.

## Run Locally

From the `frontend` directory:

```powershell
npm install
npm run dev
```

The configured development script starts the Node backend on `http://localhost:5000` and the Vite frontend on `http://localhost:3000`.

Useful commands:

```powershell
npm run server
npm run client
npm run build
```

Health check:

```text
GET http://localhost:5000/api/health
```

The health response reports whether Gemini and Rime keys are configured. A configured Rime key is not, by itself, proof that synthesis succeeded; the UI marks Rime active only after receiving an audio response.

## API Routes

- `POST /api/investor/analyze`: analyzes a founder pitch or answer, optionally transcribing `audioBase64`, and returns the cleaned transcript, investor response, and key observations.
- `POST /api/tts`: validates narration text and returns Rime audio or a JSON fallback response.
- `GET /api/health`: reports service configuration status.

## Gemini Model Verification

Google's current [Gemini model catalog](https://ai.google.dev/gemini-api/docs/models) lists `gemini-3.5-flash-lite` as a stable Gemini 3 model. The backend calls that exact ID, and the UI displays `GEMINI 3.5 FLASH LITE` and `gemini-3.5-flash-lite`.