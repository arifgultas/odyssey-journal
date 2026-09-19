#!/usr/bin/env node
/**
 * Refreshes the demo content inside a real app screenshot with fal.ai GPT Image 2.5, while
 * keeping every pixel of the app's own interface.
 *
 * The model re-renders the whole frame even when given a mask, so its output is never used
 * as-is: only the masked regions are cut out of it and pasted back onto the original
 * screenshot. Tab bar, headers, buttons and typography therefore stay exactly as the app
 * draws them, which is what App Store guideline 2.3.3 asks of screenshots.
 *
 * Usage: node scripts/store-assets/edit-screen.js <job-name> [--recomposite]
 *   --recomposite  reuse the saved generated.png and only redo the paste-back (no fal call,
 *                  no cost) - for adjusting regions after a generation.
 * Jobs live in scripts/store-assets/jobs.js. Output: mockup_feature/_work/<job>/
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { fal } = require("@fal-ai/client");

const ROOT = path.join(__dirname, "..", "..");
const MODEL = "openai/gpt-image-2.5/flare/edit";
// The account holds $9 and the user asked not to spend all of it. Estimates are deliberately
// high (edit calls also bill the reference image), so the real total stays under the cap.
const BUDGET_USD = 5;
const EST_COST = { low: 0.03, medium: 0.08, high: 0.2 };

function loadEnv() {
  for (const f of [".env", ".env.local"]) {
    const file = path.join(ROOT, f);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]])
        process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

/** An SVG of the regions, white on black - used both for the model's mask and the paste-back */
function regionSvg(width, height, regions, { feather = 0, keep = [] } = {}) {
  const toShape = (r) => {
      if (r.rect) {
        const [x, y, w, h] = r.rect;
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r.radius || 0}"/>`;
      }
      if (r.poly)
        return `<polygon points="${r.poly.map((p) => p.join(",")).join(" ")}"/>`;
      if (r.circle) {
        const [cx, cy, rad] = r.circle;
        return `<circle cx="${cx}" cy="${cy}" r="${rad}"/>`;
      }
      throw new Error("unknown region " + JSON.stringify(r));
  };
  const shapes = regions.map(toShape).join("");
  // "keep" shapes are cut back out: UI that sits on top of a repainted area (a map's zoom
  // buttons, a pill) stays the app's own pixels.
  const keepShapes = keep.map(toShape).join("");
  const filter = feather
    ? `<filter id="f"><feGaussianBlur stdDeviation="${feather}"/></filter>`
    : "";
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${filter}` +
      `<rect width="100%" height="100%" fill="black"/>` +
      `<g fill="white"${feather ? ' filter="url(#f)"' : ""}>${shapes}</g>` +
      `<g fill="black">${keepShapes}</g></svg>`,
  );
}

async function run(jobName) {
  loadEnv();
  if (!process.env.FAL_KEY) throw new Error("FAL_KEY missing in .env.local");
  fal.config({ credentials: process.env.FAL_KEY });

  const jobs = require("./jobs.js");
  const job = jobs[jobName];
  if (!job)
    throw new Error(
      `no job "${jobName}". Known: ${Object.keys(jobs).join(", ")}`,
    );

  const outDir = path.join(ROOT, "mockup_feature", "_work", jobName);
  fs.mkdirSync(outDir, { recursive: true });

  let src = path.join(ROOT, job.src);
  if (job.stack) {
    // Repeat a real list row down the screen (e.g. one conversation -> a full inbox), so the
    // extra rows are the app's own UI and only their contents get repainted.
    const [x, y, w, h] = job.stack.rect;
    const row = await sharp(src).extract({ left: x, top: y, width: w, height: h }).toBuffer();
    const copies = [];
    for (let i = 1; i < job.stack.count; i++) copies.push({ input: row, left: x, top: y + job.stack.pitch * i });
    const prepared = path.join(outDir, "prepared.png");
    await sharp(src).composite(copies).png().toFile(prepared);
    src = prepared;
  }
  const { width, height } = await sharp(src).metadata();

  // The model works at a larger size with the screenshot's aspect ratio, in multiples of 16.
  const genW = job.genWidth || 1168;
  const genH = Math.round((genW * height) / width / 16) * 16;
  const sx = genW / width;
  const sy = genH / height;
  const scale = (r) => ({
    ...r,
    rect: r.rect && [
      r.rect[0] * sx,
      r.rect[1] * sy,
      r.rect[2] * sx,
      r.rect[3] * sy,
    ],
    poly: r.poly && r.poly.map(([x, y]) => [x * sx, y * sy]),
    circle: r.circle && [r.circle[0] * sx, r.circle[1] * sy, r.circle[2] * sx],
  });
  const scaled = job.regions.map(scale);
  const scaledKeep = (job.keep || []).map(scale);

  const input = await sharp(src).resize(genW, genH).png().toBuffer();
  // OpenAI-style mask: transparent where the model may paint, opaque where it should keep.
  const keep = await sharp(regionSvg(genW, genH, scaled, { keep: scaledKeep }))
    .negate({ alpha: false })
    .extractChannel(0)
    .toBuffer();
  const mask = await sharp({
    create: { width: genW, height: genH, channels: 3, background: "#000" },
  })
    .joinChannel(keep, { raw: undefined })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(outDir, "input.png"), input);
  fs.writeFileSync(path.join(outDir, "mask.png"), mask);

  const genPath = path.join(outDir, "generated.png");
  let generated;
  if (process.argv.includes("--recomposite")) {
    generated = fs.readFileSync(genPath);
    console.log(`[${jobName}] recompositing saved output (no fal call)`);
  } else {
    const [imageUrl, maskUrl] = await Promise.all([
      fal.storage.upload(new Blob([input], { type: "image/png" })),
      fal.storage.upload(new Blob([mask], { type: "image/png" })),
    ]);

    // Spend guard: every paid call is logged, and the run refuses once the budget is used.
    const ledgerPath = path.join(ROOT, "mockup_feature", "_work", "spend.json");
    const ledger = fs.existsSync(ledgerPath)
      ? JSON.parse(fs.readFileSync(ledgerPath, "utf8"))
      : [];
    const spent = ledger.reduce((s, e) => s + e.estUsd, 0);
    const estUsd = EST_COST[job.quality || "high"];
    if (spent + estUsd > BUDGET_USD) {
      throw new Error(
        `budget: ~$${spent.toFixed(2)} spent, next call ~$${estUsd} would pass $${BUDGET_USD}`,
      );
    }

    console.log(
      `[${jobName}] generating ${genW}x${genH} with ${MODEL} (~$${spent.toFixed(2)} spent so far)...`,
    );
    const result = await fal.subscribe(MODEL, {
      input: {
        prompt: job.prompt,
        image_urls: [imageUrl],
        mask_url: maskUrl,
        image_size: { width: genW, height: genH },
        quality: job.quality || "high",
        num_images: 1,
        output_format: "png",
      },
      logs: false,
    });
    ledger.push({
      job: jobName,
      quality: job.quality || "high",
      estUsd,
      at: new Date().toISOString(),
    });
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    const image = result.data.images[0];
    generated = Buffer.from(await (await fetch(image.url)).arrayBuffer());
    fs.writeFileSync(genPath, generated);
  }

  // Paste back: generated pixels inside the (slightly feathered) regions, original elsewhere.
  const genAtSrc = await sharp(generated)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .png()
    .toBuffer();
  const alpha = await sharp(
    regionSvg(width, height, job.regions, {
      feather: job.feather ?? 1.5,
      keep: job.keep || [],
    }),
  )
    .extractChannel(0)
    .toBuffer();
  const patch = await sharp(genAtSrc).joinChannel(alpha).png().toBuffer();
  // "clear" boxes are painted over with the background colour sampled just left of them, for
  // old text that the model's version sits beside rather than on top of (e.g. a counter
  // whose icon the model drew a few pixels off).
  const base = sharp(src).removeAlpha();
  const { data: px, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const clears = (job.clear || []).map(([x, y, w, h]) => {
    const i = (Math.round(y + h / 2) * info.width + Math.max(0, x - 3)) * info.channels;
    const fill = `rgb(${px[i]},${px[i + 1]},${px[i + 2]})`;
    return {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${fill}"/></svg>`,
      ),
      left: x,
      top: y,
    };
  });
  let final = await base
    .composite([...clears, { input: patch }])
    .png()
    .toBuffer();

  // "labels" fix small text the model garbled (a map label, a name): the box is painted with
  // the colour sampled at its left edge of the result, and the correct text is set on top.
  if (job.labels && job.labels.length) {
    const { data: fp, info: fi } = await sharp(final).raw().toBuffer({ resolveWithObject: true });
    const overlays = [];
    // Background patches get feathered edges so they blend into the map instead of showing a box.
    const softEdge = async (buf, w, h) => {
      const a = await sharp(
        Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><filter id="b"><feGaussianBlur stdDeviation="3"/></filter><rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="6" fill="white" filter="url(#b)"/></svg>`,
        ),
      )
        .extractChannel(0)
        .toBuffer();
      return sharp(buf).removeAlpha().joinChannel(a).png().toBuffer();
    };
    for (const l of job.labels) {
      const [x, y, w, h] = l.rect;
      const i = (Math.round(y + h / 2) * fi.width + Math.max(0, x - 2)) * fi.channels;
      if (l.from) {
        // textured backgrounds (satellite imagery): copy a clean patch from nearby instead
        const [dx, dy] = l.from;
        overlays.push({
          input: await softEdge(await sharp(final).extract({ left: x + dx, top: y + dy, width: w, height: h }).toBuffer(), w, h),
          left: x,
          top: y,
        });
      } else {
        const fill = l.fill || `rgb(${fp[i]},${fp[i + 1]},${fp[i + 2]})`;
        overlays.push({
          input: await softEdge(
            await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${fill}"/></svg>`)).png().toBuffer(),
            w,
            h,
          ),
          left: x,
          top: y,
        });
      }
      const text = await sharp({
        text: {
          text: `<span foreground="${l.color || "#5B5146"}" letter_spacing="${(l.spacing || 0) * 1024}">${l.text}</span>`,
          font: `${l.font || "Segoe UI Semibold"} ${l.size || 22}`,
          rgba: true,
          dpi: 72,
        },
      })
        .png()
        .toBuffer({ resolveWithObject: true });
      const tx = Math.round(x + (w - text.info.width) / 2);
      const ty = Math.round(y + (h - text.info.height) / 2);
      if (l.shadow) {
        const sh = await sharp(text.data).ensureAlpha().linear([0, 0, 0, 0.8], [0, 0, 0, 0]).blur(1.2).toBuffer();
        overlays.push({ input: sh, left: tx + 1, top: ty + 2 });
      }
      overlays.push({
        input: text.data,
        left: Math.round(x + (w - text.info.width) / 2),
        top: Math.round(y + (h - text.info.height) / 2),
      });
    }
    final = await sharp(final).composite(overlays).png().toBuffer();
  }
  const finalPath = path.join(outDir, "final.png");
  fs.writeFileSync(finalPath, final);
  console.log(`[${jobName}] done -> ${path.relative(ROOT, finalPath)}`);
}

run(process.argv[2]).catch((e) => {
  console.error(e.body ? JSON.stringify(e.body) : e);
  process.exit(1);
});
