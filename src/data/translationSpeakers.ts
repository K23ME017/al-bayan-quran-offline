import { TranslationSpeaker } from '../types/quran';

export const TRANSLATION_SPEAKERS: TranslationSpeaker[] = [
  // Urdu Speakers
  {
    id: 'ur_shamshad',
    name: 'Shamshad Ali Khan',
    language: 'ur',
    scholarOrNarrator: 'Maulana Fateh Muhammad Jalandhry Translation',
    gender: 'male',
    style: 'Classic Reverent Voice (EveryAyah CDN)',
    baseUrl: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/',
    provider: 'everyayah',
  },
  {
    id: 'ur_farhat',
    name: 'Dr. Farhat Hashmi',
    language: 'ur',
    scholarOrNarrator: 'Taleem-ul-Quran Translation',
    gender: 'female',
    style: 'Articulate Female Scholar Voice',
    baseUrl: 'https://everyayah.com/data/translations/urdu_farhat_hashmi/',
    provider: 'cdn',
  },
  {
    id: 'ur_jawadi',
    name: 'Allama Zeeshan Haider Jawadi',
    language: 'ur',
    scholarOrNarrator: 'Anwar-ul-Quran Translation',
    gender: 'male',
    style: 'Measured Scholarly Tone',
    baseUrl: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/',
    provider: 'cdn',
  },
  {
    id: 'ur_studio',
    name: 'Qari Muhammad Ibrahim (Urdu)',
    language: 'ur',
    scholarOrNarrator: 'Contemporary Clear Urdu Narration',
    gender: 'male',
    style: 'Modern Studio Narration',
    baseUrl: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/',
    provider: 'cdn',
  },

  // English Speakers
  {
    id: 'en_ibrahim',
    name: 'Ibrahim Walk',
    language: 'en',
    scholarOrNarrator: 'Saheeh International Translation',
    gender: 'male',
    style: 'Clear American Resonance (EveryAyah CDN)',
    baseUrl: 'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps/',
    provider: 'everyayah',
  },
  {
    id: 'en_khattab',
    name: 'The Clear Quran (Dr. Mustafa Khattab)',
    language: 'en',
    scholarOrNarrator: 'Dr. Mustafa Khattab Thematic Translation',
    gender: 'male',
    style: 'Contemporary Fluent English Speaker',
    baseUrl: 'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps/',
    provider: 'cdn',
  },
  {
    id: 'en_sarah',
    name: 'Sister Sarah Jenkins',
    language: 'en',
    scholarOrNarrator: 'Gentle British English Narration',
    gender: 'female',
    style: 'Gentle, Calm Female Voice',
    baseUrl: 'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps/',
    provider: 'tts',
  },
  {
    id: 'en_guy_eaton',
    name: 'Guy Eaton',
    language: 'en',
    scholarOrNarrator: 'Marmaduke Pickthall Translation',
    gender: 'male',
    style: 'Classical Orator Style',
    baseUrl: 'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps/',
    provider: 'cdn',
  },

  // Sindhi Speakers
  {
    id: 'sd_qasmi',
    name: 'Allama Ghulam Mustafa Qasmi',
    language: 'sd',
    scholarOrNarrator: 'Classical Sindhi Translation',
    gender: 'male',
    style: 'Traditional Sindhi Scholar Tone (علامہ غلام مصطفيٰ قاسمي)',
    baseUrl: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/',
    provider: 'cdn',
  },
  {
    id: 'sd_amroti',
    name: 'Maulana Taj Mehmood Amroti Reciter',
    language: 'sd',
    scholarOrNarrator: 'Maulana Taj Mehmood Amroti (مولانا تاج محمود امروٽي)',
    gender: 'male',
    style: 'Classic Sindhi Translation Voice',
    baseUrl: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/',
    provider: 'cdn',
  },
  {
    id: 'sd_regional',
    name: 'Regional Sindhi Voice (Hyderabad / Sukkur)',
    language: 'sd',
    scholarOrNarrator: 'Contemporary Sindhi Dialect Narration',
    gender: 'male',
    style: 'Natural Contemporary Sindhi Speaker',
    baseUrl: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/',
    provider: 'tts',
  },
];

export const DEFAULT_TRANSLATION_SPEAKER_ID = 'ur_shamshad';

export function getTranslationSpeakerAudioUrl(speakerId: string, surahNumber: number, ayahNumber: number): string {
  const speaker = TRANSLATION_SPEAKERS.find((s) => s.id === speakerId) || TRANSLATION_SPEAKERS[0];
  const pad = (n: number) => n.toString().padStart(3, '0');
  const filename = `${pad(surahNumber)}${pad(ayahNumber)}.mp3`;
  return `${speaker.baseUrl}${filename}`;
}
