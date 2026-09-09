# AI Investor Pitch Coach — Project Handoff

## Repository

Git repository root:
D:\Project\Data forge\frontend

GitHub remote:
https://github.com/aniruddh18122006-cyber/Frontend-2.git

Branch:
main

## Important Folder Structure

The Git repository is the `frontend` folder on the developer's computer.

Inside the repository:

- `src/` — React/Vite frontend
- `backend/` — Node/Express backend used by this project
- `legacy/` — legacy/older files
- `.env.example` — environment variable template
- `.gitignore` — ignored files configuration
- `README.md` — project documentation
- `RIME_EVIDENCE.md` — Rime integration/evidence documentation
- `package.json` — frontend/root scripts and dependencies
- `package-lock.json`
- `vite.config.js`

The workspace also contains:
`D:\Project\Data forge\backend`

IMPORTANT: This workspace-level `backend` is OUTSIDE the Git repository and is NOT part of the GitHub project. Do not depend on it.

## Frontend

The React/Vite application is located at:

`src/`

The frontend is started from the repository root.

The Vite development server runs on:

`http://localhost:3000`

## Backend

The Node/Express backend used by this project is:

`backend/`

Backend entry point:

`backend/server.js`

Backend development server runs on:

`http://localhost:5000`

Health endpoint:

`http://localhost:5000/api/health`

The root `package.json` contains the development script that starts the frontend and the project backend together.

## Main Backend Integration

The backend contains:

`backend/routes/investor.js`
`backend/routes/story.js`
`backend/routes/tts.js`

and:

`backend/ridhima-integration/investor.js`
`backend/ridhima-integration/rime.js`

The investor flow uses Gemini for AI investor analysis/question generation.

Rime is used for investor voice/TTS output.

## Environment Variables

`.env` is intentionally NOT committed to GitHub.

Each developer must create their own `.env` from `.env.example`.

Required API credentials must be supplied locally by the developer.

Never commit `.env`.
Never put API keys in source code.
Never share API keys through GitHub.

## Application Purpose

AI Investor Pitch Coach allows a founder to practice an investor pitch with an AI investor.

The founder selects a pitch category such as:

- Consumer App
- B2B SaaS
- Marketplace

The category provides starting context only.

The AI should understand the founder's actual pitch and answers and generate relevant follow-up investor questions.

## Investor Persona

The investor should be:

- skeptical
- sharp
- concise
- professional
- challenging but not rude
- unimpressed by fluff

Questions should be based on the founder's actual pitch and previous answers rather than a fixed scripted sequence.

## Five-Question Flow

The conversation must contain exactly five investor questions.

Flow:

1. Founder submits pitch.
2. Gemini analyzes the pitch.
3. Investor asks Question 1.
4. Founder explicitly answers.
5. Gemini generates the next relevant question.
6. Continue until Question 5.
7. After the fifth answer, end the interview and show the final conclusion/feedback.

There must NEVER be Question 6.

## Voice Flow

Expected microphone flow:

Speak
→ LISTENING
→ transcript appears
→ founder explicitly presses Stop/Finish
→ PROCESSING
→ Gemini processes the answer
→ investor question generated
→ Rime speaks the investor question
→ application waits for the founder's next answer

The application must NOT automatically submit microphone input immediately after recording starts.

## Speech Recognition

Speech-to-text should handle:

- normal speech recognition
- obvious recognition errors
- spelling
- punctuation
- grammar
- duplicated words

Cleanup must preserve the founder's intended meaning and must not rewrite the pitch into something different.

## Rime

Rime is the primary spoken output for investor responses.

After Gemini generates an investor question, the application should send the investor text through the existing Rime TTS pipeline and play the resulting audio.

## Interruption Handling

If the investor is currently speaking and the founder starts speaking:

- stop/cancel stale investor audio where possible
- cancel stale requests where possible
- prioritize the newest founder input
- do not allow an old investor response to overwrite the newest state

## UI Requirements

Keep the existing UI and design.

Existing controls should remain functional, including:

- Back
- Settings
- AI/status controls
- Voice Input
- Language
- Speak
- Stop/Finish
- Send
- New Session
- category selection
- History where currently implemented

New Session must reset the five-question conversation completely.

## Local Development

After cloning the repository:

1. Install root dependencies:

`npm install`

2. Install backend dependencies:

`cd backend`
`npm install`

3. Return to the repository root.

4. Create `.env` using `.env.example`.

5. Add valid local API credentials.

6. Start the application using the existing root development command:

`npm run dev`

Expected:

Frontend:
`http://localhost:3000`

Backend:
`http://localhost:5000`

## Important Git Information

The Git repository root is:

`D:\Project\Data forge\frontend`

The separate workspace-level:

`D:\Project\Data forge\backend`

is outside the Git repository and should NOT be copied into the GitHub project unless explicitly required.

The repository currently has a clean Git status after the latest committed project update.

## Testing Checklist

Before making major changes, verify:

- [ ] Application starts successfully
- [ ] Frontend loads
- [ ] Backend health endpoint works
- [ ] Category selection works
- [ ] Typed pitch reaches Gemini
- [ ] Gemini generates a relevant investor question
- [ ] Rime produces investor voice output
- [ ] Microphone starts correctly
- [ ] Microphone remains active until Stop/Finish
- [ ] Transcript appears
- [ ] Founder explicitly submits the answer
- [ ] Questions are based on the actual pitch and previous answers
- [ ] Exactly five questions occur
- [ ] No Question 6
- [ ] Final conclusion appears after Question 5
- [ ] New Session resets the interview
- [ ] Settings and existing UI controls work
- [ ] `.env` remains ignored
- [ ] API keys are never committed

## Handoff Rule

Before changing architecture or replacing an integration, inspect the existing implementation first.

Do not unnecessarily introduce new dependencies, databases, authentication, analytics, or unrelated redesigns.

The goal is to preserve the existing working MVP while fixing only genuine issues.
