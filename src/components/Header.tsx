import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  BarChart3,
  Search,
  Sparkles,
  Bookmark,
  Layers,
  Flame,
  Sun,
  Moon,
  Info,
  Mic,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ReadingStreakData } from '../types/quran';

interface Props {
  activeView: 'list' | 'reader' | 'analytics' | 'search' | 'assistant' | 'bookmarks';
  onSelectView: (view: 'list' | 'reader' | 'analytics' | 'search' | 'assistant' | 'bookmarks') => void;
  streak: ReadingStreakData;
  theme: 'dark' | 'light' | 'midnight';
  onToggleTheme: () => void;
  onOpenArchitecture: () => void;
  onOpenTajweedGuide: () => void;
}

export const Header: React.FC<Props> = ({
  activeView,
  onSelectView,
  streak,
  theme,
  onToggleTheme,
  onOpenArchitecture,
  onOpenTajweedGuide,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-emerald-500/20 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectView('list')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-bold font-amiri text-xl">
              ب
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cinzel font-bold text-lg text-slate-100 tracking-wider">
                AL-BAYAN
              </span>
              <span className="font-amiri text-xs text-emerald-400 font-semibold">
                البيان
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              AI-Powered Quran & Tafseer Ecosystem
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => onSelectView('list')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeView === 'list' || activeView === 'reader'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Quran
          </button>
          <button
            onClick={() => onSelectView('analytics')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeView === 'analytics'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics & Sajdah
          </button>
          <button
            onClick={() => onSelectView('search')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeView === 'search'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            Voice Search
          </button>
          <button
            onClick={() => onSelectView('assistant')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeView === 'assistant'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI Scholar
          </button>
          <button
            onClick={() => onSelectView('bookmarks')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeView === 'bookmarks'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            My Journey
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Online / Offline Status Badge */}
          {!isOnline ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold animate-pulse"
              title="You are currently offline. Full Quran (114 Surahs), Translations, and Classical Tafseer are available offline!"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">آف لائن موڈ (مکمل قرآن)</span>
              <span className="sm:hidden">Offline</span>
            </div>
          ) : (
            <div
              className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]"
              title="Connected: Cloud AI & Audio Streaming Active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>114 Surahs Bundled Offline</span>
            </div>
          )}

          {/* Quick Voice Search Button */}
          <button
            type="button"
            onClick={() => onSelectView('search')}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              activeView === 'search'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 border-slate-800 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50'
            }`}
            title="Voice Search Quran Verses & Themes"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Architecture Blueprint Trigger (Deliverable) */}
          <button
            onClick={onOpenArchitecture}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm"
            title="Inspect System Architecture, APIs & Database Schema"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Architecture Blueprint
          </button>

          {/* Tajweed guide button */}
          <button
            onClick={onOpenTajweedGuide}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors"
            title="Tajweed Phonetic Rules Guide"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Streak Badge */}
          <div
            onClick={() => onSelectView('bookmarks')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold cursor-pointer hover:bg-amber-500/25 transition-colors"
            title={`Active streak: ${streak.currentStreak} days`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streak.currentStreak}d</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Toggle App Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Shown on small screens) */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/95 py-2 px-1 text-[10px]">
        <button
          onClick={() => onSelectView('list')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
            activeView === 'list' || activeView === 'reader'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Quran</span>
        </button>

        <button
          onClick={() => onSelectView('analytics')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
            activeView === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => onSelectView('search')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
            activeView === 'search' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          <span>Voice Search</span>
        </button>

        <button
          onClick={() => onSelectView('assistant')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
            activeView === 'assistant' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Scholar</span>
        </button>

        <button
          onClick={() => onSelectView('bookmarks')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
            activeView === 'bookmarks' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Journey</span>
        </button>

        <button
          onClick={onOpenArchitecture}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-teal-400"
        >
          <Layers className="w-4 h-4" />
          <span>Blueprint</span>
        </button>
      </div>
    </header>
  );
};
