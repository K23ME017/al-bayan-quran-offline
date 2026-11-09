import React, { useState } from 'react';
import {
  BarChart3,
  Award,
  BookOpen,
  Compass,
  Layers,
  PieChart,
  ArrowUpDown,
  Search,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { SURAH_METADATA_LIST, ALL_SAJDAH_VERSES } from '../data/surahMetadata';
import { SurahMetadata } from '../types/quran';

interface Props {
  onSelectSurah: (surahNumber: number) => void;
}

export const SurahAnalyticsView: React.FC<Props> = ({ onSelectSurah }) => {
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'sajdahs' | 'chronology'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedSurah = SURAH_METADATA_LIST.find((s) => s.number === selectedSurahNum) || SURAH_METADATA_LIST[0];

  // Metrics
  const totalAyahs = 6236;
  const totalRukus = SURAH_METADATA_LIST.reduce((acc, s) => acc + s.rukus, 0);
  const makkiCount = SURAH_METADATA_LIST.filter((s) => s.revelationType === 'Meccan').length;
  const madaniCount = SURAH_METADATA_LIST.filter((s) => s.revelationType === 'Medinan').length;

  // Chronology sorted list
  const chronologicalList = [...SURAH_METADATA_LIST].sort((a, b) => a.revelationOrder - b.revelationOrder);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-6 animate-fade-in text-slate-100 font-sans">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cinzel text-emerald-400 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Surah Metadata & Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Comprehensive quantitative analysis, revelation chronology, and Sajdah directory
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Metrics Overview
          </button>
          <button
            onClick={() => setActiveTab('sajdahs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'sajdahs'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sajdah Directory ({ALL_SAJDAH_VERSES.length})
          </button>
          <button
            onClick={() => setActiveTab('chronology')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'chronology'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Revelation Order
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Total Surahs</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">114</div>
          <span className="text-[10px] text-slate-500">Chapters</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Total Ayahs</span>
          <div className="text-2xl font-bold font-mono text-teal-400">6,236</div>
          <span className="text-[10px] text-slate-500">Verses</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Total Rukus</span>
          <div className="text-2xl font-bold font-mono text-amber-400">{totalRukus}</div>
          <span className="text-[10px] text-slate-500">Sections</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Total Sajdahs</span>
          <div className="text-2xl font-bold font-mono text-rose-400">15</div>
          <span className="text-[10px] text-slate-500">In 14 Surahs</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Makki Surahs</span>
          <div className="text-2xl font-bold font-mono text-emerald-300">{makkiCount}</div>
          <span className="text-[10px] text-slate-500">75.4% of Quran</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Madani Surahs</span>
          <div className="text-2xl font-bold font-mono text-purple-400">{madaniCount}</div>
          <span className="text-[10px] text-slate-500">24.6% of Quran</span>
        </div>
      </div>

      {/* TAB 1: Overview & Surah Deep Inspector */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Surah Selector & Thematic Background */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Historical Context & Revelation Inspector
                </h3>

                {/* Dropdown selector for Surah */}
                <select
                  value={selectedSurahNum}
                  onChange={(e) => setSelectedSurahNum(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {SURAH_METADATA_LIST.map((s) => (
                    <option key={s.number} value={s.number}>
                      #{s.number} {s.englishName} ({s.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Surah Detailed Card */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-cinzel text-slate-100">
                      {selectedSurah.englishName} ({selectedSurah.englishNameTranslation})
                    </h2>
                    <p className="text-xs text-amber-300 font-amiri mt-0.5">
                      اردو: {selectedSurah.urduName} • سنڌي: {selectedSurah.sindhiName}
                    </p>
                  </div>
                  <span className="font-amiri text-3xl font-bold text-emerald-300">
                    {selectedSurah.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400">Classification:</span>{' '}
                    <span className="font-semibold text-emerald-400">{selectedSurah.revelationType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Chronological Order:</span>{' '}
                    <span className="font-semibold text-slate-200">#{selectedSurah.revelationOrder}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Verses:</span>{' '}
                    <span className="font-semibold text-slate-200">{selectedSurah.numberOfAyahs}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Ruko Sections:</span>{' '}
                    <span className="font-semibold text-slate-200">{selectedSurah.rukus}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-300">Central Theme:</span>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {selectedSurah.themeSummary}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-teal-400">Historical Asbab an-Nuzul & Era:</span>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {selectedSurah.historicalContext}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectSurah(selectedSurah.number)}
                  className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <BookOpen className="w-4 h-4" />
                  Open in Quran Reader
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Classification Distribution */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Makki vs Madani Distribution
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      Makki (Meccan) Revelations
                    </span>
                    <span className="font-mono font-bold text-emerald-400">86 Surahs (75%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '75.4%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Focused on Tawhid, the Day of Judgment, moral character, and stories of ancient prophets.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      Madani (Medinan) Revelations
                    </span>
                    <span className="font-mono font-bold text-purple-400">28 Surahs (25%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: '24.6%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Focused on community organization, social justice, legal legislation, family, and statecraft.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sajdah Directory */}
      {activeTab === 'sajdahs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
            <strong>About Sajdah Tilawat (Prostration of Recitation):</strong> There are 15 distinct places in the Holy Quran where recitation of or listening to the verse warrants a prostration of humility before Allah. All 15 instances are indexed below:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_SAJDAH_VERSES.map((sajdah, idx) => (
              <div
                key={idx}
                onClick={() => onSelectSurah(sajdah.surahNumber)}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs">
                    {idx + 1}
                  </span>
                  <span className="font-amiri text-lg text-emerald-300">
                    {sajdah.surahName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-100 font-cinzel">
                      Surah {sajdah.englishName}
                    </h4>
                    <p className="text-slate-400">Ayat #{sajdah.ayahNumber}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                    {sajdah.juz}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Chronology */}
      {activeTab === 'chronology' && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-xs text-slate-300">
            Compare the chronological order of historical revelation against the traditional canonical Mushaf order:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {chronologicalList.map((surah) => (
              <div
                key={surah.number}
                onClick={() => onSelectSurah(surah.number)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                    <span className="text-emerald-400 font-mono">#{surah.revelationOrder}</span>
                    <span>{surah.englishName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Mushaf Index: #{surah.number} • {surah.revelationType}
                  </span>
                </div>

                <span className="font-amiri text-base text-emerald-300 font-bold">
                  {surah.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
