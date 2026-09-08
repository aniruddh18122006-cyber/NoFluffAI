# Rime Integration Evidence

This document records the Rime TTS integration used by the AI Investor Pitch Coach.

## What Rime Does

Gemini generates the investor's next question or final conclusion. The frontend then sends that investor text to `POST /api/tts`. The backend calls Rime and returns the audio response for playback. Rime is the spoken-output service; it does not generate investor dialogue.

## Code-Verified Contract

The implementation in `backend/ridhima-integration/rime.js` sends:

| Field | Implemented value |
| --- | --- |
| Endpoint | `https://users.rime.ai/v1/rime-tts` |
| Method | `POST` |
| Authentication | `Authorization: Bearer <RIME_API_KEY>` |
| Model | `coda` (`modelId`) |
| Language | Supported language code, otherwise `en` |
| Speaker | Request speaker, default `astra` |
| Response | An audio content type and non-empty audio buffer |

The route validates non-empty text up to 12,000 characters and returns JSON with `fallback: true` when the key is missing, Rime returns an error, or the response is not audio. The Rime request has a 30-second timeout.

## Persona Voice Mapping

`frontend/src/components/InvestorScreen.jsx` selects the speaker used for each persona:

| Persona | Investor character | Rime speaker |
| --- | --- | --- |
| Friendly | Dana | `luna` |
| Stern | Marcus | `astra` |

The application sends the selected speaker in the JSON body of `/api/tts`. If no speaker is supplied by a caller, the backend default is `astra`.

## Reproducible Verification

Start the backend from the `frontend` directory with `npm run server`, then run this request without putting a key in source code:

```powershell
$body = @{ text = "Please explain your customer acquisition plan."; language = "en"; speaker = "astra" } | ConvertTo-Json
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:5000/api/tts" -Method Post -ContentType "application/json" -Body $body
```

With a valid `RIME_API_KEY`, a successful response has an audio content type and non-zero bytes. Without a configured key, the implemented response is HTTP 200 JSON with `fallback: true` and the reason `RIME_API_KEY not configured in backend environment.` That fallback is not evidence of live Rime synthesis.

## Current Verification Status

The source-level integration is verified against the request contract above: model `coda`, default speaker `astra`, and the persona speakers `luna` and `astra`. No live audio response is claimed in this document because a usable Rime API key was not available during this documentation pass. The command above is the live check to run in an environment with credentials.