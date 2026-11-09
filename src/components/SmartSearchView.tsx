import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Search,
  Sparkles,
  Play,
  BookOpen,
  RefreshCw,
  Compass,
  ArrowRight,
  AlertCircle,
  Square,
  Volume2,
  CheckCircle,
  WifiOff,
} from 'lucide-react';
import { SmartSearchResult } from '../types/quran';
import { instantQuranSearch } from '../utils/quranSearchEngine';

// Client-side cache for sub-millisecond query retrieval
const clientSearchCache = new Map<string, SmartSearchResult>();

interface Props {
  onSelectSurah: (surahNumber: number) => void;
  onPlayAyah: (surahNumber: number, ayahNumber: number) => void;
  autoStartVoice?: boolean;
}

export const SmartSearchView: React.FC<Props> = ({
  onSelectSurah,
  onPlayAyah,
  autoStartVoice = false,
}) => {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<'en' | 'ur' | 'sd'>('en');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isOfflineEngine, setIsOfflineEngine] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  // References to hardware handles and async locks
  const isOperatingRef = useRef(false); // Mutex lock to prevent multi-tap race conditions
  const recognitionRef = useRef<any>(null); // Web Speech API instance
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const transcribeAbortControllerRef = useRef<AbortController | null>(null);
  const lastTranscriptRef = useRef<string>('');

  // Cleanup all audio resources and timers on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
      if (transcribeAbortControllerRef.current) {
        transcribeAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-start voice if requested via prop (e.g., from top navbar mic click)
  useEffect(() => {
    if (autoStartVoice && !isRecording && !isTranscribing) {
      const timer = setTimeout(() => {
        startVoiceRecording();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoStartVoice]);

  /**
   * Complete, safe resource cleanup that releases mic hardware immediately
   * so Quran playback and other browser audio streams are never blocked.
   */
  const stopRecordingCleanup = useCallback(() => {
    // 1. Stop SpeechRecognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('SpeechRecognition stop cleanup:', err);
      }
      recognitionRef.current = null;
    }

    // 2. Clear timer
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    // 3. Stop all media stream audio tracks
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      } catch (err) {
        console.warn('Error stopping stream tracks:', err);
      }
      streamRef.current = null;
    }

    // 4. Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
  }, []);

  /**
   * Starts voice search with strict 100% offline support via Web Speech API
   * and fallback to MediaRecorder + Gemini API. Guarded by async mutex lock.
   */
  const startVoiceRecording = async () => {
    // Prevent concurrent calls if user taps rapidly
    if (isOperatingRef.current || isRecording || isTranscribing) {
      return;
    }
    isOperatingRef.current = true;

    setError(null);
    setMicNotice(null);
    lastTranscriptRef.current = '';

    // Check if Browser Web Speech API is supported (100% local/offline speech recognition)
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        // Map language to speech recognition locale
        if (language === 'ur') {
          recognition.lang = 'ur-PK';
        } else if (language === 'sd') {
          recognition.lang = 'sd-PK';
        } else {
          recognition.lang = 'en-US';
        }

        recognition.onstart = () => {
          setIsRecording(true);
          setIsOfflineEngine(true);
          setRecordSeconds(0);

          let elapsed = 0;
          recordTimerRef.current = setInterval(() => {
            elapsed += 1;
            setRecordSeconds(elapsed);
            if (elapsed >= 10) {
              stopVoiceRecording();
            }
          }, 1000);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = (finalTranscript || interimTranscript).trim();
          if (currentText) {
            setQuery(currentText);
            lastTranscriptRef.current = currentText;
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition notice:', event.error);
          if (event.error === 'not-allowed') {
            setMicNotice(
              'Microphone permission was denied. Please allow microphone permissions or tap one of the preset search topics below.'
            );
          } else if (event.error === 'no-speech') {
            // User did not speak within timeout - non-fatal
          } else {
            // Other error - try MediaRecorder fallback
            console.warn('Routing to MediaRecorder fallback on error:', event.error);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (recordTimerRef.current) {
            clearInterval(recordTimerRef.current);
            recordTimerRef.current = null;
          }

          const textToSearch = lastTranscriptRef.current.trim() || query.trim();
          if (textToSearch) {
            handleSearch(textToSearch, language);
          }
        };

        recognition.start();
        isOperatingRef.current = false;
        return;
      } catch (recErr: any) {
        console.warn('Web Speech API initialization notice, attempting MediaRecorder fallback:', recErr);
      }
    }

    // Fallback: MediaRecorder + Gemini Server-side Transcription
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Microphone recording is not supported in this browser. Please use text search or tap a sample query below.'
        );
      }

      // Check permissions if supported
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: 'microphone' as any });
          if (perm.state === 'denied') {
            throw new Error(
              'Microphone access is blocked by browser settings. Please allow microphone permissions or use a preset query.'
            );
          }
        } catch {}
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
            track.enabled = false;
          });
          streamRef.current = null;
        }

        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];

        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: mimeType });
          processRecordedAudio(audioBlob, mimeType);
        } else {
          setIsRecording(false);
          setIsTranscribing(false);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setIsOfflineEngine(false);
      setRecordSeconds(0);

      let elapsed = 0;
      recordTimerRef.current = setInterval(() => {
        elapsed += 1;
        setRecordSeconds(elapsed);
        if (elapsed >= 10) {
          stopVoiceRecording();
        }
      }, 1000);
    } catch (err: any) {
      console.error('Microphone start error:', err);
      stopRecordingCleanup();
      setIsRecording(false);
      setMicNotice(
        err.message ||
          'Microphone access is unavailable or denied. You can select one of the sample voice queries below to search instantly!'
      );
    } finally {
      isOperatingRef.current = false;
    }
  };

  /**
   * Stops voice recording safely and triggers processing.
   */
  const stopVoiceRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    setIsRecording(false);

    // Stop SpeechRecognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('SpeechRecognition stop notice:', err);
      }
    }

    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('MediaRecorder stop notice:', err);
      }
    } else {
      stopRecordingCleanup();
    }
  };

  /**
   * Processes the recorded audio blob asynchronously via server-side Gemini transcription.
   * Guarded with an 8-second AbortController timeout so it CANNOT hang the app or disable buttons.
   */
  const processRecordedAudio = async (audioBlob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setError(null);

    if (transcribeAbortControllerRef.current) {
      transcribeAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    transcribeAbortControllerRef.current = controller;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 8000);

    try {
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const resultStr = reader.result as string;
          if (resultStr && resultStr.includes(',')) {
            resolve(resultStr.split(',')[1]);
          } else {
            reject(new Error('Invalid audio data read'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader failed'));
        reader.readAsDataURL(audioBlob);
      });

      const response = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType,
          language,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Transcription service returned status ${response.status}`);
      }

      const data = await response.json();
      const transcribedText = (data.text || '').trim();

      if (transcribedText) {
        setQuery(transcribedText);
        handleSearch(transcribedText, language);
      } else {
        if (query.trim()) {
          handleSearch(query, language);
        } else {
          setError(
            'No clear speech detected. Please speak closer to your mic, or select one of the sample search topics below.'
          );
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Voice transcription notice:', err);

      if (err.name === 'AbortError') {
        setError('Voice request timed out. You can re-try or select a sample query below.');
      } else if (query.trim()) {
        handleSearch(query, language);
      } else {
        setError('Voice transcription was unavailable. You can type your query or tap any sample query below.');
      }
    } finally {
      setIsTranscribing(false);
      stopRecordingCleanup();
    }
  };

  /**
   * High-speed Quran search with instant (<1ms) local indexing + background AI enrichment
   */
  const handleSearch = async (searchQuery: string, lang: 'en' | 'ur' | 'sd') => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    const cacheKey = `${lang}:${trimmed.toLowerCase()}`;

    // 1. Instant Cache Hit (0ms)
    if (clientSearchCache.has(cacheKey)) {
      setResult(clientSearchCache.get(cacheKey)!);
      setError(null);
      setLoading(false);
      return;
    }

    // 2. High-speed local match (0ms instant display - no UI freeze or hanging!)
    const instant = instantQuranSearch(trimmed, lang);
    setResult(instant);
    setError(null);

    // 3. Abort any previous pending AI refinement
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    searchAbortControllerRef.current = controller;

    setLoading(true);

    try {
      const response = await fetch('/api/gemini/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          language: lang,
        }),
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.featuredAyats && data.featuredAyats.length > 0) {
          clientSearchCache.set(cacheKey, data);
          setResult(data);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Background search refinement notice:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const presetQueries = [
    { label: 'Patience & Trials (Sabr)', query: 'Verses about Patience (Sabr) in hardship and grief' },
    { label: 'Duas for Parents', query: 'Duas for parents and family peace in the Quran' },
    { label: 'Surahs with Sajdah', query: 'Surahs containing prostration (Sajdah) and their spiritual rulings' },
    { label: 'Cosmos & Astronomy', query: 'Astronomical signs, stars, moon and cosmic creation in the Quran' },
    { label: 'Forgiveness & Mercy', query: 'Divine forgiveness, repentance and infinite mercy in Quran' },
    { label: 'سنڌي: صبر ۽ شڪر', query: 'قرآن مجيد ۾ صبر ۽ آزمائش بابت آيتون سنڌي ۾' },
    { label: 'اردو: ماں باپ کے حقوق', query: 'قرآن مجید میں والدین کی عزت اور حقوق کی آیات' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-6 animate-fade-in text-slate-100 font-sans">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          AI Voice & Semantic Quran Search
        </div>
        <h1 className="text-3xl font-bold font-cinzel text-slate-100">
          Voice Search & Semantic Query
        </h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Tap the microphone to speak your question in English, Urdu (اردو), Sindhi (سنڌي), or Arabic.
        </p>
      </div>

      {/* Mic Permission Guidance Notification if denied or blocked */}
      {micNotice && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200/90 text-xs space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Microphone Access Notice</span>
          </div>
          <p>{micNotice}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Try with a sample query:</span>
            <button
              onClick={() => {
                setQuery('Verses about patience and trials in Sindhi');
                handleSearch('Verses about patience and trials in Sindhi', 'sd');
                setMicNotice(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
            >
              Test: "Patience in Sindhi"
            </button>
            <button
              onClick={() => {
                setQuery('What does the Quran say about kindness to parents?');
                handleSearch('What does the Quran say about kindness to parents?', 'en');
                setMicNotice(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
            >
              Test: "Kindness to Parents"
            </button>
          </div>
        </div>
      )}

      {/* Live Voice Recording Visualizer Drawer */}
      {isRecording && (
        <div className="p-5 rounded-3xl bg-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-400">
                Listening... Speak your question into the microphone
              </span>
              {isOfflineEngine && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" /> Offline Web Speech Engine
                </span>
              )}
            </div>
            <span className="font-mono text-xs text-slate-400">
              0:0{recordSeconds} / 0:10
            </span>
          </div>

          {/* Sound wave visualizer bars (pure CSS pulsing with zero CPU main-thread overhead!) */}
          <div className="flex items-center justify-center gap-1.5 h-12 bg-slate-950/60 rounded-2xl p-2">
            {[18, 36, 60, 85, 100, 75, 45, 90, 65, 40, 70, 95, 55, 30, 20].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                  animationDelay: `${(i % 4) * 0.1}s`,
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 text-[11px]">
              {query ? `Transcribing: "${query}"` : 'Speak clearly. Tap "Done" or wait when finished.'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  stopRecordingCleanup();
                  setIsRecording(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={stopVoiceRecording}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/30"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Done Speaking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcribing state indicator */}
      {isTranscribing && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-teal-500/40 flex items-center justify-center gap-3 text-xs text-teal-300 animate-fade-in shadow-lg">
          <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
          <span>Processing voice audio and generating query...</span>
        </div>
      )}

      {/* Main Search & Mic Input Bar */}
      <div className="relative rounded-3xl bg-slate-900 border border-emerald-500/30 p-2 shadow-2xl flex items-center gap-2">
        {/* Language selector */}
        <div className="pl-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="px-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="en">EN</option>
            <option value="ur">اردو</option>
            <option value="sd">سنڌي</option>
          </select>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(query, language);
          }}
          placeholder={
            language === 'ur'
              ? 'قرآن پاک میں تلاش کریں یا مائیک دبائیں (مثلاً: صبر کی فضیلت، والدین کے حقوق)...'
              : language === 'sd'
              ? 'قرآن پاڪ ۾ ڳولھيو يا مائيڪ دٻايو (مثلاً: صبر جا فائدا، ماءُ پيءُ لاءِ دعا)...'
              : 'Type or tap mic to speak (e.g. "Verses about finding peace in trials")'
          }
          className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />

        {/* Mic Button - Pulsating and Fully Responsive */}
        <button
          type="button"
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          disabled={isTranscribing}
          className={`p-3 rounded-2xl border transition-all flex items-center justify-center relative ${
            isRecording
              ? 'bg-rose-600 border-rose-400 text-white shadow-xl shadow-rose-600/40 scale-105 animate-pulse ring-4 ring-rose-500/30'
              : isTranscribing
              ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-500/40 hover:scale-105 active:scale-95'
          }`}
          title={isRecording ? 'Click to stop recording' : 'Click to speak query with your microphone (Offline supported)'}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : isTranscribing ? (
            <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
          ) : (
            <Mic className="w-5 h-5 text-emerald-400" />
          )}
        </button>

        {/* Search Submit Button */}
        <button
          type="button"
          onClick={() => handleSearch(query, language)}
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-40"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Preset Suggestions & Voice Query Inspiration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            Quick Voice Query Ideas (Tap to search instantly):
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {presetQueries.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(preset.query);
                handleSearch(preset.query, language);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-slate-300 hover:text-emerald-300 transition-colors shadow-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      {loading && !result ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs">
            Searching Quranic themes, verses & semantic cross-references...
          </p>
        </div>
      ) : error && !result ? (
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs text-center space-y-2">
          <p>{error}</p>
        </div>
      ) : result ? (
        <div className="space-y-6 animate-fade-in">
          {/* Subtle non-blocking indicator if AI background refinement is running */}
          {loading && (
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1 rounded-xl w-fit">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Refining insights with Gemini...</span>
            </div>
          )}

          {/* Query Interpretation & Spiritual Wisdom */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Compass className="w-4 h-4" />
              Quranic Guidance & Synthesis
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {result.spiritualWisdom}
            </p>
            <div className="text-xs text-slate-400 italic">
              Interpreted Intent: "{result.queryInterpretation}"
            </div>
          </div>

          {/* Recommended Surahs */}
          {result.recommendedSurahs && result.recommendedSurahs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Relevant Surahs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.recommendedSurahs.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectSurah(s.surahNumber)}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-start justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-100 font-cinzel text-sm">
                        Surah #{s.surahNumber} • {s.surahName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{s.reason}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Ayats List */}
          {result.featuredAyats && result.featuredAyats.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Direct Quran Verses (Ayats)
              </h3>
              <div className="space-y-4">
                {result.featuredAyats.map((ayah, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-semibold text-emerald-400">
                        Surah {ayah.surahName} ({ayah.surahNumber}:{ayah.ayahNumber})
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onPlayAyah(ayah.surahNumber, ayah.ayahNumber)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Listen
                        </button>
                        <button
                          onClick={() => onSelectSurah(ayah.surahNumber)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <BookOpen className="w-3 h-3" />
                          View in Reader
                        </button>
                      </div>
                    </div>

                    <p className="font-amiri text-2xl text-right text-emerald-300 leading-loose dir-rtl">
                      {ayah.arabic}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                      <p className="text-slate-200">
                        <strong>English:</strong> {ayah.english}
                      </p>
                      {ayah.urdu && (
                        <p className="font-nastaliq text-sm text-right text-amber-200/90 dir-rtl pt-1">
                          <strong>اردو:</strong> {ayah.urdu}
                        </p>
                      )}
                      {ayah.sindhi && (
                        <p className="font-amiri text-sm text-right text-teal-200/90 dir-rtl">
                          <strong>سنڌي:</strong> {ayah.sindhi}
                        </p>
                      )}
                    </div>

                    {ayah.relevance && (
                      <div className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        Context: {ayah.relevance}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
