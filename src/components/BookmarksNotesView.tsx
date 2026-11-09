import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Edit3,
  Flame,
  Calendar,
  Trash2,
  ExternalLink,
  BookOpen,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  getBookmarks,
  removeBookmark,
  getNotes,
  deleteNote,
  getReadingStreak,
  setDailyGoal,
} from '../services/storage';
import { BookmarkItem, AyatNote, ReadingStreakData } from '../types/quran';

interface Props {
  onSelectSurah: (surahNumber: number) => void;
}

export const BookmarksNotesView: React.FC<Props> = ({ onSelectSurah }) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes' | 'streak'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notes, setNotes] = useState<AyatNote[]>([]);
  const [streak, setStreak] = useState<ReadingStreakData>(getReadingStreak());
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [goalInput, setGoalInput] = useState<number>(streak.dailyGoalAyahs);

  const reloadData = () => {
    setBookmarks(getBookmarks());
    setNotes(getNotes());
    setStreak(getReadingStreak());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleDeleteBookmark = (surahNumber: number, ayahNumber: number) => {
    removeBookmark(surahNumber, ayahNumber);
    reloadData();
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    reloadData();
  };

  const handleUpdateGoal = () => {
    if (goalInput > 0) {
      const updated = setDailyGoal(goalInput);
      setStreak(updated);
    }
  };

  const filteredBookmarks =
    selectedTag === 'all'
      ? bookmarks
      : bookmarks.filter((b) => b.tag.toLowerCase() === selectedTag.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-6 animate-fade-in text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cinzel text-emerald-400 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-emerald-400" />
            My Quran Journey & Reflections
          </h1>
          <p className="text-xs text-slate-400">
            Saved verses, memorization targets, personal notes, and reading goals
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bookmarks ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reflections ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('streak')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'streak'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Streak & Goals
          </button>
        </div>
      </div>

      {/* TAB 1: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4 animate-fade-in">
          {/* Tag filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-full border transition-colors ${
                selectedTag === 'all'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              All Tags
            </button>
            {['Favorites', 'Memorizing', 'Daily Recitation', 'Duas', 'Reflections'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1 rounded-full border transition-colors ${
                  selectedTag === t
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {filteredBookmarks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No bookmarks saved yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                While reading any Surah, click the bookmark icon on any Ayat to save it here for fast revision and memorization.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookmarks.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 font-cinzel text-xs">
                        Surah {b.surahName} ({b.surahNumber}:{b.ayahNumber})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {b.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectSurah(b.surahNumber)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Open in Reader"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBookmark(b.surahNumber, b.ayahNumber)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="font-amiri text-xl text-right text-emerald-300 leading-loose dir-rtl">
                    {b.arabicText}
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {b.translation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Notes & Reflections */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-fade-in">
          {notes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <Edit3 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No reflections or notes recorded yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Capture your Tadabbur, personal insights, or spiritual reflections directly on any Ayat while reading.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-emerald-400 font-cinzel text-xs">
                      Surah {n.surahName} • Verse #{n.ayahNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(n.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => onSelectSurah(n.surahNumber)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Open in Reader"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    {n.noteText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Streak & Goals */}
      {activeTab === 'streak' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> Current Active Streak
              </span>
              <div className="text-3xl font-bold font-cinzel text-amber-400">
                {streak.currentStreak} Days
              </div>
              <p className="text-[11px] text-slate-500">Consecutive reading days</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-400" /> Minutes Read Today
              </span>
              <div className="text-3xl font-bold font-cinzel text-teal-400">
                {streak.todayMinutesRead} mins
              </div>
              <p className="text-[11px] text-slate-500">Spiritual investment</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" /> Ayahs Read Today
              </span>
              <div className="text-3xl font-bold font-cinzel text-emerald-400">
                {streak.todayAyahsRead} Verses
              </div>
              <p className="text-[11px] text-slate-500">Goal: {streak.dailyGoalAyahs} Ayahs</p>
            </div>
          </div>

          {/* Goal adjustment box */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-semibold text-emerald-400 text-sm">
              Customize Your Daily Quran Target
            </h3>
            <p className="text-xs text-slate-300">
              Set a realistic, consistent daily reading goal to cultivate a lifelong habit of Quranic engagement:
            </p>

            <div className="flex items-center gap-3 max-w-sm">
              <input
                type="number"
                min={1}
                max={200}
                value={goalInput}
                onChange={(e) => setGoalInput(Number(e.target.value))}
                className="w-28 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleUpdateGoal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                Update Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
