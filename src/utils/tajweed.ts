export interface TajweedRuleInfo {
  id: string;
  name: string;
  arabicName: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  description: string;
  letters: string;
  example: string;
}

export const TAJWEED_RULES: TajweedRuleInfo[] = [
  {
    id: 'ghunnah',
    name: 'Ghunnah (Nasalization)',
    arabicName: 'غنة',
    colorClass: 'text-emerald-400 font-semibold',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
    description: 'Nasal resonance held for 2 harakahs when Noon (نّ) or Meem (مّ) carries a Shaddah.',
    letters: 'نّ ، مّ',
    example: 'إِنَّا ، ثُمَّ',
  },
  {
    id: 'qalqalah',
    name: 'Qalqalah (Echo / Bouncing)',
    arabicName: 'قلقلة',
    colorClass: 'text-rose-400 font-semibold',
    bgClass: 'bg-rose-500/15',
    borderClass: 'border-rose-500/30',
    description: 'An echoing or bouncing sound when the five letters of (ق ط ب ج د) carry a Sukoon or are stopped upon.',
    letters: 'ق ، ط ، ب ، ج ، د (قطب جد)',
    example: 'أَحَدْ ، الْفَلَقْ ، تَبَّتْ يَدَا أَبِي لَهَبٍ',
  },
  {
    id: 'ikhfa',
    name: 'Ikhfa (Concealment)',
    arabicName: 'إخفاء',
    colorClass: 'text-amber-400 font-semibold',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/30',
    description: 'Concealing the Noon Saakin or Tanween between Izhar and Idgham with a slight nasalization.',
    letters: 'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك',
    example: 'مِنْ قَبْلُ ، أَنْفُسَكُمْ',
  },
  {
    id: 'idgham',
    name: 'Idgham (Merging)',
    arabicName: 'إدغام',
    colorClass: 'text-sky-400 font-semibold',
    bgClass: 'bg-sky-500/15',
    borderClass: 'border-sky-500/30',
    description: 'Merging Noon Saakin or Tanween into the next letter with or without Ghunnah.',
    letters: 'ي ، ر ، م ، ل ، و ، ن (يرملون)',
    example: 'مَنْ يَقُولُ ، مِنْ رَبِّهِمْ',
  },
  {
    id: 'madd',
    name: 'Madd (Prolongation)',
    arabicName: 'مدّ',
    colorClass: 'text-purple-400 font-semibold',
    bgClass: 'bg-purple-500/15',
    borderClass: 'border-purple-500/30',
    description: 'Prolonging the vowel sound from 4 to 6 harakahs when followed by Hamzah or Sukoon/Shaddah.',
    letters: 'آ ، ۤ ، ۧ ، وا ، يا',
    example: 'السَّمَاءِ ، الضَّالِّينَ',
  },
  {
    id: 'iqlab',
    name: 'Iqlab (Conversion)',
    arabicName: 'إقلاب',
    colorClass: 'text-teal-400 font-semibold',
    bgClass: 'bg-teal-500/15',
    borderClass: 'border-teal-500/30',
    description: 'Changing Noon Saakin or Tanween into a hidden Meem when followed by Baa (ب).',
    letters: 'نْ + ب -> م (ۢ)',
    example: 'مِنْ بَعْدِ -> مِمْ بَعْدِ',
  },
];

export interface TajweedToken {
  text: string;
  rule?: 'ghunnah' | 'qalqalah' | 'ikhfa' | 'idgham' | 'madd' | 'iqlab';
}

// In-memory cache to prevent repetitive CPU-intensive re-tokenization
const tajweedTokenCache = new Map<string, TajweedToken[]>();

/**
 * Intelligent tokenizer that tags segments of Arabic Quranic text with their Tajweed rule.
 * Uses high-speed memory caching for sub-millisecond lookups.
 */
export function tokenizeTajweed(text: string): TajweedToken[] {
  if (!text) return [];
  if (tajweedTokenCache.has(text)) {
    return tajweedTokenCache.get(text)!;
  }

  const tokens: TajweedToken[] = [];
  let buffer = '';

  // Helper to flush plain buffer
  const flushPlain = () => {
    if (buffer) {
      tokens.push({ text: buffer });
      buffer = '';
    }
  };

  const len = text.length;
  let i = 0;

  while (i < len) {
    const char = text[i];
    const nextChar = i + 1 < len ? text[i + 1] : '';
    const nextNextChar = i + 2 < len ? text[i + 2] : '';

    // Check Madd sign (Maddah ~ / ٓ / ۤ)
    if (char === '\u0653' || char === '\u06E1' || char === 'آ' || char === 'ۤ') {
      flushPlain();
      tokens.push({ text: char, rule: 'madd' });
      i++;
      continue;
    }

    // Check Iqlab (small high meem ۢ \u06E2 or ۭ \u06ED)
    if (char === '\u06E2' || char === '\u06ED') {
      flushPlain();
      tokens.push({ text: char, rule: 'iqlab' });
      i++;
      continue;
    }

    // Check Ghunnah: Noon or Meem followed by Shaddah (ّ \u0651)
    if ((char === 'ن' || char === 'م') && nextChar === '\u0651') {
      flushPlain();
      tokens.push({ text: char + nextChar, rule: 'ghunnah' });
      i += 2;
      continue;
    }

    // Check Qalqalah: letters ق, ط, ب, ج, د when followed by Sukoon (ْ \u0652)
    if ('قطبجد'.includes(char) && nextChar === '\u0652') {
      flushPlain();
      tokens.push({ text: char + nextChar, rule: 'qalqalah' });
      i += 2;
      continue;
    }

    // Check Idgham: Tanween or Noon Saakin before يرملون
    if (
      (char === 'ن' && nextChar === '\u0652') ||
      char === '\u064B' || // Fathatan
      char === '\u064C' || // Dammatan
      char === '\u064D' // Kasratan
    ) {
      // Look ahead for whitespace and next letter
      let lookIdx = i + 1;
      if (char === 'ن') lookIdx = i + 2;
      while (lookIdx < len && text[lookIdx] === ' ') lookIdx++;

      if (lookIdx < len) {
        const targetLetter = text[lookIdx];
        if ('يرملون'.includes(targetLetter)) {
          flushPlain();
          const chunk = text.slice(i, lookIdx + 1);
          tokens.push({ text: chunk, rule: 'idgham' });
          i = lookIdx + 1;
          continue;
        } else if ('تثجدذزسشصضطظفقك'.includes(targetLetter)) {
          flushPlain();
          const chunk = text.slice(i, lookIdx + 1);
          tokens.push({ text: chunk, rule: 'ikhfa' });
          i = lookIdx + 1;
          continue;
        }
      }
    }

    buffer += char;
    i++;
  }

  flushPlain();
  tajweedTokenCache.set(text, tokens);
  return tokens;
}
