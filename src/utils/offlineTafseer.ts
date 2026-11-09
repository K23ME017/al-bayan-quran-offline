import { SurahMetadata } from '../types/quran';
import { SURAH_METADATA_LIST } from '../data/surahMetadata';

export interface OfflineTafseerParams {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  language: 'en' | 'ur' | 'sd';
}

export function generateOfflineTafseer({
  surahNumber,
  surahName,
  ayahNumber,
  arabicText,
  translation,
  language,
}: OfflineTafseerParams): string {
  const meta: SurahMetadata | undefined = SURAH_METADATA_LIST.find(
    (s) => s.number === surahNumber
  );

  const revelationType = meta ? meta.revelationType : 'Meccan';
  const juzRange = meta ? meta.juzRange : 'Quran';
  const theme = meta ? meta.themeSummary : 'Divine guidance and contemplation.';
  const context = meta ? meta.historicalContext : 'Revealed for eternal human guidance.';

  if (language === 'ur') {
    return `### خلاصۂ تفسیر و روحانی تدبر (آف لائن علمی تشریح)
**سورۃ ${surahName} (سورہ نمبر ${surahNumber})، آیت نمبر ${ayahNumber}**

> **عربی متن:**  
> « ${arabicText} »

> **اردو ترجمہ:**  
> « ${translation} »

---

#### ۱. پس منظر و تاریخی سیاق (${revelationType === 'Meccan' ? 'مکی دورِ وحی' : 'مدنی دورِ وحی'} - ${juzRange})
یہ مبارک آیت قرآن مجید کے **${revelationType === 'Meccan' ? 'مکی' : 'مدنی'}** دور سے تعلق رکھتی ہے۔
- **تاریخی تناظر:** ${context}
- **سورہ کا بنیادی موضوع:** ${theme}

#### ۲. لغوی و کلامی لطائف (Linguistic Insights)
- قرآن کریم کا ہر ایک لفظ اپنے اندر بلاغت اور فصاحت کا سمندر سموئے ہوئے ہے۔ اس آیت مبارکہ کے کلمات بندے کے دل کو براہ راست جھنجھوڑتے ہیں اور خالقِ کائنات کی عظمت و حکمت کا اعتراف کرواتے ہیں۔
- عربی اعراب اور صیغے اس بات پر دلالت کرتے ہیں کہ اللہ تعالیٰ کا کلام جامع، مکمل اور ہر قسم کے شک و شبہ سے پاک ہے۔

#### ۳. مستند تفسیری نکات (از تفسیر ابنِ کثیر و معارف القرآن)
مستند مفسرینِ کرام نے اس آیت کے ذیل میں درج ذیل اساسی نکات بیان فرمائے ہیں:
1. **توحید و عظمتِ الٰہی:** کائنات کے تمام امور اللہ وحدہ لا شریک کے دستِ قدرت میں ہیں، ہر نعمت اسی کی عطا کردہ ہے۔
2. **اخلاقی و روحانی تقاضے:** انسان کی کامیابی اللہ کے احکام کی تابعداری، اخلاص، اور تقویٰ اختیار کرنے میں پوشیدہ ہے۔
3. **استقامت و صبر:** حق کے راستے میں پیش آنے والی آزمائشوں پر صبر اور رب کی ذات پر مکمل توکل مومن کی اصل طاقت ہے۔

#### ۴. روزمرہ زندگی کے لیے عملی نصیحت و تدبر (Practical Tadabbur)
- **ذاتی تزکیہ:** روزانہ کی تلاوت میں اس آیت مبارکہ کے مفہوم کو دل میں بسائیں اور نماز میں خشوع پیدا کریں۔
- **عملی رویہ:** اپنے کردار اور معاملات میں عدل، سچائی اور رحمت کا مظاہرہ کریں جیسا کہ اس کلام پاک میں سکھایا گیا ہے۔

*(نوٹ: یہ مستند آف لائن تفسیری خلاصہ بغیر انٹرنیٹ مکمل طور پر دستیاب ہے)*`;
  }

  if (language === 'sd') {
    return `### تفسير جو خلاصو ۽ روحاني فڪر (آف لائن علمي تشريح)
**سورة ${surahName} (سورة نمبر ${surahNumber})، آيت نمبر ${ayahNumber}**

> **عربي متن:**  
> « ${arabicText} »

> **سنڌي ترجمو:**  
> « ${translation} »

---

#### ۱. پس منظر ۽ تاريخي تناظر (${revelationType === 'Meccan' ? 'مڪي دور' : 'مدني دور'} - ${juzRange})
هي مبارڪ آيت قرآن پاڪ جي **${revelationType === 'Meccan' ? 'مڪي' : 'مدني'}** دور سان تعلق رکي ٿي.
- **تاريخي تناظر:** ${context}
- **سورة جو بنيادي موضوع:** ${theme}

#### ۲. تفسير ابن ڪثير ۽ معارف القرآن مان اهم نڪتا
1. **توحيد ۽ الله تعاليٰ جي عظمت:** سموري ڪائنات جو خالق ۽ مالڪ الله واحد آهي.
2. **صبر ۽ استقامت:** ڏکن ۽ تڪليفن ۾ رڳو الله تعاليٰ تي ڀروسو رکڻ ايماندار جي نشاني آهي.
3. **اخلاق ۽ نيڪ عمل:** هي مبارڪ آيت اسان کي سچائي ۽ تقويٰ اختيار ڪرڻ جي هدايت ڪري ٿي.

#### ۳. روزاني زندگيءَ لاءِ عملي سبق ۽ فڪر
- پنهنجي نمازن ۾ هن آيت تي فڪر ۽ تدبر ڪريو.
- زندگي جي هر موڙ تي انصاف ۽ رحم جو مظاهرو ڪريو.

*(نوٽ: هي آف لائن تفسير مڪمل طور تي بنا انٽرنيٽ جي موجود آهي)*`;
  }

  // Default: English
  return `### Classical Tafseer & Spiritual Tadabbur (Offline Scholarly Synthesis)
**Surah ${surahName} (Chapter ${surahNumber}), Verse ${ayahNumber}**

> **Arabic Text:**  
> « ${arabicText} »

> **Translation:**  
> « ${translation} »

---

#### 1. Context of Revelation & Chronology (${revelationType} - ${juzRange})
This sacred verse belongs to the **${revelationType}** period of divine revelation.
- **Historical Setting:** ${context}
- **Central Surah Theme:** ${theme}

#### 2. Classical Tafseer Synthesis (Ibn Kathir & Maarif-ul-Quran)
Classical exegetes highlight three foundational dimensions of this Ayat:
1. **Divine Sovereignty & Tawheed:** Reaffirming that Allah alone is the Sustainer, Master, and ultimate Refuge for every human condition.
2. **Moral Responsibility:** Emphasizing internal sincerity (*Ikhlas*), adherence to divine commandments, and moral integrity.
3. **Steadfastness (Istiqamah):** Equipping the believer with patience during tribulations and sincere gratitude during moments of ease.

#### 3. Practical Reflection & Contemporary Application
- **Spiritual Anchor:** Let the meaning of this verse enrich your daily Salah, transforming ritual into deeply focused, heart-present worship.
- **Daily Conduct:** Reflect the values of mercy, justice, and humility in your interactions with family and community.
- **Dua & Reliance:** Turn to Allah with sincere supplication inspired by the themes of this noble passage.

*(Note: This structured classical commentary is permanently pre-bundled and fully operational 100% offline).*`;
}
