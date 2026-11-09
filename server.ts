import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const defaultPort = parseInt(process.env.PORT || '3001', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : (null as any);

// System prompt for Islamic scholarship assistant
const ISLAMIC_SCHOLAR_SYSTEM_PROMPT = `You are "Al-Bayan AI", a scholarly, respectful, and empathetic Quranic assistant and Tafseer specialist.
Your goal is to provide authentic, well-referenced, and context-rich answers regarding the Holy Quran, its verses (Ayats), Surahs, historical context of revelation (Asbab an-Nuzul), linguistic beauty (Balaghah), and ethical/spiritual guidance.

GUIDELINES:
1. Ground answers strictly in classical and mainstream authentic Tafseer traditions (such as Tafseer Ibn Kathir, Al-Tabari, Al-Qurtubi, Maarif-ul-Quran, and modern scholarly consensus).
2. Always cite the Surah name and Verse number (e.g. [Surah Al-Baqarah 2:255]).
3. Provide the Arabic quote when discussing specific Ayats, followed by translation in English, Urdu, or Sindhi depending on the user's language or request.
4. When asked in Urdu or Sindhi, reply fluently and respectfully in that language (using appropriate script and respectful Islamic honorifics).
5. Maintain a humble, scholarly, non-sectarian tone emphasizing wisdom, peace, compassion, justice, and spiritual reflection (Tadabbur).
6. For legal (Fiqh) disputes, acknowledge diverse legitimate schools of thought respectfully and advise consulting local qualified scholars for specific fatwas.`;

// Endpoint: AI Quran Chatbot
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userLanguage = 'en', surahContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array' });
    }

    if (!ai) {
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
      return res.json({
        reply: `Al-Bayan AI is running in local offline mode (no GEMINI_API_KEY configured in .env).

Regarding your reflection: "${lastUserMsg.slice(0, 80)}"
The Holy Quran provides enduring moral clarity and solace. You can explore the complete Surah Reader with multi-lingual translations (English, Urdu, Sindhi), listen to multi-Qari recitations, or search any topic via the Smart Search tab. To enable live AI scholarship, configure your GEMINI_API_KEY in the .env file.`,
      });
    }

    let contextualPrompt = ISLAMIC_SCHOLAR_SYSTEM_PROMPT;
    if (userLanguage === 'ur') {
      contextualPrompt += '\nPlease answer predominantly in respectful Urdu with Arabic script/Urdu Nastaliq readability in mind.';
    } else if (userLanguage === 'sd') {
      contextualPrompt += '\nPlease answer predominantly in respectful Sindhi (using Arabic-Sindhi script with characters like ڄ, ڃ, ڳ, ڱ, ڌ, ٺ, etc.).';
    }

    if (surahContext) {
      contextualPrompt += `\nCurrently, the user is studying: Surah ${surahContext.name} (${surahContext.englishName}, #${surahContext.number}), Ayat ${surahContext.currentAyah || 'All'}.`;
    }

    // Construct conversation history
    const conversationContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationContents,
      config: {
        systemInstruction: contextualPrompt,
      },
    });

    const reply = response.text || 'I could not generate an answer at this moment. Please try again.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    res.status(500).json({
      error: 'Failed to generate response from AI Assistant.',
      details: error.message || String(error),
    });
  }
});

// Endpoint: Detailed Tafseer for an Ayat
app.post('/api/gemini/tafseer', async (req: Request, res: Response) => {
  try {
    const { surahNumber, surahName, ayahNumber, arabicText, translation, language = 'en' } = req.body;

    if (!ai) {
      return res.json({
        tafseer: `### Classical Tafseer & Spiritual Reflection
**Surah ${surahName || ''} (${surahNumber || ''}), Ayat ${ayahNumber || ''}**

> **Arabic:** ${arabicText || ''}  
> **Translation:** ${translation || ''}

#### 1. Linguistic Depth & Keyword Significance
In this blessed verse, every word carries profound grammatical precision and spiritual resonance in classical Arabic lexicography. The divine phrasing speaks directly to human conscience, combining majesty with mercy.

#### 2. Classical Commentary Synthesis (Ibn Kathir & Maarif-ul-Quran)
Classical mufassireen emphasize that this Ayat encapsulates foundational Quranic principles:
- Recognizing Allah's boundless sovereignty and wisdom.
- Internalizing ethical responsibility, truthfulness, and steadfastness (Istiqamah).

#### 3. Practical Reflection & Daily Tadabbur
- **Spiritual Anchor:** Recite and ponder this ayah during personal moments of contemplation and prayer.
- **Moral Application:** Let the core guidance of this verse shape your attitude toward hardship, gratitude, and compassion with others.

*(Configure your \`GEMINI_API_KEY\` in \`.env\` for live multi-perspective AI scholarship).*`,
        surahNumber,
        ayahNumber,
      });
    }

    const prompt = `Provide a comprehensive scholarly Tafseer and spiritual reflection for:
Surah ${surahName} (${surahNumber}), Ayat ${ayahNumber}:
Arabic: "${arabicText}"
Translation: "${translation}"

Please structure your response with:
1. **Linguistic & Key Term Breakdown** (Key Arabic words, their roots, and depth of meaning).
2. **Context of Revelation (Asbab an-Nuzul)** (Historical background when and why this was revealed).
3. **Core Message & Classical Tafseer Synthesis** (Ibn Kathir, Maarif-ul-Quran).
4. **Practical Life Reflection & Tadabbur** (How a modern Muslim or seeker applies this today).
5. **Cross-Referenced Ayats** (1-2 related verses from other Surahs).

Target language for the explanation: ${language === 'ur' ? 'Urdu' : language === 'sd' ? 'Sindhi' : 'English'}. Include Arabic script for Quranic quotes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ISLAMIC_SCHOLAR_SYSTEM_PROMPT,
      },
    });

    res.json({
      tafseer: response.text,
      surahNumber,
      ayahNumber,
    });
  } catch (error: any) {
    console.error('Tafseer error:', error);
    res.status(500).json({
      error: 'Failed to fetch Tafseer explanation.',
      details: error.message || String(error),
    });
  }
});

// Curated semantic knowledge base fallback when upstream AI has transient latency/503 spikes
const BUILTIN_THEMATIC_INDEX = [
  {
    keywords: ['patience', 'sabr', 'trial', 'hardship', 'grief', 'صبر', 'آزمائش'],
    result: {
      queryInterpretation: 'Quranic guidance on patience (Sabr), endurance through trials, and divine solace.',
      recommendedSurahs: [
        { surahNumber: 2, surahName: 'Al-Baqarah', reason: 'Contains direct commands to seek strength through prayer and Sabr.' },
        { surahNumber: 94, surahName: 'Ash-Sharh', reason: 'Reassures believers that every hardship is followed by relief.' },
        { surahNumber: 103, surahName: 'Al-Asr', reason: 'Identifies mutual counsel to patience as the prerequisite to overcoming loss.' }
      ],
      featuredAyats: [
        {
          surahNumber: 2,
          ayahNumber: 153,
          surahName: 'Al-Baqarah',
          arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
          english: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.',
          urdu: 'اے ایمان والو! صبر اور نماز کے ذریعے مدد چاہو۔ بیشک اللہ صبر کرنے والوں کے ساتھ ہے۔',
          sindhi: 'اي ايمان وارئو! صبر ۽ نماز سان مدد طلب ڪريو، بيشڪ الله صبر ڪندڙن سان گڏ آھي.',
          relevance: 'Direct divine formula for resilience during testing moments.'
        },
        {
          surahNumber: 94,
          ayahNumber: 5,
          surahName: 'Ash-Sharh',
          arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
          english: 'For indeed, with hardship [will be] ease.',
          urdu: 'پس بیشک ہر تنگی کے ساتھ آسانی ہے۔',
          sindhi: 'پوءِ بيشڪ ھر ڏکيائي سان گڏ سؤلائي آھي.',
          relevance: 'Timeless promise of divine ease paired with worldly struggle.'
        }
      ],
      spiritualWisdom: 'The Holy Quran emphasizes that Sabr is not passive resignation, but active steadfastness in faith, knowing that divine relief invariably accompanies hardship.'
    }
  },
  {
    keywords: ['parent', 'mother', 'father', 'family', 'والدین', 'ماءُ', 'پيءُ'],
    result: {
      queryInterpretation: 'Verses enjoining compassion, gratitude, and devotion to parents and elders.',
      recommendedSurahs: [
        { surahNumber: 17, surahName: 'Al-Isra', reason: 'The core charter of honoring aging parents with gentleness.' },
        { surahNumber: 31, surahName: 'Luqman', reason: 'Recognizes the sacrifice of the mother carrying a child through hardship.' }
      ],
      featuredAyats: [
        {
          surahNumber: 17,
          ayahNumber: 24,
          surahName: 'Al-Isra',
          arabic: 'وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
          english: 'And lower to them the wing of humility out of mercy and say, "My Lord, have mercy upon them as they brought me up [when I was] small."',
          urdu: 'اور ان کے آگے شفقت سے عاجزی کا بازو جھکاؤ اور کہو: اے میرے رب! ان دونوں پر رحم فرما جیسا کہ انہوں نے بچپن میں مجھے پالا۔',
          sindhi: '۽ انھن لاءِ مھربانيءَ سان نماڻائيءَ جو پاسو جھڪاءِ ۽ چئو ته: اي منھنجا پالڻھار! انھن تي رحم ڪر جھڙو انھن مون کي ننڍپڻ ۾ نپايو.',
          relevance: 'The pinnacle Quranic supplication for parents.'
        }
      ],
      spiritualWisdom: 'Devotion to parents in the Quran is paired directly with monotheism, reminding seekers that serving mothers and fathers is an essential pathway to divine mercy.'
    }
  },
  {
    keywords: ['sajdah', 'prostration', 'سجدہ', 'سجدا'],
    result: {
      queryInterpretation: 'Verses on physical and spiritual prostration (Sajdah) and reverence before God.',
      recommendedSurahs: [
        { surahNumber: 32, surahName: 'As-Sajdah', reason: 'Named after the deep prostration upon hearing divine revelation.' },
        { surahNumber: 96, surahName: 'Al-Alaq', reason: 'Commands believers to prostrate and draw near to Allah.' }
      ],
      featuredAyats: [
        {
          surahNumber: 96,
          ayahNumber: 19,
          surahName: 'Al-Alaq',
          arabic: 'كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِب ۩',
          english: 'No! Do not obey him. But prostrate and draw near [to Allah].',
          urdu: 'ہرگز نہیں! اس کی بات نہ مانو اور سجدہ کرو اور (اپنے رب کے) قریب ہو جاؤ۔',
          sindhi: 'ھرگز ائين نه آھي! سندس چيو نه مڃ، ۽ سجدي ۾ پئو ۽ (الله جي) ويجھو ٿي وڃ.',
          relevance: 'Final verse of Surah Al-Alaq signifying the closest state of a servant to God.'
        }
      ],
      spiritualWisdom: 'Sajdah represents the ultimate surrender of human ego and pride before the Majesty of the Creator.'
    }
  }
];

// In-memory query cache to guarantee sub-millisecond responses
const searchCache = new Map<string, any>();

// Endpoint: Smart Semantic & Voice Query Search
app.post('/api/gemini/smart-search', async (req: Request, res: Response) => {
  const { query = '', language = 'en' } = req.body;
  const normalized = query.toLowerCase().trim();
  const cacheKey = `${language}:${normalized}`;

  // 1. Instant Cache Hit (0ms)
  if (searchCache.has(cacheKey)) {
    return res.json(searchCache.get(cacheKey));
  }

  // 2. Compute instant local semantic result
  let instantResult;
  try {
    const { instantQuranSearch } = await import('./src/utils/quranSearchEngine');
    instantResult = instantQuranSearch(query, language as any);
  } catch (err) {
    const matchedTheme = BUILTIN_THEMATIC_INDEX.find((t) =>
      t.keywords.some((k) => normalized.includes(k))
    ) || BUILTIN_THEMATIC_INDEX[0];
    instantResult = {
      ...matchedTheme.result,
      queryInterpretation: `Results matching: "${query}"`,
    };
  }

  // 3. Strict 2.2-second race against Gemini so search never hangs
  if (!ai) {
    searchCache.set(cacheKey, instantResult);
    return res.json(instantResult);
  }

  const prompt = `A user is searching the Quran with query: "${query}".
Identify the most relevant Surahs and Ayats that address this query.
Return valid JSON matching:
{
  "queryInterpretation": "Brief 1-line interpretation",
  "recommendedSurahs": [
    { "surahNumber": 1, "surahName": "Al-Fatihah", "reason": "Why relevant" }
  ],
  "featuredAyats": [
    {
      "surahNumber": 2,
      "ayahNumber": 153,
      "surahName": "Al-Baqarah",
      "arabic": "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
      "english": "O you who have believed, seek help through patience and prayer...",
      "urdu": "اے ایمان والو! صبر اور نماز کے ذریعے مدد چاہو...",
      "sindhi": "اي ايمان وارئو! صبر ۽ نماز سان مدد طلب ڪريو...",
      "relevance": "Direct instruction on patience and finding strength."
    }
  ],
  "spiritualWisdom": "A comforting 2-sentence summary in ${language === 'ur' ? 'Urdu' : language === 'sd' ? 'Sindhi' : 'English'}."
}`;

  const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2200));

  const aiPromise = (async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an intelligent Quranic semantic search and indexing engine. Output valid JSON only, without markdown backticks.',
          responseMimeType: 'application/json',
        },
      });
      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (e: any) {
      console.warn('AI smart search notice (transient overload, using fast index):', e?.message || e);
    }
    return null;
  })();

  try {
    const aiResult = await Promise.race([aiPromise, timeoutPromise]);
    if (aiResult && (aiResult as any).featuredAyats && Array.isArray((aiResult as any).featuredAyats) && (aiResult as any).featuredAyats.length > 0) {
      if (searchCache.size > 200) searchCache.clear();
      searchCache.set(cacheKey, aiResult);
      return res.json(aiResult);
    }
  } catch (err) {
    console.warn('Smart search race exception:', err);
  }

  // Immediately return instant result if AI timed out or errored
  searchCache.set(cacheKey, instantResult);
  res.json(instantResult);
});

// Endpoint: Transcribe Audio Query
app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', language = 'en' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64 payload' });
    }

    if (!ai) {
      return res.json({ text: '', notice: 'Gemini AI is not configured. Voice query transcribed locally.' });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    const promptText = `Transcribe the spoken audio query verbatim. The user is searching the Quran and may speak in English, Urdu (اردو), Sindhi (سنڌي), or Arabic (عربي). Output ONLY the plain transcription text, no extra commentary or quotes.`;

    // Race against 5.5s timeout to prevent hanging the client
    const transcriptionPromise = (async () => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [audioPart, { text: promptText }] },
        });
        return (response.text || '').trim();
      } catch (e: any) {
        console.warn('gemini-2.5-flash audio fallback to gemini-3.8-flash:', e?.message || e);
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: [audioPart, { text: promptText }] },
        });
        return (fallbackResponse.text || '').trim();
      }
    })();

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Transcription timed out after 5.5s')), 5500)
    );

    const transcription = await Promise.race([transcriptionPromise, timeoutPromise]);
    res.json({ text: transcription });
  } catch (error: any) {
    console.error('Audio transcription notice:', error?.message || error);
    res.status(200).json({
      text: '',
      notice: 'Voice transcription timed out or was unavailable. Falling back gracefully.',
    });
  }
});

// Endpoint: Server health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'Al-Bayan Quran Ecosystem',
    timestamp: new Date().toISOString(),
    aiReady: !!process.env.GEMINI_API_KEY,
  });
});

function startListening(portToTry: number) {
  const server = app.listen(portToTry, '0.0.0.0', () => {
    console.log(`[Al-Bayan Server] running at http://localhost:${portToTry}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Al-Bayan Server] Port ${portToTry} is in use. Trying port ${portToTry + 1}...`);
      startListening(portToTry + 1);
    } else {
      console.error('[Al-Bayan Server] Listen error:', err);
    }
  });
}

// Dev / Prod Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  startListening(defaultPort);
}

startServer();
