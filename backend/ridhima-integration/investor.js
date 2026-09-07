import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey && apiKey.trim() && !apiKey.includes('your_gemini_api_key')
  ? new GoogleGenAI({ apiKey })
  : null;

const STERN_PERSONA = `You are a skeptical startup investor listening to a founder's pitch.

RULES:
- Keep responses to 1-2 short sentences.
- Use a direct, clipped, challenging, higher-pressure tone with firm, professional phrasing.
- Always ask for a specific number, metric, or piece of evidence.
- If the founder gives a vague answer (e.g. 'we think', 'people will love it'),
  push back and ask for concrete proof.
- NEVER say encouraging phrases like 'great idea', 'I love that', 'that's exciting'.
- NEVER be rude, insulting, or hostile. Stay calm and professional, just blunt.
- In a five-question session, use a filler on at most 2 non-conclusion responses.
  Begin or insert one short natural filler on roughly half of those turns, chosen
  and varied from: 'Right.', 'Hm, okay.', 'Alright, next—', or 'Okay.'. Omit it
  on the other turns and never use one inside the final conclusion.

Respond only as the investor. Do not break character.`;

const FRIENDLY_PERSONA = `You are a warm, encouraging startup investor mentor listening to a founder's pitch.

RULES:
- Keep responses to 1-2 short sentences.
- Use a warm, polite, encouraging tone with softer, collaborative phrasing.
- Still ask hard, discerning questions to help them succeed, asking for specific metrics, proof, or unit economics in a collaborative way.
- Be encouraging and warm, but never compromise on asking for real business viability.
- NEVER be dismissive, cold, sarcastic, or harsh. Be an approachable, constructive partner.
- In a five-question session, use a filler on at most 2 non-conclusion responses.
  Begin or insert one short natural filler on roughly half of those turns, chosen
  and varied from: 'Okay, nice—', 'Got it, love that—', 'Mm, I like that—', or
  'Nice, okay—'. Omit it on the other turns and never use one inside the final
  conclusion.

Respond only as the investor. Do not break character.`;

const PERSONA = STERN_PERSONA;

export async function transcribeInvestorAudio({ audioBase64, audioMimeType = 'audio/webm' }) {
  if (!ai) {
    const error = new Error('Gemini is not configured. Investor analysis is unavailable.');
    error.code = 'GEMINI_NOT_CONFIGURED';
    throw error;
  }

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    throw new Error('Recorded founder audio is required.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: [{
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: audioMimeType,
            data: audioBase64
          }
        },
        {
          text: 'Transcribe the founder audio exactly. Return only the spoken words, with no labels, commentary, or quotation marks.'
        }
      ]
    }]
  });

  const transcript = typeof response?.text === 'string' ? response.text.trim() : '';
  if (!transcript) throw new Error('Gemini returned an empty audio transcript.');
  return transcript;
}

export async function analyzeInvestorPitch({ category, conversationHistory = [], latestFounderMessage, persona = 'stern', isConclusion = false }) {
  if (!ai) {
    const error = new Error('Gemini is not configured. Investor analysis is unavailable.');
    error.code = 'GEMINI_NOT_CONFIGURED';
    throw error;
  }

  const isFriendly = String(persona).toLowerCase() === 'friendly';
  const systemInstruction = isFriendly ? FRIENDLY_PERSONA : STERN_PERSONA;

  const history = conversationHistory.map((item) => ({
    role: item.role === 'investor' ? 'assistant' : 'user',
    content: `${item.role === 'founder' ? 'FOUNDER' : 'INVESTOR'}: ${item.text}`
  }));

  const conclusionGuidelines = isFriendly
    ? `This is the conclusion of the 5-question interview.
Provide a final closing evaluation and wrap-up in-character as the friendly investor.
- 1-2 concise sentences.
- Acknowledge that the 5-question review is complete and thank the founder.
- State a warm, constructive verdict encouraging their journey while highlighting what key metrics they should focus on next.
- Do NOT ask a follow-up question; this is your final closing wrap-up.`
    : `This is the conclusion of the 5-question interview.
Provide a final closing evaluation and wrap-up in-character as the skeptical investor.
- 1-2 concise sentences.
- Acknowledge that the 5-question review is complete.
- State a blunt, fair verdict summarizing where the evidence was strong or where gaps remain, encouraging them to prove the numbers.
- Do NOT ask a follow-up question; this is your final closing wrap-up.`;

  const prompt = isConclusion
    ? `Pitch category: ${category || 'Unspecified'}

Conversation so far:
${history.map((item) => item.content).join('\n') || '(Opening pitch)'}

Final founder message:
${latestFounderMessage}

${conclusionGuidelines}

Return JSON only with this shape:
{
  "cleanedText": "A light correction of the latest message, preserving its meaning and claims.",
  "investorResponse": "Your final in-character wrap-up statement.",
  "keyObservations": ["Overall takeaway or summary observation"]
}

Clean obvious spelling, punctuation, grammar, duplicated words, and speech artifacts only.
Do not add claims, metrics, customers, or certainty that the founder did not provide.`
    : `Pitch category: ${category || 'Unspecified'}

Conversation so far:
${history.map((item) => item.content).join('\n') || '(This is the founder\'s opening pitch.)'}

Latest founder message:
${latestFounderMessage}

Use the persona tone rules above. In this five-question session, use a filler on at
most 2 non-conclusion responses: begin or insert one on roughly half of those turns
from the persona's approved list, and omit it on the others. Vary the fillers and
never include one in a final conclusion.

Return JSON only with this shape:
{
  "cleanedText": "A light correction of the latest message, preserving its meaning and claims.",
  "investorResponse": "One concise reaction followed by exactly one strong follow-up question.",
  "keyObservations": ["Short, evidence-based observations about claims, gaps, or metrics"]
}

Clean obvious spelling, punctuation, grammar, duplicated words, and speech artifacts only.
Do not add claims, metrics, customers, or certainty that the founder did not provide.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: isFriendly ? 0.45 : 0.35
      }
    });

    const rawText = typeof response?.text === 'string' ? response.text : '';
    let parsed = {};

    if (rawText) {
      try {
        parsed = JSON.parse(rawText);
      } catch (error) {
        console.warn('[Investor Service] Gemini returned non-JSON content:', rawText);
      }
    }

    const cleanedText = typeof parsed.cleanedText === 'string' && parsed.cleanedText.trim()
      ? parsed.cleanedText
      : latestFounderMessage;

    const investorResponse = typeof parsed.investorResponse === 'string' && parsed.investorResponse.trim()
      ? parsed.investorResponse
      : isConclusion
        ? (isFriendly
            ? "Thank you for walking me through your pitch over these five questions. Keep that passion, but anchor your next round in solid customer retention data."
            : "That concludes our five-question review. The concept is clear, but without defensible retention and unit economics, this remains too unproven to back.")
        : (isFriendly
            ? "I really appreciate your vision. What customer retention or repeat usage numbers have you seen so far?"
            : "Be specific. What evidence supports that claim?");

    const keyObservations = Array.isArray(parsed.keyObservations)
      ? parsed.keyObservations.filter((item) => typeof item === 'string' && item.trim())
      : [];

    return {
      cleanedText,
      investorResponse,
      keyObservations
    };
  } catch (error) {
    console.error('[Investor Service] Gemini analysis failed:', error.message);
    throw error;
  }
}