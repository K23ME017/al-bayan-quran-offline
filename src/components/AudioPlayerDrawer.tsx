import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Download,
  ChevronUp,
  ChevronDown,
  Gauge,
  Radio,
  Check,
  RefreshCw,
  Headphones,
  Mic,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { RECITERS_LIST } from '../data/reciters';
import { SURAH_BY_NUMBER } from '../data/surahMetadata';
import { TRANSLATION_SPEAKERS } from '../data/translationSpeakers';
import {
  ActivePlaybackPhase,
  PlaybackMode,
  PlaybackRate,
  RepeatMode,
} from '../types/quran';
import { downloadSurahOffline, getDownloadedSurahs } from '../utils/api';
import confetti from 'canvas-confetti';

interface Props {
  currentSurah: number;
  currentAyah: number;
  totalAyahs: number;
  isPlaying: boolean;
  activePhase: ActivePlaybackPhase;
  playbackMode: PlaybackMode;
  reciterId: string;
  translationSpeakerId: string;
  playbackRate: PlaybackRate;
  repeatMode: RepeatMode;
  autoScroll: boolean;
  currentTime?: number;
  duration?: number;
  isMuted: boolean;
  onSubscribeTime?: (cb: (cur: number, dur: number) => void) => () => void;
  onPlayPause: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onSelectReciter: (id: string) => void;
  onSelectTranslationSpeaker: (id: string) => void;
  onSelectPlaybackMode: (mode: PlaybackMode) => void;
  onSelectRate: (rate: PlaybackRate) => void;
  onToggleRepeat: () => void;
  onToggleAutoScroll: () => void;
  onSeek: (pct: number) => void;
  onToggleMute: () => void;
}

export const AudioPlayerDrawer: React.FC<Props> = ({
  currentSurah,
  currentAyah,
  totalAyahs,
  isPlaying,
  activePhase,
  playbackMode,
  reciterId,
  translationSpeakerId,
  playbackRate,
  repeatMode,
  autoScroll,
  currentTime: propCurrentTime = 0,
  duration: propDuration = 0,
  isMuted,
  onSubscribeTime,
  onPlayPause,
  onNextAyah,
  onPrevAyah,
  onSelectReciter,
  onSelectTranslationSpeaker,
  onSelectPlaybackMode,
  onSelectRate,
  onToggleRepeat,
  onToggleAutoScroll,
  onSeek,
  onToggleMute,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(propCurrentTime);
  const [localDuration, setLocalDuration] = useState(propDuration);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [isCached, setIsCached] = useState(false);

  // Subscribe directly to high-frequency audio clock without re-rendering parent App!
  useEffect(() => {
    if (!onSubscribeTime) return;
    return onSubscribeTime((cur, dur) => {
      setLocalCurrentTime(cur);
      setLocalDuration(dur);
    });
  }, [onSubscribeTime]);

  const currentTime = onSubscribeTime ? localCurrentTime : propCurrentTime;
  const duration = onSubscribeTime ? localDuration : propDuration;

  const surahMeta = SURAH_BY_NUMBER.get(currentSurah);
  const currentReciter = RECITERS_LIST.find((r) => r.id === reciterId) || RECITERS_LIST[0];
  const currentSpeaker =
    TRANSLATION_SPEAKERS.find((s) => s.id === translationSpeakerId) || TRANSLATION_SPEAKERS[0];

  // Check if current surah is already downloaded offline
  useEffect(() => {
    const downloaded = getDownloadedSurahs();
    setIsCached(downloaded.includes(currentSurah));
  }, [currentSurah]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    const success = await downloadSurahOffline(
      currentSurah,
      reciterId,
      totalAyahs,
      (prog, status) => {
        setDownloadProgress(prog);
        setDownloadStatus(status);
      }
    );

    setIsDownloading(false);
    if (success) {
      setIsCached(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.9 },
      });
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(pct);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/30 text-slate-100 shadow-[0_-12px_36px_rgba(0,0,0,0.6)] transition-all duration-300">
      {/* Clickable progress scrubber along the top of drawer */}
      <div
        onClick={handleProgressClick}
        className="w-full h-1.5 bg-slate-800 relative group cursor-pointer"
        title="Click to seek"
      >
        <div
          className={`h-full relative transition-all duration-150 ${
            activePhase === 'arabic'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-amber-500 to-amber-300'
          }`}
          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Mini Drawer Bar (Always visible) */}
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Surah, Ayat, & Active Dual-Track Phase Badge */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-initial">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title={isExpanded ? 'Collapse player' : 'Expand sequential dual-track options'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-emerald-400 truncate">
                {surahMeta?.englishName || `Surah ${currentSurah}`}
              </span>

              <span className="text-[11px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Ayat {currentAyah} / {totalAyahs}
              </span>

              {/* Sequential Dual-Track Active Phase Pill */}
              {playbackMode === 'dual' ? (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium transition-all ${
                    isPlaying && activePhase === 'arabic'
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-sm shadow-emerald-500/20 animate-pulse'
                      : isPlaying && activePhase === 'translation'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  title={
                    activePhase === 'arabic'
                      ? 'Now Reciting Arabic script'
                      : `Now Speaking Spoken Translation (${currentSpeaker.name})`
                  }
                >
                  {activePhase === 'arabic' ? (
                    <>
                      <Headphones className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Phase 1: Arabic</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-2.5 h-2.5 text-amber-400" />
                      <span>Phase 2: Voice ({currentSpeaker.language.toUpperCase()})</span>
                    </>
                  )}
                </span>
              ) : playbackMode === 'arabic_only' ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Arabic Only
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                  Voice Only ({currentSpeaker.language.toUpperCase()})
                </span>
              )}
            </div>

            {/* Subtext: Current Speaker & Qari Name */}
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              {playbackMode === 'dual' ? (
                activePhase === 'arabic' ? (
                  <span className="text-emerald-300 font-medium">Qari: {currentReciter.name}</span>
                ) : (
                  <span className="text-amber-300 font-medium">Voice: {currentSpeaker.name}</span>
                )
              ) : playbackMode === 'arabic_only' ? (
                <span>{currentReciter.name}</span>
              ) : (
                <span>{currentSpeaker.name} ({currentSpeaker.scholarOrNarrator})</span>
              )}
              <span className="text-slate-600">•</span>
              <span className="font-amiri text-xs text-slate-300">{surahMeta?.name}</span>
            </p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Previous Ayah */}
          <button
            onClick={onPrevAyah}
            disabled={currentAyah <= 1}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Previous verse"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Button */}
          <button
            onClick={onPlayPause}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg transition-all hover:scale-105 active:scale-95 ${
              activePhase === 'arabic'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/30'
                : 'bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-amber-500/30'
            }`}
            title={isPlaying ? 'Pause playback' : 'Start sequential playback'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Ayah */}
          <button
            onClick={onNextAyah}
            disabled={currentAyah >= totalAyahs}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Next verse"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Quick Dual-Track & Voice Track Mode Toggle Pill */}
          <div className="flex items-center bg-slate-950/90 p-0.5 rounded-xl border border-slate-800 ml-1 shadow-inner">
            <button
              type="button"
              onClick={() => onSelectPlaybackMode('dual')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all ${
                playbackMode === 'dual'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sequential Dual-Track: Recite Arabic -> Speak Translation"
            >
              <span className="hidden sm:inline">Dual Track</span>
              <span className="sm:hidden">Dual</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPlaybackMode('arabic_only')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all ${
                playbackMode === 'arabic_only'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Arabic Recitation Only"
            >
              Arabic
            </button>
            <button
              type="button"
              onClick={() => onSelectPlaybackMode('translation_only')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] transition-all flex items-center gap-1 ${
                playbackMode === 'translation_only'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/30 ring-1 ring-amber-300'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 font-medium'
              }`}
              title="Voice Translation Audio Track Only (Urdu, Sindhi, or English)"
            >
              <Mic className="w-3 h-3 text-amber-400 group-hover:text-amber-300" />
              <span>Voice</span>
            </button>
          </div>
        </div>

        {/* Right: Timer, Speed, Repeat, Mute & Download */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Time display */}
          <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Repeat button */}
          <button
            onClick={onToggleRepeat}
            className={`p-1.5 rounded-lg border text-xs transition-colors hidden sm:flex items-center gap-1 ${
              repeatMode === 'verse'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : repeatMode === 'surah'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={`Repeat Mode: ${
              repeatMode === 'verse'
                ? 'Loop Single Verse (Arabic + Translation combo)'
                : repeatMode === 'surah'
                ? 'Loop Surah'
                : 'Play Once'
            }`}
          >
            {repeatMode === 'verse' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
            <span className="text-[10px] hidden xl:inline">
              {repeatMode === 'verse' ? 'Ayat Loop' : repeatMode === 'surah' ? 'Surah Loop' : 'Once'}
            </span>
          </button>

          {/* Speed Badge */}
          <button
            onClick={() => {
              const rates: PlaybackRate[] = [0.75, 1.0, 1.25, 1.5, 2.0];
              const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
              onSelectRate(rates[nextIdx]);
            }}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 hover:border-emerald-500 text-[11px] font-mono text-emerald-400 transition-colors"
            title="Audio playback speed"
          >
            {playbackRate}x
          </button>

          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Offline Cache Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              isCached
                ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
            title={isCached ? 'Surah audio is cached offline' : 'Download Surah audio for offline use'}
          >
            {isDownloading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : isCached ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Drawer Panel: Multi-Speaker & Sequential Engine Configuration */}
      {isExpanded && (
        <div className="px-4 py-4 sm:px-6 border-t border-slate-800 bg-slate-950/85 max-w-7xl mx-auto space-y-4 animate-fade-in">
          {/* Download Progress Banner */}
          {isDownloading && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  {downloadStatus}
                </span>
                <span className="font-mono text-emerald-400">{downloadProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Sequential Mode Banner & Selector */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-emerald-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Sequential Dual-Track Playback Mode:
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {playbackMode === 'dual'
                    ? 'Plays Verse Arabic recitation, then immediately switches to Spoken Translation without pause.'
                    : playbackMode === 'arabic_only'
                    ? 'Plays only Arabic recitations sequentially from verse to verse.'
                    : 'Plays only spoken voice translations sequentially.'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => onSelectPlaybackMode('dual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    playbackMode === 'dual'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Dual-Track (Ayat+Voice)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPlaybackMode('arabic_only')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    playbackMode === 'arabic_only'
                      ? 'bg-emerald-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Arabic Only
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPlaybackMode('translation_only')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    playbackMode === 'translation_only'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/30 ring-1 ring-amber-300'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 font-medium'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  Voice Only
                </button>
              </div>
            </div>
          </div>

          {/* Multi-Speaker Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Arabic Qari Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                Arabic Reciter (Qari):
              </label>
              <select
                value={reciterId}
                onChange={(e) => onSelectReciter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {RECITERS_LIST.filter((r) => r.audioType === 'arabic_recitation').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.style})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Studio audio from EveryAyah CDN.
              </p>
            </div>

            {/* 2. Spoken Translation Voice / Teacher (Multi-Speaker) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                Spoken Translation Voice & Speaker:
              </label>
              <select
                value={translationSpeakerId}
                onChange={(e) => onSelectTranslationSpeaker(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <optgroup label="Urdu Scholars & Speakers (اردو)">
                  {TRANSLATION_SPEAKERS.filter((s) => s.language === 'ur').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} • {s.gender === 'female' ? '♀ Female' : '♂ Male'} ({s.scholarOrNarrator})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="English Narrators & Teachers (English)">
                  {TRANSLATION_SPEAKERS.filter((s) => s.language === 'en').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} • {s.gender === 'female' ? '♀ Female' : '♂ Male'} ({s.scholarOrNarrator})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Sindhi Scholars & Speakers (سنڌي)">
                  {TRANSLATION_SPEAKERS.filter((s) => s.language === 'sd').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.style})
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="text-[10px] text-amber-300/80">
                Selected: {currentSpeaker.style}
              </p>
            </div>

            {/* 3. Speed, Loop, & Auto-Scroll */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-teal-400" />
                Playback Speed & Auto-Scroll:
              </label>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-900 rounded-xl border border-slate-700 p-0.5">
                  {([0.75, 1.0, 1.25, 1.5, 2.0] as PlaybackRate[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => onSelectRate(r)}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors font-mono ${
                        playbackRate === r
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>

                <div className="flex-1 flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                  <span className="text-slate-300 text-[11px]">Auto-Scroll</span>
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={onToggleAutoScroll}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onToggleRepeat}
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    repeatMode === 'verse'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : repeatMode === 'surah'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {repeatMode === 'verse' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                  <span>
                    {repeatMode === 'verse'
                      ? 'Hifz Ayat Loop (Repeats Arabic + Voice)'
                      : repeatMode === 'surah'
                      ? 'Loop Surah'
                      : 'Play Once'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
