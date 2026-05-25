#!/usr/bin/env node
// Sync content from the repo root into site/src/content/docs.
//
// The Charter spec keeps its canonical artifacts at the repo root
// (CHARTER.md, EVIDENCE.md, etc.) because that's where adopters see them
// on GitHub. The Starlight site mirrors them — it does NOT modify them.
//
// This script copies each source file into Starlight's content collection
// with three transformations:
//   1. Synthesizes YAML frontmatter from the first H1 heading.
//   2. Adds sidebar order, label, and editUrl pointing to the repo source.
//   3. Rewrites in-text relative links so cross-document references resolve
//      against Starlight's URL space (e.g. `CHARTER.md` → `/spec`).
//
// The generated files live in src/content/docs/ and are gitignored.
// Running this script is idempotent: it overwrites the targets.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..");
const docsDir = resolve(__dirname, "..", "src", "content", "docs");

// Map of source path (relative to repo root) → destination + frontmatter.
//
// The `order` value controls sidebar order within its group.
// Spec is first because it is the most-linked artifact.
const PAGES = [
  {
    src: "CHARTER.md",
    dest: "spec.md",
    label: "Spec",
    order: 1,
    description:
      "Charter v1 — the normative specification for a portable, machine-validatable design system contract.",
  },
  {
    src: "EVIDENCE.md",
    dest: "evidence.md",
    label: "Evidence",
    order: 2,
    description:
      "What's measured, what's preliminary. The empirical record behind Charter's design.",
  },
  {
    src: "MEASUREMENT-PLAN.md",
    dest: "measurement-plan.md",
    label: "Measurement plan",
    order: 3,
    description:
      "The nine experiments scheduled before Charter v1.0.0 final.",
  },
  {
    src: "PHILOSOPHY.md",
    dest: "philosophy.md",
    label: "Philosophy",
    order: 4,
    description:
      "Why Charter exists. The design rationale, in thirteen sections.",
  },
  {
    src: "COMPARISON.md",
    dest: "comparison.md",
    label: "Comparison",
    order: 5,
    description:
      "Charter vs DESIGN.md, DTCG tokens, Style Dictionary, Tailwind, and Figma Variables.",
  },
  {
    src: "CHANGELOG.md",
    dest: "changelog.md",
    label: "Changelog",
    order: 10,
    description: "Charter release history.",
  },
  {
    src: "CONTRIBUTING.md",
    dest: "contributing.md",
    label: "Contributing",
    order: 11,
    description: "How to propose changes to the Charter spec.",
  },
  {
    src: "converters/README.md",
    dest: "converters/index.md",
    label: "Converters",
    order: 1,
    description:
      "Tools that convert other design system formats into Charter.",
  },
  {
    src: "converters/design-md-to-charter/README.md",
    dest: "converters/design-md.md",
    label: "DESIGN.md → Charter",
    order: 2,
    description:
      "Convert an existing DESIGN.md file into a draft Charter.",
  },
  {
    src: "converters/design-md-to-charter/SPEC.md",
    dest: "converters/design-md-spec.md",
    label: "DESIGN.md converter spec",
    order: 3,
    description:
      "The normative spec for the DESIGN.md → Charter converter.",
  },
];

// Map of source-filename references → Starlight URLs.
// Used by the link rewriter below. Keys are matched against link targets
// after stripping any leading `./` or `../` segments.
const LINK_MAP = new Map([
  ["CHARTER.md", "/spec/"],
  ["EVIDENCE.md", "/evidence/"],
  ["MEASUREMENT-PLAN.md", "/measurement-plan/"],
  ["PHILOSOPHY.md", "/philosophy/"],
  ["COMPARISON.md", "/comparison/"],
  ["CHANGELOG.md", "/changelog/"],
  ["CONTRIBUTING.md", "/contributing/"],
  ["README.md", "/"],
  ["converters/README.md", "/converters/"],
  ["converters/design-md-to-charter/", "/converters/design-md/"],
  ["converters/design-md-to-charter/README.md", "/converters/design-md/"],
  ["converters/design-md-to-charter/SPEC.md", "/converters/design-md-spec/"],
  ["examples/README.md", "/examples/"],
  // Asset paths — served from /v1/ and /examples/ via site/public/.
  ["v1/charter.schema.json", "/v1/charter.schema.json"],
  ["examples/charter.minimal.yaml", "/examples/charter.minimal.yaml"],
  ["examples/charter.complete.yaml", "/examples/charter.complete.yaml"],
  ["examples/charter.from-design-md.yaml", "/examples/charter.from-design-md.yaml"],
  ["charter.minimal.yaml", "/examples/charter.minimal.yaml"],
  ["charter.complete.yaml", "/examples/charter.complete.yaml"],
  ["charter.from-design-md.yaml", "/examples/charter.from-design-md.yaml"],
  ["LICENSE", "https://github.com/Jtiem/charter-spec/blob/main/LICENSE"],
  ["SPEC.md", "/converters/design-md-spec/"],
]);

/**
 * Strip leading `./`, `../`, or `/` segments from a link target so it can
 * be matched against LINK_MAP keys regardless of where the source file
 * sits in the repo.
 */
function normalizeLink(target) {
  // Drop any fragment (#anchor) and query — we re-attach the fragment after.
  const hashIdx = target.indexOf("#");
  const fragment = hashIdx >= 0 ? target.slice(hashIdx) : "";
  const path = hashIdx >= 0 ? target.slice(0, hashIdx) : target;

  // Remove leading ./ and ../ pairs.
  let cleaned = path.replace(/^(?:\.\.\/)+/, "").replace(/^\.\//, "");
  // Remove leading slash (root-relative).
  cleaned = cleaned.replace(/^\//, "");
  return { cleaned, fragment };
}

/**
 * Rewrite markdown links so cross-document references in the source repo
 * resolve to Starlight URLs.
 *
 * Only relative links are rewritten. External URLs (http/https/mailto)
 * and bare anchors (#section) pass through untouched.
 */
function rewriteLinks(markdown) {
  return markdown.replace(/(\[(?:[^\]]*)\])\(([^)]+)\)/g, (match, label, target) => {
    // Skip absolute URLs and mailto:/tel: schemes.
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return match;
    // Skip pure anchor links.
    if (target.startsWith("#")) return match;

    const { cleaned, fragment } = normalizeLink(target);

    // Direct hit on the link map.
    if (LINK_MAP.has(cleaned)) {
      return `${label}(${LINK_MAP.get(cleaned)}${fragment})`;
    }

    // Some links use trailing-slash directory form (e.g. `converters/design-md-to-charter/`).
    const withSlash = cleaned.endsWith("/") ? cleaned : cleaned + "/";
    if (LINK_MAP.has(withSlash)) {
      return `${label}(${LINK_MAP.get(withSlash)}${fragment})`;
    }

    // Unmapped relative link — leave it alone. The build will flag it if it
    // resolves to nothing; better that than silently rewriting to a bad URL.
    return match;
  });
}

/**
 * Extract the first H1 from a markdown body. Returns the text without the
 * leading `# `. Throws if no H1 is found.
 */
function extractTitle(markdown, srcPath) {
  const match = markdown.match(/^#\s+(.+?)\s*$/m);
  if (!match) {
    throw new Error(`No H1 found in ${srcPath}; cannot synthesize title.`);
  }
  return match[1].trim();
}

/**
 * Remove the first H1 from the markdown body. Starlight renders the title
 * from frontmatter as the page heading, so leaving the H1 in would duplicate it.
 */
function stripFirstH1(markdown) {
  return markdown.replace(/^#\s+.+?\s*\n+/m, "");
}

/**
 * Escape a string for YAML single-quoted scalar context.
 */
function yamlEscape(value) {
  return value.replace(/'/g, "''");
}

function processFile(page) {
  const srcAbs = join(repoRoot, page.src);
  if (!existsSync(srcAbs)) {
    throw new Error(`Source not found: ${srcAbs}`);
  }
  const raw = readFileSync(srcAbs, "utf8");
  const title = extractTitle(raw, page.src);
  const body = stripFirstH1(raw);
  const rewritten = rewriteLinks(body);

  const editUrl = `https://github.com/Jtiem/charter-spec/edit/main/${page.src}`;

  // Frontmatter is built explicitly so the YAML is predictable and minimal.
  const frontmatter = [
    "---",
    `title: '${yamlEscape(title)}'`,
    `description: '${yamlEscape(page.description)}'`,
    `editUrl: '${editUrl}'`,
    "sidebar:",
    `  label: '${yamlEscape(page.label)}'`,
    `  order: ${page.order}`,
    "---",
    "",
  ].join("\n");

  const destAbs = join(docsDir, page.dest);
  mkdirSync(dirname(destAbs), { recursive: true });
  writeFileSync(destAbs, frontmatter + rewritten, "utf8");
  return destAbs;
}

function main() {
  mkdirSync(docsDir, { recursive: true });
  const written = PAGES.map(processFile);
  console.log(`sync-content: wrote ${written.length} files into ${docsDir}`);
  for (const p of written) console.log("  " + p);
}

main();
