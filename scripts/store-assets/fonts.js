/**
 * Headline fonts per store language. Playfair Display (the brand face) covers Latin and
 * Cyrillic; Japanese, Korean, Chinese and Arabic need a face that has their glyphs, or Pango
 * draws empty boxes. The Noto serifs are the closest match to Playfair's bookish look.
 *
 * The Noto files are large (up to 15 MB each), so they are not in git. They live in
 * mockup_feature/_work/fonts/; fetch them once with
 *   npm i --no-save @expo-google-fonts/noto-serif-jp @expo-google-fonts/noto-serif-kr \
 *     @expo-google-fonts/noto-serif-sc @expo-google-fonts/noto-naskh-arabic
 * and copy the 400Regular / 700Bold .ttf files there.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const PLAYFAIR = path.join(ROOT, 'node_modules', '@expo-google-fonts', 'playfair-display');
const NOTO = path.join(ROOT, 'mockup_feature', '_work', 'fonts');

const LANGS = ['en', 'tr', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'ja', 'ko', 'zh', 'ar'];

const NOTO_FACES = {
    ja: { family: 'Noto Serif JP', file: 'NotoSerifJP' },
    ko: { family: 'Noto Serif KR', file: 'NotoSerifKR' },
    zh: { family: 'Noto Serif SC', file: 'NotoSerifSC' },
    ar: { family: 'Noto Naskh Arabic', file: 'NotoNaskhArabic' },
};

/**
 * @param {string} lang
 * @param {'bold'|'regular'|'italic'} style italic falls back to regular where the face has none
 * @returns {{ font: string, fontfile: string }} Pango family name (without size) and file
 */
function fontFor(lang, style) {
    const noto = NOTO_FACES[lang];
    if (!noto) {
        if (style === 'bold') return { font: 'Playfair Display Bold', fontfile: path.join(PLAYFAIR, '700Bold', 'PlayfairDisplay_700Bold.ttf') };
        if (style === 'italic') return { font: 'Playfair Display Italic', fontfile: path.join(PLAYFAIR, '400Regular_Italic', 'PlayfairDisplay_400Regular_Italic.ttf') };
        return { font: 'Playfair Display', fontfile: path.join(PLAYFAIR, '400Regular', 'PlayfairDisplay_400Regular.ttf') };
    }
    const bold = style === 'bold';
    const fontfile = path.join(NOTO, `${noto.file}_${bold ? '700Bold' : '400Regular'}.ttf`);
    if (!fs.existsSync(fontfile)) throw new Error(`missing font ${fontfile} - see the comment at the top of fonts.js`);
    return { font: bold ? `${noto.family} Bold` : noto.family, fontfile };
}

module.exports = { LANGS, fontFor };
