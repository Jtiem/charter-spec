# Comparison

A Charter is not the first attempt to declare a design system in a machine-readable file. This document compares Charter to the formats and conventions it sits alongside, with an honest assessment of where Charter is stronger, where it's weaker, and where the two can coexist.

The intent is to help a reader decide whether to adopt Charter, whether to keep an existing format, or whether to use both. None of these comparisons are zero-sum.

---

## Charter vs `DESIGN.md`

This is the most important comparison. `DESIGN.md` is Google's open-source markdown spec ([blog.google announcement](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/), Apache 2.0, April 2026) — a markdown file with 9 predefined sections pairing W3C DTCG tokens with plain-text rationale. It is the closest analog to Charter and the most likely format a Charter adopter is migrating from.

|  | `DESIGN.md` | Charter |
| --- | --- | --- |
| Format | Markdown with embedded YAML token blocks | YAML or JSON, schema-validated |
| Token format | W3C DTCG (in code blocks within markdown) | W3C DTCG (as the document body) |
| Audience | Models reading the file as a prompt at generation time | Models + linters + CI + humans, at any phase |
| Enforcement | None — prose advisory | Schema-validated structure; per-rule severity; CI-gateable |
| Component allowlist | Not normative; prose description | Normative — `components.allowed` |
| Accessibility | Aspirational; suggests AI "can validate against WCAG" but no checker exists | Enforced — `wcag_level` + `accessibility` rule, executed by a Charter-aware linter |
| Drift detection | No | Yes — `delta_e_threshold`, `hardcoded_colors`, etc. |
| Versioning | Document version (`version` field in YAML frontmatter) | Schema version (`$schema` URL) + content version (`version` field) |
| Inline rationale | Native (markdown prose) | Native (`notes` field, prose preserved on round-trip) |
| Reference implementation | Stitch (Google) | Flint |

**Where `DESIGN.md` is stronger:** lower adoption friction for prose-first teams. A `DESIGN.md` is just markdown — anyone can write one, no schema to learn. As a prompt artifact for a model with no linter in the loop, it is sufficient.

**Where Charter is stronger:** enforceability. A team that wants to *block* drift, not just *describe* the design system, needs a format a test can refuse. `DESIGN.md` cannot fail a build. A Charter can.

**Can they coexist?** Yes. Many teams will keep a `DESIGN.md` for the model-prompt use case (Stitch, Cursor, Claude Code reading it as context) and a Charter for the audit use case (CI, IDE diagnostics, export gates). Because Charter uses DTCG tokens, the same token block can live in both files, generated from one source. The [`converters/design-md-to-charter/`](converters/design-md-to-charter/) tool emits a Charter draft from any `DESIGN.md` to make this trivially easy.

**One-line summary:** `DESIGN.md` is a prompt. A Charter is a contract.

---

## Charter vs `tokens.json` (raw W3C DTCG)

A raw DTCG `tokens.json` declares the tokens of a design system and nothing else.

|  | `tokens.json` (raw DTCG) | Charter |
| --- | --- | --- |
| Tokens | Yes — primary content | Yes — `tokens` field |
| Components | No | Yes — `components` field |
| Rules | No | Yes — `rules` field |
| Profiles | No | Yes — `profiles` field |
| Schema validation | DTCG schema only | DTCG token schema + Charter envelope |
| Rationale | No native place; some implementations use `$description` per token | Yes — top-level `notes` field |

**Where `tokens.json` is stronger:** narrower scope. If a team only needs tokens — for Style Dictionary export, platform pipelines, or Figma sync — `tokens.json` is exactly the right tool. Adding Charter's components/rules layer would be unused weight.

**Where Charter is stronger:** scope. If a team wants component allowlists, enforcement rules, or per-profile overrides, `tokens.json` cannot express them. A Charter is a strict superset of `tokens.json` in the tokens dimension and adds three more dimensions (components, rules, profiles).

**Can they coexist?** Trivially. A Charter's `tokens` block is valid DTCG. A team can extract just `tokens` from a Charter and feed it to any DTCG-consuming tool.

**One-line summary:** `tokens.json` defines the tokens; Charter defines the *contract* the tokens are part of.

---

## Charter vs Style Dictionary

[Style Dictionary](https://amzn.github.io/style-dictionary/) (Amazon, MIT) is a build-time tool that takes design tokens (in JSON, YAML, or DTCG) and emits platform-specific outputs: CSS variables, iOS XML, Android XML, Swift, Kotlin, Tailwind config, etc. It is the de facto standard for token transformation in large design systems.

|  | Style Dictionary | Charter |
| --- | --- | --- |
| Purpose | Transform tokens into platform outputs | Declare design-system constraints for audit |
| Input | Tokens (any format) + config | Charter (single file) |
| Output | Platform-specific token files (CSS, Swift, Kotlin, etc.) | None (the file *is* the output) |
| Enforcement | No — generation tool, not audit tool | Yes |
| Component allowlist | No | Yes |
| Runs at | Build time | Audit time / CI / IDE |

**Where Style Dictionary is stronger:** token transformation. Charter has no opinion on how DTCG tokens get into a CSS file, a Swift enum, or a Compose theme. Style Dictionary owns that pipeline.

**Where Charter is stronger:** audit. Style Dictionary will happily emit a CSS variable for `--color-primary` and then watch as an AI agent writes `color: #f5a40e` (close to primary, but not it) and emit no warning. Charter's job starts where Style Dictionary's ends.

**Can they coexist?** Designed to. Style Dictionary consumes a Charter's `tokens` block as input. Charter consumes Style Dictionary's outputs as the things to audit against. They are upstream and downstream of each other.

**One-line summary:** Style Dictionary makes the tokens; Charter checks that they're used.

---

## Charter vs Tailwind config

A Tailwind config (`tailwind.config.js` or `.ts`) declares the design tokens of a Tailwind-based design system in a framework-specific format. For many web teams in 2026, it is the de facto design-system source of truth.

|  | Tailwind config | Charter |
| --- | --- | --- |
| Tokens | Yes — `theme.colors`, `theme.spacing`, etc. | Yes — `tokens` field (DTCG) |
| Format | JavaScript / TypeScript (executable) | YAML / JSON (declarative) |
| Components | No | Yes |
| Rules | No (lint is separate) | Yes |
| Audience | Tailwind compiler | Models + linters + CI |
| Stack scope | Tailwind only | Framework-agnostic |

**Where Tailwind config is stronger:** native to the stack it serves. A web team using Tailwind has the config anyway; not requiring a parallel file is an honest win.

**Where Charter is stronger:** stack-portable + machine-readable. Tailwind config is executable JavaScript, which means an AI agent reading it must execute or interpret it — a brittle path. A Charter is data, validated by schema, readable by any tool. And a non-Tailwind team (Vue with PrimeVue, Svelte with shadcn-svelte, native with SwiftUI) cannot use a Tailwind config; they can use a Charter.

**Can they coexist?** Yes, and many will. A Tailwind team can generate a Charter from their `tailwind.config.ts` (a one-shot converter, similar to the `DESIGN.md` converter, planned for `converters/tailwind-to-charter/`). The Charter then becomes the source of truth for audit; the Tailwind config remains the source of truth for compilation.

**One-line summary:** Tailwind config compiles your design system into CSS; Charter declares the contract your design system enforces.

---

## Charter vs Figma Variables

Figma Variables (introduced 2023, mature in 2026) are Figma's native design-token system: colors, numbers, strings, booleans, organized into collections and modes, exportable via the [REST API](https://www.figma.com/developers/api).

|  | Figma Variables | Charter |
| --- | --- | --- |
| Token format | Figma-proprietary, exportable to DTCG | DTCG native |
| Mode support (light/dark) | Yes — modes per collection | Limited (profiles can model this) |
| Components | No (Figma has components, but Variables aren't tied to them) | Yes |
| Rules | No | Yes |
| Where it lives | Figma file (cloud) | Project repo (local) |
| Source of truth | Designer-owned | Engineer-owned (typically) |

**Where Figma Variables is stronger:** designer-native authoring. Designers write tokens in Figma; the moment they save, the source of truth updates. No file-based workflow can match that for the design side.

**Where Charter is stronger:** the audit side. Figma Variables describe what's *defined*; they don't describe what's *required*. A Charter declares "no color outside this set may appear in production code," which is not a thing Figma Variables can express.

**Can they coexist?** Designed to. The Figma → Charter sync is a primary integration path: design tokens flow from Figma into the Charter's `tokens` block via the Figma REST API. Designers stay in Figma; engineers and CI see the Charter. The reference implementation (Flint) ships this sync.

**One-line summary:** Figma Variables are where tokens *live*; Charter is where they *bind*.

---

## Charter vs a Markdown style guide

A traditional Markdown style guide — `STYLE.md`, design-system docs in Storybook, brand guidelines as a Notion page — is the historical default. Most design systems still ship as prose.

|  | Markdown style guide | Charter |
| --- | --- | --- |
| Format | Prose | Schema-validated structure |
| Audience | Humans | Humans + machines |
| Enforcement | None | Yes |
| Discoverability | Variable (depends on linking, search) | Single file at project root |

**Where Markdown is stronger:** narrative. A long-form style guide can explain the *culture* of a design system in a way no machine-readable format can. "We chose amber over orange because orange-700 looked muddy against the surface" — that sentence has a place, and Charter does provide it (`notes`), but a 30-page brand book has more room.

**Where Charter is stronger:** machine readability and enforceability. A Markdown style guide is read at *adoption time* by humans; it cannot be consulted at *audit time* by a linter.

**Can they coexist?** Yes. A team can keep their long-form style guide and emit the machine-readable subset as a Charter. The Charter's `notes` field can link back to the long-form doc for any reader who wants the narrative.

**One-line summary:** Markdown style guides are what your design system *is*; a Charter is what your design system *checks*.

---

## Charter vs AI codegen agents (Kombai, v0, Locofy, Anima)

AI codegen agents — [Kombai](https://kombai.com/), [v0](https://v0.dev), [Locofy](https://www.locofy.ai/), [Anima](https://www.animaapp.com/) — take design input (Figma, screenshots, prompts) and emit frontend code. They are the most active product category in 2026 adjacent to Charter, and the comparison most likely to be misread.

Charter is not an alternative to a codegen agent. Charter is the contract a codegen agent's output can be measured against. The comparison below is between *the codegen agent on its own* and *the codegen agent plus a Charter-aware linter in the loop.*

|  | Codegen agent (alone) | Codegen agent + Charter |
| --- | --- | --- |
| Produces code from a design | Yes | Yes (unchanged) |
| Reuses existing components | Heuristic; varies by agent | Verified against `components.allowed` |
| Stays inside the token palette | Aspirational | Enforced via `delta_e_threshold` + `hardcoded_colors` |
| A11y floor | Claimed; rarely audited | Enforced via `wcag_level` rule |
| Failure mode | "The diff looks weird, ship it anyway" | "The build refuses; here's the offending line" |

**Where the codegen agent is stronger:** authorship. Writing the code is what the agent does. Charter has no opinion on which lines to write or in what order — that's the agent's job.

**Where Charter is stronger:** verification. The codegen agent's strongest current claim is some variant of *"production-ready code"*. None of the agents in the category publish a falsifiable definition of *production-ready*. Charter is that definition, externalized into a file every agent's output can be checked against.

**Can they coexist?** They are designed to. A Charter-conformant agent would emit code that passes a Charter-aware linter on first run. No such agent exists today; the reference implementation (Flint) ships the linter and the workflow that wraps any agent's output in the audit. The expectation is that the highest-quality codegen agents will eventually publish a Charter conformance badge, the way frontend tools today publish a TypeScript or ESLint conformance badge.

**One-line summary:** Codegen agents write the code; a Charter defines what the code has to satisfy before it ships.

---

## Where Charter is weaker than the rest

Honesty: there are things a Charter does poorly, and reviewers should know them.

**Charter is not great for first-draft authoring.** Writing a Charter from scratch with no prior tokens or component library is more friction than writing prose. Teams with neither should start with [`examples/charter.minimal.yaml`](examples/charter.minimal.yaml) and iterate, or write a `DESIGN.md` first and convert.

**Charter is not a design tool.** Designers do not author Charters in their flow; engineers and design ops do. The Charter is downstream of design tooling (Figma, design-system docs); it is not the place designers go to define a system.

**Charter does not solve the "what *is* my design system?" problem.** A team that has not made the tokens-and-components decisions cannot write a Charter, because Charter is a *declaration* of those decisions, not a way to make them.

**Charter v1 has no monorepo story.** One Charter per project. A monorepo with a shared design system across many products has to either duplicate the Charter or factor it into a `core-charter` package — neither is ideal. v2 will address this.

**Charter relies on linter quality.** A Charter that no linter audits is a markdown file with extra syntax. The reference implementation (Flint) handles the audit; teams using other linters need to verify their linter actually implements Charter's rules correctly.

These are honest gaps. None of them are fatal. All of them are tractable.

---

## So which one should you use?

If you have prose only → write a `DESIGN.md` first, convert to Charter when you want enforcement.

If you have `tokens.json` already → wrap it in a Charter envelope and add a `rules` block. ~10 minutes of work.

If you have Style Dictionary → keep it. Add Charter alongside, with the same token source. Charter handles audit; Style Dictionary handles transformation.

If you have a Tailwind config → keep it. Generate a Charter from it (converter planned). Charter handles audit; Tailwind handles compilation.

If you have Figma Variables → sync them into a Charter `tokens` block via the Figma API. Charter handles audit; Figma stays designer-native.

If you have a long-form Markdown style guide → extract the rules and tokens into a Charter; leave the prose in the style guide and link from Charter `notes`.

If you have nothing → start with [`examples/charter.minimal.yaml`](examples/charter.minimal.yaml). Three tokens. One component. Iterate.

A Charter rarely replaces what you already have. It binds the rest of it into something a test can read.
