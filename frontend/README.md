# ECHOES — AI Voice Storyteller

> *"Don't read the story. Live it."*  
> An interactive story that listens, remembers, and changes with you.

---

## ✦ Product Identity

**ECHOES** transforms storytelling from a passive "storybook with a play button" into a **living AI voice agent**. The user talks naturally to the application: the AI listens, understands, and responds, while **Rime TTS** narrates the journey in real time. If the user interrupts, the narration halts immediately, and the AI adapts on the fly.

---

## ✦ System Architecture

```
         USER SPEECH
              ↓
      SPEECH RECOGNITION  (Web Speech API with Auto-routing)
              ↓
           AI AGENT       (Intent, Memory & Command Dispatcher)
              ↓
            OPENAI        (gpt-4o-mini with Spoken Prompt Cadence)
              ↓
           RESPONSE       (narrative, speechText, memoryUpdate, action)
              ↓
           RIME TTS       (POST https://users.rime.ai/v1/rime-tts)
              ↓
            AUDIO         (Binary MP3 Stream & Live Waveform)
              ↓
             USER         (Live Interruption Supported)
```

---

## ✦ Key Features

### 1. Modern Dark Aurora Interface
- Built with a futuristic, calm, dark aurora design palette:
  - **Background**: `#080B14`
  - **Deep Surface**: `#101522`
  - **Card**: `#151C2B`
  - **Electric Cyan**: `#45E0D0`
  - **Violet**: `#8B7CFF`
  - **Soft Lavender**: `#B8B4FF`
  - **Warm White**: `#F4F7FB`
  - **Success**: `#57E6A5`
- 6 Themes: **Aurora**, **Midnight**, **Ocean**, **Violet**, **Emerald**, and **Sunset**.

### 2. Central Interactive Voice Core
- Replaces traditional static audio players with a living central reactive centerpiece:
  - `✦ READY`: "Talk to Echoes"
  - `● LISTENING`: Animated concentric rings & pulse
  - `✦ THINKING`: Rotating particle glow
  - `◉ SPEAKING`: Multi-bar dynamic waveform
  - `Ⅱ INTERRUPTED`: "Listening again..."
  - `! ISSUE`: Voice connection status

### 3. Instantaneous Voice Interruption
- Users can interrupt the AI at any moment by speaking, tapping the Voice Core or Mic button, or pressing Space/Escape.
- Active audio halts instantly (`audio.pause()`, `currentTime = 0`), pending requests are aborted via `AbortController`, and the microphone captures the new intent.

### 4. Dual Memory System (Zero External Database)
- **AI Story Memory**: Structured memory object tracking protagonist name, current location, discovered items/relics, and established world lore.
- **Conversation Memory**: Live visible feed recording user statements, Echoes replies, and system memory updates (`Memory updated: Character → Maya`).
- Persisted locally in `localStorage` with graceful in-memory fallback.

### 5. Safe Voice Commands & Settings
- Natural language commands map to predefined, safe frontend actions:
  - **Themes**: *"Switch to Ocean theme"*, *"Make it more purple"*
  - **Settings**: *"Make the text larger"*, *"Turn animations off"*, *"Enable subtitles"*
  - **Memory**: *"Remember my character is Maya"*, *"Forget the silver key"*, *"What's in my story memory?"*
  - **Playback**: *"Stop"*, *"Pause"*, *"Repeat that"*, *"Start a new story"*
- Strict safety: **Zero** arbitrary code execution.

### 6. Primary Rime TTS & Transparent Fallback
- Rime TTS is the primary spoken output (`modelId: mist`, `speaker: marsh`, `samplingRate: 22050`, `speedAlpha: 0.95`).
- Browser `SpeechSynthesis` functions strictly as an explicitly labeled fallback when no API key is configured or on network error.
- Displays real measured latencies (via `performance.now()`). Zero fabricated metrics.
- The Navbar reports active Rime only after a successful audio response. A configured key alone is not synthesis verification.
- Current workspace verification returned `fallback: true` because `RIME_API_KEY` was not configured. No live Rime success is claimed.

#### Rime Runtime Contract
- Endpoint: `POST https://users.rime.ai/v1/rime-tts` over HTTPS.
- Model: `mist`; voice: `marsh`; requested sample rate: `22050`; requested output: MP3.
- Application language codes sent to Rime: `en`, `de`, `es`, `fr`, `hi`, and `ja`.
- The API key is loaded by the Node server from `.env` and is never sent to the browser.
- `/api/tts` validates text and speed, applies a 30-second upstream timeout, validates an audio response, and returns JSON fallback information when Rime is unavailable.

#### Reproducible TTS Verification
Start the backend with `npm run server`, then run this request without placing the key in source code:

```powershell
$body = @{ text = "This is a live Rime synthesis verification."; language = "en"; speedAlpha = 0.95 } | ConvertTo-Json
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:5000/api/tts" -Method Post -ContentType "application/json" -Body $body
```

Successful live Rime output is an HTTP 200 audio response with non-zero bytes. JSON containing `fallback: true` is not a Rime success.

---

## ✦ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

# OpenAI API Key (Story Generation & Memory Orchestration)
OPENAI_API_KEY=your_openai_api_key_here

# Rime TTS API Key (Spoken Audio Output)
RIME_API_KEY=your_rime_api_key_here
```

*(If keys are not configured, ECHOES runs in offline demonstration mode with local story branches, safe actions, memory mutations, and browser speech fallback.)*

---

## ✦ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
Starts both backend server (port 5000) and Vite client (port 3000):
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## ✦ Primary Hackathon Demonstration Flow (16 Steps)

1. Open `http://localhost:3000` and click **"🎙 START TALKING"**.
2. AI begins Chapter 1; Voice Core transitions to `◉ SPEAKING`.
3. Rime narrates the opening lore and options with natural conversational cadence.
4. **Interrupt Rime**: Click the Voice Core orb or say *"Wait, stop"*.
5. Rime audio stops immediately; state changes to `Ⅱ INTERRUPTED` then `● LISTENING`.
6. Speak a new choice: *"I want to inspect the celestial astrolabe"*.
7. Speech is recognized and appears in the Live Conversation stream.
8. AI agent understands intent and advances to Chapter 2.
9. Rime resumes narration of the new path.
10. **Mutate Memory**: Speak *"Remember that my character name is Maya"*.
11. Observe conversation confirmation: `Memory updated: Character → Maya`.
12. **Query Memory**: Ask *"What is my character name?"* -> AI answers using Maya.
13. **Voice Theme**: Say *"Switch to Ocean theme"* -> UI transitions to Ocean palette.
14. **Voice Settings**: Say *"Make text bigger"* -> Story typography scales up.
15. **Language Command**: Say *"Change language to Hindi"* -> System routes language.
16. Open the **Story Memory Modal** (Brain icon) to inspect cataloged relics and lore.

---

## ✦ Mobile Responsiveness

On mobile devices, ECHOES delivers a first-class stacked layout:
1. **Header** (Sticky brand & status pills)
2. **Central Voice Core** (Large, easy to tap)
3. **Current Story Card** (Compact, readable serif)
4. **Live Conversation Stream** (Scrollable message feed)
5. **Voice Input Dock** (Large microphone button)
6. **Branching Choices** (Touch-friendly pills)
7. **AI State Bar** (Live telemetry)

## ✦ Known Limitations
- OpenAI and Rime credentials are external prerequisites. Without them, the local story engine and browser speech fallback are used.
- Browser speech recognition is primarily available in Chromium-based browsers and requires microphone permission.
- Rime language acceptance is provider-dependent; unsupported responses are disclosed as browser fallback.
- Interruption cancels browser requests and playback promptly. A provider may finish work after a client disconnect if it already accepted the request.
- Express is version 4 in the current package.

---

## ✦ License
MIT License
