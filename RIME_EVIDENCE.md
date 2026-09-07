# ✦ Rime Hackathon Challenge Evidence ✦
## Project: ECHOES OF THE ARCANE — AI Voice Storyteller

---

### 1. The Voice Problem Being Solved

Traditional choose-your-own-adventure digital stories suffer from cognitive fatigue and detached interaction:
- **Text Fatigue**: Reading endless paragraphs on screens breaks immersion.
- **Detached Interaction**: Clicking sterile buttons reduces narrative agency to a web form.
- **Audiobook Rigidity**: Standard audiobooks are linear; pre-recorded voice trees are rigid.

**ECHOES** solves this by creating a **living conversational voice storyteller**:
The user speaks naturally, the AI understands, the story evolves in real time, **Rime TTS acts as the primary voice of the storyteller**, and the user can interrupt the narration at any second to steer the journey.

---

### 2. Why Voice Is Essential to the Product

Voice is the fundamental core of ECHOES:
1. **Oral Tradition & Immersion**: Expressive cinematic voice creates suspense and emotional depth.
2. **Conversational Agency & Memory**: Users speak commands directly (*"Remember that my character is Maya"*, *"Switch to Ocean theme"*, *"Open the silver door"*) and the AI adapts instantly.
3. **Live Interruption Agency**: If the user speaks while Rime is narrating, audio halts instantaneously (`audio.pause()`), recognition captures the user's new command, and the AI processes it immediately.
4. **Auto-Listen After Narration**: After each Rime chapter ends, the system automatically enters LISTENING mode — no button click required.

---

### 3. Architecture & Data Flow

```
USER SPEECH (Web Speech API — continuous, interimResults)
    ↓
INTERRUPTION CHECK (onspeechstart + onresult detect speech while voiceState='speaking')
    ↓
AI ORCHESTRATOR & MEMORY ENGINE (Express 4 / Node.js backend)
    ↓
OPENAI gpt-4o-mini (or offline demo engine when key absent)
    ↓
RESPONSE (JSON: narrative, speechText, choices, memory, action)
    ↓
RIME TTS POST https://users.rime.ai/v1/rime-tts (model: mist, speaker: marsh)
    ↓
AUDIO PLAYBACK via <audio> element
    ↓
AUTO-LISTEN (handleAudioEnded → 350ms → setVoiceState('listening'))
    ↓
USER (Can Interrupt At Any Second — including during audio)
```

> **Note**: ECHOES does NOT claim to have trained Rime. Rime is consumed as the primary spoken audio synthesis engine through its official HTTP REST API.

---

### 4. Exact Rime Integration Locations in the Codebase

| Component | File | Role |
| :--- | :--- | :--- |
| **Rime Service** | `../backend/ridhima-integration/rime.js` | `synthesizeSpeech(text, options)` — authenticated `POST` to Rime API, returns binary audio buffer |
| **TTS Route** | `../backend/routes/tts.js` | `POST /api/tts` — receives text + language, calls Rime service, streams `audio/mp3` |
| **Frontend API** | `src/utils/api.js` | `fetchTTSAudio()` — tracks real latency via `performance.now()`, supports AbortController, creates Object URL |
| **Voice Controller** | `src/components/StoryScreen.jsx` | Manages autoplay, interruption, continuous recognition, auto-listen after narration |
| **Voice Core UI** | `src/components/VoiceCore.jsx` | Reactive orb: idle / listening / thinking / speaking / interrupted / error |

---

### 5. Verified Rime API Parameters

Implemented in `../backend/ridhima-integration/rime.js`: 

| Parameter | Value |
| :--- | :--- |
| **Endpoint** | `https://users.rime.ai/v1/rime-tts` |
| **Method** | `POST` |
| **Model ID** | `mist` |
| **Speaker** | `marsh` (deep, resonant, cinematic storyteller voice) |
| **Output Format** | `audio/mp3` |
| **Sampling Rate** | `22050` Hz |
| **Speed Alpha** | `0.95` (deliberate storytelling pace, user-adjustable) |
| **Fallback** | Returns `{ fallback: true, reason: "..." }` — never silently fails |

---

### 6. Interruption Architecture — Full State Machine

```
IDLE → LISTENING (after narration ends or user clicks mic)
LISTENING → THINKING (user speaks final utterance)
THINKING → SPEAKING (Rime audio starts playing)
SPEAKING → INTERRUPTED (user speaks while audio plays — onspeechstart/onresult)
INTERRUPTED → LISTENING (180ms after interruption, mic reactivated)
LISTENING → THINKING (new utterance processed)
```

**True Interruption Implementation** (in `StoryScreen.jsx`):
1. `recognition.continuous = true` + `interimResults = true` — mic stays primed while Rime audio plays
2. `recognition.onspeechstart` fires the moment user starts speaking — instant `stopAudio()` + state change
3. `recognition.onresult` also checks `voiceStateRef.current === 'speaking'` on every interim result
4. `stopAudio()` executes: `audioRef.current.pause()`, `currentTime = 0`, `abortControllerRef.current.abort()`
5. `onUserMessage({ isInterruption: true })` logs the interruption event to the Live Conversation panel
6. After 180ms, `setVoiceState('listening')` — user's new speech is captured
7. Space / Escape keyboard shortcuts also trigger immediate interruption

---

### 7. Safe Structured Action Schema

Voice commands trigger safe structured actions (no `eval()`, no arbitrary JS). All 9 action types:

| Action Type | Voice Trigger Example | Effect |
| :--- | :--- | :--- |
| `change_theme` | *"Switch to Ocean theme"* | `setTheme('ocean')` |
| `change_language` | *"Speak in Hindi"* | `setSelectedLanguage('hi')` |
| `change_text_size` | *"Make text bigger"* | `updateSettings({ fontSize: 'large' })` |
| `toggle_animations` | *"Disable animations"* | `updateSettings({ animations: false })` |
| `toggle_subtitles` | *"Turn on subtitles"* | `updateSettings({ subtitles: true })` |
| `change_narration_speed` | *"Speak faster"* | `updateSettings({ narrationSpeed: 1.15 })` |
| `start_new_story` | *"Start a new adventure"* | `onRestart()` |
| `remember_fact` | *"Remember that the dragon is Ember"* | Appended to `memory.storyFacts` |
| `delete_memory` | *"Forget that the door is locked"* | Removed from `memory.storyFacts` |

---

### 8. Story Memory Schema (Persisted in localStorage)

```json
{
  "currentChapter": 2,
  "character": "The Seeker",
  "location": "Oakhaven Subterranean Archives",
  "importantObjects": ["Celestial Astrolabe", "Serpent Key", "Pulsing Grimoire"],
  "relationships": ["The Silent Scribes"],
  "choicesMade": ["Examined the celestial astrolabe"],
  "storyFacts": ["Azure flame burns without heat", "Dragon is called Ember"],
  "previousUserInstructions": ["Remember the dragon is called Ember"]
}
```

---

### 9. Real Performance Telemetry

ECHOES displays **only genuinely measured timings** (zero fabricated metrics):
- **AI Latency**: `performance.now()` from request dispatch to response receipt in `src/utils/api.js`
- **Rime Audio Latency**: `performance.now()` from `/api/tts` dispatch to binary audio blob arrival
- Status bar displays: `AI: 1.24s | RIME AUDIO: 0.62s`

---

### 10. Fallback Transparency

| State | Indicator | When |
| :--- | :--- | :--- |
| `RIME ● READY` | Configuration indicator | `RIME_API_KEY` configured; does not prove synthesis |
| `RIME ● SPEAKING` | Animated waveform | Rime audio is playing |
| `RIME ● OFFLINE` | Amber dot | No API key / network error |

Browser `SpeechSynthesis` is used strictly as fallback — always labeled explicitly in the conversation panel.

---

### 11. Runtime Verification Results

Checks run against `http://localhost:5000` in the current workspace. No `RIME_API_KEY` was configured, so no live Rime synthesis success is claimed:

```
✅ GET  /api/health       → { status: "ok", services: { openai: false, rime: false } }
✅ POST /api/story/start  → chapter 1 narrative with full memory schema + 3 choices
✅ POST /api/tts          → HTTP 200, `Content-Type: application/json; charset=utf-8`, 81 bytes, `fallback: true`, message: `RIME_API_KEY not configured in backend environment.`
✅ POST /api/story/continue
       input: "Remember that the dragon is called Ember"
       → chapter 2 with memory.storyFacts updated
✅ POST /api/story/continue
       input: "What do you remember about me?"
       → character, location, objects, lore recalled accurately

Additional checks after hardening:

```
✅ German story start → HTTP 200, 3 choices, localized opening text
✅ Character recall with memory.character = Maya → response speech mentions Maya
✅ Forget that Silver Key → Silver Key removed from importantObjects
✅ Invalid speedAlpha = 3 → HTTP 400 with validation message
❌ Live Rime synthesis → not verified because RIME_API_KEY is unavailable
```
```

---

### 12. Step-by-Step Reproduction Guide

#### Test A: Start Story by Voice
1. Run `npm run dev` and open `http://localhost:3000`
2. Click **"🎙 START TALKING"** or the Voice Core orb
3. Observe: THINKING → SPEAKING with animated Rime waveform
4. Rime (or fallback browser TTS) narrates the opening chapter with 3 choices
5. After narration ends, system automatically enters LISTENING mode

#### Test B: Live Interruption
1. While narration is playing, say *"Wait, stop"* or press Space/Escape
2. Audio halts immediately
3. State changes to `Ⅱ INTERRUPTED: Listening again...`
4. Your speech is recognized and logged in the Conversation panel
5. AI responds; Rime narrates the new path

#### Test C: Natural Story Memory
1. Say: *"Remember that my character name is Maya."*
2. Conversation panel logs: `MEMORY — Memory updated`
3. Open the AI Story Memory modal (Brain icon in header) → `PROTAGONIST IDENTITY: Maya`
4. Say: *"Who am I and what do you remember?"*
5. AI responds with Maya's name and inventory

#### Test D: Voice Settings & Theme Commands
1. *"Switch to Ocean theme"* → UI palette transitions to ocean dark
2. *"Make text bigger"* → Story typography expands
3. *"Change language to Hindi"* → Recognition lang switches to `hi-IN`

#### Test E: Rime with Live API Key
1. Add a valid `RIME_API_KEY` to `.env` without committing or printing it.
2. Restart server
3. Run the exact `/api/tts` request from the README verification section.
4. Confirm HTTP 200, an audio content type, and non-zero response bytes.
5. Confirm the UI reports active Rime audio, not browser fallback.

---

### 13. Limitations

- **Autoplay Policies**: Browsers require an initial user gesture before playing audio. Clicking *"🎙 START TALKING"* satisfies this.
- **Speech Recognition**: Web Speech API is natively supported in Chrome, Edge, Brave. Firefox/Safari need the text fallback.
- **Offline Mode**: With no API keys, the offline engine provides local branches, localized opening text for the application languages, memory, safe controls, and browser speech fallback. OpenAI story generation and live Rime audio require valid credentials.
- **Verification status**: This document records the actual fallback result above and does not claim live Rime success until the reproducible request returns audio.
