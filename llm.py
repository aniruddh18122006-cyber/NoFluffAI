from google import genai
from google.genai import types
from dotenv import load_dotenv
import requests
import os

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# ── Persona definition ────────────────────────────────────────

INVESTOR_SYSTEM_PROMPT = """
You are a skeptical startup investor listening to a founder's pitch.

RULES:
- Keep responses to 1-2 short sentences.
- Always ask for a specific number, metric, or piece of evidence.
- If the founder gives a vague answer (e.g. "we think", "people will love it"),
  push back and ask for concrete proof.
- NEVER say encouraging phrases like "great idea", "I love that", "that's exciting".
- NEVER be rude, insulting, or hostile. Stay calm and professional, just blunt.

EXAMPLE LINES YOU MIGHT SAY:
- "Okay. Who's paying for that today, and how much?"
- "'We think' isn't a number I can underwrite. What evidence do you have?"
- "That doesn't answer my question. What's your actual conversion rate?"
- "Fair pitch, clear framing — but I'd want to see traction first."

Respond only as the investor. Do not break character.
"""

# ── LLM call ───────────────────────────────────────────────────

def get_investor_line(conversation_history):
    # Send the FULL conversation, not just the first message
    contents = [turn["content"] for turn in conversation_history]

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=INVESTOR_SYSTEM_PROMPT
        )
    )
    return response.text

# ── Rime TTS call ────────────────────────────────────────────

def speak(text, voice_id):
    url = "https://users.rime.ai/v1/rime-tts"

    headers = {
        "Accept": "audio/wav",
        "Authorization": f"Bearer {os.getenv('RIME_API_KEY')}",
        "Content-Type": "application/json"
    }

    data = {
        "text": text,
        "speaker": voice_id,
        "modelId": "coda",
        "language": "en-US"
    }

    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()

    return response.content

# ── Multi-turn conversation loop ──────────────────────────────

history = []

print("=" * 50)
print("Pitch your startup to the Investor. Type 'quit' to end.")
print("=" * 50)

# Turn 1: get the initial pitch from the founder
founder_input = input("\nYour pitch: ")
history.append({"role": "user", "content": founder_input})

# Run for up to 5 exchanges
for turn in range(5):
    # Get the investor's reply based on the FULL conversation so far
    investor_line = get_investor_line(history)
    print(f"\nInvestor: {investor_line}")

    # Add the investor's reply to history so the next call has full context
    history.append({"role": "assistant", "content": investor_line})

    # Speak it out loud
    audio = speak(investor_line, voice_id="astra")
    with open("output.wav", "wb") as f:
        f.write(audio)
    os.system("start output.wav")

    # Check if we should stop
    if turn == 4:
        print("\n[Session ended after 5 exchanges]")
        break

    # Get the founder's next response
    founder_input = input("\nYour answer: ")
    if founder_input.lower() == "quit":
        print("\n[Session ended by user]")
        break
    history.append({"role": "user", "content": founder_input})

print("\n" + "=" * 50)
print("Full conversation:")
for turn in history:
    print(f"{turn['role']}: {turn['content']}")

