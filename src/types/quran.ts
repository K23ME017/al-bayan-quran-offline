export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahMetadata {
  number: number;
  name: string; // Arabic name, e.g. "الفاتحة"
  englishName: string; // "Al-Faatiha"
  englishNameTranslation: string; // "The Opening"
  urduName: string; // "الفاتحہ"
  sindhiName: string; // "سورة فاتحه"
  numberOfAyahs: number;
  revelationType: RevelationType;
  rukus: number;
  sajdahAyats: number[]; // e.g. [206] or empty
  revelationOrder: number;
  juzRange: string; // e.g. "Juz 1"
  themeSummary: string;
  historicalContext: string;
}

export interface AyahData {
  number: number; // Absolute Quranic ayah index (1 to 6236)
  numberInSurah: number; // Ayah number in surah (1, 2, ...)
  text: string; // Arabic text
  translations: {
    en: string;
    ur: string;
    sd: string;
  };
  transliteration?: string;
  sajda?: boolean | { id: number; recommended: boolean; obligatory: boolean };
  ruku?: number;
  juz?: number;
  manzil?: number;
  page?: number;
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: string;
  baseUrl: string;
  audioType: 'arabic_recitation' | 'urdu_translation' | 'english_translation';
  language: 'ar' | 'ur' | 'en';
}

export type PlaybackRate = 0.75 | 1.0 | 1.25 | 1.5 | 1.75 | 2.0;
export type RepeatMode = 'none' | 'verse' | 'surah';
export type PlaybackMode = 'dual' | 'arabic_only' | 'translation_only';
export type ActivePlaybackPhase = 'arabic' | 'translation';

export interface TranslationSpeaker {
  id: string;
  name: string;
  language: 'ur' | 'en' | 'sd';
  scholarOrNarrator: string;
  gender: 'male' | 'female';
  style: string;
  baseUrl: string;
  provider: 'everyayah' | 'cdn' | 'tts';
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentSurah: number;
  currentAyah: number;
  reciterId: string;
  translationSpeakerId: string;
  playbackMode: PlaybackMode;
  activePhase: ActivePlaybackPhase;
  playbackRate: PlaybackRate;
  repeatMode: RepeatMode;
  autoScroll: boolean;
  volume: number;
  isMuted: boolean;
  duration: number;
  currentTime: number;
  isLoading: boolean;
  error?: string | null;
}

export interface BookmarkItem {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  tag: string;
  createdAt: number;
}

export interface AyatNote {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  noteText: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReadingStreakData {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string; // YYYY-MM-DD
  todayAyahsRead: number;
  todayMinutesRead: number;
  dailyGoalAyahs: number;
  history: { [date: string]: number }; // date string -> ayahs count
}

export interface SmartSearchResult {
  queryInterpretation: string;
  recommendedSurahs: {
    surahNumber: number;
    surahName: string;
    reason: string;
  }[];
  featuredAyats: {
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    arabic: string;
    english: string;
    urdu: string;
    sindhi: string;
    relevance: string;
  }[];
  spiritualWisdom: string;
}
