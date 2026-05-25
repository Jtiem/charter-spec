# Charter

**A portable, AI-readable, machine-validatable design system contract.**

In one line: a `DESIGN.md` you can fail the build on.

---

AI agents are good at writing code that *looks* right. They are reliably bad at writing code that *is* right — that uses the design system's tokens, respects the design system's components, and behaves the way the design system was meant to behave.

The reason is plain. The "design system" the agent is reading isn't a contract. It's prose — a Figma library description, a brand brief, maybe a `DESIGN.md`. The model interprets the prose, makes a generation, and most of the time it's close. The heading is one weight too thin. The spacing is one notch off. The grey is one shade too cool. The output looks right. The output isn't right. And no test catches the difference, because the source of truth was prose.

A Charter is the upgrade.

A Charter pairs the same human-readable rationale you'd put in a `DESIGN.md` with a machine-validatable schema — design tokens in W3C DTCG format, component allowlists, accessibility requirements, drift thresholds, and per-rule enforcement modes. **An agent reads a Charter to know what your design system is. A linter reads the same Charter to know when the agent has ignored it.**

```yaml
# CHARTER.yaml
$schema: https://usecharter.dev/v1/charter.schema.json
name: Citrine
version: 1.0.0

tokens:
  color:
    primary:    { $value: "#f59e0b", $type: color }
    surface:    { $value: "#ffffff", $type: color }
    text:       { $value: "#1f2937", $type: color }
  spacing:
    "1":        { $value: "4px", $type: dimension }
    "2":        { $value: "8px", $type: dimension }
    "4":        { $value: "16px", $type: dimension }
  typography:
    body:       { $value: { fontFamily: Inter, fontSize: "16px", lineHeight: "1.5" }, $type: typography }

components:
  registry: "@citrine/ui"
  allowed: [Button, Card, Input, Text]

rules:
  delta_e_threshold: 2.0
  wcag_level: AA
  hardcoded_colors: error
  hardcoded_spacing: warn
  off_token_typography: error
```

That is a Charter. It is also a contract. An agent that generates a component using `color: #f5a40e` (close to `primary`, but not it) will produce a hex string that a linter, given this file, will reject. The design system is no longer a suggestion.

## What a Charter is not

- **Not a replacement** for Figma, your component library, your design system documentation, or your style guide. A Charter *describes* the design system you already have; it doesn't replace it.
- **Not a generation tool.** A Charter is not opinionated about how UI is produced. It is opinionated about what produced UI must comply with.
- **Not a successor to `DESIGN.md`.** It is a superset and an upgrade path. If you have a `DESIGN.md`, you have most of a Charter already — run it through the converter (see [`converters/design-md-to-charter/`](converters/design-md-to-charter/)) and you have a draft Charter in seconds.

## How a Charter differs from `DESIGN.md`

|                          | `DESIGN.md`               | Charter                          |
| ------------------------ | ------------------------- | -------------------------------- |
| Format                   | Markdown + YAML sections  | YAML / JSON with schema          |
| Audience                 | Models, at generation time | Models, linters, CI, and humans  |
| Enforcement              | None (prose)              | Schema-validated, lintable, CI-gateable |
| Drift detection          | No                        | Yes (Delta-E, allowlists, severity) |
| Versioning               | Document version          | Schema version + content version |
| Component allowlist      | Descriptive               | Normative                        |
| Accessibility            | Aspirational              | Enforced (level, contrast ratios) |
| Reference implementation | Stitch                    | Flint                            |

A `DESIGN.md` is a great prompt. A Charter is a contract. Both have a place — many teams will keep a `DESIGN.md` *and* a Charter, and read the same content out of either depending on whether they're prompting or auditing. The point of the Charter is that *the same source of truth* can now do both jobs.

See [`COMPARISON.md`](COMPARISON.md) for the full side-by-side, including `tokens.json`, Style Dictionary, Tailwind config, and Figma Variables.

## Adoption

Three ways in, easiest first.

**You have a `DESIGN.md` already.**
Run it through [`converters/design-md-to-charter/`](converters/design-md-to-charter/). You'll get a draft `CHARTER.yaml` with your tokens, your rationale (preserved as `notes` fields), and a set of sensible default rules. Tighten the rules to taste.

**You have a `tokens.json` (W3C DTCG).**
Charter's `tokens` section is DTCG. Wrap your existing token file in a Charter envelope (`$schema`, `name`, `version`, `tokens`, `rules`) and you're done. The DTCG `$value` / `$type` fields pass through unchanged.

**You have neither.**
Copy [`examples/charter.minimal.yaml`](examples/charter.minimal.yaml). Replace the tokens with three of your real colors. Save it as `CHARTER.yaml` at your project root. Validate with any JSON Schema validator pointed at [`v1/charter.schema.json`](v1/charter.schema.json). Iterate.

## Validation

Charter ships a JSON Schema (draft 2020-12) at [`v1/charter.schema.json`](v1/charter.schema.json). Any standards-compliant validator works:

```bash
# Node (ajv)
npx ajv validate -s v1/charter.schema.json -d CHARTER.yaml --spec=draft2020

# Python (jsonschema)
check-jsonschema --schemafile v1/charter.schema.json CHARTER.yaml

# IDE
# Most editors auto-fetch the $schema URL and validate on save.
```

The schema validates *structure*. Enforcement of rules (drift thresholds, severity levels, component allowlists against actual code) is the job of a Charter-aware linter — for example, [Flint](https://github.com/Jtiem/Lunar-Elevator-Bridge), the reference implementation. The spec is intentionally tool-neutral: anyone can build a linter that reads a Charter.

## Why this exists

The longer answer lives in [`PHILOSOPHY.md`](PHILOSOPHY.md). The short version: AI-generated UI is a structural-quality problem disguised as a style problem. Style problems get caught by reviewers. Structural-quality problems get caught by tests. Until there's an artifact that a test can read, drift will keep shipping.

A Charter is that artifact.

## What we've measured (and what we haven't)

The Charter format is informed by an empirical validation arc — five tests run May 2026, 36+ blind-scored builds, pre-registered predictions, independent verification. Headline findings:

- A strong importable component library suppressed all chromatic/typographic drift in 8/8 builds, even under "make it on-brand" vague specs.
- At six-section scale, falsifiable specs produced 3/3 reference-quality builds; vague specs hand-rolled three of six sections **despite importing the right components.**
- Drift is structural before it's chromatic — what breaks first is "should this be a `Card` or a `<div>`?", not color.

What this supports: the `components.registry` + `components.allowed` mechanism, and the decision to default `unknown_components` to `error`. What it does **not** support: specific numeric thresholds like `delta_e_threshold: 2.0`, or generalization beyond JSX / React / Tailwind. Those are tagged **[preliminary]** in [`CHARTER.md`](CHARTER.md) and tracked in [`MEASUREMENT-PLAN.md`](MEASUREMENT-PLAN.md) for closing before `v1.0.0` final.

The full audit lives in [`EVIDENCE.md`](EVIDENCE.md). Reviewers are explicitly invited to challenge anything in it.

## License

Apache 2.0. See [`LICENSE`](LICENSE).

Fork it. Embed it. Ship a competing linter against it. Translate it. Sell tools built on it. The spec is the contract; the implementation is the market.

## Versioning

Charter follows [Semantic Versioning](https://semver.org/) at the schema level. The current schema is `v1`. Breaking changes increment the major version and ship under a new `$schema` URL (`https://usecharter.dev/v2/charter.schema.json`). Charters declare which version they target via the `$schema` field, so a `v1` Charter remains valid forever.

See [`CHANGELOG.md`](CHANGELOG.md).

## Reference implementation

[Flint](https://github.com/Jtiem/Lunar-Elevator-Bridge) is the reference implementation: a governance engine (MCP server) and an observability surface (desktop app) that read a Charter and enforce it against AI-generated code at the AST level. Flint is one implementation of the Charter spec, not the only possible one.
