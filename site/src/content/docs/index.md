---
title: 'Charter'
description: 'A portable, AI-readable, machine-validatable design system contract. A DESIGN.md you can fail the build on.'
template: splash
editUrl: false
hero:
  title: 'Charter'
  tagline: 'A portable, AI-readable, machine-validatable design system contract. <br><strong>A <code>DESIGN.md</code> you can fail the build on.</strong>'
  actions:
    - text: 'Read the spec'
      link: '/spec/'
      variant: 'primary'
    - text: 'See the evidence'
      link: '/evidence/'
      variant: 'secondary'
    - text: 'GitHub'
      link: 'https://github.com/Jtiem/charter-spec'
      variant: 'minimal'
      icon: 'github'
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

## Three ways in

**You have a `DESIGN.md` already.**
Run it through the [DESIGN.md converter](/converters/design-md/). You'll get a draft `CHARTER.yaml` with your tokens, your rationale (preserved as `notes` fields), and a set of sensible default rules. Tighten the rules to taste.

**You have a `tokens.json` (W3C DTCG).**
Charter's `tokens` section is DTCG. Wrap your existing token file in a Charter envelope (`$schema`, `name`, `version`, `tokens`, `rules`) and you're done. The DTCG `$value` / `$type` fields pass through unchanged.

**You have neither.**
Copy the [minimal example](/examples/charter.minimal.yaml). Replace the tokens with three of your real colors. Save it as `CHARTER.yaml` at your project root. Validate with any JSON Schema validator pointed at [`v1/charter.schema.json`](/v1/charter.schema.json). Iterate.

## What we've measured

The Charter format is informed by an empirical validation arc — five tests, 36+ blind-scored builds, pre-registered predictions, independent verification. The full audit lives in [Evidence](/evidence/). Reviewers are explicitly invited to challenge anything in it.

Specific numeric thresholds (`delta_e_threshold: 2.0`) and generalization beyond JSX / React / Tailwind are tagged **[preliminary]** in the spec and tracked in the [Measurement plan](/measurement-plan/) for closing before `v1.0.0` final.

## License

Apache 2.0. Fork it. Embed it. Ship a competing linter against it. The spec is the contract; the implementation is the market.
