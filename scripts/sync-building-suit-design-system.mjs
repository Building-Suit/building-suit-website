#!/usr/bin/env node
// Regenerates app/assets/css/building-suit-tokens.css from design-system/design-tokens.source.json
// (a DTCG 2025.10 token tree) and rewrites design-system.lock.json with fresh provenance hashes.
// Do not hand-edit the generated CSS file — edit the vendored JSON (see design-system/PROVENANCE.md)
// and rerun `pnpm tokens:sync`.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_JSON = join(ROOT, "design-system/design-tokens.source.json");
const OUTPUT_CSS = join(ROOT, "app/assets/css/building-suit-tokens.css");
const LOCK_FILE = join(ROOT, "design-system.lock.json");
const LOGO_DARK = join(ROOT, "public/brand/building-suit-logo-dark.png");
const LOGO_LIGHT = join(ROOT, "public/brand/building-suit-logo-light.png");

const PROVENANCE = {
  sourceRepository: "tareq-abdelwhap/building-suit",
  sourcePath: ".docs/building-suit-brand-guidelines/07-design-tokens/design-tokens.json",
  sourceRef: "origin/codex/remove-prototype",
  sourceCommitSha: "d746c578539017caa046a6a34a7f1f949df4356a",
};

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function kebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function loadTokens() {
  const raw = readFileSync(SOURCE_JSON, "utf8");
  return { raw, tree: JSON.parse(raw) };
}

// Resolve a "{a.b.c}" alias against the full token tree, returning the leaf $value.
function resolveAlias(tree, refPath) {
  const parts = refPath.split(".");
  let node = tree;
  for (const part of parts) {
    if (node == null) return undefined;
    node = node[part];
  }
  if (node && typeof node === "object" && "$value" in node) {
    return resolveValue(tree, node.$value);
  }
  return node;
}

function resolveValue(tree, value) {
  if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
    return resolveAlias(tree, value.slice(1, -1));
  }
  return value;
}

function colorToCss(value) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  const { hex, alpha } = value;
  if (alpha === undefined || alpha === 1) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function dimensionToCss(value) {
  if (value == null) return null;
  return `${value.value}${value.unit}`;
}

// Walk a token group, calling onLeaf(path[], resolvedValue, rawNode) for every $value leaf.
function walk(tree, node, path, onLeaf) {
  if (node == null || typeof node !== "object") return;
  if ("$value" in node) {
    onLeaf(path, resolveValue(tree, node.$value), node);
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    walk(tree, child, [...path, key], onLeaf);
  }
}

function buildRootVars(tree) {
  const lines = [];

  walk(tree, tree.color?.brand, ["color", "brand"], (path, val) => {
    lines.push(`  --bs-color-brand-${kebab(path.slice(2).join("-"))}: ${colorToCss(val)};`);
  });
  walk(tree, tree.color?.brandContext, ["color", "brand-context"], (path, val) => {
    lines.push(`  --bs-color-brand-context-${kebab(path.slice(2).join("-"))}: ${colorToCss(val)};`);
  });
  walk(tree, tree.color?.neutral, ["color", "neutral"], (path, val) => {
    lines.push(`  --bs-color-neutral-${kebab(path.slice(2).join("-"))}: ${colorToCss(val)};`);
  });
  walk(tree, tree.color?.secondary, ["color", "secondary"], (path, val) => {
    lines.push(`  --bs-color-secondary-${kebab(path.slice(2).join("-"))}: ${colorToCss(val)};`);
  });
  walk(tree, tree.color?.functional, ["color", "functional"], (path, val) => {
    lines.push(`  --bs-color-functional-${kebab(path.slice(2).join("-"))}: ${colorToCss(val)};`);
  });
  walk(tree, tree.color?.categorical, ["color", "categorical"], (path, val) => {
    lines.push(`  --bs-color-categorical-${kebab(path.slice(2).join("-"))}: ${colorToCss(val)};`);
  });
  walk(tree, tree.color?.role, ["color", "role"], (path, val) => {
    lines.push(`  --bs-color-role-${kebab(path.slice(2).join("-"))}: ${colorToCss(val)};`);
  });

  // Gradients
  for (const [name, node] of Object.entries(tree.gradient ?? {})) {
    if (name.startsWith("$")) continue;
    const angle = node.$extensions?.["com.building-suit.css"]?.angle ?? "180deg";
    const stops = node.$value
      .map((stop) => `${colorToCss(resolveValue(tree, stop.color))} ${Math.round(stop.position * 100)}%`)
      .join(", ");
    lines.push(`  --bs-gradient-${name}: linear-gradient(${angle}, ${stops});`);
  }

  // Typography
  const fam = tree.typography.fontFamily;
  lines.push(`  --bs-typography-font-family-latin: ${fam.latin.$value.map((f) => (f.includes(" ") ? `"${f}"` : f)).join(", ")};`);
  lines.push(`  --bs-typography-font-family-arabic: ${fam.arabic.$value.map((f) => (f.includes(" ") ? `"${f}"` : f)).join(", ")};`);
  for (const [name, node] of Object.entries(tree.typography.fontWeight)) {
    if (name.startsWith("$")) continue;
    lines.push(`  --bs-typography-font-weight-${kebab(name)}: ${node.$value};`);
  }
  lines.push(`  --bs-typography-locale-latin-line-height-multiplier: ${tree.typography.locale.latinLineHeightMultiplier.$value};`);
  lines.push(`  --bs-typography-locale-arabic-line-height-multiplier: ${tree.typography.locale.arabicLineHeightMultiplier.$value};`);
  for (const [name, node] of Object.entries(tree.typography.scale)) {
    if (name.startsWith("$")) continue;
    const v = node.$value;
    lines.push(`  --bs-type-${kebab(name)}-size: ${v.fontSize.value}px;`);
    lines.push(`  --bs-type-${kebab(name)}-lh: ${Math.round(v.fontSize.value * v.lineHeight)}px;`);
    lines.push(`  --bs-type-${kebab(name)}-weight: ${resolveValue(tree, v.fontWeight)};`);
  }

  // Spacing / radius / size
  for (const [name, node] of Object.entries(tree.spacing)) {
    if (name.startsWith("$")) continue;
    lines.push(`  --bs-spacing-${name}: ${dimensionToCss(node.$value)};`);
  }
  for (const [name, node] of Object.entries(tree.radius)) {
    if (name.startsWith("$")) continue;
    lines.push(`  --bs-radius-${kebab(name)}: ${dimensionToCss(node.$value)};`);
  }
  for (const [name, node] of Object.entries(tree.size)) {
    if (name.startsWith("$")) continue;
    lines.push(`  --bs-size-${kebab(name)}: ${dimensionToCss(node.$value)};`);
  }

  // Duration / easing (component-level shorthand — see docs/building-suit-source-audit.md
  // contradiction #2: page-level structural motion uses app/utils/buildingSuitMotion.ts instead)
  for (const [name, node] of Object.entries(tree.duration)) {
    if (name.startsWith("$")) continue;
    lines.push(`  --bs-duration-${kebab(name)}: ${dimensionToCss(node.$value)};`);
  }
  const stdEase = tree.easing.standard.$value;
  lines.push(`  --bs-easing-standard: cubic-bezier(${stdEase.join(", ")});`);

  // Shadows
  for (const [name, node] of Object.entries(tree.shadow)) {
    if (name.startsWith("$")) continue;
    const v = node.$value;
    lines.push(
      `  --bs-shadow-${kebab(name)}: ${dimensionToCss(v.offsetX)} ${dimensionToCss(v.offsetY)} ${dimensionToCss(v.blur)} ${dimensionToCss(v.spread)} ${colorToCss(v.color)};`
    );
  }

  return lines;
}

function buildRoleBlock(tree, mode) {
  const role = tree.color.role[mode];
  const functional = tree.color.functional[mode];
  const shadowSuffix = mode === "dark" ? "-dark" : "";
  const lines = [];
  for (const [name] of Object.entries(role)) {
    if (name.startsWith("$")) continue;
    lines.push(`  --bs-${kebab(name)}: var(--bs-color-role-${mode}-${kebab(name)});`);
  }
  for (const [name] of Object.entries(functional)) {
    if (name.startsWith("$")) continue;
    const short = name.replace(/Foreground$/, "").replace(/Background$/, "-bg").replace(/Text$/, "-text").replace(/TextOnSolid$/, "-text-on-solid").replace(/Border$/, "-border").replace(/Icon$/, "-icon");
    lines.push(`  --bs-status-${kebab(short)}: var(--bs-color-functional-${mode}-${kebab(name)});`);
  }
  lines.push(`  --bs-elevation-1: var(--bs-shadow-elevation1${shadowSuffix});`);
  lines.push(`  --bs-elevation-2: var(--bs-shadow-elevation2${shadowSuffix});`);
  lines.push(`  --bs-elevation-3: var(--bs-shadow-elevation3${shadowSuffix});`);
  return lines;
}

function main() {
  const { raw, tree } = loadTokens();
  const header = `/*
 * Building Suit design tokens — GENERATED FILE. Do not hand-edit.
 *
 * Generated by scripts/sync-building-suit-design-system.mjs from the vendored
 * DTCG token tree at design-system/design-tokens.source.json.
 *
 * Source repository : ${PROVENANCE.sourceRepository}
 * Source path        : ${PROVENANCE.sourcePath}
 * Source ref          : ${PROVENANCE.sourceRef}
 * Source commit SHA  : ${PROVENANCE.sourceCommitSha}
 * Generation date     : 2026-08-06
 *
 * Run \`pnpm tokens:sync\` after updating design-system/design-tokens.source.json.
 * Run \`pnpm tokens:verify\` to confirm this file and design-system.lock.json are still in sync.
 */
`;

  const rootVars = buildRootVars(tree);
  const lightVars = buildRoleBlock(tree, "light");
  const darkVars = buildRoleBlock(tree, "dark");

  const css = [
    header,
    ":root {",
    ...rootVars,
    "}",
    "",
    ':root, [data-theme="light"] {',
    ...lightVars,
    "}",
    "",
    '[data-theme="dark"] {',
    ...darkVars,
    "}",
    "",
  ].join("\n");

  writeFileSync(OUTPUT_CSS, css, "utf8");

  const lock = {
    generatedAt: "2026-08-06",
    source: PROVENANCE,
    hashes: {
      "design-system/design-tokens.source.json": `sha256:${sha256(raw)}`,
      "app/assets/css/building-suit-tokens.css": `sha256:${sha256(css)}`,
      "public/brand/building-suit-logo-dark.png": `sha256:${sha256(readFileSync(LOGO_DARK))}`,
      "public/brand/building-suit-logo-light.png": `sha256:${sha256(readFileSync(LOGO_LIGHT))}`,
    },
    logoGitBlobSha: {
      "building-suit-logo-dark.png": "be54d13ab1a43f756530186fbb6ee14cf4bde7bb",
      "building-suit-logo-light.png": "b11a12bff243beccdf44fc4387f4f2d9265d8755",
    },
    packages: {
      "@fontsource-variable/manrope": "^5.3.0",
      "@fontsource/ibm-plex-sans-arabic": "^5.3.0",
      "@hugeicons/vue": "^1.0.7",
      "@hugeicons/core-free-icons": "^4.2.3",
      "motion-v": "^2.3.0",
    },
  };
  writeFileSync(LOCK_FILE, JSON.stringify(lock, null, 2) + "\n", "utf8");

  console.log(`Wrote ${OUTPUT_CSS}`);
  console.log(`Wrote ${LOCK_FILE}`);
}

main();
