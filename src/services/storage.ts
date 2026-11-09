import { BookmarkItem, AyatNote, ReadingStreakData } from '../types/quran';

export interface UserPreferences {
  arabicFontSize: number;
  translationFontSize: number;
  arabicFontFamily: 'font-amiri' | 'font-scheherazade' | 'font-naskh';
  showEnglish: boolean;
  showUrdu: boolean;
  showSindhi: boolean;
  showTransliteration: boolean;
  tajweedEnabled: boolean;
  theme: 'dark' | 'light' | 'midnight';
  autoScrollToVerse: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  arabicFontSize: 30,
  translationFontSize: 16,
  arabicFontFamily: 'font-amiri',
  showEnglish: true,
  showUrdu: true,
  showSindhi: true,
  showTransliteration: false,
  tajweedEnabled: true,
  theme: 'dark',
  autoScrollToVerse: true,
};

const STORAGE_KEYS = {
  BOOKMARKS: 'albayan_bookmarks_v1',
  NOTES: 'albayan_notes_v1',
  STREAK: 'albayan_streak_v1',
  PREFS: 'albayan_preferences_v1',
  LAST_READ: 'albayan_last_read_v1',
};

// In-memory cache to prevent repetitive JSON.parse and localStorage hits on every verse render
let cachedBookmarks: BookmarkItem[] | null = null;
let bookmarkIdSet: Set<string> | null = null;

function refreshBookmarkIdSet(items: BookmarkItem[]) {
  cachedBookmarks = items;
  bookmarkIdSet = new Set(items.map((b) => `${b.surahNumber}:${b.ayahNumber}`));
}

// ============ BOOKMARKS ============
export function getBookmarks(): BookmarkItem[] {
  if (cachedBookmarks !== null) {
    return cachedBookmarks;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    const parsed = raw ? JSON.parse(raw) : [];
    refreshBookmarkIdSet(parsed);
    return parsed;
  } catch {
    refreshBookmarkIdSet([]);
    return [];
  }
}

export function saveBookmark(item: Omit<BookmarkItem, 'id' | 'createdAt'>): BookmarkItem {
  const bookmarks = [...getBookmarks()];
  const existingIdx = bookmarks.findIndex(
    (b) => b.surahNumber === item.surahNumber && b.ayahNumber === item.ayahNumber
  );

  const newBookmark: BookmarkItem = {
    ...item,
    id: `${item.surahNumber}:${item.ayahNumber}`,
    createdAt: Date.now(),
  };

  if (existingIdx >= 0) {
    bookmarks[existingIdx] = newBookmark;
  } else {
    bookmarks.unshift(newBookmark);
  }

  refreshBookmarkIdSet(bookmarks);
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch {}
  return newBookmark;
}

export function removeBookmark(surahNumber: number, ayahNumber: number): void {
  const bookmarks = getBookmarks().filter(
    (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
  );
  refreshBookmarkIdSet(bookmarks);
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch {}
}

export function isAyahBookmarked(surahNumber: number, ayahNumber: number): boolean {
  if (bookmarkIdSet === null) {
    getBookmarks();
  }
  return bookmarkIdSet ? bookmarkIdSet.has(`${surahNumber}:${ayahNumber}`) : false;
}

// ============ NOTES ============
export function getNotes(): AyatNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAyatNote(surahNumber: number, ayahNumber: number, surahName: string, text: string): AyatNote {
  const notes = getNotes();
  const id = `${surahNumber}:${ayahNumber}`;
  const existingIdx = notes.findIndex((n) => n.id === id);

  const note: AyatNote = {
    id,
    surahNumber,
    ayahNumber,
    surahName,
    noteText: text,
    createdAt: existingIdx >= 0 ? notes[existingIdx].createdAt : Date.now(),
    updatedAt: Date.now(),
  };

  if (existingIdx >= 0) {
    notes[existingIdx] = note;
  } else {
    notes.unshift(note);
  }

  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  return note;
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
}

export function getNoteForAyat(surahNumber: number, ayahNumber: number): AyatNote | undefined {
  return getNotes().find((n) => n.surahNumber === surahNumber && n.ayahNumber === ayahNumber);
}

// ============ READING STREAK & GOALS ============
export function getReadingStreak(): ReadingStreakData {
  const today = new Date().toISOString().split('T')[0];
  const defaultStreak: ReadingStreakData = {
    currentStreak: 1,
    longestStreak: 1,
    lastReadDate: today,
    todayAyahsRead: 5,
    todayMinutesRead: 12,
    dailyGoalAyahs: 10,
    history: { [today]: 5 },
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!raw) return defaultStreak;
    const parsed = JSON.parse(raw);

    // If today is a new day, reset today's counters
    if (parsed.lastReadDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (parsed.lastReadDate === yesterday) {
        // Consecutive streak continued!
      } else {
        // Broke streak
        parsed.currentStreak = 0;
      }
      parsed.lastReadDate = today;
      parsed.todayAyahsRead = 0;
      parsed.todayMinutesRead = 0;
    }
    return parsed;
  } catch {
    return defaultStreak;
  }
}

export function recordAyahRead(): ReadingStreakData {
  const today = new Date().toISOString().split('T')[0];
  const streak = getReadingStreak();

  streak.todayAyahsRead = (streak.todayAyahsRead || 0) + 1;
  streak.todayMinutesRead = (streak.todayMinutesRead || 0) + 1;

  if (streak.currentStreak === 0) {
    streak.currentStreak = 1;
  }

  if (streak.todayAyahsRead >= streak.dailyGoalAyahs && streak.lastReadDate !== today) {
    streak.currentStreak += 1;
  }

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  streak.lastReadDate = today;
  streak.history = streak.history || {};
  streak.history[today] = (streak.history[today] || 0) + 1;

  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  return streak;
}

export function setDailyGoal(goalAyahs: number): ReadingStreakData {
  const streak = getReadingStreak();
  streak.dailyGoalAyahs = goalAyahs;
  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  return streak;
}

// ============ USER PREFERENCES ============
export function getPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFS);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function updatePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(updated));
  return updated;
}

// ============ LAST READ SURAH/AYAH ============
export function setLastRead(surahNumber: number, ayahNumber: number): void {
  localStorage.setItem(
    STORAGE_KEYS.LAST_READ,
    JSON.stringify({ surahNumber, ayahNumber, timestamp: Date.now() })
  );
}

export function getLastRead(): { surahNumber: number; ayahNumber: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_READ);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
