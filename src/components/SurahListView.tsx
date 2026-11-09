import React, { useState } from 'react';
import {
  Search,
  Flame,
  Award,
  Play,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  Clock,
  Compass,
  Volume2,
} from 'lucide-react';
import { SURAH_METADATA_LIST } from '../data/surahMetadata';
import { SurahMetadata, ReadingStreakData, AyahData } from '../types/quran';

interface Props {
  streak: ReadingStreakData;
  onSelectSurah: (surahNumber: number) => void;
  onPlaySurah: (surahNumber: number) => void;
  onOpenTafseer: (ayah: AyahData, surahNumber: number, surahName: string) => void;
}

export const SurahListView: React.FC<Props> = ({
  streak,
  onSelectSurah,
  onPlaySurah,
  onOpenTafseer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan' | 'sajdah' | 'juz30'>('all');

  const filteredSurahs = React.useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return SURAH_METADATA_LIST.filter((surah) => {
      // Search query match
      const matchesSearch =
        !term ||
        surah.number.toString() === term ||
        surah.englishName.toLowerCase().includes(term) ||
        surah.englishNameTranslation.toLowerCase().includes(term) ||
        surah.name.includes(term) ||
        surah.urduName.includes(term) ||
        surah.sindhiName.includes(term);

      if (!matchesSearch) return false;

      // Filter type match
      if (filterType === 'Meccan') return surah.revelationType === 'Meccan';
      if (filterType === 'Medinan') return surah.revelationType === 'Medinan';
      if (filterType === 'sajdah') return surah.sajdahAyats.length > 0;
      if (filterType === 'juz30') return surah.juzRange.includes('30');
      return true;
    });
  }, [searchTerm, filterType]);

  const dailyAyah: AyahData = {
    number: 255,
    numberInSurah: 255,
    text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    translations: {
      en: 'Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor sleep.',
      ur: 'اللہ وہ ہے جس کے سوا کوئی معبود نہیں، ہمیشہ زندہ رہنے والا اور سب کو سنبھالنے والا۔ نہ اسے اونگھ آتی ہے نہ نیند۔',
      sd: 'الله اھو آھي جنھن کان سواءِ ڪو به معبود ناھي، سدائين جيئرو رھندڙ، سڀ ڪجھ سنڀاليندڙ، نڪي کيس ننڊ اچي ٿي ۽ نڪي جھوٽو.',
    },
  };

  const goalPercent = Math.min(100, Math.round((streak.todayAyahsRead / streak.dailyGoalAyahs) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-6 animate-fade-in">
      {/* Top Banner: Daily Streak & Goal Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              Daily Quran Streak
            </div>
            <div className="text-3xl font-bold font-cinzel text-slate-100 flex items-baseline gap-2">
              <span>{streak.currentStreak}</span>
              <span className="text-sm font-normal text-slate-400">Days Active</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Best record: {streak.longestStreak} days continuous recitation
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-7 h-7 fill-amber-400" />
          </div>
        </div>

        {/* Daily Goal Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col justify-between shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Daily Reading Goal
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {streak.todayAyahsRead} / {streak.dailyGoalAyahs} Ayahs
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {goalPercent >= 100
              ? '🎉 Daily goal accomplished! May Allah reward your diligence.'
              : `${streak.dailyGoalAyahs - streak.todayAyahsRead} more verses to complete today's target.`}
          </p>
        </div>

        {/* Spiritual Wisdom Tip */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400">
            <Compass className="w-4 h-4" />
            Prophetic Reflection
          </div>
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "The best among you are those who learn the Quran and teach it to others."
          </p>
          <span className="text-[10px] text-slate-500 font-mono">— Sahih Al-Bukhari 5027</span>
        </div>
      </div>

      {/* Daily Ayat of the Day Spotlight */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/30 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Ayat of the Day
            </span>
            <span className="text-xs text-slate-400">
              Surah Al-Baqarah (2:255) • Ayatul Kursi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlaySurah(2)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Listen to Recitation
            </button>
            <button
              onClick={() => onOpenTafseer(dailyAyah, 2, 'Al-Baqarah')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Explore AI Tafseer
            </button>
          </div>
        </div>

        <p className="font-amiri text-2xl sm:text-3xl text-right text-emerald-300 leading-loose mb-3 dir-rtl drop-shadow">
          {dailyAyah.text}
        </p>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          <strong>English:</strong> {dailyAyah.translations.en}
        </p>
        <p className="font-nastaliq text-xs sm:text-sm text-right text-amber-200/90 leading-loose dir-rtl pt-1">
          <strong>اردو:</strong> {dailyAyah.translations.ur}
        </p>
        <p className="font-amiri text-xs sm:text-sm text-right text-teal-200/90 leading-loose dir-rtl">
          <strong>سنڌي:</strong> {dailyAyah.translations.sd}
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Surah name in English, Arabic, Urdu, Sindhi or number (e.g. Al-Mulk, يس, 67)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All (114)' },
            { id: 'Meccan', label: 'Makki (86)' },
            { id: 'Medinan', label: 'Madani (28)' },
            { id: 'sajdah', label: 'Sajdah (14)' },
            { id: 'juz30', label: 'Juz 30' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id as any)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors font-medium border ${
                filterType === pill.id
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Surahs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurahs.map((surah) => {
          const hasSajdah = surah.sajdahAyats.length > 0;

          return (
            <div
              key={surah.number}
              onClick={() => onSelectSurah(surah.number)}
              className="group relative rounded-2xl p-5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-500/5 flex flex-col justify-between space-y-4"
            >
              {/* Card Header: Number & Arabic Name */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 group-hover:bg-emerald-500/20 border border-slate-700/80 group-hover:border-emerald-500/40 flex items-center justify-center font-mono font-bold text-xs text-emerald-400 transition-colors">
                    {surah.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors font-cinzel text-base">
                      {surah.englishName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {surah.englishNameTranslation}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-amiri text-2xl font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors">
                    {surah.name}
                  </span>
                  <div className="text-[11px] text-amber-200/80 font-amiri">
                    {surah.urduName} • {surah.sindhiName}
                  </div>
                </div>
              </div>

              {/* Badges & Metrics */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/70">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                    {surah.revelationType === 'Meccan' ? 'Makki' : 'Madani'}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {surah.numberOfAyahs} Ayats • {surah.rukus} Ruko
                  </span>
                  {hasSajdah && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-0.5">
                      <Award className="w-2.5 h-2.5" /> Sajdah
                    </span>
                  )}
                </div>

                {/* Quick Audio Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySurah(surah.number);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                  title="Play Surah audio"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
