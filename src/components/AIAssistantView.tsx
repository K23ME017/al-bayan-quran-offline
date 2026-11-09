import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Globe,
  RefreshCw,
  BookOpen,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { SURAH_METADATA_LIST } from '../data/surahMetadata';
import { generateOfflineAIResponse } from '../utils/offlineAICompanion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Assalamu Alaikum wa Rahmatullah. I am Al-Bayan AI, your scholarly companion for Quranic study, Tafseer, linguistic analysis, and ethical reflection. How may I assist your contemplation of the Noble Quran today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLang, setUserLang] = useState<'en' | 'ur' | 'sd'>('en');
  const [selectedSurahContext, setSelectedSurahContext] = useState<number | 'none'>('none');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const surahContextObj =
        selectedSurahContext !== 'none'
          ? SURAH_METADATA_LIST.find((s) => s.number === selectedSurahContext)
          : null;

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
          })),
          userLanguage: userLang,
          surahContext: surahContextObj
            ? {
                number: surahContextObj.number,
                name: surahContextObj.name,
                englishName: surahContextObj.englishName,
              }
            : null,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      console.warn('Live AI unavailable, activating offline Islamic knowledge companion:', err);
      const surahContextObj =
        selectedSurahContext !== 'none'
          ? SURAH_METADATA_LIST.find((s) => s.number === selectedSurahContext)
          : null;

      const offlineResult = generateOfflineAIResponse(textToSend, userLang, surahContextObj);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: offlineResult.reply,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const starterPrompts = [
    'Explain the central message and lessons of Surah Al-Kahf',
    'What is the historical context of revelation for Surah Al-Fil?',
    'Give me a Quranic reflection on finding inner peace during hardship',
    'Explain the linguistic depth of the phrase "Al-Hamdulillahi Rabbil Alamin"',
    'قرآن مجید میں صبر اور استقامت کے بارے میں کیا رہنمائی ہے؟',
    'سنڌي ۾ ٻڌايو ته سورة رحمٰن جا مکيه موضوع ڪھڙا آھن؟',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-4 animate-fade-in text-slate-100 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-cinzel text-emerald-400 flex items-center gap-2">
              Al-Bayan AI Quran Scholar
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                gemini-3.8-flash
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Authentic Tafseer, historical context, and spiritual contemplation
            </p>
          </div>
        </div>

        {/* Language & Context selector */}
        <div className="flex items-center gap-2 text-xs">
          {/* Language selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            <button
              onClick={() => setUserLang('en')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                userLang === 'en' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setUserLang('ur')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                userLang === 'ur' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              اردو
            </button>
            <button
              onClick={() => setUserLang('sd')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                userLang === 'sd' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              سنڌي
            </button>
          </div>

          {/* Surah Context attachment */}
          <select
            value={selectedSurahContext}
            onChange={(e) =>
              setSelectedSurahContext(e.target.value === 'none' ? 'none' : Number(e.target.value))
            }
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 max-w-[140px] truncate"
          >
            <option value="none">General Context</option>
            {SURAH_METADATA_LIST.map((s) => (
              <option key={s.number} value={s.number}>
                Surah #{s.number} {s.englishName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="min-h-[400px] max-h-[60vh] overflow-y-auto space-y-4 p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-inner">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/60'
                } ${
                  userLang === 'ur' || userLang === 'sd' ? 'font-amiri text-base leading-loose' : ''
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/50 p-3 rounded-2xl w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Al-Bayan scholar is formulating authentic response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter suggestions */}
      {messages.length <= 2 && (
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Suggested Questions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {starterPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-3 py-1 text-xs rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-slate-300 hover:text-emerald-300 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Field */}
      <div className="relative rounded-2xl bg-slate-900 border border-slate-700/80 p-2 flex items-center gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            userLang === 'ur'
              ? 'اپنا سوال یہاں لکھیں...'
              : userLang === 'sd'
              ? 'پنهنجو سوال هتي لکو...'
              : 'Ask a question about any verse, Islamic theme, or Tafseer...'
          }
          rows={1}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-24"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors shadow-md shadow-emerald-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
