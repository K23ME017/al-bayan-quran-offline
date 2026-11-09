import React, { useState, useEffect } from 'react';
import { Bookmark, Edit3, X, Check, Trash2, Tag } from 'lucide-react';
import { getNoteForAyat, saveAyatNote, deleteNote, saveBookmark, removeBookmark, isAyahBookmarked } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  onSaved?: () => void;
}

export const AyatNoteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  surahNumber,
  ayahNumber,
  surahName,
  arabicText,
  translation,
  onSaved,
}) => {
  const [noteContent, setNoteContent] = useState('');
  const [tag, setTag] = useState('Favorites');
  const [bookmarked, setBookmarked] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getNoteForAyat(surahNumber, ayahNumber);
      setNoteContent(existing ? existing.noteText : '');
      setBookmarked(isAyahBookmarked(surahNumber, ayahNumber));
      setSavedSuccess(false);
    }
  }, [isOpen, surahNumber, ayahNumber]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (noteContent.trim()) {
      saveAyatNote(surahNumber, ayahNumber, surahName, noteContent.trim());
    }

    if (bookmarked) {
      saveBookmark({
        surahNumber,
        ayahNumber,
        surahName,
        arabicText,
        translation,
        tag,
      });
    } else {
      removeBookmark(surahNumber, ayahNumber);
    }

    setSavedSuccess(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleDeleteNote = () => {
    deleteNote(`${surahNumber}:${ayahNumber}`);
    setNoteContent('');
    if (onSaved) onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-cinzel text-emerald-400">
                Reflection & Bookmark
              </h2>
              <p className="text-xs text-slate-400">
                Surah {surahName} • Verse {ayahNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-right font-amiri text-lg text-emerald-300 dir-rtl">
            {arabicText}
          </div>

          {/* Bookmark checkbox */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-2">
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
              <span className="text-xs font-medium text-slate-200">
                Add to Quick Bookmarks
              </span>
            </div>
            <input
              type="checkbox"
              checked={bookmarked}
              onChange={(e) => setBookmarked(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800 cursor-pointer"
            />
          </div>

          {/* Tag Selector */}
          {bookmarked && (
            <div className="flex items-center gap-2 text-xs">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Tag:</span>
              <div className="flex gap-1.5 overflow-x-auto">
                {['Favorites', 'Memorizing', 'Daily Recitation', 'Duas', 'Reflections'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                      tag === t
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-medium'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Personal Note / Tadabbur input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Personal Reflection / Tadabbur Notes:</span>
              {noteContent && (
                <button
                  type="button"
                  onClick={handleDeleteNote}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear Note
                </button>
              )}
            </label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Record your thoughts, lessons, spiritual insights, or memorization notes for this Ayat..."
              rows={4}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {savedSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved to local journal!
              </span>
            ) : (
              'Stored privately on your device'
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Check className="w-3.5 h-3.5" />
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
