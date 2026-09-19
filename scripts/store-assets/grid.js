// Dev helper: overlays a labelled 100px grid on a screenshot, for measuring job regions.
// Usage: node scripts/store-assets/grid.js <src> <out>
const sharp = require('sharp');
(async () => {
    const [src, out] = process.argv.slice(2);
    const { width, height } = await sharp(src).metadata();
    let g = '';
    for (let x = 0; x < width; x += 50) g += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${x % 100 ? '#0ff' : '#f0f'}" stroke-opacity="${x % 100 ? 0.35 : 0.8}" stroke-width="1.5"/>` + (x % 100 ? '' : `<text x="${x + 3}" y="14" fill="#f0f" font-size="14" font-family="Arial">${x}</text>`);
    for (let y = 0; y < height; y += 50) g += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${y % 100 ? '#0ff' : '#f0f'}" stroke-opacity="${y % 100 ? 0.35 : 0.8}" stroke-width="1.5"/>` + (y % 100 ? '' : `<text x="3" y="${y - 3}" fill="#f0f" font-size="14" font-family="Arial">${y}</text>`);
    await sharp(src).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${g}</svg>`) }]).jpeg({ quality: 85 }).toFile(out);
})();
