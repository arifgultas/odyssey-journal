/**
 * Every image file has to actually be the format its extension claims.
 *
 * Three onboarding images were JPEGs named .png. Metro never noticed - it sniffs the
 * bytes - so the app ran fine in development and every JS check passed. Android's resource
 * compiler trusts the extension, so `:app:mergeReleaseResources` failed with "AAPT: error:
 * file failed to compile", and the EAS production build had been failing on every commit
 * for that reason alone. The signal was six minutes away in a remote build log; this test
 * puts it a second away instead.
 */
import fs from 'fs';
import path from 'path';

/** First bytes that identify each format, as hex */
const MAGIC: Record<string, { hex: string[]; name: string }> = {
    '.png': { hex: ['89504e47'], name: 'PNG' },
    '.jpg': { hex: ['ffd8ff'], name: 'JPEG' },
    '.jpeg': { hex: ['ffd8ff'], name: 'JPEG' },
    '.gif': { hex: ['47494638'], name: 'GIF' },
    '.webp': { hex: ['52494646'], name: 'WebP (RIFF)' },
};

function identify(buffer: Buffer): string {
    const head = buffer.subarray(0, 4).toString('hex');
    for (const { hex, name } of Object.values(MAGIC)) {
        if (hex.some((signature) => head.startsWith(signature))) return name;
    }
    return `unknown (${head})`;
}

function imageFiles(dir: string, out: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            imageFiles(full, out);
        } else if (path.extname(entry.name).toLowerCase() in MAGIC) {
            out.push(full);
        }
    }
    return out;
}

describe('bundled image assets', () => {
    const root = path.join(__dirname, '..', '..');
    const assets = path.join(root, 'assets');

    it('are the format their file extension says they are', () => {
        const wrong: string[] = [];

        for (const file of imageFiles(assets)) {
            const extension = path.extname(file).toLowerCase();
            const expected = MAGIC[extension];
            const actual = fs.readFileSync(file);
            const head = actual.subarray(0, 4).toString('hex');

            if (!expected.hex.some((signature) => head.startsWith(signature))) {
                wrong.push(
                    `${path.relative(root, file)} is ${identify(actual)}, not ${expected.name}`
                );
            }
        }

        expect(wrong).toEqual([]);
    });

    it('finds the files at all, so a passing run means something', () => {
        expect(imageFiles(assets).length).toBeGreaterThan(0);
    });
});
