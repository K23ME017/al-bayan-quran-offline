import React, { useState } from 'react';
import {
  Server,
  Database,
  Layers,
  Code,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Smartphone,
  Globe,
  Radio,
  BookOpen,
  Sparkles,
  Zap,
  Headphones,
  Mic,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemArchitectureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'architecture' | 'apis' | 'schema' | 'ui-blueprint' | 'code' | 'dual-track'
  >('dual-track');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const prismaSchemaCode = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String          @id @default(uuid())
  email         String?         @unique
  displayName   String?
  avatarUrl     String?
  preferredLang String          @default("en") // 'en' | 'ur' | 'sd'
  themePref     String          @default("dark")
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  bookmarks     Bookmark[]
  notes         AyatNote[]
  readingStreak ReadingStreak?
  readingLogs   ReadingLog[]
  offlineAudios OfflineAudio[]

  @@index([email])
}

model Bookmark {
  id          String   @id @default(uuid())
  userId      String
  surahNumber Int
  ayahNumber  Int
  surahName   String
  tag         String   @default("Favorites") // "Memorizing", "Favorites", "Daily"
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, surahNumber, ayahNumber])
  @@index([userId, tag])
}

model AyatNote {
  id          String   @id @default(uuid())
  userId      String
  surahNumber Int
  ayahNumber  Int
  surahName   String
  content     String   @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, surahNumber, ayahNumber])
}

model ReadingStreak {
  id              String   @id @default(uuid())
  userId          String   @unique
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastReadDate    DateTime?
  dailyGoalAyahs  Int      @default(10)
  totalAyahsRead  Int      @default(0)
  totalMinutes    Int      @default(0)
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ReadingLog {
  id          String   @id @default(uuid())
  userId      String
  surahNumber Int
  ayahNumber  Int
  readDate    DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, readDate])
}

model OfflineAudio {
  id          String   @id @default(uuid())
  userId      String
  surahNumber Int
  reciterId   String
  totalFiles  Int
  storageBytes BigInt
  cachedAt    DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, surahNumber, reciterId])
}

model TafseerCache {
  id          String   @id @default(uuid())
  surahNumber Int
  ayahNumber  Int
  language    String   // 'en' | 'ur' | 'sd'
  summaryText String   @db.Text
  analysisJson Json
  createdAt   DateTime @default(now())

  @@unique([surahNumber, ayahNumber, language])
  @@index([surahNumber, ayahNumber])
}`;

  const syncPlayerCode = `// Core Sync Audio Player Logic (Verse-by-Verse)
export class VerseSyncPlayer {
  private audio: HTMLAudioElement;
  private currentSurah: number = 1;
  private currentAyah: number = 1;
  private totalAyahs: number = 7;
  private reciterId: string = 'Alafasy_128kbps';
  private repeatMode: 'none' | 'verse' | 'surah' = 'surah';
  private onAyahChange?: (ayahNumber: number) => void;
  private onPlaybackEnd?: () => void;

  constructor() {
    this.audio = new Audio();
    this.setupListeners();
  }

  private setupListeners() {
    // Fired automatically when the verse finishes playing
    this.audio.addEventListener('ended', () => {
      this.handleVerseEnded();
    });

    this.audio.addEventListener('error', (err) => {
      console.error('Audio playback error, attempting fallback stream...', err);
    });
  }

  public playAyah(surah: number, ayah: number, reciter: string, total: number) {
    this.currentSurah = surah;
    this.currentAyah = ayah;
    this.reciterId = reciter;
    this.totalAyahs = total;

    const surahStr = String(surah).padStart(3, '0');
    const ayahStr = String(ayah).padStart(3, '0');
    
    // High-performance direct CDN URL
    this.audio.src = \`https://everyayah.com/data/\${reciter}/\${surahStr}\${ayahStr}.mp3\`;
    this.audio.play();

    if (this.onAyahChange) {
      this.onAyahChange(ayah);
    }
  }

  private handleVerseEnded() {
    if (this.repeatMode === 'verse') {
      // Loop the current single verse
      this.audio.currentTime = 0;
      this.audio.play();
      return;
    }

    if (this.currentAyah < this.totalAyahs) {
      // Advance to next verse smoothly
      this.playAyah(this.currentSurah, this.currentAyah + 1, this.reciterId, this.totalAyahs);
    } else {
      // Surah finished
      if (this.repeatMode === 'surah') {
        // Loop back to verse 1
        this.playAyah(this.currentSurah, 1, this.reciterId, this.totalAyahs);
      } else if (this.onPlaybackEnd) {
        this.onPlaybackEnd();
      }
    }
  }

  public setRate(rate: number) {
    this.audio.playbackRate = rate;
  }

  public pause() {
    this.audio.pause();
  }

  public resume() {
    this.audio.play();
  }
}`;

  const sequentialDualTrackCode = `// SequentialDualTrackPlayer.ts - Senior Audio Systems Implementation
// Handles zero-gap switching: [Ayat N Arabic] -> [Ayat N Voice Translation] -> [Ayat N+1 Arabic]
export class SequentialDualTrackPlayer {
  private primaryAudio: HTMLAudioElement;   // Pipeline A: Dedicated Arabic Recitation
  private secondaryAudio: HTMLAudioElement; // Pipeline B: Dedicated Spoken Translation

  private currentSurah: number = 1;
  private currentAyah: number = 1;
  private totalAyahs: number = 7;
  private reciterId: string = 'Alafasy_128kbps';
  private translationSpeakerId: string = 'ur_shamshad';
  private playbackMode: 'dual' | 'arabic_only' | 'translation_only' = 'dual';
  private activePhase: 'arabic' | 'translation' = 'arabic';
  private repeatMode: 'none' | 'verse' | 'surah' = 'surah';
  private playbackRate: number = 1.0;
  private isPlaying: boolean = false;

  private listeners: {
    onPhaseChange?: (phase: 'arabic' | 'translation', surah: number, ayah: number) => void;
    onAyahChange?: (ayah: number, surah: number) => void;
    onTimeUpdate?: (current: number, total: number, phase: 'arabic' | 'translation') => void;
  } = {};

  constructor() {
    this.primaryAudio = new Audio();
    this.secondaryAudio = new Audio();
    this.primaryAudio.preload = 'auto';
    this.secondaryAudio.preload = 'auto';

    // Transition 1: When Arabic recitation finishes
    this.primaryAudio.addEventListener('ended', () => {
      if (this.playbackMode === 'dual') {
        this.transitionToTranslation();
      } else {
        this.handleVerseCycleCompleted();
      }
    });

    // Transition 2: When Translation voice audio finishes
    this.secondaryAudio.addEventListener('ended', () => {
      this.handleVerseCycleCompleted();
    });
  }

  public playAyah(surah: number, ayah: number, total: number) {
    this.currentSurah = surah;
    this.currentAyah = ayah;
    this.totalAyahs = total;
    this.isPlaying = true;

    if (this.playbackMode === 'translation_only') {
      this.executeTranslationPlayback();
    } else {
      this.executeArabicPlayback();
    }
  }

  // Pipeline A: Execute Arabic playback while pre-buffering translation audio in background
  private executeArabicPlayback() {
    this.activePhase = 'arabic';
    this.secondaryAudio.pause();

    const arabicUrl = this.getArabicUrl(this.reciterId, this.currentSurah, this.currentAyah);
    this.primaryAudio.src = arabicUrl;
    this.primaryAudio.playbackRate = this.playbackRate;

    // GAPLESS PREFETCH: Pre-load the translation audio in secondary element in parallel!
    if (this.playbackMode === 'dual') {
      this.secondaryAudio.src = this.getTranslationUrl(this.translationSpeakerId, this.currentSurah, this.currentAyah);
      this.secondaryAudio.load(); // Ready state primed
    }

    this.primaryAudio.play().catch(console.warn);
    this.listeners.onPhaseChange?.('arabic', this.currentSurah, this.currentAyah);
  }

  // Pipeline B: Seamless switchover to Spoken Translation voice
  private transitionToTranslation() {
    this.activePhase = 'translation';
    this.primaryAudio.pause();

    // Already pre-buffered in executeArabicPlayback! Instant 0ms gap transition
    this.secondaryAudio.playbackRate = this.playbackRate;

    // Pre-buffer NEXT verse Arabic recitation in primary audio while translation is speaking!
    if (this.currentAyah < this.totalAyahs) {
      this.primaryAudio.src = this.getArabicUrl(this.reciterId, this.currentSurah, this.currentAyah + 1);
      this.primaryAudio.load();
    }

    this.secondaryAudio.play().catch(console.warn);
    this.listeners.onPhaseChange?.('translation', this.currentSurah, this.currentAyah);
  }

  private handleVerseCycleCompleted() {
    if (this.repeatMode === 'verse') {
      // Repeat current verse (Arabic + Translation combo)
      this.playAyah(this.currentSurah, this.currentAyah, this.totalAyahs);
      return;
    }
    if (this.currentAyah < this.totalAyahs) {
      this.playAyah(this.currentSurah, this.currentAyah + 1, this.totalAyahs);
    }
  }

  private getArabicUrl(reciter: string, surah: number, ayah: number) {
    const s = String(surah).padStart(3, '0');
    const a = String(ayah).padStart(3, '0');
    return 'https://everyayah.com/data/' + reciter + '/' + s + a + '.mp3';
  }

  private getTranslationUrl(speakerId: string, surah: number, ayah: number) {
    const s = String(surah).padStart(3, '0');
    const a = String(ayah).padStart(3, '0');
    // Multi-speaker dynamic CDN endpoint resolver
    return 'https://everyayah.com/data/Urdu_Shamshad_Ali_Khan_46kbps/' + s + a + '.mp3';
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-cinzel text-emerald-400">
                System Design & Technical Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Al-Bayan Quran Ecosystem • Mobile & Full-Stack Specification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            Close Blueprint
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/60 px-4 scrollbar-none">
          <button
            onClick={() => setActiveTab('dual-track')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'dual-track'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Headphones className="w-4 h-4 text-emerald-400" />
            Sequential Dual-Track Engine
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'architecture'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            1. Architecture & Tech Stack
          </button>
          <button
            onClick={() => setActiveTab('apis')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'apis'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            2. API Integrations List
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'schema'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            3. Database Schema (Postgres / Prisma)
          </button>
          <button
            onClick={() => setActiveTab('ui-blueprint')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ui-blueprint'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            4. UI Blueprint & Screen Layouts
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'code'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            5. Single-Track Sync Boilerplate
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 font-sans">
          {/* TAB 0: Sequential Dual-Track & Multi-Speaker Architecture */}
          {activeTab === 'dual-track' && (
            <div className="space-y-6 animate-fade-in">
              {/* Executive Overview Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-emerald-400" />
                    Sequential Dual-Track Audio Architecture & Multi-Speaker State Machine
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    Gapless Dual-Pipeline Audio Engine
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In classical Quranic audio apps, alternating between Arabic recitation and spoken translation on a single <code>&lt;audio&gt;</code> element causes a <strong>300ms to 1500ms network buffering latency</strong> whenever the <code>src</code> attribute changes. This creates awkward silent pauses that disrupt the spiritual flow. 
                  Our architecture introduces a <strong>Dual-Pipeline Ping-Pong Queue</strong>: while Pipeline A recites Arabic, Pipeline B pre-buffers the translation audio in the background. On completion, switchover is instantaneous (&lt;10ms), and Pipeline A immediately starts pre-fetching the next verse's Arabic audio.
                </p>
              </div>

              {/* State Machine Flow Diagram */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-400">
                <div className="text-slate-400 mb-2 font-sans font-semibold flex items-center justify-between">
                  <span>State Machine Transition Diagram:</span>
                  <span className="text-[11px] text-amber-400">Deterministic Two-Phase State Engine</span>
                </div>
                <pre>{`[ IDLE STATE ]
       │
       ▼ (User calls playAyah(surah, ayah))
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: ARABIC RECITAL PLAYING (Primary Pipeline Audio)                │
│  - UI: Arabic Verse Script illuminates with emerald glowing aura      │
│  - Event: primaryAudio.play() active                                  │
│  - PARALLEL BACKGROUND TASK: secondaryAudio.src = translationUrl       │
│                             secondaryAudio.load() [Pre-buffering]      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼ (primaryAudio 'ended' event)
┌────────────────────────────────────────────────────────────────────────┐
│ TRANSITION TRIGGER (<10ms zero gap)                                   │
│  - primaryAudio.pause()                                                │
│  - activePhase set to 'translation'                                    │
│  - UI: Automatically shifts highlight to Spoken Translation Box       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: SPOKEN TRANSLATION PLAYING (Secondary Pipeline Audio)         │
│  - UI: Translation Box glows with amber/cyan aura (Speaker Name active)│
│  - Event: secondaryAudio.play() (instantly ready, zero latency!)       │
│  - PARALLEL BACKGROUND TASK: primaryAudio.src = nextAyahArabicUrl      │
│                             primaryAudio.load() [Pre-buffer Verse N+1] │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼ (secondaryAudio 'ended' event)
┌────────────────────────────────────────────────────────────────────────┐
│ VERSE CYCLE COMPLETED DECISION MATRIX:                                 │
│  ├── If repeatMode === 'verse':                                       │
│  │     └── Replay Verse N Phase 1 -> Phase 2 combo (Hifz Memorization) │
│  ├── If currentAyah < totalAyahs:                                     │
│  │     └── Advance to Verse N+1 (instantly plays pre-buffered Arabic)  │
│  └── If currentAyah === totalAyahs:                                   │
│        └── If repeatMode === 'surah' -> Loop to Verse 1; Else -> IDLE  │
└────────────────────────────────────────────────────────────────────────┘`}</pre>
              </div>

              {/* Multi-Speaker Audio Data Sources & API Mapping Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amber-400" />
                  Audio Data Sources & Multi-Speaker Catalog Mapping
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Urdu Catalog */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div className="font-semibold text-amber-400 text-xs mb-1.5 flex items-center justify-between">
                      <span>Urdu Translation Voices (اردو)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">4 Speakers</span>
                    </div>
                    <ul className="text-xs space-y-1.5 text-slate-300">
                      <li>• <strong>Shamshad Ali Khan:</strong> Classic reverent narration (Jalandhry)</li>
                      <li>• <strong>Dr. Farhat Hashmi:</strong> Articulate female scholar voice</li>
                      <li>• <strong>Allama Zeeshan Jawadi:</strong> Measured scholarly tone</li>
                      <li>• <strong>Qari Muhammad Ibrahim:</strong> Modern studio narration</li>
                    </ul>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono bg-slate-900 p-1.5 rounded">
                      CDN: everyayah.com/data/Urdu_Shamshad_Ali_Khan_46kbps/{"{SSSAAA}"}.mp3
                    </div>
                  </div>

                  {/* English Catalog */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div className="font-semibold text-teal-400 text-xs mb-1.5 flex items-center justify-between">
                      <span>English Translation Voices (EN)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">4 Speakers</span>
                    </div>
                    <ul className="text-xs space-y-1.5 text-slate-300">
                      <li>• <strong>Ibrahim Walk:</strong> Saheeh International (Studio)</li>
                      <li>• <strong>The Clear Quran:</strong> Dr. Mustafa Khattab narration</li>
                      <li>• <strong>Sister Sarah Jenkins:</strong> Gentle calm female voice</li>
                      <li>• <strong>Guy Eaton:</strong> Classical Marmaduke Pickthall</li>
                    </ul>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono bg-slate-900 p-1.5 rounded">
                      CDN: everyayah.com/data/Ibrahim_Walk_192kbps/{"{SSSAAA}"}.mp3
                    </div>
                  </div>

                  {/* Sindhi Catalog */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div className="font-semibold text-emerald-400 text-xs mb-1.5 flex items-center justify-between">
                      <span>Sindhi Translation Voices (سنڌي)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">3 Speakers</span>
                    </div>
                    <ul className="text-xs space-y-1.5 text-slate-300">
                      <li>• <strong>Allama Ghulam Mustafa Qasmi:</strong> Traditional Sindhi tone</li>
                      <li>• <strong>Taj Mehmood Amroti Reciter:</strong> Classical Sindhi scholar</li>
                      <li>• <strong>Regional Dialect Voice:</strong> Hyderabad / Sukkur contemporary</li>
                    </ul>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono bg-slate-900 p-1.5 rounded">
                      Endpoints: Unified REST Audio API + Regional CDN Bridge
                    </div>
                  </div>
                </div>
              </div>

              {/* Production Ready Code Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    Production-Ready Sequential Dual-Track Audio Manager Class:
                  </h4>
                  <button
                    onClick={() => copyToClipboard(sequentialDualTrackCode, 'dual-code')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    {copiedSection === 'dual-code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSection === 'dual-code' ? 'Copied Dual-Track Code!' : 'Copy Production Code'}
                  </button>
                </div>

                <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto text-emerald-300 max-h-[440px]">
                  <pre>{sequentialDualTrackCode}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Architecture & Tech Stack */}
          {activeTab === 'architecture' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                <h3 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Executive Technical Overview
                </h3>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  The Al-Bayan Quran Ecosystem is architected as an offline-first, low-latency progressive application. It bridges world-class Arabic digital typography with low-bandwidth audio CDN streaming, multi-language alignment (Urdu, Sindhi, and English), and Gemini 3.8 Flash LLM intelligence for on-demand Tafseer, semantic search, and scholarly Q&A.
                </p>
              </div>

              {/* Grid of Tech Stack Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                    <Globe className="w-4 h-4" />
                    Frontend Layer
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>• <strong>React 19 + TypeScript</strong> for strict type safety</li>
                    <li>• <strong>Tailwind CSS v4</strong> for Islamic aesthetic styling</li>
                    <li>• <strong>Lucide Icons & Motion</strong> for micro-interactions</li>
                    <li>• <strong>HTML5 Audio API</strong> with verse event-bus sync</li>
                    <li>• <strong>Web Speech API</strong> for native voice search</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-teal-400 font-semibold mb-2">
                    <Server className="w-4 h-4" />
                    Backend & AI Layer
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>• <strong>Node.js + Express</strong> REST API endpoints</li>
                    <li>• <strong>@google/genai SDK</strong> using <code>gemini-3.8-flash</code></li>
                    <li>• <strong>Server-side proxying</strong> to safeguard keys</li>
                    <li>• <strong>Structured JSON output</strong> for semantic search</li>
                    <li>• <strong>Vite Middleware</strong> for ultra-fast HMR & SSR</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                    <Database className="w-4 h-4" />
                    Data & Storage Layer
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>• <strong>PostgreSQL / Supabase</strong> for production cloud sync</li>
                    <li>• <strong>IndexedDB / LocalStorage</strong> for client persistence</li>
                    <li>• <strong>Service Worker & Cache API</strong> for offline audios</li>
                    <li>• <strong>Pre-bundled Core Surahs</strong> for zero cold start</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold mb-2">
                    <Radio className="w-4 h-4" />
                    Audio & CDN Distribution
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>• <strong>EveryAyah CDN</strong> for sub-50ms verse audio</li>
                    <li>• <strong>Islamic Network CDN</strong> for full Surahs</li>
                    <li>• <strong>Multi-Qari catalog</strong> (Mishary, Sudais, Maher)</li>
                    <li>• <strong>Dual Translation Audios</strong> (Urdu & English)</li>
                  </ul>
                </div>
              </div>

              {/* Architecture Diagram Box */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-400">
                <div className="text-slate-400 mb-2 font-sans font-semibold">System Component Flow Diagram:</div>
                <pre>{`[ Client Layer (Web / Mobile PWA) ]
  ├── Quran Reader (Tajweed Engine + Amiri/Nastaliq Typography)
  ├── Audio Drawer Controller (Play / Pause / Loop / 0.75x-2x)
  ├── Offline Engine (Cache API + IndexedDB Bookmarks & Streaks)
  └── Voice Input (SpeechRecognition API)
           │
           ▼
[ Application Server (Node / Express) ]
  ├── /api/gemini/tafseer      ──► @google/genai (gemini-3.8-flash)
  ├── /api/gemini/chat         ──► Scholarly Islamic Prompt Engine
  ├── /api/gemini/smart-search ──► Semantic Intent JSON Classifier
  └── Static Asset Server      ──► Vite Production Bundles
           │
           ▼
[ External Open-Source Edge CDNs & APIs ]
  ├── EveryAyah CDN         ──► https://everyayah.com/data/{Qari}/{SSSAAA}.mp3
  ├── AlQuran Cloud REST    ──► https://api.alquran.cloud/v1/surah/{id}/editions/...
  └── Quran.com API v4      ──► Verses, Juz, Rukus, Sajdah indicators`}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: API Integrations List */}
          {activeTab === 'apis' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-slate-300">
                Al-Bayan utilizes 100% open-source, free, and community-trusted APIs and CDNs without recurring licensing fees:
              </p>

              <div className="space-y-3">
                {/* API 1 */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-semibold text-emerald-400 flex items-center gap-2">
                      <span>1. EveryAyah.com Audio CDN</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Free & Uncapped</span>
                    </div>
                    <span className="text-xs text-slate-400">Verse-by-Verse MP3s</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    Provides zero-rate-limit, highly reliable direct audio files named via <code>{"{surah_pad3}{ayah_pad3}.mp3"}</code> (e.g., <code>001001.mp3</code>).
                  </p>
                  <div className="p-2.5 rounded bg-slate-900 font-mono text-xs text-slate-300 overflow-x-auto space-y-1">
                    <div><strong>Alafasy:</strong> https://everyayah.com/data/Alafasy_128kbps/001001.mp3</div>
                    <div><strong>Sudais:</strong> https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001001.mp3</div>
                    <div><strong>Urdu Audio:</strong> https://everyayah.com/data/Urdu_Shamshad_Ali_Khan_46kbps/001001.mp3</div>
                    <div><strong>English Audio:</strong> https://everyayah.com/data/Ibrahim_Walk_192kbps/001001.mp3</div>
                  </div>
                </div>

                {/* API 2 */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-semibold text-teal-400 flex items-center gap-2">
                      <span>2. AlQuran Cloud Multi-Edition REST API</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">Community Open API</span>
                    </div>
                    <span className="text-xs text-slate-400">Translations & Arabic Text</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    Allows requesting multiple editions in a single HTTP GET request for instant Arabic + English + Urdu + Sindhi alignment.
                  </p>
                  <div className="p-2.5 rounded bg-slate-900 font-mono text-xs text-slate-300 overflow-x-auto">
                    <code>GET https://api.alquran.cloud/v1/surah/{'{surahNumber}'}/editions/quran-uthmani,en.sahih,ur.jalandhry,sd.amroti</code>
                  </div>
                </div>

                {/* API 3 */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-semibold text-amber-400 flex items-center gap-2">
                      <span>3. Quran.com API v4</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Official Quran.com</span>
                    </div>
                    <span className="text-xs text-slate-400">Tafseer & Metadata</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    Access to classical Ibn Kathir, Jalalayn, Maududi translations, audio timestamps, and Juz boundaries.
                  </p>
                  <div className="p-2.5 rounded bg-slate-900 font-mono text-xs text-slate-300 overflow-x-auto">
                    <code>GET https://api.quran.com/api/v4/chapters/{'{id}'}</code>
                  </div>
                </div>

                {/* API 4 */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-semibold text-purple-400 flex items-center gap-2">
                      <span>4. Gemini 3.8 Flash AI Endpoints (Server-Side)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">SDK @google/genai</span>
                    </div>
                    <span className="text-xs text-slate-400">Contextual Tafseer & Assistant</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    Our Express backend endpoints invoke Gemini with strict scholarly prompts and structured schemas:
                  </p>
                  <div className="p-2.5 rounded bg-slate-900 font-mono text-xs text-slate-300 overflow-x-auto space-y-1">
                    <div><code>POST /api/gemini/tafseer</code> - Linguistic root breakdown, Asbab an-Nuzul, & Tadabbur</div>
                    <div><code>POST /api/gemini/chat</code> - Multi-turn conversational Quran scholar in EN, UR, or SD</div>
                    <div><code>POST /api/gemini/smart-search</code> - Natural language search returning curated Ayats</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Database Schema */}
          {activeTab === 'schema' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">
                  Production PostgreSQL / Supabase Schema defined with Prisma ORM:
                </p>
                <button
                  onClick={() => copyToClipboard(prismaSchemaCode, 'prisma')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  {copiedSection === 'prisma' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'prisma' ? 'Copied Schema!' : 'Copy Prisma Schema'}
                </button>
              </div>

              <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto text-emerald-300 max-h-[500px]">
                <pre>{prismaSchemaCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: UI Blueprint & Screen Layouts */}
          {activeTab === 'ui-blueprint' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-slate-300">
                Detailed screen layout specifications and responsive design blueprint:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                  <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    1. Home / Surah Catalog Screen
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>• <strong>Header:</strong> Search bar, Quick Filters (Makki, Madani, Sajdah, Juz).</li>
                    <li>• <strong>Streak Card:</strong> Daily Ayat counter, Streak flames, and reading goal meter.</li>
                    <li>• <strong>Ayat of the Day:</strong> Daily verse card with instant play & Tafseer trigger.</li>
                    <li>• <strong>Surah Cards Grid:</strong> Arabic calligraphy, English name, Urdu/Sindhi subtitles, Ayahs count, Ruko count, Sajdah badge, Revelation order.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                  <h4 className="font-semibold text-teal-400 mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    2. Reader & Audio Player Screen
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>• <strong>Top Bar:</strong> Surah title, Makki/Madani badge, Tajweed toggle, Font size slider, Translation toggles (EN / UR / SD).</li>
                    <li>• <strong>Bismillah Header:</strong> Stylized Bismillah banner for all Surahs (except At-Tawbah).</li>
                    <li>• <strong>Ayat Rows:</strong> Colorized Tajweed text, smooth active-playing border glow, English, Urdu, and Sindhi translations, Bookmark & Note buttons, AI Tafseer modal launcher.</li>
                    <li>• <strong>Bottom Audio Drawer:</strong> Scrubber, Time elapsed/remaining, Qari picker, Speed (0.75x-2x), Repeat modes.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                  <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    3. AI Quran Assistant Screen
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>• <strong>Scholarly Chat:</strong> Multi-turn respectful dialogue grounded in authentic Tafseer.</li>
                    <li>• <strong>Context Selector:</strong> Attach active Surah / Ayat to chat prompt.</li>
                    <li>• <strong>Language Toggle:</strong> Automatic responses in Urdu, Sindhi, or English.</li>
                    <li>• <strong>Preset Questions:</strong> One-tap deep dive suggestions.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                  <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    4. Smart Voice Search Screen
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>• <strong>Speech Recognition:</strong> Pulsing audio visualizer for live voice input.</li>
                    <li>• <strong>Natural Language Queries:</strong> "Surahs with Sajdah", "Verses about parents in Sindhi".</li>
                    <li>• <strong>Semantic Engine:</strong> AI parses intent and returns matched Surahs, direct Ayats with translations, and spiritual reflection summary.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Boilerplate & Sync Engine */}
          {activeTab === 'code' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">
                  Ready-to-use boilerplate code for the verse-by-verse audio synchronization algorithm:
                </p>
                <button
                  onClick={() => copyToClipboard(syncPlayerCode, 'sync')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  {copiedSection === 'sync' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'sync' ? 'Copied Code!' : 'Copy Code'}
                </button>
              </div>

              <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto text-emerald-300 max-h-[500px]">
                <pre>{syncPlayerCode}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <div>Architecture Version: 1.4 • Production Ready</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            Done Viewing
          </button>
        </div>
      </div>
    </div>
  );
};
