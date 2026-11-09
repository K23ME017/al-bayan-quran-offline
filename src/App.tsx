import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { SurahListView } from './components/SurahListView';
import { SurahReaderView } from './components/SurahReaderView';
import { SurahAnalyticsView } from './components/SurahAnalyticsView';
import { SmartSearchView } from './components/SmartSearchView';
import { AIAssistantView } from './components/AIAssistantView';
import { BookmarksNotesView } from './components/BookmarksNotesView';
import { AudioPlayerDrawer } from './components/AudioPlayerDrawer';
import { SystemArchitectureModal } from './components/SystemArchitectureModal';
import { TajweedGuideModal } from './components/TajweedGuideModal';
import { TafseerModal } from './components/TafseerModal';
import { AyatNoteModal } from './components/AyatNoteModal';

import { SURAH_BY_NUMBER } from './data/surahMetadata';
import { DEFAULT_RECITER_ID } from './data/reciters';
import { DEFAULT_TRANSLATION_SPEAKER_ID } from './data/translationSpeakers';
import {
  ActivePlaybackPhase,
  AyahData,
  PlaybackMode,
  PlaybackRate,
  RepeatMode,
} from './types/quran';
import {
  getPreferences,
  updatePreferences,
  getReadingStreak,
  recordAyahRead,
  getLastRead,
} from './services/storage';
import { SequentialDualTrackPlayer } from './services/SequentialAudioManager';

export default function App() {
  const [activeView, setActiveView] = useState<
    'list' | 'reader' | 'analytics' | 'search' | 'assistant' | 'bookmarks'
  >('list');

  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);

  // Sequential Dual-Track Audio Playback State
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [currentAyah, setCurrentAyah] = useState<number>(1);
  const [totalAyahs, setTotalAyahs] = useState<number>(7);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePhase, setActivePhase] = useState<ActivePlaybackPhase>('arabic');
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('dual');
  const [reciterId, setReciterId] = useState<string>(DEFAULT_RECITER_ID);
  const [translationSpeakerId, setTranslationSpeakerId] = useState<string>(
    DEFAULT_TRANSLATION_SPEAKER_ID
  );
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1.0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('surah');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio Player Instance Ref
  const playerRef = useRef<SequentialDualTrackPlayer | null>(null);

  // User Preferences & Reading Streak
  const [preferences, setPreferences] = useState(getPreferences());
  const [streak, setStreak] = useState(getReadingStreak());

  // Modals
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isTajweedGuideOpen, setIsTajweedGuideOpen] = useState(false);

  const [tafseerModal, setTafseerModal] = useState<{
    isOpen: boolean;
    ayah: AyahData | null;
    surahNumber: number;
    surahName: string;
  }>({
    isOpen: false,
    ayah: null,
    surahNumber: 1,
    surahName: 'Al-Fatihah',
  });

  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    arabicText: string;
    translation: string;
  }>({
    isOpen: false,
    surahNumber: 1,
    ayahNumber: 1,
    surahName: 'Al-Fatihah',
    arabicText: '',
    translation: '',
  });

  // Initialize SequentialDualTrackPlayer singleton
  useEffect(() => {
    const player = new SequentialDualTrackPlayer({
      onPhaseChange: (phase, surah, ayah) => {
        setActivePhase(phase);
        setCurrentSurah(surah);
        setCurrentAyah(ayah);
      },
      onAyahChange: (ayah, surah) => {
        setCurrentAyah(ayah);
        setCurrentSurah(surah);
        setStreak(recordAyahRead());
      },
      onStateChange: (playing, phase) => {
        setIsPlaying(playing);
        setActivePhase(phase);
      },
      onError: (err) => {
        console.warn('Sequential Audio Notice:', err);
      },
    });

    playerRef.current = player;

    return () => {
      player.destroy();
    };
  }, []);

  // Restore last read on startup if available
  useEffect(() => {
    const last = getLastRead();
    if (last) {
      setSelectedSurahNumber(last.surahNumber);
      setCurrentSurah(last.surahNumber);
      const meta = SURAH_BY_NUMBER.get(last.surahNumber);
      if (meta) {
        setTotalAyahs(meta.numberOfAyahs);
      }
    }
  }, []);

  const handleUpdatePreferences = (partial: any) => {
    const updated = updatePreferences(partial);
    setPreferences(updated);
  };

  const handleToggleTheme = () => {
    const nextTheme = preferences.theme === 'light' ? 'dark' : 'light';
    handleUpdatePreferences({ theme: nextTheme });
  };

  const handleSelectSurah = (num: number) => {
    if (num < 1 || num > 114) return;
    setSelectedSurahNumber(num);
    const meta = SURAH_BY_NUMBER.get(num);
    if (meta) {
      setTotalAyahs(meta.numberOfAyahs);
    }
    setActiveView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaySurah = (surahNum: number) => {
    const meta = SURAH_BY_NUMBER.get(surahNum);
    const count = meta?.numberOfAyahs || 7;
    setSelectedSurahNumber(surahNum);
    setCurrentSurah(surahNum);
    setCurrentAyah(1);
    setTotalAyahs(count);
    setActiveView('reader');

    if (playerRef.current) {
      playerRef.current.playAyah(
        surahNum,
        1,
        count,
        reciterId,
        translationSpeakerId,
        playbackMode
      );
    }
    setStreak(recordAyahRead());
  };

  const handlePlayAyah = (surahNum: number, ayahNum: number) => {
    const meta = SURAH_BY_NUMBER.get(surahNum);
    const count = meta?.numberOfAyahs || 7;
    setCurrentSurah(surahNum);
    setCurrentAyah(ayahNum);
    setTotalAyahs(count);

    if (playerRef.current) {
      playerRef.current.playAyah(
        surahNum,
        ayahNum,
        count,
        reciterId,
        translationSpeakerId,
        playbackMode
      );
    }
    setStreak(recordAyahRead());
  };

  const handlePlayAyahTranslation = (surahNum: number, ayahNum: number, speakerId?: string) => {
    const meta = SURAH_BY_NUMBER.get(surahNum);
    const count = meta?.numberOfAyahs || 7;
    setCurrentSurah(surahNum);
    setCurrentAyah(ayahNum);
    setTotalAyahs(count);
    const targetSpeaker = speakerId || translationSpeakerId || DEFAULT_TRANSLATION_SPEAKER_ID;
    setTranslationSpeakerId(targetSpeaker);
    setPlaybackMode('translation_only');

    if (playerRef.current) {
      playerRef.current.playAyahTranslation(
        surahNum,
        ayahNum,
        count,
        targetSpeaker
      );
    }
    setStreak(recordAyahRead());
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (!isPlaying) {
        // Start or resume
        playerRef.current.playAyah(
          currentSurah,
          currentAyah,
          totalAyahs,
          reciterId,
          translationSpeakerId,
          playbackMode
        );
      } else {
        playerRef.current.pause();
      }
    }
  };

  const handleNextAyah = () => {
    if (playerRef.current) {
      playerRef.current.nextAyah();
    }
  };

  const handlePrevAyah = () => {
    if (playerRef.current) {
      playerRef.current.prevAyah();
    }
  };

  const handleSelectPlaybackMode = (mode: PlaybackMode) => {
    setPlaybackMode(mode);
    if (playerRef.current) {
      playerRef.current.setMode(mode);
      setActivePhase(playerRef.current.getActivePhase());
    }
  };

  const handleSelectReciter = (id: string) => {
    setReciterId(id);
    if (playerRef.current) {
      playerRef.current.setReciter(id);
    }
  };

  const handleSelectTranslationSpeaker = (id: string) => {
    setTranslationSpeakerId(id);
    if (playerRef.current) {
      playerRef.current.setTranslationSpeaker(id);
    }
  };

  const handleSelectRate = (rate: PlaybackRate) => {
    setPlaybackRate(rate);
    if (playerRef.current) {
      playerRef.current.setRate(rate);
    }
  };

  const handleToggleRepeat = () => {
    const modes: RepeatMode[] = ['none', 'verse', 'surah'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setRepeatMode(nextMode);
    if (playerRef.current) {
      playerRef.current.setRepeat(nextMode);
    }
  };

  const handleSeek = (pct: number) => {
    if (playerRef.current) {
      playerRef.current.seek(pct);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (playerRef.current) {
      playerRef.current.setMute(nextMuted);
    }
  };

  const currentSurahMeta = SURAH_BY_NUMBER.get(selectedSurahNumber) || SURAH_BY_NUMBER.get(1)!;

  return (
    <div
      className={`min-h-screen text-slate-100 flex flex-col transition-colors duration-300 ${
        preferences.theme === 'light'
          ? 'bg-slate-100 text-slate-900'
          : preferences.theme === 'midnight'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-[#080d11] text-slate-100'
      }`}
    >
      {/* Top App Header */}
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        streak={streak}
        theme={preferences.theme}
        onToggleTheme={handleToggleTheme}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenTajweedGuide={() => setIsTajweedGuideOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'list' && (
          <SurahListView
            streak={streak}
            onSelectSurah={handleSelectSurah}
            onPlaySurah={handlePlaySurah}
            onOpenTafseer={(ayah, num, name) =>
              setTafseerModal({
                isOpen: true,
                ayah,
                surahNumber: num,
                surahName: name,
              })
            }
          />
        )}

        {activeView === 'reader' && (
          <SurahReaderView
            surah={currentSurahMeta}
            currentPlayingAyah={currentSurah === selectedSurahNumber ? currentAyah : -1}
            isPlaying={isPlaying}
            activePhase={activePhase}
            playbackMode={playbackMode}
            translationSpeakerId={translationSpeakerId}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onPlayAyah={handlePlayAyah}
            onPlayAyahTranslation={handlePlayAyahTranslation}
            onOpenTafseer={(ayah) =>
              setTafseerModal({
                isOpen: true,
                ayah,
                surahNumber: currentSurahMeta.number,
                surahName: currentSurahMeta.englishName,
              })
            }
            onOpenNote={(ayah) =>
              setNoteModal({
                isOpen: true,
                surahNumber: currentSurahMeta.number,
                ayahNumber: ayah.numberInSurah,
                surahName: currentSurahMeta.englishName,
                arabicText: ayah.text,
                translation: ayah.translations.en,
              })
            }
            onOpenTajweedGuide={() => setIsTajweedGuideOpen(true)}
            onSelectSurah={handleSelectSurah}
          />
        )}

        {activeView === 'analytics' && (
          <SurahAnalyticsView onSelectSurah={handleSelectSurah} />
        )}

        {activeView === 'search' && (
          <SmartSearchView
            onSelectSurah={handleSelectSurah}
            onPlayAyah={handlePlayAyah}
          />
        )}

        {activeView === 'assistant' && <AIAssistantView />}

        {activeView === 'bookmarks' && (
          <BookmarksNotesView onSelectSurah={handleSelectSurah} />
        )}
      </main>

      {/* Sticky Bottom Sequential Dual-Track Audio Player Drawer */}
      <AudioPlayerDrawer
        currentSurah={currentSurah}
        currentAyah={currentAyah}
        totalAyahs={totalAyahs}
        isPlaying={isPlaying}
        activePhase={activePhase}
        playbackMode={playbackMode}
        reciterId={reciterId}
        translationSpeakerId={translationSpeakerId}
        playbackRate={playbackRate}
        repeatMode={repeatMode}
        autoScroll={autoScroll}
        onSubscribeTime={useCallback(
          (cb) => (playerRef.current ? playerRef.current.subscribeTimeUpdate((cur, dur) => cb(cur, dur)) : () => {}),
          []
        )}
        isMuted={isMuted}
        onPlayPause={handlePlayPause}
        onNextAyah={handleNextAyah}
        onPrevAyah={handlePrevAyah}
        onSelectReciter={handleSelectReciter}
        onSelectTranslationSpeaker={handleSelectTranslationSpeaker}
        onSelectPlaybackMode={handleSelectPlaybackMode}
        onSelectRate={handleSelectRate}
        onToggleRepeat={handleToggleRepeat}
        onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
        onSeek={handleSeek}
        onToggleMute={handleToggleMute}
      />

      {/* Modals & Drawers */}
      <SystemArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <TajweedGuideModal
        isOpen={isTajweedGuideOpen}
        onClose={() => setIsTajweedGuideOpen(false)}
      />

      <TafseerModal
        isOpen={tafseerModal.isOpen}
        onClose={() => setTafseerModal({ ...tafseerModal, isOpen: false })}
        surahNumber={tafseerModal.surahNumber}
        surahName={tafseerModal.surahName}
        ayah={tafseerModal.ayah}
        onPlayAyah={handlePlayAyah}
      />

      <AyatNoteModal
        isOpen={noteModal.isOpen}
        onClose={() => setNoteModal({ ...noteModal, isOpen: false })}
        surahNumber={noteModal.surahNumber}
        ayahNumber={noteModal.ayahNumber}
        surahName={noteModal.surahName}
        arabicText={noteModal.arabicText}
        translation={noteModal.translation}
      />
    </div>
  );
}
