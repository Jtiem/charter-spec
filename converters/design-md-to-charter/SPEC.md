# `DESIGN.md` → Charter converter specification

This document specifies how a `DESIGN.md` file is converted into a Charter. It is intentionally tool-neutral: any implementation that follows this mapping is a conforming converter.

The conversion is **partially lossy by design**. DTCG token blocks round-trip losslessly. Prose sections are preserved verbatim under `notes` but cannot be converted into enforcement rules without author intervention. The converter produces a *draft* Charter the author then tightens; it does not produce a finished Charter.

---

## 1. Input

A `DESIGN.md` file conforming to Google's open-source DESIGN.md spec ([blog.google announcement](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/), Apache 2.0, April 2026). The expected structure is:

- Optional YAML frontmatter (`---` delimited)
- A markdown body with nine predefined sections (titles may vary in case and punctuation; the converter MUST be tolerant):
  1. Visual Theme & Atmosphere
  2. Color Palette & Roles
  3. Typography Rules
  4. Spacing & Layout
  5. Interaction & Motion
  6. Imagery & Iconography
  7. Accessibility Requirements
  8. Brand Voice & Tone
  9. Governance & Change
- Embedded YAML token blocks (in fenced code blocks marked `yaml`) within the Color Palette, Typography, and Spacing sections (and possibly others).

## 2. Output

A Charter conforming to [`v1/charter.schema.json`](../../v1/charter.schema.json), with the following sections populated:

- `$schema` — set to `https://usecharter.dev/v1/charter.schema.json`
- `name` — extracted from the DESIGN.md's frontmatter (`name:` field) or its top-level heading. If neither is found, the converter MUST emit a warning and use the input file's basename.
- `version` — extracted from the DESIGN.md's frontmatter (`version:` field). If absent, default to `0.1.0`.
- `tokens` — populated from the embedded DTCG blocks (see §3)
- `components` — emitted as an empty allowlist with a `# TODO` comment (see §4)
- `rules` — emitted with the CHARTER.md defaults verbatim (see §5)
- `notes` — populated from the prose sections (see §6)

## 3. Token conversion (lossless)

For each fenced YAML code block in the DESIGN.md body that contains DTCG-formatted tokens (objects with `$value` and `$type` keys), the converter MUST:

1. Parse the YAML block.
2. Identify which top-level Charter token category the block belongs to, based on the surrounding section heading:
   - "Color Palette & Roles" → `tokens.color`
   - "Typography Rules" → `tokens.typography`
   - "Spacing & Layout" → `tokens.spacing`
   - "Interaction & Motion" → `tokens.motion` (custom category)
   - Other sections with token blocks → preserve at top level under a sanitized key
3. Merge the parsed tokens into the corresponding `tokens.<category>` Charter section.
4. Preserve all DTCG fields verbatim, including `$description`.

Token references (DTCG curly-brace syntax) MUST be preserved as-is. The converter does not resolve references; the linter does.

If two blocks declare the same token path, the converter MUST emit an error and refuse to produce output until the conflict is resolved upstream.

## 4. Components conversion

DESIGN.md has no formal component allowlist concept; component information is prose. The converter therefore:

1. Emits `components.registry: ""` (empty string)
2. Emits `components.allowed: []` (empty array)
3. Emits a `# TODO` comment in the output explaining that the author must populate these fields before `unknown_components` enforcement will fire

A future heuristic extension MAY scan the prose for component names (e.g., capitalized identifiers in code voice) and propose them as suggestions, but v1 deliberately does not — the false-positive rate is too high for a normative output.

## 5. Rules conversion

The converter MUST emit a complete `rules` block populated with the defaults from [CHARTER.md §5.2](../../CHARTER.md#52-defined-rules-v1):

```yaml
rules:
  delta_e_threshold: 2.0
  wcag_level: AA
  hardcoded_colors: error
  hardcoded_spacing: warn
  hardcoded_typography: warn
  off_token_typography: error
  unknown_components: error
  forbidden_components: error
  inline_styles: warn
  accessibility: error
```

The converter MUST emit a comment above the rules block instructing the author to review and tighten the defaults before shipping to production.

A future extension MAY parse the "Accessibility Requirements" prose for WCAG level mentions (`AA`, `AAA`) and adjust `wcag_level` accordingly, but v1 does not — preserving consistency is more valuable than partial inference.

## 6. Notes conversion (lossless prose preservation)

For each of the nine DESIGN.md prose sections (and any custom sections present), the converter MUST:

1. Map the section title to a snake_case key under `notes`:
   - "Visual Theme & Atmosphere" → `visual_theme_and_atmosphere`
   - "Color Palette & Roles" → `color_palette_and_roles`
   - "Typography Rules" → `typography_rules`
   - "Spacing & Layout" → `spacing_and_layout`
   - "Interaction & Motion" → `interaction_and_motion`
   - "Imagery & Iconography" → `imagery_and_iconography`
   - "Accessibility Requirements" → `accessibility_requirements`
   - "Brand Voice & Tone" → `brand_voice_and_tone`
   - "Governance & Change" → `governance_and_change`
2. Extract the section's prose content, excluding any fenced YAML blocks (those went to `tokens`).
3. Strip markdown heading syntax from the body.
4. Preserve inline markdown (links, emphasis, lists) verbatim — `notes` values are strings; consumers may render or display as they see fit.
5. Write the result as the value of the corresponding `notes.<key>`.

Custom sections (not in the nine standard) MUST be preserved as additional `notes` keys with sanitized snake_case names. The converter MUST emit a warning listing any non-standard sections it encountered.

## 7. Frontmatter

YAML frontmatter at the top of a DESIGN.md MAY contain arbitrary metadata. The converter MUST:

- Extract `name` and `version` into the corresponding Charter fields
- Preserve all other frontmatter keys under `notes.frontmatter` as a single multi-line string (verbatim, including the keys)

This ensures no DESIGN.md content is silently dropped.

## 8. Validation

The converter MUST validate its output against [`v1/charter.schema.json`](../../v1/charter.schema.json) before writing. If the output does not validate, the converter MUST report the schema error and refuse to write a corrupt Charter.

## 9. Warning and error semantics

The converter MUST surface:

- **Errors** — conditions that prevent producing a valid Charter (duplicate token paths, invalid DTCG, schema validation failure). The converter exits non-zero and writes no output.
- **Warnings** — conditions the author should review (non-standard section names, empty token sections, missing frontmatter `name`). The converter exits zero, writes output, and surfaces a structured list of warnings to stderr or a `--report` flag.

## 10. CLI surface (reference)

A conforming converter SHOULD provide at least:

```
charter-from-design-md <input.md> [-o <output.yaml>] [--report <report.json>]
```

Output defaults to `charter.yaml` in the current directory. The `--report` flag emits a JSON file enumerating warnings and conversion decisions for downstream tooling.

## 11. Round-trip

A `DESIGN.md` → Charter round-trip is partially lossy by design — the prose under `notes` cannot be converted back into 9 distinct DESIGN.md sections without ambiguity. However, the *tokens* section MUST round-trip losslessly (see [MEASUREMENT-PLAN.md §5](../../MEASUREMENT-PLAN.md#5-dtcg--charter-conversion-is-lossless-for-tokens)).

A future Charter → DESIGN.md emitter is out of scope for v1.

## 12. Reference implementation

A reference implementation will be provided in this directory at `src/`. Until then, this specification is sufficient for any party to implement the converter independently.

## 13. Limitations

- The converter cannot infer `components.allowed` from prose. This is the largest gap and the most important post-conversion author task.
- The converter cannot adjust `rules` defaults from prose. A team that says "we require AAA" in their DESIGN.md still gets `wcag_level: AA` in the converted Charter; the author must tighten.
- Custom DESIGN.md sections that contain token-shaped YAML blocks are preserved in `notes` only, not as tokens, unless the converter is extended with a custom mapping.

These limitations are stable for v1. Future versions may add inference passes (with author opt-in).
