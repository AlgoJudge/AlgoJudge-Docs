// Fetches the artefacts other repositories own, pinned by `content-sources.json`.
//
// **Nothing here is committed.** `.sources/` is build input that belongs to
// another repository; a copy in this one would be a second place for it to be
// wrong. What is committed is the pin, so two people building the same commit
// build the same site.
//
// A cached file whose hash already matches is left alone, so a rebuild costs no
// network.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const OUT = ".sources";

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

const manifest = JSON.parse(await readFile("content-sources.json", "utf8"));

let failed = false;

for (const [name, source] of Object.entries(manifest)) {
    if (name.startsWith("$")) continue;

    const target = join(OUT, `${name}.json`);
    const url = `https://raw.githubusercontent.com/${source.repository}/${source.ref}/${source.path}`;

    // Already here and already right.
    const cached = await readFile(target).catch(() => null);
    if (cached && sha256(cached) === source.sha256) {
        console.log(`  ok   ${name}: cached, ${source.sha256.slice(0, 12)}`);
        continue;
    }

    const response = await fetch(url);
    if (!response.ok) {
        console.error(`  FAIL ${name}: ${response.status} ${response.statusText}`);
        console.error(`         ${url}`);
        failed = true;
        continue;
    }

    const body = Buffer.from(await response.arrayBuffer());
    const got = sha256(body);

    // **A mismatch is refused rather than reported.** The point of pinning a ref
    // is that the bytes behind it do not move; if they have, the site would
    // document something nobody agreed to publish.
    if (got !== source.sha256) {
        console.error(`  FAIL ${name}: the pinned ref served different bytes`);
        console.error(`         expected ${source.sha256}`);
        console.error(`         got      ${got}`);
        console.error(`         ${url}`);
        failed = true;
        continue;
    }

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, body);
    console.log(`  ok   ${name}: fetched ${source.repository}@${source.ref.slice(0, 12)}, ${got.slice(0, 12)}`);
}

if (failed) process.exit(1);
