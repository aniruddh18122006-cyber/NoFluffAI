import json
import os
import urllib.request

RIME_API_KEY = os.environ["RIME_API_KEY"]

headers = {
    "Accept": "audio/wav",
    "Authorization": f"Bearer {RIME_API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "text": "Hello! This is Rime speaking.",
    "speaker": "celeste",
    "modelId": "coda"
}

data = json.dumps(payload).encode("utf-8")

request = urllib.request.Request(
    "https://users.rime.ai/v1/rime-tts",
    data=data,
    headers=headers,
    method="POST"
)

with urllib.request.urlopen(request) as response:
    with open("output.wav", "wb") as f:
        while chunk := response.read(4096):
            f.write(chunk)

print("Audio saved to output.wav")

def play(audio):
    with open("output.wav", "wb") as f:
        f.write(audio)

    print("Audio saved as output.wav")