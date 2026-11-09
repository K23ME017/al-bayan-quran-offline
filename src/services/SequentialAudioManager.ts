import { ActivePlaybackPhase, PlaybackMode, PlaybackRate, RepeatMode } from '../types/quran';
import { getAyahAudioUrl } from '../data/reciters';
import { getTranslationSpeakerAudioUrl, TRANSLATION_SPEAKERS } from '../data/translationSpeakers';
import { fetchSurahAyahs } from '../utils/api';

export interface SequentialPlayerListeners {
  onPhaseChange?: (phase: ActivePlaybackPhase, surah: number, ayah: number) => void;
  onAyahChange?: (ayah: number, surah: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number, phase: ActivePlaybackPhase) => void;
  onStateChange?: (isPlaying: boolean, phase: ActivePlaybackPhase) => void;
  onError?: (errorMessage: string) => void;
}

/**
 * SequentialDualTrackPlayer
 * Senior Audio Systems Architecture for seamless gapless sequential dual-track Quran playback:
 * [Ayat N Arabic Recitation] ➔ [Ayat N Voice Translation (Urdu/Sindhi/English Multi-Speaker)] ➔ [Ayat N+1 Arabic...]
 *
 * Includes:
 * 1. Dual-pipeline pre-buffering (zero latency switchover).
 * 2. Instant track switching for "Dual Track", "Arabic Only", and "Voice Only".
 * 3. Offline resilience: Cache API matching -> Web Speech API SpeechSynthesis fallback -> Web Audio Synth chime.
 * 4. 100% try-catch guarded execution preventing main thread stalls or frozen controls.
 */
export class SequentialDualTrackPlayer {
  private primaryAudio: HTMLAudioElement; // Dedicated Arabic pipeline
  private secondaryAudio: HTMLAudioElement; // Dedicated Translation pipeline

  private currentSurah: number = 1;
  private currentAyah: number = 1;
  private totalAyahs: number = 7;

  private reciterId: string = 'Alafasy_128kbps';
  private translationSpeakerId: string = 'ur_shamshad';

  private playbackMode: PlaybackMode = 'dual'; // 'dual' | 'arabic_only' | 'translation_only'
  private activePhase: ActivePlaybackPhase = 'arabic'; // 'arabic' | 'translation'
  private repeatMode: RepeatMode = 'surah';
  private playbackRate: PlaybackRate = 1.0;
  private volume: number = 1.0;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;

  private isHandlingFallback: boolean = false;
  private synthUtterance: SpeechSynthesisUtterance | null = null;
  private fallbackTimer: any = null;

  private listeners: SequentialPlayerListeners = {};
  private timeSubscribers: Set<(cur: number, dur: number, phase: ActivePlaybackPhase) => void> = new Set();

  constructor(listeners: SequentialPlayerListeners = {}) {
    this.listeners = listeners;

    this.primaryAudio = new Audio();
    this.secondaryAudio = new Audio();

    this.primaryAudio.preload = 'auto';
    this.secondaryAudio.preload = 'auto';

    this.setupAudioListeners();
  }

  public setListeners(listeners: SequentialPlayerListeners) {
    this.listeners = { ...this.listeners, ...listeners };
  }

  public subscribeTimeUpdate(callback: (cur: number, dur: number, phase: ActivePlaybackPhase) => void): () => void {
    this.timeSubscribers.add(callback);
    // Send immediate initial time safely
    try {
      const active = this.activePhase === 'arabic' ? this.primaryAudio : this.secondaryAudio;
      callback(active.currentTime || 0, active.duration || 0, this.activePhase);
    } catch {}
    return () => {
      this.timeSubscribers.delete(callback);
    };
  }

  private setupAudioListeners() {
    // Primary (Arabic) Handlers
    this.primaryAudio.addEventListener('timeupdate', () => {
      if (this.activePhase === 'arabic') {
        const cur = this.primaryAudio.currentTime;
        const dur = this.primaryAudio.duration || 0;
        this.timeSubscribers.forEach((cb) => cb(cur, dur, 'arabic'));
        this.listeners.onTimeUpdate?.(cur, dur, 'arabic');
      }
    });

    this.primaryAudio.addEventListener('ended', () => {
      this.handlePrimaryArabicEnded();
    });

    this.primaryAudio.addEventListener('error', (e) => {
      if (this.activePhase === 'arabic') {
        console.warn('Primary audio stream notice, testing offline recovery:', e);
        if (this.playbackMode === 'dual') {
          this.transitionToTranslation();
        } else {
          this.advanceToNextAyah();
        }
      }
    });

    // Secondary (Translation Voice) Handlers
    this.secondaryAudio.addEventListener('timeupdate', () => {
      if (this.activePhase === 'translation') {
        const cur = this.secondaryAudio.currentTime;
        const dur = this.secondaryAudio.duration || 0;
        this.timeSubscribers.forEach((cb) => cb(cur, dur, 'translation'));
        this.listeners.onTimeUpdate?.(cur, dur, 'translation');
      }
    });

    this.secondaryAudio.addEventListener('ended', () => {
      this.handleSecondaryTranslationEnded();
    });

    this.secondaryAudio.addEventListener('error', () => {
      if (this.activePhase === 'translation') {
        console.warn('Secondary voice audio load failed/offline. Triggering seamless speech synthesis fallback.');
        this.handleTranslationAudioFailure();
      }
    });
  }

  /**
   * Prime and start playback of a verse with async resilience
   */
  public playAyah(
    surah: number,
    ayah: number,
    totalAyahs: number,
    reciterId?: string,
    translationSpeakerId?: string,
    mode?: PlaybackMode
  ) {
    this.currentSurah = surah;
    this.currentAyah = ayah;
    this.totalAyahs = totalAyahs;

    if (reciterId) this.reciterId = reciterId;
    if (translationSpeakerId) this.translationSpeakerId = translationSpeakerId;
    if (mode) this.playbackMode = mode;

    this.isPlaying = true;
    this.cancelSpeechFallback();

    // Determine initial phase based on mode
    if (this.playbackMode === 'translation_only') {
      this.activePhase = 'translation';
      this.executeTranslationPlayback();
    } else {
      this.activePhase = 'arabic';
      this.executeArabicPlayback();
    }

    this.listeners.onAyahChange?.(this.currentAyah, this.currentSurah);
    this.listeners.onPhaseChange?.(this.activePhase, this.currentSurah, this.currentAyah);
    this.listeners.onStateChange?.(true, this.activePhase);
  }

  /**
   * Pipeline 1: Play Arabic recitation while pre-buffering translation audio in background
   */
  private executeArabicPlayback() {
    this.activePhase = 'arabic';
    this.cancelSpeechFallback();

    try {
      this.secondaryAudio.pause();
    } catch {}

    const arabicUrl = getAyahAudioUrl(this.reciterId, this.currentSurah, this.currentAyah);
    this.primaryAudio.src = arabicUrl;
    this.primaryAudio.playbackRate = this.playbackRate;
    this.primaryAudio.volume = this.isMuted ? 0 : this.volume;

    // GAPLESS PREFETCH: Pre-load translation audio in secondary audio element in parallel
    if (this.playbackMode === 'dual') {
      const translationUrl = getTranslationSpeakerAudioUrl(
        this.translationSpeakerId,
        this.currentSurah,
        this.currentAyah
      );
      this.secondaryAudio.src = translationUrl;
      try {
        this.secondaryAudio.load();
      } catch {}
    }

    this.primaryAudio.play().catch((err) => {
      console.warn('Primary audio playback start notice:', err);
    });

    this.listeners.onPhaseChange?.('arabic', this.currentSurah, this.currentAyah);
    this.listeners.onStateChange?.(true, 'arabic');
  }

  /**
   * Pipeline 2: Seamless switchover to Translation audio
   */
  private transitionToTranslation() {
    this.activePhase = 'translation';
    try {
      this.primaryAudio.pause();
    } catch {}

    this.executeTranslationPlayback();
  }

  private executeTranslationPlayback() {
    this.activePhase = 'translation';
    this.cancelSpeechFallback();

    try {
      this.primaryAudio.pause();
    } catch {}

    const translationUrl = getTranslationSpeakerAudioUrl(
      this.translationSpeakerId,
      this.currentSurah,
      this.currentAyah
    );

    if (this.secondaryAudio.src !== translationUrl) {
      this.secondaryAudio.src = translationUrl;
    }

    if (this.secondaryAudio.currentTime > 0) {
      try {
        this.secondaryAudio.currentTime = 0;
      } catch {}
    }

    this.secondaryAudio.playbackRate = this.playbackRate;
    this.secondaryAudio.volume = this.isMuted ? 0 : this.volume;

    // Pre-buffer the NEXT verse Arabic recitation in primary audio while translation is speaking!
    if (this.currentAyah < this.totalAyahs && this.playbackMode !== 'translation_only') {
      const nextArabicUrl = getAyahAudioUrl(this.reciterId, this.currentSurah, this.currentAyah + 1);
      this.primaryAudio.src = nextArabicUrl;
      try {
        this.primaryAudio.load();
      } catch {}
    }

    this.secondaryAudio.play().catch((err) => {
      if (err.name === 'AbortError') return;
      console.warn('Secondary voice playback blocked or offline. Using speech synthesis fallback:', err);
      this.handleTranslationAudioFailure();
    });

    this.listeners.onPhaseChange?.('translation', this.currentSurah, this.currentAyah);
    this.listeners.onStateChange?.(true, 'translation');
  }

  /**
   * Play translation voice track directly for a single ayah
   */
  public playAyahTranslation(
    surah: number,
    ayah: number,
    totalAyahs?: number,
    translationSpeakerId?: string
  ) {
    this.currentSurah = surah;
    this.currentAyah = ayah;
    if (totalAyahs) this.totalAyahs = totalAyahs;
    if (translationSpeakerId) this.translationSpeakerId = translationSpeakerId;
    this.playbackMode = 'translation_only';
    this.isPlaying = true;
    this.activePhase = 'translation';
    this.executeTranslationPlayback();
    this.listeners.onAyahChange?.(this.currentAyah, this.currentSurah);
    this.listeners.onPhaseChange?.('translation', this.currentSurah, this.currentAyah);
    this.listeners.onStateChange?.(true, 'translation');
  }

  /**
   * OFFLINE & RESILIENCE FALLBACK:
   * When translation voice audio fails, 404s, or device is offline:
   * 1. Checks Cache API for downloaded audio.
   * 2. Speaks the translation verse offline using Web Speech API (SpeechSynthesis).
   * 3. Plays a soothing Web Audio API harmonic chime if speech synthesis is unsupported.
   * Ensures playback NEVER crashes, NEVER stays silent, and NEVER cascades through all verses!
   */
  private async handleTranslationAudioFailure() {
    if (this.isHandlingFallback) return;
    this.isHandlingFallback = true;

    try {
      // 1. Try Cache API match
      const translationUrl = getTranslationSpeakerAudioUrl(
        this.translationSpeakerId,
        this.currentSurah,
        this.currentAyah
      );

      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const match = await caches.match(translationUrl);
          if (match) {
            const blob = await match.blob();
            const objUrl = URL.createObjectURL(blob);
            this.secondaryAudio.src = objUrl;
            await this.secondaryAudio.play();
            this.isHandlingFallback = false;
            return;
          }
        } catch {}
      }

      // 2. Offline Web Speech API SpeechSynthesis Fallback
      await this.speakTranslationViaSynth();
    } catch (err) {
      console.warn('Offline speech synthesis error:', err);
      // 3. Fallback to harmonic Web Audio chime
      this.playWebAudioChime(() => {
        this.isHandlingFallback = false;
        this.handleSecondaryTranslationEnded();
      });
    }
  }

  private async speakTranslationViaSynth() {
    const speaker =
      TRANSLATION_SPEAKERS.find((s) => s.id === this.translationSpeakerId) ||
      TRANSLATION_SPEAKERS[0];
    const lang = speaker.language; // 'ur' | 'sd' | 'en'

    // Fetch verse translation text
    let verseText = '';
    try {
      const ayahs = await fetchSurahAyahs(this.currentSurah);
      const targetAyah = ayahs.find((a) => a.numberInSurah === this.currentAyah);
      if (targetAyah) {
        verseText =
          targetAyah.translations[lang] ||
          targetAyah.translations['en'] ||
          targetAyah.translations['ur'] ||
          '';
      }
    } catch {}

    if (!verseText || verseText.includes('اڻلڀ') || verseText.includes('دستیاب نہیں')) {
      verseText = `Surah ${this.currentSurah}, Verse ${this.currentAyah}.`;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(verseText);
      utterance.rate = Math.min(1.2, this.playbackRate);
      utterance.volume = this.isMuted ? 0 : this.volume;
      utterance.lang = lang === 'ur' ? 'ur-PK' : lang === 'sd' ? 'sd-PK' : 'en-US';

      let finished = false;
      const onDone = () => {
        if (finished) return;
        finished = true;
        this.cancelSpeechFallback();
        this.isHandlingFallback = false;
        this.handleSecondaryTranslationEnded();
      };

      utterance.onend = onDone;
      utterance.onerror = () => {
        this.playWebAudioChime(onDone);
      };

      this.synthUtterance = utterance;
      window.speechSynthesis.speak(utterance);

      // Safety timeout guard (max 15s per verse speech synthesis)
      this.fallbackTimer = setTimeout(() => {
        if (!finished) onDone();
      }, 15000);
    } else {
      this.playWebAudioChime(() => {
        this.isHandlingFallback = false;
        this.handleSecondaryTranslationEnded();
      });
    }
  }

  /**
   * Harmonious Web Audio chime when audio is offline and synth is unavailable
   */
  private playWebAudioChime(onComplete: () => void) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setTimeout(onComplete, 1000);
        return;
      }
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Harmonic Quranic bell chord (A4 440Hz -> C#5 554Hz)
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(554.37, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(this.isMuted ? 0 : 0.2 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.25);

      osc.onended = () => {
        ctx.close().catch(() => {});
        onComplete();
      };
    } catch {
      setTimeout(onComplete, 800);
    }
  }

  private cancelSpeechFallback() {
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.synthUtterance = null;
    this.isHandlingFallback = false;
  }

  /**
   * Arabic audio completed event
   */
  private handlePrimaryArabicEnded() {
    if (this.playbackMode === 'dual') {
      this.transitionToTranslation();
    } else {
      this.handleVerseCycleCompleted();
    }
  }

  /**
   * Translation audio completed event
   */
  private handleSecondaryTranslationEnded() {
    this.handleVerseCycleCompleted();
  }

  /**
   * Entire verse cycle finished
   */
  private handleVerseCycleCompleted() {
    if (this.repeatMode === 'verse') {
      this.playAyah(
        this.currentSurah,
        this.currentAyah,
        this.totalAyahs,
        this.reciterId,
        this.translationSpeakerId,
        this.playbackMode
      );
      return;
    }
    this.advanceToNextAyah();
  }

  private advanceToNextAyah() {
    if (this.currentAyah < this.totalAyahs) {
      this.playAyah(
        this.currentSurah,
        this.currentAyah + 1,
        this.totalAyahs,
        this.reciterId,
        this.translationSpeakerId,
        this.playbackMode
      );
    } else {
      // Surah Finished
      if (this.repeatMode === 'surah') {
        this.playAyah(
          this.currentSurah,
          1,
          this.totalAyahs,
          this.reciterId,
          this.translationSpeakerId,
          this.playbackMode
        );
      } else {
        this.pause();
        this.currentAyah = 1;
        this.listeners.onAyahChange?.(1, this.currentSurah);
      }
    }
  }

  public nextAyah() {
    if (this.currentAyah < this.totalAyahs) {
      this.playAyah(
        this.currentSurah,
        this.currentAyah + 1,
        this.totalAyahs,
        this.reciterId,
        this.translationSpeakerId,
        this.playbackMode
      );
    }
  }

  public prevAyah() {
    if (this.currentAyah > 1) {
      this.playAyah(
        this.currentSurah,
        this.currentAyah - 1,
        this.totalAyahs,
        this.reciterId,
        this.translationSpeakerId,
        this.playbackMode
      );
    }
  }

  public pause() {
    this.isPlaying = false;
    this.cancelSpeechFallback();
    try {
      this.primaryAudio.pause();
    } catch {}
    try {
      this.secondaryAudio.pause();
    } catch {}
    this.listeners.onStateChange?.(false, this.activePhase);
  }

  public resume() {
    this.isPlaying = true;
    this.cancelSpeechFallback();
    if (this.activePhase === 'arabic') {
      this.primaryAudio.play().catch(() => {});
    } else {
      this.secondaryAudio.play().catch(() => {
        this.handleTranslationAudioFailure();
      });
    }
    this.listeners.onStateChange?.(true, this.activePhase);
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (!this.primaryAudio.src && !this.secondaryAudio.src) {
        this.playAyah(this.currentSurah, this.currentAyah, this.totalAyahs);
      } else {
        this.resume();
      }
    }
  }

  public seek(pct: number) {
    const active = this.activePhase === 'arabic' ? this.primaryAudio : this.secondaryAudio;
    if (active.duration && !isNaN(active.duration)) {
      active.currentTime = pct * active.duration;
    }
  }

  public setRate(rate: PlaybackRate) {
    this.playbackRate = rate;
    this.primaryAudio.playbackRate = rate;
    this.secondaryAudio.playbackRate = rate;
  }

  /**
   * Smoothly switch playback mode: 'dual', 'arabic_only', or 'translation_only'
   * When switching to 'translation_only' (the yellow/orange "Voice" button),
   * immediately switches active source to the voice track without pausing or hanging the player!
   */
  public setMode(mode: PlaybackMode) {
    this.playbackMode = mode;

    if (mode === 'translation_only') {
      this.activePhase = 'translation';
      try {
        this.primaryAudio.pause();
      } catch {}
      if (this.isPlaying) {
        this.executeTranslationPlayback();
      }
    } else if (mode === 'arabic_only') {
      this.activePhase = 'arabic';
      this.cancelSpeechFallback();
      try {
        this.secondaryAudio.pause();
      } catch {}
      if (this.isPlaying) {
        this.executeArabicPlayback();
      }
    } else if (mode === 'dual') {
      if (this.isPlaying && this.activePhase === 'arabic') {
        // Pre-load translation audio in background
        const translationUrl = getTranslationSpeakerAudioUrl(
          this.translationSpeakerId,
          this.currentSurah,
          this.currentAyah
        );
        this.secondaryAudio.src = translationUrl;
        try {
          this.secondaryAudio.load();
        } catch {}
      }
    }

    this.listeners.onPhaseChange?.(this.activePhase, this.currentSurah, this.currentAyah);
    this.listeners.onStateChange?.(this.isPlaying, this.activePhase);
  }

  public setRepeat(repeat: RepeatMode) {
    this.repeatMode = repeat;
  }

  public setReciter(reciterId: string) {
    this.reciterId = reciterId;
    if (this.isPlaying && this.activePhase === 'arabic') {
      this.executeArabicPlayback();
    }
  }

  public setTranslationSpeaker(speakerId: string) {
    this.translationSpeakerId = speakerId;
    if (this.isPlaying && this.activePhase === 'translation') {
      this.executeTranslationPlayback();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.primaryAudio.volume = muted ? 0 : this.volume;
    this.secondaryAudio.volume = muted ? 0 : this.volume;
  }

  public setVolume(vol: number) {
    this.volume = vol;
    this.primaryAudio.volume = this.isMuted ? 0 : vol;
    this.secondaryAudio.volume = this.isMuted ? 0 : vol;
  }

  public getActivePhase(): ActivePlaybackPhase {
    return this.activePhase;
  }

  public getPlaybackMode(): PlaybackMode {
    return this.playbackMode;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public destroy() {
    this.cancelSpeechFallback();
    try {
      this.primaryAudio.pause();
      this.secondaryAudio.pause();
      this.primaryAudio.src = '';
      this.secondaryAudio.src = '';
    } catch {}
  }
}
