import { SURAH_METADATA_LIST } from '../data/surahMetadata';

export interface OfflineAIChatResponse {
  reply: string;
  isOffline: boolean;
}

export function generateOfflineAIResponse(
  query: string,
  userLanguage: 'en' | 'ur' | 'sd',
  surahContext?: { number: number; name: string; englishName: string } | null
): OfflineAIChatResponse {
  const qLower = query.toLowerCase().trim();

  // 1. Check if user asked about a specific Surah
  let matchedSurah = null;
  if (surahContext) {
    matchedSurah = SURAH_METADATA_LIST.find((s) => s.number === surahContext.number);
  }

  if (!matchedSurah) {
    matchedSurah = SURAH_METADATA_LIST.find((s) => {
      const matchNum = qLower.match(/\b(\d+)\b/);
      if (matchNum && parseInt(matchNum[1], 10) === s.number) return true;
      return (
        qLower.includes(s.englishName.toLowerCase()) ||
        qLower.includes(s.name.replace(/[^\u0621-\u064A]/g, '')) ||
        (s.urduName && qLower.includes(s.urduName)) ||
        (s.sindhiName && qLower.includes(s.sindhiName))
      );
    });
  }

  if (matchedSurah) {
    if (userLanguage === 'ur') {
      return {
        reply: `### سورۃ ${matchedSurah.name} (${matchedSurah.englishName}) - آف لائن جامع رہنمائی
- **ترتیبِ نزول:** نمبر ${matchedSurah.number} | **مقامِ نزول:** ${matchedSurah.revelationType === 'Meccan' ? 'مکی دور' : 'مدنی دور'}
- **آیات کی تعداد:** ${matchedSurah.numberOfAyahs} | **رکوعات:** ${matchedSurah.rukus} | **پارہ:** ${matchedSurah.juzRange}

#### مرکزی پیغام اور موضوعات:
${matchedSurah.themeSummary}

#### تاریخی پس منظر:
${matchedSurah.historicalContext}

💡 *آپ اس سورہ کی تمام آیات کا عربی متن، اردو و سندھی ترجمہ اور تفسیری نوٹس آف لائن ریڈر میں بغیر انٹرنیٹ پڑھ اور سن سکتے ہیں۔*`,
        isOffline: true,
      };
    }

    if (userLanguage === 'sd') {
      return {
        reply: `### سورة ${matchedSurah.name} (${matchedSurah.englishName}) - آف لائن معلومات
- **سورة نمبر:** ${matchedSurah.number} | **نزول:** ${matchedSurah.revelationType === 'Meccan' ? 'مڪي' : 'مدني'}
- **آيتن جو تعداد:** ${matchedSurah.numberOfAyahs} | **سيپارو:** ${matchedSurah.juzRange}

#### بنيادي موضوع:
${matchedSurah.themeSummary}

#### تاريخي پس منظر:
${matchedSurah.historicalContext}`,
        isOffline: true,
      };
    }

    return {
      reply: `### Surah ${matchedSurah.englishName} (${matchedSurah.name}) - Scholarly Profile
- **Chapter Number:** ${matchedSurah.number} | **Revelation Type:** ${matchedSurah.revelationType}
- **Verses (Ayahs):** ${matchedSurah.numberOfAyahs} | **Rukus:** ${matchedSurah.rukus} | **Juz:** ${matchedSurah.juzRange}

#### Central Themes & Divine Guidance:
${matchedSurah.themeSummary}

#### Historical Revelation Context:
${matchedSurah.historicalContext}

💡 *You can read all verses of this Surah with English, Urdu, and Sindhi translations and audio fully offline in the Quran Reader.*`,
      isOffline: true,
    };
  }

  // 2. Thematic topics: Sabr, Tawheed, Dua, Parents, Repentance, Prayer
  if (qLower.includes('sabr') || qLower.includes('patience') || qLower.includes('صبر')) {
    if (userLanguage === 'ur') {
      return {
        reply: `### قرآن مجید میں صبر کی فضیلت اور تعلیمات
قرآن پاک میں صبر کا ذکر ۹۰ سے زائد مقامات پر آیا ہے، جو اس کی عظیم فضیلت کا ثبوت ہے۔

1. **اللہ تعالیٰ کا صبر کرنے والوں کے ساتھ ہونا:**
   « إِنَّ اللَّهَ مَعَ الصَّابِرِينَ » (البقرہ: ۱۵۳)  
   *بے شک اللہ صبر کرنے والوں کے ساتھ ہے۔*

2. **بے حساب اجر:**
   « إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ » (الزمر: ۱۰)  
   *صبر کرنے والوں کو ان کا بدلہ بغیر حساب کے دیا جائے گا۔*

3. **عملی رہنمائی:**
   - صبر کا مطلب محض خاموشی نہیں، بلکہ آزمائش کے وقت استقامت، گناہوں سے بچنا، اور احکامِ الٰہی پر جمے رہنا ہے۔
   - مشکل کے وقت نماز اور استغفار کے ذریعے اللہ سے مدد طلب کریں۔`,
        isOffline: true,
      };
    }
    return {
      reply: `### Virtue and Guidance on Patience (Sabr) in the Quran
Patience (*Sabr*) is highlighted over 90 times throughout the Noble Quran as a cornerstone of faith.

1. **Divine Companion:**
   « إِنَّ اللَّهَ مَعَ الصَّابِرِينَ » (Al-Baqarah 2:153)  
   *"Indeed, Allah is with the patient."*

2. **Unlimited Reward:**
   « إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ » (Az-Zumar 39:10)  
   *"Only those who are patient will be given their reward without account."*

3. **Dimensions of Sabr:**
   - **Patience in obedience:** Remaining steadfast in prayers and righteous deeds.
   - **Patience against sin:** Restraining oneself from forbidden desires.
   - **Patience in trials:** Accepting divine decree with trust (*Tawakkul*) and gratitude.`,
      isOffline: true,
    };
  }

  if (qLower.includes('dua') || qLower.includes('prayer') || qLower.includes('دعا')) {
    if (userLanguage === 'ur') {
      return {
        reply: `### دعا کی فضیلت اور قرآنی دعائیں
اللہ تعالیٰ اپنے بندوں کی دعاؤں کو سننے والا اور قبول فرمانے والا ہے:

« وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ » (غافر: ۶۰)  
*اور تمہارے رب نے فرمایا: مجھ سے دعا مانگو، میں تمہاری دعا قبول کروں گا۔*

#### جامع قرآنی دعائیں:
1. **دنیا و آخرت کی بھلائی کے لیے:**  
   « رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ » (البقرہ: ۲۰۱)
2. **علم میں اضافے کے لیے:**  
   « رَّبِّ زِدْنِي عِلْمًا » (طٰہٰ: ۱۱۴)
3. **گناہوں کی بخشش کے لیے:**  
   « رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ » (ابراہیم: ۴۱)`,
        isOffline: true,
      };
    }
    return {
      reply: `### The Essence and Etiquette of Supplication (Dua)
Allah invites believers directly to call upon Him:

« وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ » (Ghafir 40:60)  
*"And your Lord says: 'Call upon Me; I will respond to you.'"*

#### Essential Quranic Supplications:
1. **For Goodness in Both Worlds:**  
   « رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ » (Al-Baqarah 2:201)
2. **For Knowledge & Wisdom:**  
   « رَّبِّ زِدْنِي عِلْمًا » (Ta-Ha 20:114)
3. **For Parents and Believers:**  
   « رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ » (Ibrahim 14:41)`,
      isOffline: true,
    };
  }

  // 3. General Islamic Guidance & Introduction
  if (userLanguage === 'ur') {
    return {
      reply: `السلام علیکم و رحمتہ اللہ و برکاتہ!
میں **البیان اسسٹنٹ** ہوں اور اس وقت **آف لائن موڈ** میں آپ کی خدمت کے لیے تیار ہوں۔

آپ مجھ سے درج ذیل موضوعات پر رہنمائی حاصل کر سکتے ہیں:
1. **قرآن مجید کی تمام ۱۱۴ سورتوں کے نام، مکی/مدنی پس منظر، آیات اور فضائل**
2. **قرآنی اخلاقیات و موضوعات:** صبر، شکر، توکل، توبہ، والدین کا احترام، اخلاص
3. **مسنون اور قرآنی دعائیں**

*(آپ اوپر دیے گئے کسی بھی موضوع پر سوال لکھیں یا سورت کا نام درج کریں)*`,
      isOffline: true,
    };
  }

  if (userLanguage === 'sd') {
    return {
      reply: `السلام عليڪم ورحمة الله!
مان **البيان آف لائن اسسٽنٽ** آهيان. توهان بنا انٽرنيٽ جي قرآن پاڪ جي سڀني ۱۱۴ سورتن، مڪي/مدني پس منظر ۽ روحاني هدايتن بابت ڄاڻ حاصل ڪري سگهو ٿا.`,
      isOffline: true,
    };
  }

  return {
    reply: `Assalamu Alaikum wa Rahmatullah!
I am **Al-Bayan AI Assistant**, currently running in **Offline Mode** to provide uninterrupted Quranic reflections and scholarly knowledge without requiring an internet connection.

You can ask me about:
1. **Any of the 114 Surahs:** Themes, historical revelation contexts (Makki/Madani), verse counts, and key teachings.
2. **Quranic Values & Ethics:** Patience (*Sabr*), Gratitude (*Shukr*), Tawheed, Trust in God (*Tawakkul*), Honesty, and Kindness.
3. **Quranic Supplications (Duas):** Beautiful prayers preserved in the sacred text.

*Feel free to ask a question or explore any Surah in detail.*`,
    isOffline: true,
  };
}
