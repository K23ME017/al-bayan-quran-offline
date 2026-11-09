import React, { useState, useEffect } from 'react';
import { Sparkles, X, Volume2, Globe, BookOpen, Share2, Check, RefreshCw } from 'lucide-react';
import { AyahData } from '../types/quran';
import { generateOfflineTafseer } from '../utils/offlineTafseer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  ayah: AyahData | null;
  onPlayAyah: (surahNumber: number, ayahNumber: number) => void;
}

export const TafseerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  ayah,
  onPlayAyah,
}) => {
  const [language, setLanguage] = useState<'en' | 'ur' | 'sd'>('en');
  const [loading, setLoading] = useState(false);
  const [tafseerText, setTafseerText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && ayah) {
      loadTafseer(language);
    }
  }, [isOpen, ayah, language]);

  const loadTafseer = async (lang: 'en' | 'ur' | 'sd') => {
    if (!ayah) return;
    setLoading(true);
    setError(null);

    const translation =
      lang === 'ur'
        ? ayah.translations.ur
        : lang === 'sd'
        ? ayah.translations.sd
        : ayah.translations.en;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch('/api/gemini/tafseer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahNumber,
          surahName,
          ayahNumber: ayah.numberInSurah,
          arabicText: ayah.text,
          translation,
          language: lang,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to generate Tafseer.');
      }

      const data = await response.json();
      setTafseerText(data.tafseer || 'No Tafseer available.');
    } catch (err: any) {
      console.warn('Live Tafseer unavailable, falling back to bundled offline classical Tafseer:', err);
      const offlineCommentary = generateOfflineTafseer({
        surahNumber,
        surahName,
        ayahNumber: ayah.numberInSurah,
        arabicText: ayah.text,
        translation,
        language: lang,
      });
      setTafseerText(offlineCommentary);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!ayah) return;
    const shareText = `Surah ${surahName} (${surahNumber}:${ayah.numberInSurah})\n\n"${ayah.text}"\n\nTranslation: ${ayah.translations.en}\n\nTafseer & Tadabbur:\n${tafseerText}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !ayah) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-cinzel text-emerald-400">
                  AI Tafseer & Tadabbur
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Surah {surahName} : {ayah.numberInSurah}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Classical synthesis, linguistic breakdown & practical reflections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlayAyah(surahNumber, ayah.numberInSurah)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
              title="Play verse audio"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Listen
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy Tafseer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ayat Summary Box */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/80">
          <p className="font-amiri text-2xl text-right text-emerald-300 leading-relaxed mb-3 dir-rtl">
            {ayah.text}
          </p>
          <div className="text-xs text-slate-300 space-y-1">
            <p className="text-slate-200">
              <strong className="text-emerald-400">English:</strong> {ayah.translations.en}
            </p>
            {ayah.translations.ur && (
              <p className="font-nastaliq text-sm text-right text-amber-200/90 dir-rtl">
                {ayah.translations.ur}
              </p>
            )}
            {ayah.translations.sd && (
              <p className="font-amiri text-sm text-right text-teal-200/90 dir-rtl">
                {ayah.translations.sd}
              </p>
            )}
          </div>
        </div>

        {/* Language Selection Pills */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800 bg-slate-900/50 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tafseer Language:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                language === 'en'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ur')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                language === 'ur'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              اردو (Urdu)
            </button>
            <button
              onClick={() => setLanguage('sd')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                language === 'sd'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              سنڌي (Sindhi)
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-200 leading-relaxed">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs">
                Consulting classical Tafseer sources & synthesizing insights...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs text-center space-y-3">
              <p>{error}</p>
              <button
                onClick={() => loadTafseer(language)}
                className="px-4 py-1.5 rounded-lg bg-rose-600/50 hover:bg-rose-600 text-white transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className={`prose prose-invert max-w-none text-slate-300 whitespace-pre-line text-sm leading-relaxed ${language === 'ur' || language === 'sd' ? 'text-right dir-rtl font-amiri text-base leading-loose' : ''}`}>
              {tafseerText}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span className="italic">
            Sources: Tafseer Ibn Kathir, Maarif-ul-Quran, and Al-Bayan Scholarly Insights
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
