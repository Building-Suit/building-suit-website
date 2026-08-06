#!/usr/bin/env node
// Verifies design-system.lock.json still matches the vendored token JSON, the generated
// CSS, and the logo assets — and that no component/page/CSS file outside the generated
// token layer hardcodes a raw hex color. Exits non-zero on any mismatch.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCK_FILE = join(ROOT, "design-system.lock.json");

function sha256(buf) {
  return `sha256:${createHash("sha256").update(buf).digest("hex")}`;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

function main() {
  if (!existsSync(LOCK_FILE)) {
    fail("design-system.lock.json is missing — run `pnpm tokens:sync` first.");
    return;
  }
  const lock = JSON.parse(readFileSync(LOCK_FILE, "utf8"));

  for (const [relPath, expected] of Object.entries(lock.hashes)) {
    const abs = join(ROOT, relPath);
    if (!existsSync(abs)) {
      fail(`${relPath}: file missing`);
      continue;
    }
    const actual = sha256(readFileSync(abs));
    if (actual !== expected) {
      fail(`${relPath}: hash mismatch (lock file is stale — run \`pnpm tokens:sync\`)`);
    } else {
      ok(`${relPath} matches lock file`);
    }
  }

  // Raw-hex scan: component/page/CSS source must consume --bs-* custom properties,
  // not hardcode canonical hex values. The generated token file itself is exempt.
  const scanDirs = ["app/components", "app/pages", "app/assets/css"];
  const exempt = new Set(["app/assets/css/building-suit-tokens.css"]);
  const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;
  let hexHits = 0;

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const abs = join(dir, entry);
      const rel = relative(ROOT, abs);
      if (statSync(abs).isDirectory()) {
        walk(abs);
        continue;
      }
      if (exempt.has(rel)) continue;
      if (!/\.(vue|css|ts)$/.test(entry)) continue;
      const text = readFileSync(abs, "utf8");
      const matches = text.match(hexPattern);
      if (matches) {
        hexHits += matches.length;
        fail(`${rel}: contains raw hex color(s) ${matches.join(", ")} — use a --bs-* token instead`);
      }
    }
  }

  for (const dir of scanDirs) {
    const abs = join(ROOT, dir);
    if (existsSync(abs)) walk(abs);
  }
  if (hexHits === 0) {
    ok("no raw hex colors found in app/components, app/pages, app/assets/css (outside the generated token file)");
  }

  if (process.exitCode) {
    console.error("\nDesign-system verification FAILED.");
  } else {
    console.log("\nDesign-system verification passed.");
  }
}

main();
