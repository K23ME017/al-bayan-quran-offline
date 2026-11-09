import { AyahData } from '../types/quran';

export const OFFLINE_SURAHS_DATA: Record<number, AyahData[]> = {
  // Surah Al-Fatihah (1)
  1: [
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
    {
      number: 2,
      numberInSurah: 2,
      text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      translations: {
        en: '[All] praise is [due] to Allah, Lord of the worlds -',
        ur: 'سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے۔',
        sd: 'سڀ ساراهه الله جي لاءِ آھي جيڪو سڀني جھانن جو پالڻھار آھي.',
      },
      transliteration: 'Al-ḥamdu lillāhi rabbi al-ʿālamīn',
    },
    {
      number: 3,
      numberInSurah: 3,
      text: 'الرَّحْمَٰنِ الرَّحِيمِ',
      translations: {
        en: 'The Entirely Merciful, the Especially Merciful,',
        ur: 'نہایت مہربان، ہمیشہ رحم فرمانے والا۔',
        sd: 'وڏو مھربان، نھايت رحم فرمائيندڙ.',
      },
      transliteration: 'Ar-raḥmāni ar-raḥīm',
    },
    {
      number: 4,
      numberInSurah: 4,
      text: 'مَالِكِ يَوْمِ الدِّينِ',
      translations: {
        en: 'Sovereign of the Day of Recompense.',
        ur: 'روزِ جزا کا مالک۔',
        sd: 'جزا جي ڏينھن جو مالڪ.',
      },
      transliteration: 'Māliki yawmi ad-dīn',
    },
    {
      number: 5,
      numberInSurah: 5,
      text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      translations: {
        en: 'It is You we worship and You we ask for help.',
        ur: 'ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔',
        sd: 'اسين رڳو تنھنجي ئي عبادت ڪريون ٿا ۽ رڳو توکان ئي مدد گھرون ٿا.',
      },
      transliteration: 'Iyyāka naʿbudu wa-iyyāka nastaʿīn',
    },
    {
      number: 6,
      numberInSurah: 6,
      text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      translations: {
        en: 'Guide us to the straight path -',
        ur: 'ہمیں سیدھے راستے کی ہدایت فرما۔',
        sd: 'اسان کي سڌي رستي جي ھدايت ڪر.',
      },
      transliteration: 'Ihdinā aṣ-ṣirāṭa al-mustaqīm',
    },
    {
      number: 7,
      numberInSurah: 7,
      text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      translations: {
        en: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
        ur: 'ان لوگوں کا راستہ جن پر تو نے انعام فرمایا، جن پر نہ غضب ہوا اور نہ وہ گمراہ ہوئے۔',
        sd: 'انھن جو رستو جن تي تو فضل ڪيو، نڪي انھن جو جن تي غضب ٿيو ۽ نڪي گمراھن جو.',
      },
      transliteration: 'Ṣirāṭa alladhīna anʿamta ʿalayhim ghayri al-maghḍūbi ʿalayhim walā aḍ-ḍāllīn',
    },
  ],

  // Surah Al-Ikhlas (112)
  112: [
    {
      number: 6222,
      numberInSurah: 1,
      text: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      translations: {
        en: 'Say, "He is Allah, [who is] One,',
        ur: 'کہو کہ وہ اللہ ایک ہے۔',
        sd: 'چئو ته اھو الله ھڪڙو آھي.',
      },
      transliteration: 'Qul huwa Allāhu aḥad',
    },
    {
      number: 6223,
      numberInSurah: 2,
      text: 'اللَّهُ الصَّمَدُ',
      translations: {
        en: 'Allah, the Eternal Refuge.',
        ur: 'اللہ بے نیاز (سب کا سہارا) ہے۔',
        sd: 'الله بي نياز (سڀني جو سھارو) آھي.',
      },
      transliteration: 'Allāhu aṣ-ṣamad',
    },
    {
      number: 6224,
      numberInSurah: 3,
      text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      translations: {
        en: 'He neither begets nor is born,',
        ur: 'نہ اس کی کوئی اولاد ہے اور نہ وہ کسی سے پیدا ہوا ہے۔',
        sd: 'نڪي ڪنھن کي ڄڻيائين ۽ نڪي پاڻ ڪنھن مان ڄائو آھي.',
      },
      transliteration: 'Lam yalid walam yūlad',
    },
    {
      number: 6225,
      numberInSurah: 4,
      text: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
      translations: {
        en: 'Nor is there to Him any equivalent."',
        ur: 'اور کوئی اس کے برابر کا نہیں ہے۔',
        sd: '۽ نڪي ڪو سندس ھمسر آھي.',
      },
      transliteration: 'Walam yakun lahu kufuwan aḥad',
    },
  ],

  // Surah Al-Falaq (113)
  113: [
    {
      number: 6226,
      numberInSurah: 1,
      text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
      translations: {
        en: 'Say, "I seek refuge in the Lord of daybreak',
        ur: 'کہو کہ میں صبح کے رب کی پناہ مانگتا ہوں۔',
        sd: 'چئو ته آءٌ پرھه جي پروردگار جي پناھه گھران ٿو.',
      },
      transliteration: 'Qul aʿūdhu birabbi al-falaq',
    },
    {
      number: 6227,
      numberInSurah: 2,
      text: 'مِنْ شَرِّ مَا خَلَقَ',
      translations: {
        en: 'From the evil of that which He created',
        ur: 'ہر اس چیز کے شر سے جو اس نے پیدا کی ہے۔',
        sd: 'جيڪي پيدا ڪيائين تنھن جي برائي کان.',
      },
      transliteration: 'Min sharri mā khalaq',
    },
    {
      number: 6228,
      numberInSurah: 3,
      text: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ',
      translations: {
        en: 'And from the evil of darkness when it settles',
        ur: 'اور اندھیری رات کے شر سے جب وہ چھا جائے۔',
        sd: '۽ رات جي اونداھي جي برائي کان جڏھن اھا پکڙجي وڃي.',
      },
      transliteration: 'Wamin sharri ghāsiqin idhā waqab',
    },
    {
      number: 6229,
      numberInSurah: 4,
      text: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
      translations: {
        en: 'And from the evil of the blowers in knots',
        ur: 'اور گرہوں پر پھونکنے والیوں کے شر سے۔',
        sd: '۽ ڳنڍين ۾ ڦوڪيندڙن جي شر کان.',
      },
      transliteration: 'Wamin sharri an-naffāthāti fī al-ʿuqad',
    },
    {
      number: 6230,
      numberInSurah: 5,
      text: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      translations: {
        en: 'And from the evil of an envier when he envies."',
        ur: 'اور حسد کرنے والے کے شر سے جب وہ حسد کرے۔',
        sd: '۽ حسد ڪندڙ جي شر کان جڏھن اھو حسد ڪري.',
      },
      transliteration: 'Wamin sharri ḥāsidin idhā ḥasad',
    },
  ],

  // Surah An-Nas (114)
  114: [
    {
      number: 6231,
      numberInSurah: 1,
      text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
      translations: {
        en: 'Say, "I seek refuge in the Lord of mankind,',
        ur: 'کہو کہ میں انسانوں کے رب کی پناہ مانگتا ہوں۔',
        sd: 'چئو ته آءٌ انسانن جي پالڻھار جي پناھه گھران ٿو.',
      },
      transliteration: 'Qul aʿūdhu birabbi an-nās',
    },
    {
      number: 6232,
      numberInSurah: 2,
      text: 'مَلِكِ النَّاسِ',
      translations: {
        en: 'The Sovereign of mankind,',
        ur: 'انسانوں کے بادشاہ کی۔',
        sd: 'انسانن جي بادشاھه جي.',
      },
      transliteration: 'Maliki an-nās',
    },
    {
      number: 6233,
      numberInSurah: 3,
      text: 'إِلَٰهِ النَّاسِ',
      translations: {
        en: 'The God of mankind,',
        ur: 'انسانوں کے معبود برحق کی۔',
        sd: 'انسانن جي سچي معبود جي.',
      },
      transliteration: 'Ilāhi an-nās',
    },
    {
      number: 6234,
      numberInSurah: 4,
      text: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
      translations: {
        en: 'From the evil of the retreating whisperer -',
        ur: 'پیچھے ہٹ جانے والے وسوسہ ڈالنے والے کے شر سے۔',
        sd: 'پٺتي ھٽندڙ وسوسو وجھندڙ جي شر کان.',
      },
      transliteration: 'Min sharri al-waswāsi al-khannās',
    },
    {
      number: 6235,
      numberInSurah: 5,
      text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
      translations: {
        en: 'Who whispers [evil] into the breasts of mankind -',
        ur: 'جو لوگوں کے سینوں میں وسوسے ڈالتا ہے۔',
        sd: 'جيڪو ماڻھن جي سينن ۾ وسوسا وجھي ٿو.',
      },
      transliteration: 'Alladhī yuwaswisu fī ṣudūri an-nās',
    },
    {
      number: 6236,
      numberInSurah: 6,
      text: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
      translations: {
        en: 'From among the jinn and mankind."',
        ur: 'خواہ وہ جنات میں سے ہو یا انسانوں میں سے۔',
        sd: 'خواھه جنن مان ھجي يا انسانن مان.',
      },
      transliteration: 'Mina al-jinnati wan-nās',
    },
  ],

  // Surah Al-Kawthar (108)
  108: [
    {
      number: 6205,
      numberInSurah: 1,
      text: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
      translations: {
        en: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.',
        ur: 'بے شک ہم نے آپ کو کوثر (بے پناہ خیر و بھلائی) عطا فرمائی۔',
        sd: 'بيشڪ اسان توکي ڪوثر (تمام وڏي ڀلائي ۽ برڪت) عطا فرمائي.',
      },
      transliteration: 'Innā aʿṭaynāka al-kawthar',
    },
    {
      number: 6206,
      numberInSurah: 2,
      text: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
      translations: {
        en: 'So pray to your Lord and sacrifice [to Him alone].',
        ur: 'پس اپنے رب کے لیے نماز پڑھئے اور قربانی کیجئے۔',
        sd: 'تنھنڪري پنھنجي رب لاءِ نماز پڙھه ۽ قرباني ڪر.',
      },
      transliteration: 'Faṣalli lirabbika wan-ḥar',
    },
    {
      number: 6207,
      numberInSurah: 3,
      text: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
      translations: {
        en: 'Indeed, your enemy is the one cut off.',
        ur: 'یقیناً آپ کا دشمن ہی بے نام و نشان رہے گا۔',
        sd: 'يقيناً تنھنجو دشمن ئي بي نام و نشان رھندو.',
      },
      transliteration: 'Inna shāni\'aka huwa al-abtar',
    },
  ],

  // Surah Al-Asr (103)
  103: [
    {
      number: 6177,
      numberInSurah: 1,
      text: 'وَالْعَصْرِ',
      translations: {
        en: 'By time,',
        ur: 'قسم ہے زمانے کی۔',
        sd: 'زماني جو قسم.',
      },
      transliteration: 'Wal-ʿaṣr',
    },
    {
      number: 6178,
      numberInSurah: 2,
      text: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ',
      translations: {
        en: 'Indeed, mankind is in loss,',
        ur: 'بے شک انسان سراسر خسارے میں ہے۔',
        sd: 'بيشڪ انسان وڏي نقصان ۾ آھي.',
      },
      transliteration: 'Inna al-insāna lafī khusr',
    },
    {
      number: 6179,
      numberInSurah: 3,
      text: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
      translations: {
        en: 'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.',
        ur: 'سوائے ان لوگوں کے جو ایمان لائے اور نیک عمل کیے اور ایک دوسرے کو حق اور صبر کی تلقین کی۔',
        sd: 'سواءِ انھن جي جن ايمان آندو ۽ چڱا ڪم ڪيا ۽ ھڪٻئي کي حق ۽ صبر جي نصيحت ڪئي.',
      },
      transliteration: 'Illā alladhīna āmanū waʿamilū aṣ-ṣāliḥāti watawāṣaw bil-ḥaqqi watawāṣaw biṣ-ṣabr',
    },
  ],
};
