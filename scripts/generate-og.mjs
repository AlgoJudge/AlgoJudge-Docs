// The Open Graph card, built from the wordmark rather than from a screenshot.
//
// **No text is drawn**, and that is the point: `public/algojudge-dark.svg` is
// paths, not glyphs, so the card comes out identical on any machine without a
// font having to be installed for the result to be right. A card that renders
// differently on the build server than on a workstation is a card nobody
// notices is wrong until it is on somebody's timeline.
//
// The result is committed, because it is the site's own artwork rather than
// build output: regenerating it should be a deliberate act with a visible diff.
import { writeFile } from "node:fs/promises";

import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;

// The navy the square mark sits on, so the card and the favicon are the same
// brand rather than two blues.
const BACKGROUND = { r: 0x11, g: 0x1c, b: 0x6b, alpha: 1 };

const LOGO = "public/algojudge-dark.svg";
const OUT = "public/og.png";

// Rendered at about four times the target and scaled down - rasterising at card
// size directly gives soft edges, and much above this the SVG exceeds sharp's
// pixel limit rather than getting sharper.
const wordmark = await sharp(LOGO, { density: 240 })
    .resize({ width: 820, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

const card = await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 4, background: BACKGROUND },
})
    .composite([{ input: wordmark, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();

await writeFile(OUT, card);

const { width, height } = await sharp(card).metadata();
console.log(`  ok   ${OUT}: ${width}x${height}, ${card.length} bytes`);
