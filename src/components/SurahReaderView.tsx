import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Bookmark,
  Edit3,
  Copy,
  Check,
  BookOpen,
  Volume2,
  Sliders,
  Type,
  Eye,
  Info,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  ActivePlaybackPhase,
  AyahData,
  PlaybackMode,
  SurahMetadata,
} from '../types/quran';
import { fetchSurahAyahs } from '../utils/api';
import { tokenizeTajweed } from '../utils/tajweed';
import { isAyahBookmarked, recordAyahRead, setLastRead, UserPreferences } from '../services/storage';
import { TRANSLATION_SPEAKERS } from '../data/translationSpeakers';

interface Props {
  surah: SurahMetadata;
  currentPlayingAyah: number;
  isPlaying: boolean;
  activePhase?: ActivePlaybackPhase;
  playbackMode?: PlaybackMode;
  translationSpeakerId?: string;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onPlayAyah: (surahNumber: number, ayahNumber: number) => void;
  onPlayAyahTranslation?: (surahNumber: number, ayahNumber: number, speakerId?: string) => void;
  onOpenTafseer: (ayah: AyahData) => void;
  onOpenNote: (ayah: AyahData) => void;
  onOpenTajweedGuide: () => void;
  onSelectSurah: (num: number) => void;
}

export const SurahReaderView: React.FC<Props> = ({
  surah,
  currentPlayingAyah,
  isPlaying,
  activePhase = 'arabic',
  playbackMode = 'dual',
  translationSpeakerId = 'ur_shamshad',
  preferences,
  onUpdatePreferences,
  onPlayAyah,
  onPlayAyahTranslation,
  onOpenTafseer,
  onOpenNote,
  onOpenTajweedGuide,
  onSelectSurah,
}) => {
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const activeAyahRef = useRef<HTMLDivElement | null>(null);

  const sajdahSet = React.useMemo(
    () => new Set(surah.sajdahAyats),
    [surah.sajdahAyats]
  );

  const currentSpeaker = React.useMemo(
    () =>
      TRANSLATION_SPEAKERS.find((s) => s.id === translationSpeakerId) ||
      TRANSLATION_SPEAKERS[0],
    [translationSpeakerId]
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchSurahAyahs(surah.number).then((data) => {
      if (isMounted) {
        setAyahs(data);
        setLoading(false);
      }
    });

    setLastRead(surah.number, 1);

    return () => {
      isMounted = false;
    };
  }, [surah.number]);

  // Smooth scroll ONLY when active verse changes to avoid UI stutter
  useEffect(() => {
    if (preferences.autoScrollToVerse && activeAyahRef.current && isPlaying && currentPlayingAyah > 0) {
      activeAyahRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentPlayingAyah]);

  const handleCopyAyah = React.useCallback((ayah: AyahData) => {
    const text = `Surah ${surah.englishName} (${surah.number}:${ayah.numberInSurah})\n${ayah.text}\n\nEnglish: ${ayah.translations.en}\nUrdu: ${ayah.translations.ur}\nSindhi: ${ayah.translations.sd}`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayah.numberInSurah);
    setTimeout(() => setCopiedAyah(null), 2000);
  }, [surah.englishName, surah.number]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 pb-36 space-y-6 animate-fade-in">
      {/* Surah Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-6 sm:p-8 text-center shadow-xl">
        {/* Subtle decorative Islamic geometry backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Navigation between Surahs */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <button
            onClick={() => onSelectSurah(surah.number - 1)}
            disabled={surah.number <= 1}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 disabled:opacity-30 disabled:pointer-events-none border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous Surah
          </button>

          <span className="text-xs font-mono font-medium text-emerald-400">
            Surah #{surah.number} of 114
          </span>

          <button
            onClick={() => onSelectSurah(surah.number + 1)}
            disabled={surah.number >= 114}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 disabled:opacity-30 disabled:pointer-events-none border border-slate-700 transition-colors"
          >
            Next Surah <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <h1 className="font-amiri text-4xl sm:text-5xl font-bold text-emerald-300 mb-2 drop-shadow">
          {surah.name}
        </h1>

        <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-bold text-slate-100 font-cinzel">
          <span>{surah.englishName}</span>
          <span className="text-sm font-normal text-slate-400">
            ({surah.englishNameTranslation})
          </span>
        </div>

        {/* Urdu & Sindhi Names */}
        <div className="flex items-center justify-center gap-4 text-sm text-amber-200/90 mt-1 font-amiri">
          <span>اردو: {surah.urduName}</span>
          <span>•</span>
          <span>سنڌي: {surah.sindhiName}</span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
            {surah.revelationType === 'Meccan' ? '🕋 Makki (مكية)' : '🕌 Madani (مدنية)'}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
            {surah.numberOfAyahs} Verses
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
            {surah.rukus} Ruko
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
            {surah.juzRange}
          </span>
          {surah.sajdahAyats.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Sajdah at Verse {surah.sajdahAyats.join(', ')}
            </span>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          {surah.themeSummary}
        </p>
      </div>

      {/* Reader Controls Toolbar */}
      <div className="sticky top-16 z-30 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-3 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Tajweed & Display Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onUpdatePreferences({ tajweedEnabled: !preferences.tajweedEnabled })}
            className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition-colors ${
              preferences.tajweedEnabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tajweed Color: {preferences.tajweedEnabled ? 'ON' : 'OFF'}
          </button>

          {preferences.tajweedEnabled && (
            <button
              onClick={onOpenTajweedGuide}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
              title="Open Tajweed rules guide"
            >
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              Rule Guide
            </button>
          )}

          {/* Translation Toggles */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => onUpdatePreferences({ showEnglish: !preferences.showEnglish })}
              className={`px-2 py-1 rounded-lg transition-colors font-medium ${
                preferences.showEnglish ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onUpdatePreferences({ showUrdu: !preferences.showUrdu })}
              className={`px-2 py-1 rounded-lg transition-colors font-medium ${
                preferences.showUrdu ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              اردو
            </button>
            <button
              onClick={() => onUpdatePreferences({ showSindhi: !preferences.showSindhi })}
              className={`px-2 py-1 rounded-lg transition-colors font-medium ${
                preferences.showSindhi ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              سنڌي
            </button>
          </div>
        </div>

        {/* Right: Typography Settings Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              showSettingsDrawer
                ? 'bg-slate-800 border-emerald-500/50 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Fonts & Sizes
          </button>
        </div>
      </div>

      {/* Font Size & Settings Drawer */}
      {showSettingsDrawer && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl space-y-4 animate-fade-in text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Arabic Font Size */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span>Arabic Text Size:</span>
                <span className="font-mono text-emerald-400">{preferences.arabicFontSize}px</span>
              </div>
              <input
                type="range"
                min={22}
                max={48}
                step={2}
                value={preferences.arabicFontSize}
                onChange={(e) => onUpdatePreferences({ arabicFontSize: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Translation Font Size */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span>Translation Text Size:</span>
                <span className="font-mono text-emerald-400">{preferences.translationFontSize}px</span>
              </div>
              <input
                type="range"
                min={13}
                max={24}
                step={1}
                value={preferences.translationFontSize}
                onChange={(e) => onUpdatePreferences({ translationFontSize: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Arabic Font Style */}
            <div className="space-y-1.5">
              <span className="text-slate-300 font-medium">Arabic Font Calligraphy Style:</span>
              <div className="flex gap-1">
                {[
                  { id: 'font-amiri', label: 'Amiri (Classic)' },
                  { id: 'font-scheherazade', label: 'Scheherazade' },
                  { id: 'font-naskh', label: 'Naskh (Clean)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onUpdatePreferences({ arabicFontFamily: f.id as any })}
                    className={`flex-1 py-1 px-2 rounded-lg border text-[11px] transition-colors ${
                      preferences.arabicFontFamily === f.id
                        ? 'bg-emerald-600 border-emerald-500 text-white font-medium'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bismillah Header (Except Surah 9 At-Tawbah) */}
      {surah.number !== 9 && (
        <div className="text-center py-6 border-b border-slate-800/80">
          <div className="inline-block p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
            <p className="font-amiri text-2xl sm:text-3xl text-emerald-300 font-bold drop-shadow">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="text-xs text-slate-400 mt-1 italic">
              In the Name of Allah, the Entirely Merciful, the Especially Merciful
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs">Loading authentic Arabic text & multilingual translations...</p>
        </div>
      ) : (
        /* Verses List */
        <div className="space-y-4">
          {ayahs.map((ayah) => {
            const isPlayingThis = isPlaying && currentPlayingAyah === ayah.numberInSurah;
            const hasSajdah = sajdahSet.has(ayah.numberInSurah);
            const bookmarked = isAyahBookmarked(surah.number, ayah.numberInSurah);

            return (
              <div
                key={ayah.numberInSurah}
                ref={isPlayingThis ? activeAyahRef : null}
                className={`relative rounded-2xl p-4 sm:p-6 transition-all duration-300 border ${
                  isPlayingThis
                    ? activePhase === 'arabic'
                      ? 'bg-slate-900/90 border-emerald-500 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                      : 'bg-slate-900/90 border-amber-500 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80'
                }`}
              >
                {/* Verse Top Bar: Number Badge, Dual-Track Phase Pill, & Actions */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/60 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {/* Verse number ornament */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-colors ${
                        isPlayingThis
                          ? activePhase === 'arabic'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-800/80 text-emerald-400 border-slate-700'
                      }`}
                    >
                      {ayah.numberInSurah}
                    </div>

                    {/* Dual-Track Active Phase Status Pill */}
                    {isPlayingThis && (
                      <div className="flex items-center gap-1.5">
                        {activePhase === 'arabic' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-semibold flex items-center gap-1 shadow-sm shadow-emerald-500/20 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Phase 1: Reciting Arabic Script
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-semibold flex items-center gap-1 shadow-sm shadow-amber-500/20 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            Phase 2: Spoken Translation ({currentSpeaker.name})
                          </span>
                        )}
                      </div>
                    )}

                    {hasSajdah && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Sajdah Ayat
                      </span>
                    )}
                  </div>

                  {/* Actions for this verse */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Play / Pause verse */}
                    <button
                      onClick={() => {
                        onPlayAyah(surah.number, ayah.numberInSurah);
                        recordAyahRead();
                      }}
                      className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                        isPlayingThis
                          ? activePhase === 'arabic'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title={isPlayingThis ? 'Pause verse' : 'Recite & Translate this verse'}
                    >
                      {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    {/* AI Tafseer */}
                    <button
                      onClick={() => onOpenTafseer(ayah)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Generate deep AI Tafseer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span className="hidden sm:inline">AI Tafseer</span>
                    </button>

                    {/* Reflection / Bookmark Note */}
                    <button
                      onClick={() => onOpenNote(ayah)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        bookmarked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title="Add note or bookmark"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Copy Ayat */}
                    <button
                      onClick={() => handleCopyAyah(ayah)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Copy verse"
                    >
                      {copiedAyah === ayah.numberInSurah ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 1. Arabic Text Container (Illuminates when activePhase === 'arabic') */}
                <div
                  className={`text-right leading-loose mb-4 dir-rtl text-slate-100 p-3.5 rounded-2xl transition-all duration-300 ${
                    preferences.arabicFontFamily
                  } ${
                    isPlayingThis && activePhase === 'arabic'
                      ? 'bg-emerald-950/40 border border-emerald-500/60 shadow-[0_0_24px_rgba(16,185,129,0.18)] ring-2 ring-emerald-500/30'
                      : 'bg-transparent border border-transparent'
                  }`}
                  style={{ fontSize: `${preferences.arabicFontSize}px` }}
                >
                  {preferences.tajweedEnabled ? (
                    <span>
                      {tokenizeTajweed(ayah.text).map((token, idx) => {
                        if (!token.rule) {
                          return <span key={idx}>{token.text}</span>;
                        }
                        const ruleClass =
                          token.rule === 'ghunnah'
                            ? 'text-emerald-400 font-semibold'
                            : token.rule === 'qalqalah'
                            ? 'text-rose-400 font-semibold'
                            : token.rule === 'ikhfa'
                            ? 'text-amber-400 font-semibold'
                            : token.rule === 'idgham'
                            ? 'text-sky-400 font-semibold'
                            : token.rule === 'madd'
                            ? 'text-purple-400 font-semibold'
                            : 'text-teal-400 font-semibold';

                        return (
                          <span
                            key={idx}
                            className={`${ruleClass} transition-colors`}
                            title={`Tajweed: ${token.rule}`}
                          >
                            {token.text}
                          </span>
                        );
                      })}
                    </span>
                  ) : (
                    <span>{ayah.text}</span>
                  )}
                  {/* Decorative Arabic verse end marker */}
                  <span className="inline-flex items-center justify-center font-amiri text-emerald-400 mr-2 text-xl select-none">
                    ۝{ayah.numberInSurah}
                  </span>
                </div>

                {/* 2. Multilingual Translations Container (Illuminates when activePhase === 'translation') */}
                <div
                  className={`space-y-3 pt-3 border-t border-slate-800/60 rounded-2xl p-3.5 transition-all duration-300 ${
                    isPlayingThis && activePhase === 'translation'
                      ? 'bg-amber-950/25 border border-amber-500/50 shadow-[0_0_24px_rgba(245,158,11,0.18)] ring-2 ring-amber-500/30'
                      : 'bg-transparent border border-transparent'
                  }`}
                  style={{ fontSize: `${preferences.translationFontSize}px` }}
                >
                  {/* English Translation */}
                  {preferences.showEnglish && ayah.translations.en && (
                    <div
                      className={`leading-relaxed font-sans p-2.5 rounded-xl transition-all ${
                        isPlayingThis && activePhase === 'translation' && currentSpeaker.language === 'en'
                          ? 'bg-amber-500/20 border border-amber-400/50 text-amber-100 font-medium shadow-md shadow-amber-500/10'
                          : 'text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 border-b border-slate-700/50 pb-1">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                          [English Translation]
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayAyahTranslation?.(surah.number, ayah.numberInSurah, 'en_ibrahim');
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 transition-all ${
                            isPlayingThis && activePhase === 'translation' && currentSpeaker.language === 'en'
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                          title="Play English translation voice for this verse"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{isPlayingThis && activePhase === 'translation' && currentSpeaker.language === 'en' ? 'Playing Voice...' : 'Listen in English'}</span>
                        </button>
                      </div>
                      {ayah.translations.en}
                    </div>
                  )}

                  {/* Urdu Translation (Nastaliq styling) */}
                  {preferences.showUrdu && ayah.translations.ur && (
                    <div
                      className={`text-right leading-loose font-nastaliq dir-rtl p-2.5 rounded-xl transition-all ${
                        isPlayingThis && activePhase === 'translation' && currentSpeaker.language === 'ur'
                          ? 'bg-amber-500/20 border border-amber-400/50 text-amber-200 font-medium shadow-md shadow-amber-500/10'
                          : 'text-amber-100/90 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 border-b border-amber-500/15 pb-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayAyahTranslation?.(surah.number, ayah.numberInSurah, 'ur_shamshad');
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-sans flex items-center gap-1 transition-all ${
                            isPlayingThis && activePhase === 'translation' && currentSpeaker.language === 'ur'
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                              : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                          }`}
                          title="Play Urdu translation voice for this verse"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{isPlayingThis && activePhase === 'translation' && currentSpeaker.language === 'ur' ? 'اردو آواز جاری ہے...' : 'اردو آواز سنیں'}</span>
                        </button>
                        <span className="text-xs font-sans font-semibold text-amber-400">
                          [اردو ترجمہ - مولانا فتح محمد جالندھری]
                        </span>
                      </div>
                      {ayah.translations.ur}
                    </div>
                  )}

                  {/* Sindhi Translation */}
                  {preferences.showSindhi && ayah.translations.sd && (
                    <div
                      className={`text-right leading-loose font-amiri dir-rtl p-2 rounded-xl transition-all ${
                        isPlayingThis && activePhase === 'translation' && currentSpeaker.language === 'sd'
                          ? 'bg-teal-500/20 border border-teal-400/40 text-teal-100 font-medium'
                          : 'text-teal-100/90'
                      }`}
                    >
                      <span className="text-xs font-sans font-semibold text-teal-400 ml-1.5">
                        [سنڌي]
                      </span>
                      {ayah.translations.sd}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
