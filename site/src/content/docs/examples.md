---
title: 'Examples'
description: 'Three example Charters covering the minimal, complete, and converter-emitted shapes.'
sidebar:
  label: 'Examples'
  order: 1
editUrl: 'https://github.com/Jtiem/charter-spec/edit/main/examples/README.md'
---

Three example Charters, each demonstrating a different use case. All three validate against [`v1/charter.schema.json`](/v1/charter.schema.json).

- **[`charter.minimal.yaml`](/examples/charter.minimal.yaml)** — the smallest valid Charter. Start here if you're hand-writing your first Charter.
- **[`charter.complete.yaml`](/examples/charter.complete.yaml)** — a fully populated Charter for a fictional "Citrine" design system. Demonstrates every v1 field. Use as a *reference*, not a template — most real Charters will be smaller.
- **[`charter.from-design-md.yaml`](/examples/charter.from-design-md.yaml)** — what the [`DESIGN.md` → Charter converter](/converters/design-md/) emits for a typical input. Shows how prose is preserved under `notes`, and which fields the converter leaves for the author to populate.

## Minimal

The smallest valid Charter. Three tokens, one component, sensible default rules.

```yaml
# The smallest valid Charter.
# Three tokens, one component, sensible default rules.
# Copy this file as CHARTER.yaml at your project root and iterate.

$schema: https://usecharter.dev/v1/charter.schema.json
name: Hello
version: 0.1.0

tokens:
  color:
    primary: { $value: "#0066ff", $type: color }
    surface: { $value: "#ffffff", $type: color }
    text:    { $value: "#1f2937", $type: color }

components:
  registry: "@hello/ui"
  allowed:
    - Button

rules:
  hardcoded_colors: error
```

[Raw file →](/examples/charter.minimal.yaml)

## Complete

Demonstrates every v1 field. Most real Charters will be smaller than this.

```yaml
# A fully populated Charter for a fictional design system named Citrine.
# Demonstrates every v1 field. Use as a reference, not a template.

$schema: https://usecharter.dev/v1/charter.schema.json
name: Citrine
version: 1.4.0

tokens:
  color:
    # Brand
    primary:        { $value: "#f59e0b", $type: color }
    primary-hover:  { $value: "#d97706", $type: color }
    primary-active: { $value: "#b45309", $type: color }

    # Neutral
    surface:        { $value: "#ffffff", $type: color }
    surface-muted:  { $value: "#f9fafb", $type: color }
    text:           { $value: "#1f2937", $type: color }
    text-muted:     { $value: "#6b7280", $type: color }
    border:         { $value: "#e5e7eb", $type: color }

    # Status
    success:        { $value: "#10b981", $type: color }
    warning:        { $value: "#f59e0b", $type: color }
    danger:         { $value: "#ef4444", $type: color }

  spacing:
    "0":  { $value: "0",     $type: dimension }
    "1":  { $value: "4px",   $type: dimension }
    "2":  { $value: "8px",   $type: dimension }
    "3":  { $value: "12px",  $type: dimension }
    "4":  { $value: "16px",  $type: dimension }
    "6":  { $value: "24px",  $type: dimension }
    "8":  { $value: "32px",  $type: dimension }
    "12": { $value: "48px",  $type: dimension }
    "16": { $value: "64px",  $type: dimension }

  radius:
    sm:   { $value: "4px",  $type: dimension }
    md:   { $value: "8px",  $type: dimension }
    lg:   { $value: "12px", $type: dimension }
    full: { $value: "9999px", $type: dimension }

  typography:
    heading-1:
      $value:
        fontFamily: Inter
        fontWeight: "600"
        fontSize: "32px"
        lineHeight: "1.2"
      $type: typography
    body:
      $value:
        fontFamily: Inter
        fontWeight: "400"
        fontSize: "16px"
        lineHeight: "1.5"
      $type: typography

components:
  registry: "@citrine/ui"
  allowed:
    - Button
    - Card
    - Input
    - Text
    - Heading
    - Link
    - Alert
    - Badge
    - Dialog
    - Tabs
    - "Form/*"
  forbidden:
    - "div"
    - "span"

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

profiles:
  prototype:
    rules:
      hardcoded_colors: warn
      hardcoded_spacing: off
      inline_styles: off
      wcag_level: A
  production:
    rules:
      hardcoded_colors: error
      hardcoded_spacing: error
      hardcoded_typography: error
      inline_styles: error
      wcag_level: AAA
      delta_e_threshold: 1.5

notes:
  visual_theme: |
    Citrine is warm and citrus-leaning. Primary is amber (#f59e0b).
  accessibility: |
    AA is the floor. The primary/surface pair must clear 4.5:1 contrast.
```

[Raw file (full version) →](/examples/charter.complete.yaml)

## Converter output

What the [DESIGN.md → Charter converter](/converters/design-md/) emits for a typical `DESIGN.md` input. Note how prose sections are preserved verbatim under `notes`, keyed by their section name.

```yaml
# Output of running the DESIGN.md → Charter converter on a typical DESIGN.md.
# Source DESIGN.md was for a fictional "Northwind" design system.

$schema: https://usecharter.dev/v1/charter.schema.json
name: Northwind
version: 0.1.0

tokens:
  color:
    primary:   { $value: "#1d4ed8", $type: color }
    secondary: { $value: "#7c3aed", $type: color }
    surface:   { $value: "#ffffff", $type: color }
    text:      { $value: "#0f172a", $type: color }
    muted:     { $value: "#64748b", $type: color }

  spacing:
    "1": { $value: "4px",  $type: dimension }
    "2": { $value: "8px",  $type: dimension }
    "4": { $value: "16px", $type: dimension }
    "8": { $value: "32px", $type: dimension }

  typography:
    body:
      $value:
        fontFamily: "Source Sans Pro"
        fontSize: "16px"
        lineHeight: "1.5"
      $type: typography

components:
  # The converter cannot infer this list from prose.
  # Add the components your design system permits.
  registry: ""
  allowed: []

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

notes:
  visual_theme_and_atmosphere: |
    Northwind feels professional and trustworthy. The brand leans blue
    with violet accents for emphasis.
  color_palette_and_roles: |
    Primary blue (#1d4ed8) is used for primary actions. Secondary violet
    (#7c3aed) is for emphasis only.
  typography_rules: |
    Source Sans Pro for all text. Body copy is 16px.
  accessibility_requirements: |
    WCAG 2.1 AA at minimum. All interactive elements must be keyboard-accessible.
```

[Raw file (full version) →](/examples/charter.from-design-md.yaml)

## Verifying

```bash
# Node (ajv)
npx ajv validate -s v1/charter.schema.json -d charter.minimal.yaml --spec=draft2020

# Python (check-jsonschema)
check-jsonschema --schemafile v1/charter.schema.json charter.minimal.yaml
```

## Contributing examples

Real-world Charter examples from production teams are welcome. Open a PR adding the file to [`examples/`](https://github.com/Jtiem/charter-spec/tree/main/examples) with a top comment explaining the design system it describes and any non-obvious choices.
