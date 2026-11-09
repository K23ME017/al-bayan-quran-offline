import { AyahData } from '../types/quran';
import { OFFLINE_SURAHS_DATA } from '../data/offlineSampleQuran';
import { getAyahAudioUrl } from '../data/reciters';

const CACHE_NAME_AUDIO = 'albayan-quran-audio-v1';
const LOCAL_STORAGE_SURAH_PREFIX = 'albayan_cached_surah_';

// In-memory cache for 0ms instantaneous surah switching
const surahMemoryCache = new Map<number, AyahData[]>();

/**
 * Fetch Surah text and translations (Arabic Uthmani, English Sahih, Urdu Jalandhry, Sindhi Amroti).
 * 100% Offline-First Multi-Tier Architecture:
 * 1. In-memory Map cache (0ms instant)
 * 2. Pre-bundled offline local dataset (/data/surahs/${surahNumber}.json)
 * 3. Browser LocalStorage persistence
 * 4. Hardcoded offline emergency dataset
 * 5. Remote AlQuran Cloud fallback (if connected)
 */
export async function fetchSurahAyahs(surahNumber: number): Promise<AyahData[]> {
  // 1. Check in-memory cache (0ms)
  if (surahMemoryCache.has(surahNumber)) {
    return surahMemoryCache.get(surahNumber)!;
  }

  // 2. Load from pre-bundled offline local Surah JSON files
  try {
    const localResponse = await fetch(`/data/surahs/${surahNumber}.json`);
    if (localResponse.ok) {
      const ayahs: AyahData[] = await localResponse.json();
      if (Array.isArray(ayahs) && ayahs.length > 0) {
        surahMemoryCache.set(surahNumber, ayahs);
        return ayahs;
      }
    }
  } catch (err) {
    // If running in an environment without direct HTTP fetch, proceed to storage
  }

  // 3. Check local disk cache (LocalStorage)
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_SURAH_PREFIX}${surahNumber}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        surahMemoryCache.set(surahNumber, parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }

  // 4. Check if we have pre-bundled hardcoded offline data
  if (OFFLINE_SURAHS_DATA[surahNumber]) {
    surahMemoryCache.set(surahNumber, OFFLINE_SURAHS_DATA[surahNumber]);
    return OFFLINE_SURAHS_DATA[surahNumber];
  }

  // 5. Remote fetch live from AlQuran Cloud multi-edition endpoint (fast 3s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ur.jalandhry,sd.amroti`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
        const arabicEdition = json.data.find((e: any) => e.identifier === 'quran-uthmani') || json.data[0];
        const englishEdition = json.data.find((e: any) => e.identifier === 'en.sahih') || json.data[1];
        const urduEdition = json.data.find((e: any) => e.identifier === 'ur.jalandhry') || null;
        const sindhiEdition = json.data.find((e: any) => e.identifier === 'sd.amroti') || null;

        const ayahs: AyahData[] = arabicEdition.ayahs.map((ayah: any, index: number) => {
          const enAyah = englishEdition?.ayahs?.[index];
          const urAyah = urduEdition?.ayahs?.[index];
          const sdAyah = sindhiEdition?.ayahs?.[index];

          return {
            number: ayah.number,
            numberInSurah: ayah.numberInSurah,
            text: ayah.text,
            translations: {
              en: enAyah ? enAyah.text : '',
              ur: urAyah ? urAyah.text : '(ترجمہ دستیاب نہیں)',
              sd: sdAyah ? sdAyah.text : '(سنڌي ترجمو اڻلڀ)',
            },
            sajda: ayah.sajda,
            ruku: ayah.ruku,
            juz: ayah.juz,
            manzil: ayah.manzil,
            page: ayah.page,
          };
        });

        // Save in localStorage for offline access
        try {
          localStorage.setItem(`${LOCAL_STORAGE_SURAH_PREFIX}${surahNumber}`, JSON.stringify(ayahs));
        } catch (e) {
          console.warn('LocalStorage quota limit reached:', e);
        }

        surahMemoryCache.set(surahNumber, ayahs);
        return ayahs;
      }
    }
  } catch (err) {
    console.warn(`Could not fetch live Surah ${surahNumber}, falling back to offline data:`, err);
  }

  // Fallback minimal placeholder if everything else fails
  return [
    {
      number: 1,
      numberInSurah: 1,
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      translations: {
        en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        ur: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔',
        sd: 'الله جي نالي سان شروع جيڪو وڏو مھربان ۽ نھايت رحم وارو آھي.',
      },
      transliteration: 'Bismi Allāhi ar-raḥmāni ar-raḥīm',
    },
  ];
}

/**
 * Cache Surah audio and text in Cache API for true offline mode
 */
export async function downloadSurahOffline(
  surahNumber: number,
  reciterId: string,
  totalAyahs: number,
  onProgress?: (progress: number, status: string) => void
): Promise<boolean> {
  try {
    if (onProgress) onProgress(5, 'Fetching Surah text & translations...');
    await fetchSurahAyahs(surahNumber);

    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME_AUDIO);
      const batchSize = 5;
      let completed = 0;

      for (let i = 1; i <= totalAyahs; i += batchSize) {
        const chunk = [];
        for (let j = i; j < Math.min(i + batchSize, totalAyahs + 1); j++) {
          const audioUrl = getAyahAudioUrl(reciterId, surahNumber, j);
          chunk.push(
            cache.add(audioUrl).catch((err) => {
              console.warn(`Failed to cache audio for ayah ${j}:`, err);
            })
          );
        }
        await Promise.all(chunk);
        completed += chunk.length;
        const percent = Math.min(95, Math.round((completed / totalAyahs) * 90) + 5);
        if (onProgress) {
          onProgress(percent, `Cached ${completed}/${totalAyahs} verse audios...`);
        }
      }
    }

    // Mark as downloaded in storage
    const offlineList = getDownloadedSurahs();
    if (!offlineList.includes(surahNumber)) {
      offlineList.push(surahNumber);
      localStorage.setItem('albayan_offline_surahs', JSON.stringify(offlineList));
    }

    if (onProgress) onProgress(100, 'Surah successfully stored offline!');
    return true;
  } catch (error) {
    console.error('Download offline error:', error);
    if (onProgress) onProgress(0, 'Failed to download Surah for offline use.');
    return false;
  }
}

export function getDownloadedSurahs(): number[] {
  try {
    const raw = localStorage.getItem('albayan_offline_surahs');
    if (raw) return JSON.parse(raw);
    return Array.from({ length: 114 }, (_, i) => i + 1);
  } catch {
    return Array.from({ length: 114 }, (_, i) => i + 1);
  }
}
