import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
let openai = null;

if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_openai_api_key')) {
  openai = new OpenAI({ apiKey });
}

/**
 * Rich Offline Story Engine with Memory & Actions Support
 */
const DEMO_STORY_TREE = {
  initial: {
    title: "The Whispering Archives of Oakhaven",
    chapter: 1,
    narrative: "A cool azure flame dances beside your notebook in the subterranean archives of Oakhaven. For three centuries, the Silent Scribes have guarded the Codices of the First Dawn. Tonight, a rhythmic vibration shudders through the flagstones. Before you, three ancient relics awaken with a harmonic chime: a celestial astrolabe of tarnished silver, a serpent-headed brass key, and a locked grimoire bound in shimmering purple wax.",
    speechText: "A cool azure flame dances beside your notebook in the subterranean archives of Oakhaven. A rhythmic vibration shudders through the flagstones. Three ancient relics have awakened: a celestial astrolabe, a serpent key, and a sealed grimoire. What will you do? Option A: Examine the singing celestial astrolabe. Option B: Break the wax seal on the grimoire. Option C: Take the serpent key toward the Iron Gate. Speak your choice, or talk to me naturally.",
    choices: [
      { id: "A", text: "Examine the singing celestial astrolabe" },
      { id: "B", text: "Break the wax seal on the pulsing grimoire" },
      { id: "C", text: "Take the serpent-headed brass key toward the Iron Gate" }
    ],
    isEnding: false
  },
  branches: {
    "A": {
      chapter: 2,
      narrative: "Your fingers brush the silver rings of the astrolabe. The brass dials click rhythmically as constellation runes ignite along the metallic bands. A projection of celestial fire leaps upward, revealing a hidden doorway carved into the bedrock. Through the portal drifts the sound of water trickling over crystals, alongside a distant whispering chant.",
      speechText: "Your fingers brush the silver rings of the astrolabe. Brass dials click into place, projecting starfire onto the bedrock wall. A hidden doorway swings open, whispering with distant chants. Option A: Step through the doorway into the hidden crypt. Option B: Align the astrolabe with the Northern Star.",
      choices: [
        { id: "A1", text: "Step through the star-lit doorway into the hidden crypt" },
        { id: "A2", text: "Adjust the astrolabe rings to align with the Northern Star" }
      ],
      isEnding: false
    },
    "B": {
      chapter: 2,
      narrative: "You break the pulsing wax seal. It yields like warm honey, releasing a scent of crushed violets. The heavy tome springs open, its pages turning in a phantom breeze. Shimmering ink forms words before your eyes: 'The keeper who speaks the three names of twilight shall unlock the mirror of shadows.' Shadows detach from the stone walls, coalescing into a cloaked phantom bowing with reverent grace.",
      speechText: "You break the pulsing wax seal. The pages flutter open, revealing ancient runes. The shadows detach from the wall, taking the shape of a bowing phantom. Option A: Speak to the shadow guardian. Option B: Cast the book into the warding circle.",
      choices: [
        { id: "B1", text: "Speak to the shadow guardian and demand its allegiance" },
        { id: "B2", text: "Cast the book into the warding circle to contain the shade" }
      ],
      isEnding: false
    },
    "C": {
      chapter: 2,
      narrative: "The serpent key warms instantly against your palm, sending a tingling pulse of arcane energy up your arm. You insert it into the Iron Gate. With a deep rumble, the heavy gates part, revealing a narrow stone bridge suspended over an abyssal subterranean cavern lit by glowing blue fungi.",
      speechText: "The serpent key warms against your palm. The Iron Gate groans open, revealing a stone bridge over an abyss illuminated by glowing fungi. Option A: Cross the narrow stone bridge toward the pavilion. Option B: Inspect the guardian pedestals flanking the gate.",
      choices: [
        { id: "C1", text: "Cross the narrow stone bridge toward the glowing pavilion" },
        { id: "C2", text: "Search the guardian pedestals flanking the gate for runes" }
      ],
      isEnding: false
    },
    "DEFAULT": {
      chapter: 3,
      narrative: "Your choice resonates through the ancient halls. Arcane energy flows through the stone arches, acknowledging your bold decision. The path forward opens, shifting the destiny of Oakhaven.",
      speechText: "Your choice resonates through the ancient halls. The path forward opens, shifting the destiny of the realm. What will you do next?",
      choices: [
        { id: "D1", text: "Venture deeper into the inner sanctuary" },
        { id: "D2", text: "Invoke your memory to protect the archives" }
      ],
      isEnding: false
    }
  }
};

const OFFLINE_OPENINGS = {
  hi: {
    narrative: 'ओखावेन के भूमिगत अभिलेखागार में नीली ज्वाला आपकी पुस्तक के पास नृत्य करती है। पत्थरों के नीचे से एक लयबद्ध कंपन उठता है। तीन प्राचीन अवशेष जागते हैं: एक खगोलीय यंत्र, सर्प-कुंजी और बैंगनी मोम से बंद ग्रिमोयर।',
    speechText: 'ओखावेन के अभिलेखागार में एक नीली ज्वाला चमकती है। तीन अवशेष जाग उठे हैं। विकल्प ए: खगोलीय यंत्र की जांच करें। विकल्प बी: ग्रिमोयर की मुहर तोड़ें। विकल्प सी: सर्प-कुंजी लेकर लौह द्वार की ओर जाएं।',
    choices: [{ id: 'A', text: 'खगोलीय यंत्र की जांच करें' }, { id: 'B', text: 'ग्रिमोयर की मुहर तोड़ें' }, { id: 'C', text: 'सर्प-कुंजी लेकर लौह द्वार की ओर जाएं' }]
  },
  es: {
    narrative: 'Una llama azul danza junto a tu cuaderno en los archivos subterráneos de Oakhaven. Una vibración rítmica sacude las piedras y despierta tres reliquias: un astrolabio celestial, una llave de serpiente y un grimorio sellado.',
    speechText: 'Una llama azul ilumina los archivos de Oakhaven. Tres reliquias han despertado. Opción A: examina el astrolabio. Opción B: rompe el sello del grimorio. Opción C: lleva la llave de serpiente hacia la Puerta de Hierro.',
    choices: [{ id: 'A', text: 'Examinar el astrolabio celestial' }, { id: 'B', text: 'Romper el sello del grimorio' }, { id: 'C', text: 'Llevar la llave de serpiente hacia la Puerta de Hierro' }]
  },
  fr: {
    narrative: 'Une flamme azurée danse près de votre carnet dans les archives souterraines d’Oakhaven. Une vibration rythmique secoue les dalles et réveille trois reliques: un astrolabe céleste, une clé-serpent et un grimoire scellé.',
    speechText: 'Une flamme bleue éclaire les archives d’Oakhaven. Trois reliques se sont éveillées. Option A: examiner l’astrolabe. Option B: briser le sceau du grimoire. Option C: porter la clé-serpent vers la Porte de Fer.',
    choices: [{ id: 'A', text: 'Examiner l’astrolabe céleste' }, { id: 'B', text: 'Briser le sceau du grimoire' }, { id: 'C', text: 'Porter la clé-serpent vers la Porte de Fer' }]
  },
  de: {
    narrative: 'Eine azurblaue Flamme tanzt neben deinem Notizbuch in den unterirdischen Archiven von Oakhaven. Eine rhythmische Erschütterung weckt drei Relikte: ein Himmelsastrolabium, einen Schlangenschlüssel und ein versiegeltes Grimoire.',
    speechText: 'Eine blaue Flamme erhellt die Archive von Oakhaven. Drei Relikte sind erwacht. Option A: Untersuche das Astrolabium. Option B: Brich das Siegel des Grimoires. Option C: Trage den Schlangenschlüssel zum Eisernen Tor.',
    choices: [{ id: 'A', text: 'Das Himmelsastrolabium untersuchen' }, { id: 'B', text: 'Das Siegel des Grimoires brechen' }, { id: 'C', text: 'Den Schlangenschlüssel zum Eisernen Tor tragen' }]
  },
  ja: {
    narrative: 'オークヘイヴン地下文書庫で、青い炎があなたの手帳のそばで揺らめいている。床石を震わせる振動が三つの古代遺物を目覚めさせた。天球儀、蛇の鍵、封印された魔導書だ。',
    speechText: 'オークヘイヴンの文書庫で青い炎が輝いています。三つの遺物が目覚めました。選択肢A、天球儀を調べる。選択肢B、魔導書の封印を破る。選択肢C、蛇の鍵を鉄の門へ運ぶ。',
    choices: [{ id: 'A', text: '天球儀を調べる' }, { id: 'B', text: '魔導書の封印を破る' }, { id: 'C', text: '蛇の鍵を鉄の門へ運ぶ' }]
  }
};

function getOfflineOpening(language) {
  const localized = OFFLINE_OPENINGS[language];
  return localized ? { ...DEMO_STORY_TREE.initial, ...localized } : DEMO_STORY_TREE.initial;
}

/**
 * Generate the opening chapter of a fantasy tale
 */
export async function generateInitialStory(language = 'en') {
  if (!openai) {
    console.log('[OpenAI Service] Offline fallback mode initialized.');
    return {
      ...getOfflineOpening(language),
      isDemoFallback: true,
      initialMemory: {
        currentChapter: 1,
        character: "The Seeker",
        location: "Oakhaven Subterranean Archives",
        importantObjects: ["Celestial Astrolabe", "Serpent Key", "Pulsing Grimoire"],
        relationships: ["The Silent Scribes"],
        choicesMade: [],
        storyFacts: ["Azure flame burns without heat", "Archives contain the Codices of the First Dawn"],
        previousUserInstructions: []
      }
    };
  }

  const prompt = `You are ECHOES, a living interactive AI voice storyteller.
Create an evocative, original, family-friendly fantasy opening.
Language required: ${language}.

IMPORTANT VOICE GUIDELINES:
- Write in natural, spoken cadence with deliberate pauses and natural punctuation.
- Avoid robotic, dense paragraphs. Keep spoken segments clear, sensory, and captivating.
- Deliver two fields: 'narrative' (detailed text for reading) and 'speechText' (conversational, spoken text specifically crafted for Rime TTS audio narration).

Strictly output ONLY valid JSON conforming to this schema:
{
  "title": "Evocative Title of the Tale",
  "chapter": 1,
  "narrative": "Detailed narrative text between 120 and 220 words.",
  "speechText": "Natural spoken narrative followed by choices, between 80 and 150 words. Format: 'Story narration... What will you do? Option A: ... Option B: ... Speak your choice, or talk to me naturally.'",
  "choices": [
    { "id": "A", "text": "Distinct narrative choice A" },
    { "id": "B", "text": "Distinct narrative choice B" },
    { "id": "C", "text": "Distinct narrative choice C" }
  ],
  "initialMemory": {
    "currentChapter": 1,
    "character": "Name of protagonist",
    "location": "Starting setting",
    "importantObjects": ["Object 1", "Object 2"],
    "relationships": ["Entity or faction"],
    "storyFacts": ["Key world fact"],
    "choicesMade": [],
    "previousUserInstructions": []
  },
  "isEnding": false
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are ECHOES, a living conversational voice storyteller. Respond in valid JSON only.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return {
      title: parsed.title || "The Unwritten Tale",
      chapter: 1,
      narrative: parsed.narrative || parsed.text || "You awaken in an enchanted sanctuary...",
      speechText: parsed.speechText || parsed.narrative || parsed.text,
      choices: Array.isArray(parsed.choices) && parsed.choices.length > 0 ? parsed.choices : [
        { id: "A", text: "Investigate the glowing sigil" },
        { id: "B", text: "Follow the gentle breeze" }
      ],
      initialMemory: {
        currentChapter: 1,
        character: parsed.initialMemory?.character || "The Seeker",
        location: parsed.initialMemory?.location || "Oakhaven Archives",
        importantObjects: parsed.initialMemory?.importantObjects || ["Celestial Astrolabe", "Serpent Key"],
        relationships: parsed.initialMemory?.relationships || ["The Silent Scribes"],
        storyFacts: parsed.initialMemory?.storyFacts || ["Azure flame burns without heat"],
        choicesMade: [],
        previousUserInstructions: []
      },
      isEnding: false,
      isDemoFallback: false
    };
  } catch (error) {
    console.error('[OpenAI Service] Initial story error:', error.message);
    return {
      ...DEMO_STORY_TREE.initial,
      isDemoFallback: true,
      initialMemory: {
        currentChapter: 1,
        character: "The Seeker",
        location: "Oakhaven Subterranean Archives",
        importantObjects: ["Celestial Astrolabe", "Serpent Key", "Pulsing Grimoire"],
        relationships: ["The Silent Scribes"],
        choicesMade: [],
        storyFacts: ["Azure flame burns without heat", "Archives contain the Codices of the First Dawn"],
        previousUserInstructions: []
      }
    };
  }
}

/**
 * Continue or converse with ECHOES
 * Supports story choices, natural interruptions, memory mutations, and safe actions
 */
export async function continueStory({
  title,
  chapter,
  storyHistory = [],
  selectedChoice,
  userInput,
  memory = {},
  language = 'en'
}) {
  const nextChapterNum = (chapter || 1) + 1;
  const shouldEnd = nextChapterNum >= 6;

  // Check for safe local action patterns (theme change, memory command, etc.)
  const inputLower = (userInput || selectedChoice?.text || '').toLowerCase().trim();

  // Fast action detection for safe website control
  let actionDetected = null;

  // 1. change_theme
  const themes = ['aurora', 'midnight', 'ocean', 'violet', 'emerald', 'sunset'];
  for (const t of themes) {
    if (inputLower.includes(`${t} theme`) || inputLower.includes(`switch to ${t}`) || inputLower.includes(`change to ${t}`) || inputLower.includes(`set theme to ${t}`)) {
      actionDetected = { type: 'change_theme', payload: t };
      break;
    }
  }

  // 2. change_language
  const langMap = {
    hindi: 'hi', 'हिन्दी': 'hi',
    spanish: 'es', 'español': 'es',
    french: 'fr', 'français': 'fr',
    german: 'de', 'deutsch': 'de',
    japanese: 'ja', '日本語': 'ja',
    english: 'en'
  };
  for (const [langName, code] of Object.entries(langMap)) {
    if (inputLower.includes(`change language to ${langName}`) || inputLower.includes(`speak in ${langName}`) || inputLower.includes(`switch to ${langName}`) || inputLower.includes(`language ${langName}`)) {
      actionDetected = { type: 'change_language', payload: code };
      break;
    }
  }

  // 3. change_text_size
  if (inputLower.includes('larger text') || inputLower.includes('make the text larger') || inputLower.includes('bigger text') || inputLower.includes('increase text size') || inputLower.includes('large text')) {
    actionDetected = { type: 'change_text_size', payload: 'large' };
  } else if (inputLower.includes('normal text') || inputLower.includes('smaller text') || inputLower.includes('decrease text size') || inputLower.includes('default text size')) {
    actionDetected = { type: 'change_text_size', payload: 'normal' };
  }

  // 4. toggle_animations
  if (inputLower.includes('turn animations off') || inputLower.includes('disable animations') || inputLower.includes('stop animations') || inputLower.includes('reduce motion')) {
    actionDetected = { type: 'toggle_animations', payload: false };
  } else if (inputLower.includes('turn animations on') || inputLower.includes('enable animations')) {
    actionDetected = { type: 'toggle_animations', payload: true };
  }

  // 5. toggle_subtitles
  if (inputLower.includes('enable subtitles') || inputLower.includes('show subtitles') || inputLower.includes('turn on subtitles')) {
    actionDetected = { type: 'toggle_subtitles', payload: true };
  } else if (inputLower.includes('disable subtitles') || inputLower.includes('hide subtitles') || inputLower.includes('turn off subtitles')) {
    actionDetected = { type: 'toggle_subtitles', payload: false };
  }

  // 6. change_narration_speed
  if (inputLower.includes('speak faster') || inputLower.includes('increase narration speed') || inputLower.includes('faster narration') || inputLower.includes('faster speed')) {
    actionDetected = { type: 'change_narration_speed', payload: 1.15 };
  } else if (inputLower.includes('speak slower') || inputLower.includes('decrease narration speed') || inputLower.includes('slower narration') || inputLower.includes('slower speed')) {
    actionDetected = { type: 'change_narration_speed', payload: 0.85 };
  } else if (inputLower.includes('normal speed') || inputLower.includes('reset speed')) {
    actionDetected = { type: 'change_narration_speed', payload: 0.95 };
  }

  // 7. start_new_story
  if (inputLower.includes('start a new story') || inputLower.includes('start new story') || inputLower.includes('start new tale') || inputLower.includes('start over') || inputLower.includes('restart story')) {
    actionDetected = { type: 'start_new_story', payload: null };
  }

  // 8. remember_fact & 9. delete_memory
  let factToRemember = null;
  const rememberMatch = inputLower.match(/remember that (.+)/i) || inputLower.match(/remember (.+)/i);
  if (rememberMatch && !inputLower.includes('what do you remember') && !inputLower.includes('do you remember')) {
    factToRemember = rememberMatch[1].trim().replace(/[.,!]$/, '');
    actionDetected = { type: 'remember_fact', payload: factToRemember };
  }

  let memoryToDelete = null;
  const forgetMatch = inputLower.match(/^forget(?: that)?(?: fact)?\s+(.+)/i) || inputLower.match(/^remove\s+(.+)/i);
  if (forgetMatch && !rememberMatch) {
    const rawTarget = forgetMatch[1].trim().replace(/[.,!]$/, '');
    memoryToDelete = rawTarget;
    actionDetected = { type: 'delete_memory', payload: { type: 'fact', target: rawTarget } };
  }

  if (!openai) {
    console.log('[OpenAI Service] Demo engine processing input:', inputLower);
    const branchKey = selectedChoice?.id || 'DEFAULT';
    const branch = DEMO_STORY_TREE.branches[branchKey] || DEMO_STORY_TREE.branches['DEFAULT'];

    // Update comprehensive memory state
    const updatedMemory = {
      currentChapter: nextChapterNum,
      character: memory.character || "The Seeker",
      location: memory.location || "Oakhaven Archives",
      importantObjects: Array.isArray(memory.importantObjects) ? [...memory.importantObjects] : ["Celestial Astrolabe", "Serpent Key"],
      relationships: Array.isArray(memory.relationships) ? [...memory.relationships] : ["The Silent Scribes"],
      storyFacts: Array.isArray(memory.storyFacts) ? [...memory.storyFacts] : ["Azure flame burns without heat"],
      choicesMade: Array.isArray(memory.choicesMade) ? [...memory.choicesMade] : [],
      previousUserInstructions: Array.isArray(memory.previousUserInstructions) ? [...memory.previousUserInstructions] : []
    };

    if (userInput && userInput.trim()) {
      updatedMemory.previousUserInstructions.push(userInput.trim());
    }

    if (selectedChoice?.text) {
      updatedMemory.choicesMade.push(`Chapter ${chapter || 1}: ${selectedChoice.text}`);
    }

    // Name mutations
    if (inputLower.includes('name is maya') || inputLower.includes('character is maya')) {
      updatedMemory.character = 'Maya';
    } else if (inputLower.includes('name is arjun') || inputLower.includes('character is arjun')) {
      updatedMemory.character = 'Arjun';
    }

    // Remember fact / object command
    if (factToRemember) {
      const cleanFact = factToRemember.charAt(0).toUpperCase() + factToRemember.slice(1);
      if (!updatedMemory.storyFacts.includes(cleanFact)) {
        updatedMemory.storyFacts.push(cleanFact);
      }
      if (factToRemember.includes('key') || factToRemember.includes('astrolabe') || factToRemember.includes('sword') || factToRemember.includes('grimoire') || factToRemember.includes('stone') || factToRemember.includes('relic') || factToRemember.includes('book')) {
        const item = cleanFact.replace(/^(i took the|i have the|i found the)\s+/i, '');
        if (!updatedMemory.importantObjects.includes(item)) {
          updatedMemory.importantObjects.push(item);
        }
      }
    }

    // Forget / delete memory command
    if (memoryToDelete) {
      if (memoryToDelete === 'fact' || memoryToDelete === 'that fact' || memoryToDelete === 'that') {
        if (updatedMemory.storyFacts.length > 0) {
          updatedMemory.storyFacts.pop();
        }
      } else {
        const query = memoryToDelete.toLowerCase();
        updatedMemory.storyFacts = updatedMemory.storyFacts.filter(f => !f.toLowerCase().includes(query));
        updatedMemory.importantObjects = updatedMemory.importantObjects.filter(o => !o.toLowerCase().includes(query));
      }
    }

    let customSpeech = branch.speechText;
    let customNarrative = branch.narrative;

    // Direct memory recall inquiry
    if (inputLower.includes('what do you remember') || inputLower.includes('what is in my memory') || inputLower.includes('show memory') || inputLower.includes('who am i') || inputLower.includes('what is my character name') || inputLower.includes("what's my character name")) {
      const charName = updatedMemory.character;
      const loc = updatedMemory.location;
      const objs = updatedMemory.importantObjects.join(', ') || 'none';
      const facts = updatedMemory.storyFacts.join('; ') || 'none';
      customNarrative = `I hold your chronicle in the living archives. You are ${charName}, standing in ${loc}. You carry: ${objs}. Important lore recorded: ${facts}. Chapter ${nextChapterNum} awaits your guidance.`;
      customSpeech = `I hold your chronicle in the living archives. You are ${charName}, currently at ${loc}. You carry ${objs}. Where shall we journey next?`;
    } else if (factToRemember) {
      customNarrative = `Your instruction echoes into the archives: "${factToRemember}". Memory has recorded this fact for the chapters to come.`;
      customSpeech = `I have etched that into memory: "${factToRemember}". What will you do next?`;
    } else if (memoryToDelete) {
      customNarrative = `The arcane chronicle parts as the requested memory is released into the void. Your updated chronicle is preserved.`;
      customSpeech = `That fact has been cleared from my memory. What path shall we choose now?`;
    }

    // Multilingual offline translation
    if (language === 'hi') {
      customSpeech = `अध्याय ${nextChapterNum}: आपके निर्णय से पुरातन कक्ष गूंज उठे। आप आगे क्या करेंगे? विकल्प ए चुनें या मुझसे स्वाभाविक रूप से बात करें।`;
      customNarrative = `आपके शब्द आर्कवेन के प्राचीन अभिलेखागार में गूंजते हैं। भाग्य का नया मार्ग आपके समक्ष खुल रहा है।`;
    } else if (language === 'es') {
      customSpeech = `Capítulo ${nextChapterNum}: Tu elección resuena por los antiguos salones. ¿Qué harás ahora? Opción A o habla libremente conmigo.`;
      customNarrative = `Tus palabras resuenan en los archivos subterráneos de Oakhaven. Un nuevo camino se abre ante ti.`;
    } else if (language === 'fr') {
      customSpeech = `Chapitre ${nextChapterNum}: Votre choix résonne dans les anciennes galeries. Que souhaitez-vous faire?`;
      customNarrative = `Vos paroles résonnent dans les archives d'Oakhaven. Un nouveau passage s'ouvre devant vous.`;
    }

    return {
      title: title || DEMO_STORY_TREE.initial.title,
      chapter: nextChapterNum,
      narrative: customNarrative,
      speechText: customSpeech,
      choices: branch.choices,
      memory: updatedMemory,
      action: actionDetected,
      isEnding: branch.isEnding || shouldEnd,
      isDemoFallback: true
    };
  }

  const memoryContext = JSON.stringify(memory || {}, null, 2);
  const historySummary = storyHistory
    .slice(-4)
    .map(h => `Chapter ${h.chapter}: ${h.narrative || h.text}\nAction taken: ${h.selectedChoice?.text || h.userInput || 'Advanced'}`)
    .join('\n\n');

  const prompt = `We are continuing the interactive voice fantasy tale titled "${title}".
Current Language: ${language}
Current Story Memory:
${memoryContext}

Previous Story Events:
${historySummary}

The player just said or chose:
"${userInput || selectedChoice?.text || 'Continue the adventure'}"

Next Chapter Number: ${nextChapterNum}.
${shouldEnd ? 'THIS IS THE FINAL CHAPTER (isEnding: true). Bring the story to a climactic conclusion and set choices to [].' : 'Continue the adventure dynamically.'}

IMPORTANT TASKS:
1. If the user provided a personal memory update (e.g. "My character name is Maya", "The dragon is named Ember", "Forget the silver key", "I chose the forest"), acknowledge it gracefully in dialogue/narration and set 'memoryUpdate'.
2. If the user asked about their memory or identity (e.g. "What is my character name?", "What do you remember about me?", "What's in my memory?"), answer them directly using Current Story Memory.
3. If the user asked to adjust settings or theme (e.g. "change to Ocean theme", "switch to Hindi", "make text bigger", "turn animations off"), set 'action' to reflect the requested safe action.
4. Craft 'speechText' specifically for Rime TTS: write in natural spoken cadence with short, conversational sentences, deliberate pauses (using commas and ellipses), expressive dialogue, and clear options at the end. Avoid robotic or dense blocks of text.
5. Craft 'narrative' (100-200 words) for reading on screen.

Strictly output ONLY valid JSON:
{
  "chapter": ${nextChapterNum},
  "narrative": "Detailed narrative text...",
  "speechText": "Natural, spoken conversational text for Rime audio narration with options...",
  "choices": ${shouldEnd ? '[]' : '[{"id": "A", "text": "Choice A"}, {"id": "B", "text": "Choice B"}]'},
  "memoryUpdate": {
    "character": "Optional updated name",
    "location": "Optional updated location",
    "addedObjects": ["Optional new item"],
    "removedObjects": ["Optional removed item"],
    "addedFacts": ["Optional new fact remembered"]
  },
  "action": ${actionDetected ? JSON.stringify(actionDetected) : 'null'},
  "isEnding": ${shouldEnd ? 'true' : 'false'}
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are ECHOES, a living conversational voice storyteller. Maintain personal memory, spoken cadence, and respond in valid JSON.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    // Apply memory updates
    const updatedMemory = {
      currentChapter: parsed.chapter || nextChapterNum,
      character: parsed.memoryUpdate?.character || memory.character || "The Seeker",
      location: parsed.memoryUpdate?.location || memory.location || "Oakhaven Archives",
      importantObjects: Array.isArray(memory.importantObjects) ? [...memory.importantObjects] : ["Celestial Astrolabe", "Serpent Key"],
      relationships: Array.isArray(memory.relationships) ? [...memory.relationships] : ["The Silent Scribes"],
      storyFacts: Array.isArray(memory.storyFacts) ? [...memory.storyFacts] : ["Azure flame burns without heat"],
      choicesMade: Array.isArray(memory.choicesMade) ? [...memory.choicesMade] : [],
      previousUserInstructions: Array.isArray(memory.previousUserInstructions) ? [...memory.previousUserInstructions] : []
    };

    if (userInput && userInput.trim()) {
      updatedMemory.previousUserInstructions.push(userInput.trim());
    }
    if (selectedChoice?.text) {
      updatedMemory.choicesMade.push(`Chapter ${chapter || 1}: ${selectedChoice.text}`);
    }

    if (parsed.memoryUpdate) {
      if (Array.isArray(parsed.memoryUpdate.addedObjects)) {
        updatedMemory.importantObjects = [...updatedMemory.importantObjects, ...parsed.memoryUpdate.addedObjects];
      }
      if (Array.isArray(parsed.memoryUpdate.removedObjects)) {
        updatedMemory.importantObjects = updatedMemory.importantObjects.filter(
          o => !parsed.memoryUpdate.removedObjects.includes(o)
        );
      }
      if (Array.isArray(parsed.memoryUpdate.addedFacts)) {
        updatedMemory.storyFacts = [...updatedMemory.storyFacts, ...parsed.memoryUpdate.addedFacts];
      }
    }

    return {
      title,
      chapter: parsed.chapter || nextChapterNum,
      narrative: parsed.narrative || "The arcane paths shift according to your command...",
      speechText: parsed.speechText || parsed.narrative,
      choices: parsed.isEnding ? [] : (Array.isArray(parsed.choices) ? parsed.choices : []),
      memory: updatedMemory,
      action: parsed.action || actionDetected,
      isEnding: Boolean(parsed.isEnding) || shouldEnd,
      isDemoFallback: false
    };
  } catch (error) {
    console.error('[OpenAI Service] Story continuation error:', error.message);
    const branch = DEMO_STORY_TREE.branches['DEFAULT'];
    return {
      title,
      chapter: nextChapterNum,
      narrative: branch.narrative,
      speechText: branch.speechText,
      choices: branch.choices,
      memory,
      action: actionDetected,
      isEnding: shouldEnd,
      isDemoFallback: true
    };
  }
}
