import { SURAH_METADATA_LIST } from '../data/surahMetadata';
import { SmartSearchResult } from '../types/quran';

interface CuratedTheme {
  keywords: string[];
  interpretation: { en: string; ur: string; sd: string };
  wisdom: { en: string; ur: string; sd: string };
  surahs: { number: number; reason: string }[];
  ayats: {
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    arabic: string;
    english: string;
    urdu: string;
    sindhi: string;
    relevance: string;
  }[];
}

const CURATED_THEMES: CuratedTheme[] = [
  {
    keywords: [
      'patience', 'sabr', 'trial', 'hardship', 'grief', 'pain', 'suffering', 'trouble', 'difficulty',
      'صبر', 'آزمائش', 'تکلیف', 'مصیبت', 'پریشانی', 'ڏک', 'مشڪل', 'صبر و شڪر'
    ],
    interpretation: {
      en: 'Quranic wisdom on enduring hardship with patience (Sabr) and seeking divine strength.',
      ur: 'مشکلات اور آزمائشوں میں صبر و استقامت اور اللہ سے مدد طلب کرنے کی رہنمائی۔',
      sd: 'ڏکن ۽ آزمائشن ۾ صبر ۽ استقامت سان الله پاڪ مان مدد گھرڻ بابت قرآني ھدايت.',
    },
    wisdom: {
      en: 'The Holy Quran reminds us that tests are an inescapable path to spiritual elevation, and divine relief is always paired with hardship.',
      ur: 'قرآن کریم فرماتا ہے کہ ہر تنگی کے ساتھ آسانی ہے اور اللہ صبر کرنے والوں کا ہم قدم اور حامی و ناصر ہے۔',
      sd: 'قرآن پاڪ ٻڌائي ٿو ته ھر ڏکيائيءَ کان پوءِ سؤلائي ايندي آھي ۽ الله تعاليٰ صبر ڪندڙن سان گڏ آھي.',
    },
    surahs: [
      { number: 2, reason: 'Contains the direct commandment to seek help through patience and prayer (2:153).' },
      { number: 94, reason: 'Reassures believers that every hardship is accompanied by relief (94:5-6).' },
      { number: 103, reason: 'Identifies mutual counsel to truth and patience as the antidote to human loss.' }
    ],
    ayats: [
      {
        surahNumber: 2,
        ayahNumber: 153,
        surahName: 'Al-Baqarah',
        arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
        english: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.',
        urdu: 'اے ایمان والو! صبر اور نماز کے ذریعے مدد چاہو۔ بیشک اللہ صبر کرنے والوں کے ساتھ ہے۔',
        sindhi: 'اي ايمان وارئو! صبر ۽ نماز سان مدد طلب ڪريو، بيشڪ الله صبر ڪندڙن سان گڏ آھي.',
        relevance: 'Direct divine formula for strength and spiritual composure during trials.'
      },
      {
        surahNumber: 94,
        ayahNumber: 6,
        surahName: 'Ash-Sharh',
        arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        english: 'Indeed, with hardship [will be] ease.',
        urdu: 'یقیناً ہر مشکل کے ساتھ آسانی ہے۔',
        sindhi: 'يقيناً ھر ڏکيائي سان گڏ سؤلائي آھي.',
        relevance: 'Eternal promise of divine light piercing through adversity.'
      }
    ]
  },
  {
    keywords: [
      'parent', 'mother', 'father', 'parents', 'family', 'children',
      'والدین', 'ماں', 'باپ', 'ماں باپ', 'والدہ', 'والد', 'ماءُ', 'پيءُ', 'ماء', 'پيء', 'اولاد'
    ],
    interpretation: {
      en: 'Divine commandments enjoining compassion, filial devotion, and prayers for parents.',
      ur: 'والدین کی خدمت، حسنِ سلوک اور ان کے لیے دعاؤں کے قرآنی احکامات۔',
      sd: 'ماءُ پيءُ جي خدمت، ادب ۽ انھن لاءِ رحمت جي دعا جا قرآني حڪم.',
    },
    wisdom: {
      en: 'Honoring parents is ranked immediately following monotheism in the Quran, reflecting gratitude for their unconditional nurture.',
      ur: 'قرآن میں توحید کے فوراً بعد والدین کے ساتھ بھلائی کا حکم دے کر ان کے احسان کی اہمیت واضح کی گئی ہے۔',
      sd: 'قرآن ۾ توحيد کان پوءِ ماءُ پيءُ سان سٺو ورتاءُ ڪرڻ تي زور ڏنو ويو آھي.',
    },
    surahs: [
      { number: 17, reason: 'The foundational charter against utter disrespect or impatience with aging parents.' },
      { number: 31, reason: 'Luqman honors the enduring physical sacrifice of mothers during gestation.' },
      { number: 46, reason: 'Expresses the heartfelt 40-year milestone supplication for parents.' }
    ],
    ayats: [
      {
        surahNumber: 17,
        ayahNumber: 24,
        surahName: 'Al-Isra',
        arabic: 'وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
        english: 'And lower to them the wing of humility out of mercy and say, "My Lord, have mercy upon them as they brought me up [when I was] small."',
        urdu: 'اور ان کے آگے شفقت سے عاجزی کا بازو جھکاؤ اور کہو: اے میرے رب! ان دونوں پر رحم فرما جیسا کہ انہوں نے بچپن میں مجھے پالا۔',
        sindhi: '۽ انھن لاءِ مھربانيءَ سان نماڻائيءَ جو پاسو جھڪاءِ ۽ چئو ته: اي منھنجا پالڻھار! انھن تي رحم ڪر جھڙو انھن مون کي ننڍپڻ ۾ نپايو.',
        relevance: 'The pinnacle Quranic prayer for mothers and fathers.'
      },
      {
        surahNumber: 31,
        ayahNumber: 14,
        surahName: 'Luqman',
        arabic: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ',
        english: 'And We have enjoined upon man care for his parents. His mother carried him, [increasing her] in weakness upon weakness...',
        urdu: 'اور ہم نے انسان کو اس کے والدین کے متعلق نصیحت کی، اس کی ماں نے دکھ پر دکھ سہہ کر اسے پیٹ میں رکھا...',
        sindhi: '۽ اسان انسان کي سندس ماءُ پيءُ بابت تاڪيد ڪيو، کيس سندس ماءُ ھڪ ڏک مٿان ٻيو ڏک سھي پيٽ ۾ کنيو...',
        relevance: 'Acknowledging the sublime dedication of motherhood.'
      }
    ]
  },
  {
    keywords: [
      'peace', 'anxiety', 'stress', 'fear', 'calm', 'heart', 'comfort', 'peace of mind', 'tranquility',
      'سکون', 'اطمینان', 'خوف', 'گھبراہٹ', 'امن', 'دل کا سکون', 'پريشاني', 'دل جو سڪون', 'امن و سڪون'
    ],
    interpretation: {
      en: 'Finding spiritual tranquility, dispelling inner anxiety, and calming the heart through remembrance.',
      ur: 'دل کا سکون، خوف و گھبراہٹ سے نجات اور ذکرِ الٰہی سے اطمینان حاصل کرنے کی آیات۔',
      sd: 'دل جو سڪون، خوف ۽ ڳڻتيءَ کان ڇوٽڪارو ۽ الله جي ذڪر سان راحت ملڻ بابت آيتون.',
    },
    wisdom: {
      en: 'True psychological peace originates not in worldly distractions, but in aligning the soul with the remembrance of its Creator.',
      ur: 'حقیقی قلبی سکون مادی اشیاء میں نہیں بلکہ پروردگار کی یاد اور اس کے کلام میں مضمر ہے۔',
      sd: 'سچو روحاني سڪون ۽ اطمينان رڳو الله پاڪ جي سچي ياد ۽ ذڪر ۾ آھي.',
    },
    surahs: [
      { number: 13, reason: 'Proclaims that it is only through the remembrance of Allah that hearts find restful peace.' },
      { number: 48, reason: 'Highlights the descent of divine tranquility (Sakinah) upon the hearts of believers.' },
      { number: 94, reason: 'Addresses the relief of burdens and expansion of the spiritual chest.' }
    ],
    ayats: [
      {
        surahNumber: 13,
        ayahNumber: 28,
        surahName: 'Ar-Ra\'d',
        arabic: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
        english: 'Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.',
        urdu: 'وہ لوگ جو ایمان لائے اور ان کے دل اللہ کے ذکر سے اطمینان پاتے ہیں۔ سن لو! اللہ کے ذکر ہی سے دلوں کو اطمینان نصیب ہوتا ہے۔',
        sindhi: 'جن ايمان آندو ۽ انھن جون دليون الله جي ياد سان سڪون پائين ٿيون. ياد رکو! الله جي ذڪر سان ئي دلين کي سڪون ملي ٿو.',
        relevance: 'The foundational verse on healing inner agitation and anxiety.'
      }
    ]
  },
  {
    keywords: [
      'forgiveness', 'mercy', 'repentance', 'sin', 'sins', 'tawbah', 'forgive', 'merciful',
      'بخشش', 'مغفرت', 'توبہ', 'گناہ', 'رحمت', 'معافی', 'معافي', 'توبه', 'گناھن جي بخشش'
    ],
    interpretation: {
      en: 'The infinite expanse of divine forgiveness and the door of sincere repentance.',
      ur: 'اللہ کی لامحدود رحمت، گناہوں کی بخشش اور سچی توبہ کی ترغیب۔',
      sd: 'الله پاڪ جي بي انتھا رحمت، گناھن جي معافي ۽ سچي توبه جا احڪام.',
    },
    wisdom: {
      en: 'No matter how heavily one has transgressed, the Quran forbids despair, opening an ocean of divine mercy for every returning soul.',
      ur: 'قرآن کریم انسان کو مایوسی سے سختی سے روکتا ہے اور بتاتا ہے کہ سچی توبہ تمام گناہوں کو دھو ڈالتی ہے۔',
      sd: 'ڪنھن به انسان کي الله جي رحمت مان نااميد نه ٿيڻ گھرجي، الله سڀ گناھه معاف فرمائيندڙ آھي.',
    },
    surahs: [
      { number: 39, reason: 'Contains the most hopeful verse in the Quran urging believers never to despair.' },
      { number: 4, reason: 'Reassures that whoever commits wrong then seeks forgiveness will find Allah Merciful.' }
    ],
    ayats: [
      {
        surahNumber: 39,
        ayahNumber: 53,
        surahName: 'Az-Zumar',
        arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
        english: 'Say, "O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins."',
        urdu: 'فرما دیجئے: اے میرے وہ بندو جنہوں نے اپنی جانوں پر زیادتی کی ہے! اللہ کی رحمت سے ناامید نہ ہو، بیشک اللہ سب گناہوں کو معاف فرما دیتا ہے۔',
        sindhi: 'چئو ته: اي منھنجا ٻانھو جن پنھنجن پاڻ تي زيادتي ڪئي آھي! الله جي رحمت مان نااميد نه ٿيو، بيشڪ الله سڀ گناھه بخشيندڙ آھي.',
        relevance: 'Known historically as the single most hopeful verse in the entirety of the Quran.'
      }
    ]
  },
  {
    keywords: [
      'sajdah', 'prostration', 'prostrate', 'bow', 'sajda', 'prayer', 'salah', 'namaz',
      'سجدہ', 'نماز', 'سجدے', 'سجدا', 'نماز جا احڪام'
    ],
    interpretation: {
      en: 'Verses on physical prostration (Sajdah), prayer devotion, and spiritual nearness to Allah.',
      ur: 'سجدہ تلاوت، نماز کی پابندی اور اللہ کے حضور نیاز مندی کی آیات۔',
      sd: 'سجدي جي فضيلت، نماز ۽ الله پاڪ جي بارگاھه ۾ جھڪڻ بابت آيتون.',
    },
    wisdom: {
      en: 'Sajdah embodies the ultimate surrender of worldly ego, placing the highest part of the body upon the dust to reach closest to God.',
      ur: 'سجدہ انسانی انا کی نفی اور بندگی کی معراج ہے جہاں بندہ اپنے خالق کے سب سے زیادہ قریب ہوتا ہے۔',
      sd: 'سجدو انسان جي عاجزيءَ جو اعليٰ ترين درجو آھي جتي ٻانھو پنھنجي رب جي سڀ کان ويجھو ھوندو آھي.',
    },
    surahs: [
      { number: 32, reason: 'Named As-Sajdah after the sincere prostration of the believers.' },
      { number: 96, reason: 'Concludes with the famous command: "Prostrate and draw near".' },
      { number: 7, reason: 'Contains the first chronological verse of Sajdah in the Mushaf (7:206).' }
    ],
    ayats: [
      {
        surahNumber: 96,
        ayahNumber: 19,
        surahName: 'Al-Alaq',
        arabic: 'كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِب ۩',
        english: 'No! Do not obey him. But prostrate and draw near [to Allah].',
        urdu: 'ہرگز نہیں! اس کی بات نہ مانو اور سجدہ کرو اور (اپنے رب کے) قریب ہو جاؤ۔',
        sindhi: 'ھرگز ائين نه آھي! سندس چيو نه مڃ، ۽ سجدي ۾ پئو ۽ (الله جي) ويجھو ٿي وڃ.',
        relevance: 'The pinnacle command connecting physical prostration with ultimate spiritual closeness.'
      }
    ]
  },
  {
    keywords: [
      'charity', 'zakat', 'spending', 'wealth', 'money', 'poor', 'needy', 'orphan', 'sadaqah',
      'صدقہ', 'زکوٰۃ', 'خیرات', 'غربت', 'مال', 'یتیم', 'سخاوت', 'سود', 'يتيم', 'خيرات', 'زڪواة'
    ],
    interpretation: {
      en: 'Quranic financial ethics, charity (Sadaqah & Zakat), and protection of the vulnerable.',
      ur: 'صدقہ و خیرات، زکوٰۃ کی ادائیگی اور یتیموں و مسکینوں کی کفالت کے احکامات۔',
      sd: 'صدقي، خيرات، زڪواة ۽ غريبن توڙي يتيمن جي سار سنڀال بابت قرآني ھدايت.',
    },
    wisdom: {
      en: 'Wealth in Islam is a divine trust; spending on the needy purifies the soul and yields manifold multiplication in the hereafter.',
      ur: 'قرآن کریم سکھاتا ہے کہ راہِ خدا میں خرچ کیا گیا مال کم نہیں ہوتا بلکہ برکت اور ثواب میں کئی گنا بڑھتا ہے۔',
      sd: 'الله جي واٽ ۾ ڏنو ويو مال ڪڏھن کٽندو ناھي، پر اھو دُنيا ۽ آخرت ۾ ڪيترائي ڀيرا وڌي ملندو آھي.',
    },
    surahs: [
      { number: 2, reason: 'Outlines the parables of spending like a grain growing seven ears of corn (2:261).' },
      { number: 76, reason: 'Celebrates those who feed the needy, orphan, and prisoner purely for Allah.' },
      { number: 107, reason: 'Severely reprimands those who neglect orphans and refuse small acts of kindness.' }
    ],
    ayats: [
      {
        surahNumber: 2,
        ayahNumber: 261,
        surahName: 'Al-Baqarah',
        arabic: 'مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ',
        english: 'The example of those who spend their wealth in the way of Allah is like a seed of grain which grows seven spikes; in each spike is a hundred grains...',
        urdu: 'ان لوگوں کی مثال جو اپنا مال اللہ کی راہ میں خرچ کرتے ہیں اس دانے جیسی ہے جس سے سات بالیاں اگیں اور ہر بالی میں سو دانے ہوں...',
        sindhi: 'انھن ماڻھن جو مثال جيڪي پنھنجو مال الله جي واٽ ۾ خرچ ڪن ٿا اھڙي داڻي وانگر آھي جنھن مان ست سنگ ڦٽن ۽ ھر سنگ ۾ سئو داڻا ھجن...',
        relevance: 'Metaphor of exponential spiritual reward for compassionate generosity.'
      }
    ]
  },
  {
    keywords: [
      'cosmos', 'astronomy', 'stars', 'universe', 'sun', 'moon', 'sky', 'earth', 'nature', 'creation',
      'کائنات', 'ستارے', 'چاند', 'سورج', 'زمین', 'آسمان', 'قدرت', 'سج', 'چنڊ', 'تارا', 'آسمان ۽ زمين'
    ],
    interpretation: {
      en: 'Cosmic marvels, celestial orbits, stellar design, and empirical contemplation of the universe.',
      ur: 'کائناتی نشانیاں، سورج، چاند اور ستاروں کے مدار اور تخلیقِ کائنات میں غور و فکر۔',
      sd: 'ڪائنات جون عظيم نشانيون، سج، چنڊ ۽ تارن جو نظام ۽ فطرت تي ويچار ڪرڻ جا احڪام.',
    },
    wisdom: {
      en: 'The Quran repeatedly invites human intellect to examine the celestial order without defect as evidence of the Supreme Artisan.',
      ur: 'قرآن کریم عقلِ انسانی کو ستاروں اور کائناتی توازن میں غوطہ زن ہو کر خالق کی قدرت کو پہچاننے کی دعوت دیتا ہے۔',
      sd: 'قرآن پاڪ انساني عقل کي آسمان، سج ۽ چنڊ جي منظم حرڪت تي غور ڪرڻ جو تاڪيد ڪري ٿو.',
    },
    surahs: [
      { number: 67, reason: 'Challenges observers to find any flaw or inconsistency in the seven heavens.' },
      { number: 36, reason: 'Describes the sun traveling toward its destination and the appointed stations of the moon.' },
      { number: 21, reason: 'Mentions the heavens and earth once joined together before being cleft asunder.' }
    ],
    ayats: [
      {
        surahNumber: 36,
        ayahNumber: 40,
        surahName: 'Ya-Sin',
        arabic: 'لَا الشَّمْسُ يَنبَغِي لَهَا أَن تُدْرِكَ الْقَمَرَ وَلَا اللَّيْلُ سَابِقُ النَّهَارِ ۚ وَكُلٌّ فِي فَلَكٍ يَسْبَحُونَ',
        english: 'It is not allowable for the sun to reach the moon, nor does the night overtake the day, but each, in an orbit, is swimming.',
        urdu: 'نہ سورج کی مجال کہ وہ چاند کو جا پکڑے اور نہ رات دن سے پہلے آ سکتی ہے، اور سب اپنے اپنے فلک میں تیر رہے ہیں۔',
        sindhi: 'نڪي سج جو وس آھي ته چنڊ کي وڃي ڳنڍي ۽ نڪي رات ڏينھن کان اڳڀري ٿي سگھي ٿي، ۽ ھر ھڪ پنھنجي دائري ۾ تري رھيو آھي.',
        relevance: 'Profound celestial description of gravitational harmony and orbital motion.'
      }
    ]
  },
  {
    keywords: [
      'dua', 'prayer', 'supplication', 'hope', 'ask', 'calling',
      'دعا', 'التجا', 'پکار', 'امید', 'مناجات', 'سائل', 'دعا گھرڻ'
    ],
    interpretation: {
      en: 'Direct supplications, prophetic prayers, and divine responsiveness to the caller.',
      ur: 'قرآنی دعائیں، انبیاء کرام کے کلمات اور اللہ کا پکارنے والوں کو فوری جواب۔',
      sd: 'قرآني دعائون، پيغمبرن جون التجا ۽ ٻانھن جي پڪار ٻڌڻ بابت الله جو واعدو.',
    },
    wisdom: {
      en: 'Allah is closer to His servant than their jugular vein, promising: "Call upon Me; I will respond to you."',
      ur: 'پروردگار انسان کی شہہ رگ سے زیادہ قریب ہے اور فرماتا ہے کہ مجھ سے مانگو، میں تمہاری دعاؤں کو قبول کروں گا۔',
      sd: 'الله پاڪ ٻانھي جي ساھه جي رڳ کان وڌيڪ ويجھو آھي ۽ فرمائي ٿو ته مون کي پڪاريو، آءٌ اوھان جي دعا قبول ڪندس.',
    },
    surahs: [
      { number: 2, reason: 'Verses confirming divine nearness when servants inquire about Allah (2:186).' },
      { number: 40, reason: 'Contains the direct divine decree: "Call upon Me; I will answer you" (40:60).' }
    ],
    ayats: [
      {
        surahNumber: 2,
        ayahNumber: 186,
        surahName: 'Al-Baqarah',
        arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
        english: 'And when My servants ask you concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me...',
        urdu: 'اور جب میرے بندے آپ سے میرے متعلق پوچھیں تو فرما دیجئے کہ میں تو بہت قریب ہوں، پکارنے والے کی دعا قبول کرتا ہوں جب وہ مجھے پکارے...',
        sindhi: '۽ جڏھن منھنجا ٻانھا توکان منھنجي بابت پڇن ته بيشڪ آءٌ ويجھو آھيان، پڪاريندڙ جي دعا اگهائيندو آھيان جڏھن به ھو مون کي سڏي ٿو...',
        relevance: 'The most intimate reassurance of immediate divine closeness to the supplicant.'
      }
    ]
  }
];

/**
 * High-speed local search function that matches queries in < 1ms without network calls.
 */
export function instantQuranSearch(query: string, language: 'en' | 'ur' | 'sd' = 'en'): SmartSearchResult {
  const normalized = query.toLowerCase().trim();

  // 1. Check if the query targets a specific Surah (e.g. "Mulk", "Yasin", "Kahf", "18", "Surah Rahman", etc.)
  const matchedSurah = SURAH_METADATA_LIST.find((s) => {
    const sNum = s.number.toString();
    const eng = s.englishName.toLowerCase();
    const trans = s.englishNameTranslation.toLowerCase();
    const arabic = s.name;
    const urdu = s.urduName;
    const sindhi = s.sindhiName;

    return (
      normalized === sNum ||
      normalized === `surah ${sNum}` ||
      normalized === `surah ${eng}` ||
      normalized.includes(eng) ||
      normalized.includes(trans) ||
      arabic.includes(query.trim()) ||
      urdu.includes(query.trim()) ||
      sindhi.includes(query.trim())
    );
  });

  if (matchedSurah) {
    const isUr = language === 'ur';
    const isSd = language === 'sd';

    return {
      queryInterpretation: `Direct exploration of Surah ${matchedSurah.englishName} (${matchedSurah.name})`,
      recommendedSurahs: [
        {
          surahNumber: matchedSurah.number,
          surahName: matchedSurah.englishName,
          reason: `Surah #${matchedSurah.number} (${matchedSurah.revelationType}): ${matchedSurah.themeSummary.slice(0, 95)}...`,
        },
      ],
      featuredAyats: [
        {
          surahNumber: matchedSurah.number,
          ayahNumber: 1,
          surahName: matchedSurah.englishName,
          arabic: matchedSurah.number === 1 ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ - ${matchedSurah.name}`,
          english: `Opening of Surah ${matchedSurah.englishName} (${matchedSurah.englishNameTranslation}) - ${matchedSurah.numberOfAyahs} Verses.`,
          urdu: `سورۃ ${matchedSurah.urduName} کا آغاز - کل ${matchedSurah.numberOfAyahs} آیات۔`,
          sindhi: `سورة ${matchedSurah.sindhiName} جي شروعات - ڪل ${matchedSurah.numberOfAyahs} آيتون.`,
          relevance: `Central theme: ${matchedSurah.themeSummary}`,
        },
      ],
      spiritualWisdom: isUr
        ? `سورۃ ${matchedSurah.urduName} قرآن پاک کی ایک عظیم سورۃ ہے جس میں ایمانی اور روحانی رہنمائی کے گہرے پیغامات ہیں۔`
        : isSd
        ? `سورة ${matchedSurah.sindhiName} قرآن پاڪ جي اھم سورتن مان آھي جنھن ۾ توحيد، اخلاق ۽ ھدايت جا گھرا سبق آھن.`
        : `Surah ${matchedSurah.englishName} offers timeless insights into spiritual fortitude, guidance, and contemplation of the divine presence.`,
    };
  }

  // 2. Check curated themes
  const matchedTheme = CURATED_THEMES.find((theme) =>
    theme.keywords.some((k) => normalized.includes(k))
  );

  if (matchedTheme) {
    return {
      queryInterpretation: matchedTheme.interpretation[language] || matchedTheme.interpretation.en,
      recommendedSurahs: matchedTheme.surahs.map((s) => {
        const meta = SURAH_METADATA_LIST.find((m) => m.number === s.number);
        return {
          surahNumber: s.number,
          surahName: meta?.englishName || `Surah ${s.number}`,
          reason: s.reason,
        };
      }),
      featuredAyats: matchedTheme.ayats,
      spiritualWisdom: matchedTheme.wisdom[language] || matchedTheme.wisdom.en,
    };
  }

  // 3. Fallback: Search all 114 Surah summaries for matching words
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  const matchedFromMetadata = SURAH_METADATA_LIST.filter((s) => {
    const text = `${s.englishName} ${s.englishNameTranslation} ${s.themeSummary} ${s.historicalContext}`.toLowerCase();
    return words.some((w) => text.includes(w));
  }).slice(0, 3);

  if (matchedFromMetadata.length > 0) {
    return {
      queryInterpretation: `Verses and Surahs related to "${query}"`,
      recommendedSurahs: matchedFromMetadata.map((s) => ({
        surahNumber: s.number,
        surahName: s.englishName,
        reason: `${s.revelationType} Surah: ${s.themeSummary.slice(0, 90)}...`,
      })),
      featuredAyats: [
        {
          surahNumber: matchedFromMetadata[0].number,
          ayahNumber: 1,
          surahName: matchedFromMetadata[0].englishName,
          arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          english: `Surah ${matchedFromMetadata[0].englishName} addresses themes related to your query.`,
          urdu: `سورۃ ${matchedFromMetadata[0].urduName} آپ کی تلاش کے موضوع سے متعلق رہنمائی فراہم کرتی ہے۔`,
          sindhi: `سورة ${matchedFromMetadata[0].sindhiName} اوھان جي ڳولھا جي موضوع بابت قرآني روشني وجھي ٿي.`,
          relevance: matchedFromMetadata[0].themeSummary,
        },
      ],
      spiritualWisdom:
        language === 'ur'
          ? 'قرآن کریم ہر تلاش کرنے والے کے لیے حکمت، شفا اور نور کی ابدی کتاب ہے۔'
          : language === 'sd'
          ? 'قرآن پاڪ ھر ڳولھيندڙ لاءِ حڪمت، شفا ۽ سچي سڪون جو سرچشمو آھي.'
          : 'The Holy Quran provides enduring spiritual guidance and moral clarity for every seeker of truth.',
    };
  }

  // 4. Default comforting guidance
  const defaultTheme = CURATED_THEMES[0];
  return {
    queryInterpretation: `Guidance on: "${query}"`,
    recommendedSurahs: defaultTheme.surahs.map((s) => {
      const meta = SURAH_METADATA_LIST.find((m) => m.number === s.number);
      return {
        surahNumber: s.number,
        surahName: meta?.englishName || `Surah ${s.number}`,
        reason: s.reason,
      };
    }),
    featuredAyats: defaultTheme.ayats,
    spiritualWisdom: defaultTheme.wisdom[language] || defaultTheme.wisdom.en,
  };
}
