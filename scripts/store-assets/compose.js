#!/usr/bin/env node
/**
 * Puts a finished screenshot into a store frame: brand background, headline, device bezel,
 * at the exact size each store asks for. Everything here is local and deterministic - no
 * model call, no cost - so a headline or layout tweak never spends fal credit.
 *
 * Usage: node scripts/store-assets/compose.js [ios|android|all] [en|tr|all]
 * Reads the finished screens listed in slogans.js from mockup_feature/_work/<job>/final.png and
 * writes mockup_feature/<platform>/<lang>/<nn>-<name>.png
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', '..');
const FONT_DIR = path.join(ROOT, 'node_modules', '@expo-google-fonts', 'playfair-display');
const FONT_BOLD = path.join(FONT_DIR, '700Bold', 'PlayfairDisplay_700Bold.ttf');
const FONT_REGULAR = path.join(FONT_DIR, '400Regular', 'PlayfairDisplay_400Regular.ttf');

// Brand palette, from constants/theme.ts (dark theme).
const BG_TOP = '#2B1D14';
const BG_BOTTOM = '#120D0A';
const CREAM = '#F3E9DC';
const GOLD = '#D4A24C';

const CANVAS = {
    ios: { width: 1290, height: 2796, headTop: 170, headSize: 92, phoneWidth: 1010, radius: 118, bezel: 22 },
    android: { width: 1080, height: 1920, headTop: 100, headSize: 64, phoneWidth: 720, radius: 70, bezel: 16 },
};

const SLOGANS = require('./slogans.js');

function escapeMarkup(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function textImage(text, { size, fontfile, font, color, width, spacing = 0, align = 'centre' }) {
    const markup = `<span foreground="${color}" letter_spacing="${spacing * 1024}">${escapeMarkup(text)}</span>`;
    return sharp({
        text: { text: markup, font: `${font} ${size}`, fontfile, width, align, rgba: true, dpi: 72, wrap: 'word' },
    })
        .png()
        .toBuffer({ resolveWithObject: true });
}

/**
 * An iPhone capture shown in the Play Store frame gets Android's status bar: the real one cut
 * from the Android capture, its glyphs turned into a mask and recoloured for the screen below.
 */
async function androidStatusBar(shot) {
    const { width, height } = await sharp(shot).metadata();
    const barH = Math.round((110 / 2048) * height);
    const { data } = await sharp(shot).extract({ left: Math.round(width / 2), top: 12, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
    const [r, g, b] = data;
    const dark = r * 0.3 + g * 0.59 + b * 0.11 < 128;
    const src = path.join(ROOT, 'SS', 'android_map.jpeg');
    const srcMeta = await sharp(src).metadata();
    const glyphH = Math.round((80 / srcMeta.height) * height);
    // Dark glyphs on a light bar -> alpha mask of the glyphs.
    const mask = await sharp(src)
        .extract({ left: 0, top: 0, width: srcMeta.width, height: 80 })
        .resize(width, glyphH, { fit: 'fill' })
        .greyscale()
        .negate()
        .linear(2.2, -120)
        .extractChannel(0)
        .toBuffer();
    const glyphs = await sharp({ create: { width, height: glyphH, channels: 3, background: dark ? '#EDE6DA' : '#2A2522' } })
        .joinChannel(mask)
        .png()
        .toBuffer();
    return sharp(shot)
        .composite([
            { input: { create: { width, height: barH, channels: 3, background: { r, g, b } } }, left: 0, top: 0 },
            { input: glyphs, left: 0, top: Math.round((barH - glyphH) / 2) },
        ])
        .png()
        .toBuffer();
}

async function compose(entry, order, platform, lang) {
    const c = CANVAS[platform];
    const slogan = entry[lang];
    const jobName = entry[platform];
    let shotPath = path.join(ROOT, 'mockup_feature', '_work', jobName, 'final.png');
    if (platform === 'android' && !jobName.includes('android')) shotPath = await androidStatusBar(shotPath);
    const meta = await sharp(shotPath).metadata();
    const screenW = c.phoneWidth;
    const screenH = Math.round((screenW * meta.height) / meta.width);
    const phoneW = screenW + c.bezel * 2;
    const phoneH = screenH + c.bezel * 2;

    // Background: vertical gradient with a warm glow behind the phone.
    const bg = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="${BG_TOP}"/><stop offset="1" stop-color="${BG_BOTTOM}"/>
            </linearGradient>
            <radialGradient id="r" cx="0.5" cy="0.62" r="0.55">
              <stop offset="0" stop-color="${GOLD}" stop-opacity="0.22"/>
              <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
          <rect width="100%" height="100%" fill="url(#r)"/>
        </svg>`
    );

    const brand = await textImage('ODYSSEY JOURNAL', {
        size: Math.round(c.headSize * 0.34),
        font: 'Playfair Display',
        fontfile: FONT_REGULAR,
        color: GOLD,
        width: c.width,
        spacing: Math.round(c.headSize * 0.09),
    });
    const head = await textImage(slogan, {
        size: c.headSize,
        font: 'Playfair Display Bold',
        fontfile: FONT_BOLD,
        color: CREAM,
        width: Math.round(c.width * 0.84),
    });

    const brandTop = c.headTop;
    const headTop = brandTop + brand.info.height + Math.round(c.headSize * 0.35);
    // The phone sits right under the headline and may run off the bottom edge, so the frame reads
    // as one block instead of a headline floating over a gap.
    const phoneTop = headTop + head.info.height + Math.round(c.headSize * 0.8);

    // Screenshot with rounded corners inside a dark bezel with a thin gold rim.
    const inner = c.radius - c.bezel;
    const screen = await sharp(shotPath)
        .resize(screenW, screenH)
        .composite([
            {
                input: Buffer.from(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="${screenW}" height="${screenH}"><rect width="100%" height="100%" rx="${inner}"/></svg>`
                ),
                blend: 'dest-in',
            },
        ])
        .png()
        .toBuffer();
    const bezel = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${phoneW + 60}" height="${phoneH + 60}">
          <defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter></defs>
          <rect x="30" y="44" width="${phoneW}" height="${phoneH}" rx="${c.radius}" fill="#000" opacity="0.55" filter="url(#s)"/>
          <rect x="30" y="30" width="${phoneW}" height="${phoneH}" rx="${c.radius}" fill="#0B0908"/>
          <rect x="31.5" y="31.5" width="${phoneW - 3}" height="${phoneH - 3}" rx="${c.radius - 1.5}" fill="none" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="3"/>
        </svg>`
    );

    const phoneLeft = Math.round((c.width - phoneW) / 2);
    const out = await sharp(bg)
        .composite([
            { input: brand.data, left: Math.round((c.width - brand.info.width) / 2), top: brandTop },
            { input: head.data, left: Math.round((c.width - head.info.width) / 2), top: headTop },
            { input: bezel, left: phoneLeft - 30, top: phoneTop - 30 },
            { input: screen, left: phoneLeft + c.bezel, top: phoneTop + c.bezel },
        ])
        .png()
        .toBuffer();

    // Anything below the canvas is cropped: the phone is allowed to run off the bottom edge.
    const final = await sharp(out).extract({ left: 0, top: 0, width: c.width, height: c.height }).png().toBuffer();
    const outDir = path.join(ROOT, 'mockup_feature', platform, lang);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${String(order).padStart(2, '0')}-${entry.name}.png`);
    fs.writeFileSync(outPath, final);
    console.log(`-> ${path.relative(ROOT, outPath)} (${c.width}x${c.height})`);
}

async function main() {
    const [p = 'all', l = 'all'] = process.argv.slice(2);
    const platforms = p === 'all' ? ['ios', 'android'] : [p];
    const langs = l === 'all' ? ['en', 'tr'] : [l];
    for (const platform of platforms)
        for (const lang of langs)
            for (let i = 0; i < SLOGANS.length; i++) await compose(SLOGANS[i], i + 1, platform, lang);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
