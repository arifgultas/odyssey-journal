#!/usr/bin/env node
/**
 * Google Play feature graphic (1024x500). The artwork comes from fal.ai GPT Image 2.5
 * (text-to-image, generated once and cached); the app icon, name and slogan are laid on top
 * locally so the lettering is exact and each language costs nothing extra.
 *
 * Usage: node scripts/store-assets/feature-graphic.js [--regenerate]
 * Output: mockup_feature/feature-graphic/feature-graphic-<lang>.png
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { fontFor } = require('./fonts.js');
const { fal } = require('@fal-ai/client');

const ROOT = path.join(__dirname, '..', '..');
const MODEL = 'openai/gpt-image-2.5/flare/text-to-image';
const WORK = path.join(ROOT, 'mockup_feature', '_work', 'feature-graphic');
const OUT = path.join(ROOT, 'mockup_feature', 'feature-graphic');
const FONT_DIR = path.join(ROOT, 'node_modules', '@expo-google-fonts', 'playfair-display');
const CREAM = '#F3E9DC';
const GOLD = '#D4A24C';

const TEXT = {
    // manual break: wrapping left "story." alone on the second line
    en: { tagline: 'Capture your journey.\nShare your story.' },
    tr: { tagline: 'Yolculuğunu kaydet. Hikâyeni paylaş.' },
    es: { tagline: 'Registra tu viaje.\nComparte tu historia.' },
    fr: { tagline: 'Racontez votre voyage.\nPartagez votre histoire.' },
    de: { tagline: 'Halte deine Reise fest.\nTeile deine Geschichte.' },
    pt: { tagline: 'Registre sua jornada.\nCompartilhe sua história.' },
    it: { tagline: 'Racconta il tuo viaggio.\nCondividi la tua storia.' },
    ru: { tagline: 'Сохраните путешествие.\nПоделитесь историей.' },
    ja: { tagline: '旅を記録しよう。\nストーリーをシェアしよう。' },
    ko: { tagline: '여행을 기록하세요.\n이야기를 나누세요.' },
    zh: { tagline: '记录你的旅程。\n分享你的故事。' },
    ar: { tagline: 'وثّق رحلتك.\nشارك قصتك.' },
};

const PROMPT =
    'Cinematic wide banner photograph, warm golden-hour light. On the RIGHT half: an open vintage ' +
    'leather travel journal on a dark walnut desk, with a few instant-film polaroid photos of ' +
    'famous places (Cappadocia balloons, Santorini, Galata Tower), an old brass compass, a ' +
    'passport with stamps and a folded map, shallow depth of field. The LEFT half is calm, dark, ' +
    'softly lit warm brown shadow with nothing in it, leaving clean empty space for a title. ' +
    'Rich dark brown and gold palette, premium and nostalgic. No text, no letters, no logos.';

function loadEnv() {
    for (const f of ['.env', '.env.local']) {
        const file = path.join(ROOT, f);
        if (!fs.existsSync(file)) continue;
        for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
            const m = line.match(/^([A-Z_]+)=(.*)$/);
            if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
        }
    }
}

async function artwork() {
    fs.mkdirSync(WORK, { recursive: true });
    const cached = path.join(WORK, 'generated.png');
    if (fs.existsSync(cached) && !process.argv.includes('--regenerate')) return fs.readFileSync(cached);

    loadEnv();
    fal.config({ credentials: process.env.FAL_KEY });
    // Same spend ledger and cap as edit-screen.js.
    const ledgerPath = path.join(ROOT, 'mockup_feature', '_work', 'spend.json');
    const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : [];
    const spent = ledger.reduce((s, e) => s + e.estUsd, 0);
    if (spent + 0.2 > 5) throw new Error(`budget: ~$${spent.toFixed(2)} already spent`);

    console.log(`generating artwork (~$${spent.toFixed(2)} spent so far)...`);
    const result = await fal.subscribe(MODEL, {
        input: {
            prompt: PROMPT,
            image_size: { width: 1536, height: 752 },
            quality: 'high',
            num_images: 1,
            output_format: 'png',
        },
    });
    ledger.push({ job: 'feature-graphic', quality: 'high', estUsd: 0.2, at: new Date().toISOString() });
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    const buf = Buffer.from(await (await fetch(result.data.images[0].url)).arrayBuffer());
    fs.writeFileSync(cached, buf);
    return buf;
}

async function text(markup, font, fontfile, width) {
    return sharp({ text: { text: markup, font, fontfile, width, rgba: true, dpi: 72, wrap: 'word' } })
        .png()
        .toBuffer({ resolveWithObject: true });
}

async function main() {
    const art = await artwork();
    fs.mkdirSync(OUT, { recursive: true });
    const W = 1024;
    const H = 500;
    const base = await sharp(art).resize(W, H, { fit: 'cover' }).toBuffer();
    // Darken the left side a little more so the title reads on any artwork.
    const shade = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" x2="1">` +
            `<stop offset="0" stop-color="#120D0A" stop-opacity="0.85"/><stop offset="0.45" stop-color="#120D0A" stop-opacity="0.55"/>` +
            `<stop offset="0.7" stop-color="#120D0A" stop-opacity="0"/></linearGradient></defs>` +
            `<rect width="100%" height="100%" fill="url(#g)"/></svg>`
    );
    const iconSize = 96;
    const icon = await sharp(path.join(ROOT, 'assets', 'images', 'icon.png'))
        .resize(iconSize, iconSize)
        .composite([
            {
                input: Buffer.from(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}"><rect width="100%" height="100%" rx="22"/></svg>`
                ),
                blend: 'dest-in',
            },
        ])
        .png()
        .toBuffer();

    for (const [lang, t] of Object.entries(TEXT)) {
        const title = await text(
            `<span foreground="${CREAM}">Odyssey Journal</span>`,
            'Playfair Display Bold 60',
            path.join(FONT_DIR, '700Bold', 'PlayfairDisplay_700Bold.ttf'),
            520
        );
        // The app name stays in Playfair in every language; only the slogan is localized
        const taglineFont = fontFor(lang, 'italic');
        const tagline = await text(
            `<span foreground="${GOLD}">${t.tagline}</span>`,
            `${taglineFont.font} 28`,
            taglineFont.fontfile,
            470
        );
        const left = 64;
        const block = iconSize + 24 + title.info.height + 14 + tagline.info.height;
        const top = Math.round((H - block) / 2);
        const out = path.join(OUT, `feature-graphic-${lang}.png`);
        await sharp(base)
            .composite([
                { input: shade },
                { input: icon, left, top },
                { input: title.data, left, top: top + iconSize + 24 },
                { input: tagline.data, left: left + 2, top: top + iconSize + 24 + title.info.height + 14 },
            ])
            .png()
            .toFile(out);
        console.log(`-> ${path.relative(ROOT, out)} (${W}x${H})`);
    }
}

main().catch((e) => {
    console.error(e.body ? JSON.stringify(e.body) : e);
    process.exit(1);
});
