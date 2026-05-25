# Philosophy

The Charter spec is a set of design decisions. Most of them are unobvious in isolation and only make sense in context. This document records the *why* behind each — both for the reader deciding whether to adopt the format, and for the future maintainer deciding whether to revise it.

The decisions are listed in roughly the order they matter most. The earliest decisions are load-bearing for everything that follows; the later ones are easier to revise without compounding cost.

---

## 1. Spec inversion — the writer says what they want, the codebase + tool say what to forbid

The Charter format embodies one principle above all others:

> **Write what you want. Let the codebase and the tool write the constraints.**

A "falsifiable spec" — one specific enough that an automated check can refuse output that violates it — produces measurably better AI output (see [EVIDENCE.md](EVIDENCE.md)). But every line in a good falsifiable spec ("no `scale-105`," "do NOT hand-roll `<div className="rounded-lg border…">`," "no `bg-blue-600`") comes from a scar the writer has already earned. A PM or designer writing their first AI-driven specification has none of those scars. They cannot write that spec.

That's a tooling failure dressed as a discipline problem.

Three roles, cleanly separated:

| Role | Says | Source |
| --- | --- | --- |
| **Writer** | What they *want* | Intent, references, outcome properties |
| **Codebase** | What's *possible* | Tokens, components, existing patterns |
| **Tool** | What to *forbid* | Derived mechanically from the above |

A Charter is the artifact in the middle column. It captures what's possible *in machine-readable form*, so the tool can derive the forbid-list without burdening the writer. The writer's input stays small. The forbid-list stays precise. The cost of precision shifts from "scars accumulated by hand over time" to "tool installed once."

This is the load-bearing reason Charter exists. Every other decision serves it.

## 2. Why a single document, not a directory tree

Some design-system tools spread their state across many files: tokens in one, components in another, rules in a third, brand prose in a fourth. Charter is deliberately one file. There are three reasons.

**First, the AI agent reads one file at a time.** An LLM given five files to consult will sometimes consult three. A single file is harder to half-read.

**Second, version control is the contract.** A Charter is a contract between humans and tooling, and contracts live as a single signable artifact. Diffs are legible. Reviews are scoped. A change to "what the design system permits" is one PR, not five.

**Third, portability.** A Charter can be linked, fetched, embedded, shared. Adoption friction is lowest when the artifact is one file you save and commit.

A future version may allow `extends:` references to compose multiple Charters (e.g., a parent brand Charter + a product-specific overlay), but a single Charter remains the unit of declaration.

## 3. Why YAML, with JSON as equal citizen

YAML is the default for human-authored Charters because:

- Comments. A Charter has a `notes` field for prose rationale, but inline comments on specific tokens or rules are valuable and JSON forbids them.
- Multi-line strings. The `notes` block holds prose; YAML multi-line strings are pleasant, JSON's `\n` escapes are not.
- Lower visual noise. Designers and PMs will write Charters. YAML's syntax has less ceremony.

JSON is an equal citizen because:

- Machine emission. A tool that *generates* a Charter (the converter from `DESIGN.md`, a Figma export, a CI step) emits JSON. Round-tripping JSON ↔ YAML is well-defined.
- Schema validation. JSON Schema is the standard; YAML Charters are validated by mapping to JSON first.

Tooling MUST accept both. Authors choose.

## 4. Why W3C DTCG for tokens

The Design Tokens Community Group format (`$value`, `$type`, curly-brace references) is the closest thing the industry has to a token interchange standard. Stitch's `DESIGN.md` uses DTCG. Figma's Variables export uses DTCG. Style Dictionary supports it.

If Charter invented its own token format, every adoption would require a translation step. Adopting DTCG means:

- A `DESIGN.md` → Charter converter is mechanically straightforward for the tokens section
- A Charter → Style Dictionary handoff produces every platform-specific output that Style Dictionary already supports
- A Figma Variables export drops directly into the `tokens` field

Charter has no opinion on tokens beyond format compliance. The opinions are at the `rules` and `components` layer.

## 5. Why allowlists, not denylists

`components.allowed` is the primary mechanism for constraining what an AI agent can produce. The alternative — a denylist (`components.forbidden`) — exists, but it is secondary. There are two reasons.

**A denylist must be exhaustive.** "Do not use `<div>`" forgets `<span>`. "Do not use `<div>` or `<span>`" forgets `<section>`. The denylist has to enumerate everything the agent might invent, which is unbounded. An allowlist enumerates everything the design system *has*, which is bounded.

**An allowlist tells the agent what to do.** A denylist tells it what to avoid. AI agents respond better to positive constraints than to negative ones — and this is consistent with the [validation arc finding](EVIDENCE.md#1-the-validation-arc-may-2026) that "examples permit but don't forbid: 'match this' sets a ceiling, never a floor."

Charter therefore privileges the allowlist. `forbidden` exists for narrow surgical use — e.g., banning `<div>` in favor of a `Box` component — but the bulk of the constraint lives in `allowed`.

## 6. Why severity, not booleans

Every Charter rule is a severity tier (`error` / `warn` / `off`), not a boolean (`on` / `off`). Three reasons.

**First, prototype vs production are real.** A team prototyping a new feature wants `hardcoded_colors: warn` so they can iterate. The same team shipping to production wants `hardcoded_colors: error`. A boolean would force them to maintain two Charters or rewrite the file at release time. Severity + profiles (see §8) lets one Charter cover both.

**Second, severity expresses graduated enforcement.** Some violations are show-stoppers (a forbidden component); some are advisories (a one-off inline style). Conflating them produces alert fatigue. The same alert-fatigue problem killed many static analysis adoption efforts in the 2010s; we are not repeating it.

**Third, severity composes with CI.** `error` blocks the build. `warn` logs. `off` is silent. CI integrations can act on severity uniformly. A boolean would require a parallel "what blocks the build" config.

## 7. Why numeric thresholds for some rules, severity for others

`delta_e_threshold` takes a number (`2.0`), not a severity. `hardcoded_colors` takes a severity (`error`), not a number. Why the inconsistency?

Because they answer different questions.

- `delta_e_threshold` answers *how close is close enough?* — there is no boolean way to express "2.0 is acceptable, 3.0 isn't." A number is the natural type.
- `hardcoded_colors` answers *how seriously should we treat any violation?* — once a violation is detected, the question is its severity, not its magnitude.

Rules with magnitude take numbers. Rules with detection take severity. A reader looking at the table in [CHARTER.md §5.2](CHARTER.md#52-defined-rules-v1) should be able to predict which form a rule takes from its name.

## 8. Why profiles

A design system has different rules at different stages. A prototype has different rules than a production release. A marketing landing page has different rules than a checkout flow.

Profiles (see [CHARTER.md §6](CHARTER.md#6-profiles)) let one Charter declare a base rule set and named overlays:

```yaml
rules:
  hardcoded_colors: error
profiles:
  prototype:
    rules:
      hardcoded_colors: warn
```

A linter invoked with `--profile prototype` applies the overlay. Without `--profile`, only the base applies.

This is the simplest possible mechanism that covers the real use cases. It is intentionally not a general inheritance system; a Charter is not a class hierarchy. If profile composition gets baroque, the spec has failed.

## 9. Why `notes` exists, and why it has no semantics

A Charter has a `notes` field that holds free-text prose, keyed by category. It serves two purposes.

**It preserves rationale from upstream sources.** When a team converts a `DESIGN.md` to a Charter, the prose sections (Visual Theme & Atmosphere, Typography Rules, Color Palette & Roles) don't map to enforceable rules — but they're not worthless either. They document *why* the rules look the way they do. The converter places them under `notes` so the writer's voice survives.

**It gives humans somewhere to write.** A team adopting a Charter wants to record decisions like "We chose amber over orange because orange-700 looked muddy against the surface." That belongs in version control. It belongs in a single artifact. It does not belong in a rule.

The spec gives `notes` *no semantic interpretation*. Tooling MUST NOT parse it. It is for humans. A future spec extension may add machine-readable fields that supplement notes (e.g., a `rationale` field on each token); but `notes` itself remains prose.

## 10. Why the spec is tool-neutral

A Charter file is not a Flint file. It is not a Stitch file. It is not specific to any linter, IDE, MCP server, or CI provider.

This is deliberate. The Charter spec is intended to be the contract; the implementation is the market. Anyone can build a linter, an IDE plugin, a CI gate, or a generator that reads a Charter. The reference implementation (Flint) is one path; the spec doesn't depend on it.

If the spec were tied to one tool, adopting Charter would mean adopting that tool. By keeping the spec neutral, adoption is reversible — a team that writes a Charter can switch linters tomorrow.

This is the move that DESIGN.md got right (Apache 2.0, no tool dependency) and the move that proprietary "design system definition formats" historically got wrong. Charter follows DESIGN.md's playbook on this and improves on it via enforceability.

## 11. Why `$schema` carries the version

A Charter's `$schema` field is a URL pointing to a specific schema version. This is the standard JSON Schema convention; we adopt it for two reasons.

**Editors auto-validate.** Most modern editors (VS Code, IntelliJ, Zed) fetch the `$schema` URL and validate on save. A Charter author gets red squiggles for invalid input without installing anything.

**Forward compatibility is explicit.** A `v1` Charter says `https://usecharter.dev/v1/charter.schema.json`. A `v2` Charter says `https://usecharter.dev/v2/charter.schema.json`. The v1 URL never changes its meaning, so v1 Charters remain valid forever. Tooling that supports v2 also supports v1 by detecting the `$schema` URL and dispatching.

This is how SemVer at the format level actually works: the major version is a URL, not a version field that could be misinterpreted.

## 12. Why the spec is opinionated about defaults but tolerant about additions

[CHARTER.md §11](CHARTER.md#11-forward-compatibility) says a Charter with unknown fields is accepted with a warning, not rejected. This is deliberate.

A spec that rejects unknown fields cannot grow without breaking old tooling. A spec that silently ignores them grows but loses readers in version drift. The middle path — accept with a warning — lets authors use newer features without breaking older tools, while keeping awareness that they are using features the validator can't reason about.

The same logic applies to unknown rules in [CHARTER.md §5.4](CHARTER.md#54-custom-rules): tolerated, surfaced via warning, preserved on round-trip.

## 13. What this spec is not opinionated about

It is worth being explicit about the things Charter does *not* take a position on, because each non-opinion is a deliberate choice:

- **Naming conventions.** `color.primary` vs `colors.primary` vs `brand.color.primary`. Charter accepts any nested path; conventions are a team decision.
- **Token transformation pipelines.** Style Dictionary, Theo, Token Transformer — all of these handle Charter tokens (because they handle DTCG). Charter doesn't reimplement them.
- **How the rules are enforced.** A linter? A CI gate? An IDE plugin? A pre-commit hook? Yes, all of those. The spec says what to enforce, not where.
- **Component framework.** React, Vue, Svelte, Angular, SwiftUI, plain HTML — Charter is framework-agnostic. The `components.allowed` list is just names; how they map to framework imports is the linter's job.
- **Stack opinions.** Tailwind vs vanilla CSS vs CSS-in-JS — Charter doesn't care. A `hardcoded_colors` rule flags color literals wherever they appear; the linter knows where to look in the local stack.

Each of these non-opinions is a deliberate choice to keep Charter portable. Every opinion the spec doesn't ship is an adoption path it doesn't close.

---

## Reading list

- [CHARTER.md](CHARTER.md) — the normative specification
- [EVIDENCE.md](EVIDENCE.md) — what each design decision is backed by, and where the gaps are
- [COMPARISON.md](COMPARISON.md) — how Charter relates to `DESIGN.md`, `tokens.json`, Style Dictionary, Tailwind config, and Figma Variables
- [MEASUREMENT-PLAN.md](MEASUREMENT-PLAN.md) — what we will measure before `v1.0.0` final to validate the preliminary defaults
