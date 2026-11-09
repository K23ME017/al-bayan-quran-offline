import { Reciter } from '../types/quran';

export const RECITERS_LIST: Reciter[] = [
  {
    id: 'Alafasy_128kbps',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري بن راشد العفاسي',
    style: 'Murattal (Melodious & Clear)',
    baseUrl: 'https://everyayah.com/data/Alafasy_128kbps/',
    audioType: 'arabic_recitation',
    language: 'ar',
  },
  {
    id: 'Abdurrahmaan_As-Sudais_192kbps',
    name: 'Abdul Rahman Al-Sudais',
    arabicName: 'عبد الرحمن السديس',
    style: 'Imam of Masjid al-Haram, Makkah',
    baseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/',
    audioType: 'arabic_recitation',
    language: 'ar',
  },
  {
    id: 'MaherAlMuaiqly128kbps',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    style: 'Imam of Masjid al-Haram, Makkah',
    baseUrl: 'https://everyayah.com/data/MaherAlMuaiqly128kbps/',
    audioType: 'arabic_recitation',
    language: 'ar',
  },
  {
    id: 'Ghamadi_40kbps',
    name: 'Saad Al-Ghamdi',
    arabicName: 'سعد الغامدي',
    style: 'Warm, Calm & Measured',
    baseUrl: 'https://everyayah.com/data/Ghamadi_40kbps/',
    audioType: 'arabic_recitation',
    language: 'ar',
  },
  {
    id: 'Abu_Bakr_Ash-Shaatree_128kbps',
    name: 'Abu Bakr Ash-Shatri',
    arabicName: 'أبو بكر الشاطري',
    style: 'Vibrant & Resonant',
    baseUrl: 'https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/',
    audioType: 'arabic_recitation',
    language: 'ar',
  },
  {
    id: 'Yasser_Ad-Dussary_128kbps',
    name: 'Yasser Ad-Dussary',
    arabicName: 'ياسر الدوسري',
    style: 'Passionate & Powerful',
    baseUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/',
    audioType: 'arabic_recitation',
    language: 'ar',
  },
  {
    id: 'Urdu_Shamshad_Ali_Khan_46kbps',
    name: 'Shamshad Ali Khan (Urdu Voice)',
    arabicName: 'شمشاد علي خان (اردو ترجمہ آواز)',
    style: 'Urdu Translation Audio (Ayat-by-Ayat)',
    baseUrl: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/',
    audioType: 'urdu_translation',
    language: 'ur',
  },
  {
    id: 'Ibrahim_Walk_192kbps',
    name: 'Ibrahim Walk (English Voice)',
    arabicName: 'ابراهيم والك (ترجمة صوتية بالإنجليزية)',
    style: 'English Translation Audio (Ayat-by-Ayat)',
    baseUrl: 'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps/',
    audioType: 'english_translation',
    language: 'en',
  },
];

export const DEFAULT_RECITER_ID = 'Alafasy_128kbps';

export function pad3(num: number): string {
  return num.toString().padStart(3, '0');
}

export function getAyahAudioUrl(reciterId: string, surahNumber: number, ayahNumber: number): string {
  const reciter = RECITERS_LIST.find((r) => r.id === reciterId) || RECITERS_LIST[0];
  const filename = `${pad3(surahNumber)}${pad3(ayahNumber)}.mp3`;
  return `${reciter.baseUrl}${filename}`;
}
