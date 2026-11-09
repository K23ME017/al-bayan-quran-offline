const fs = require('fs');
const path = require('path');

const publicSurahsDir = path.join(__dirname, '..', 'public', 'data', 'surahs');
const srcQuranDir = path.join(__dirname, '..', 'src', 'data', 'quran');

if (!fs.existsSync(publicSurahsDir)) {
  fs.mkdirSync(publicSurahsDir, { recursive: true });
}
if (!fs.existsSync(srcQuranDir)) {
  fs.mkdirSync(srcQuranDir, { recursive: true });
}

async function fetchEdition(editionId) {
  console.log(`Fetching edition: ${editionId}...`);
  const res = await fetch(`https://api.alquran.cloud/v1/quran/${editionId}`);
  if (!res.ok) throw new Error(`Failed to fetch ${editionId}: ${res.statusText}`);
  const json = await res.json();
  return json.data.surahs;
}

async function main() {
  console.log('Downloading complete Quran editions for 100% offline access...');
  const [arSurahs, enSurahs, urSurahs, sdSurahs] = await Promise.all([
    fetchEdition('quran-uthmani'),
    fetchEdition('en.sahih'),
    fetchEdition('ur.jalandhry'),
    fetchEdition('sd.amroti'),
  ]);

  console.log('All 4 editions downloaded! Processing and packaging all 114 Surahs...');

  const manifest = [];

  for (let i = 0; i < 114; i++) {
    const surahNumber = i + 1;
    const arSurah = arSurahs[i];
    const enSurah = enSurahs[i];
    const urSurah = urSurahs[i];
    const sdSurah = sdSurahs[i];

    const ayahs = arSurah.ayahs.map((arAyah, idx) => {
      const enAyah = enSurah ? enSurah.ayahs[idx] : null;
      const urAyah = urSurah ? urSurah.ayahs[idx] : null;
      const sdAyah = sdSurah ? sdSurah.ayahs[idx] : null;

      return {
        number: arAyah.number,
        numberInSurah: arAyah.numberInSurah,
        text: arAyah.text,
        translations: {
          en: enAyah ? enAyah.text : '',
          ur: urAyah ? urAyah.text : '(ترجمہ دستیاب نہیں)',
          sd: sdAyah ? sdAyah.text : '(سنڌي ترجمو اڻلڀ)',
        },
        sajda: arAyah.sajda || false,
        ruku: arAyah.ruku,
        juz: arAyah.juz,
        manzil: arAyah.manzil,
        page: arAyah.page,
      };
    });

    manifest.push({
      number: surahNumber,
      ayahCount: ayahs.length,
      firstAyah: ayahs[0]?.text || '',
    });

    const publicFilePath = path.join(publicSurahsDir, `${surahNumber}.json`);
    fs.writeFileSync(publicFilePath, JSON.stringify(ayahs), 'utf8');
  }

  // Write manifest index
  fs.writeFileSync(
    path.join(publicSurahsDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  console.log(`Successfully generated all 114 Surah JSON files in ${publicSurahsDir}`);
}

main().catch((err) => {
  console.error('Offline Quran Generation Error:', err);
  process.exit(1);
});
