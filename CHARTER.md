# Charter Specification

**Version:** 1.0.0
**Schema:** `https://usecharter.dev/v1/charter.schema.json`
**Status:** Draft
**Date:** 2026-05-24

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

---

## 1. Overview

A Charter is a single document at the root of a project (conventionally `CHARTER.yaml`) that declares the design system constraints any UI in that project must satisfy. It is intended to be read by both humans and automated tooling. The format is YAML or JSON; tooling **MUST** accept either.

A Charter declares:

1. **Identity** — the name, version, and schema version of the design system
2. **Tokens** — the design tokens (color, spacing, typography, etc.) the design system defines, in W3C DTCG format
3. **Components** — the component library the design system provides, and which components are permitted
4. **Rules** — the enforcement policy: drift thresholds, severity per category, accessibility level
5. **Profiles** *(optional)* — named rule overlays for environments (e.g., `production`, `prototype`)
6. **Notes** *(optional)* — free-text rationale, preserved from upstream sources like `DESIGN.md`

## 2. Document structure

A Charter is a single top-level object. Every Charter **MUST** include:

```yaml
$schema: https://usecharter.dev/v1/charter.schema.json
name:    <string>
version: <semver string>
```

A Charter **SHOULD** include at least one of `tokens`, `components`, or `rules`. A Charter with none of these is structurally valid but semantically empty.

### 2.1 `$schema`

The URL of the schema this Charter targets. Tooling **MUST** use the `$schema` field to determine which version of the spec applies. The Charter ecosystem **MUST NOT** mutate the meaning of an existing `$schema` URL — breaking changes ship under a new URL.

### 2.2 `name`

A human-readable identifier for the design system. **MUST** be a non-empty string. Used in tool output and logs.

### 2.3 `version`

The version of the design system being described, in [SemVer 2.0.0](https://semver.org/) form. **MUST** match `^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$`. This is the version of *the design system* (i.e., the content of this Charter), not the version of the Charter spec. The spec version is implied by `$schema`.

## 3. Tokens

The `tokens` field declares the design tokens of the design system. Tokens **MUST** conform to the [W3C Design Tokens Community Group (DTCG)](https://www.designtokens.org/tr/drafts/) format.

```yaml
tokens:
  color:
    primary: { $value: "#0066ff", $type: color }
    surface: { $value: "#ffffff", $type: color }
  spacing:
    "1": { $value: "4px",  $type: dimension }
    "2": { $value: "8px",  $type: dimension }
```

### 3.1 Categories

Charter does not constrain which token categories appear. Conventional top-level categories are `color`, `spacing`, `typography`, `radius`, `shadow`, `opacity`, `motion`, and `border`. Tools **SHOULD** recognize these categories; custom categories **MUST** be tolerated (treated as unknown but valid).

### 3.2 Group nesting

Token groups **MAY** nest arbitrarily. Tooling **MUST** preserve the path to a token when reporting it (e.g., `color.brand.primary.500`).

### 3.3 Values

Token values **MUST** use the DTCG `$value` and `$type` keys. Reference values **MUST** use the DTCG curly-brace syntax: `{color.primary}`. References **MUST** resolve within the same Charter; cross-Charter references are out of scope for v1.

### 3.4 Forbidden token mutations

Tooling **MUST NOT** mutate tokens declared in a Charter when running in audit mode. Tokens are inputs to validation; they are not edited by validators.

## 4. Components

The `components` field declares the component library the design system provides.

```yaml
components:
  registry: "@citrine/ui"
  allowed:
    - Button
    - Card
    - Input
    - Text
  forbidden:
    - "div"
    - "span"
```

### 4.1 `registry`

The package or import specifier where the design system's components live. **MAY** be an npm package name (`@scope/pkg`), a path (`./packages/ui`), or a URL. Used by linters to resolve `allowed` entries.

### 4.2 `allowed`

The list of component names that **MAY** be used. A Charter-aware linter **MUST** flag uses of components not in `allowed` (subject to the `unknown_components` rule severity). If `allowed` is absent, all components are permitted.

The `allowed` list **MAY** include glob patterns (`Card*`, `Form/*`). Pattern matching semantics are implementation-defined for v1; tooling **SHOULD** document its matcher.

### 4.3 `forbidden`

The list of components or intrinsic elements that **MUST NOT** be used. Useful for forbidding hardcoded HTML intrinsics (`div`, `span`) in favor of design-system primitives. A use of any `forbidden` entry **MUST** produce an error-severity violation regardless of other rule settings.

### 4.4 Conflict resolution

If a name appears in both `allowed` and `forbidden`, `forbidden` wins. Tooling **MUST** emit a warning at validation time noting the redundancy.

## 5. Rules

The `rules` field declares the enforcement policy. Every field in `rules` has a default; an empty `rules: {}` block applies the defaults.

### 5.1 Severity values

Rule severity is one of:

- `error` — violation **MUST** block CI / block export / fail the build
- `warn` — violation **MUST** be reported but **MUST NOT** block
- `off` — violation **MUST NOT** be reported

A rule's severity is set by assigning the severity name directly:

```yaml
rules:
  hardcoded_colors: error
  hardcoded_spacing: warn
  hardcoded_typography: off
```

### 5.2 Defined rules (v1)

The following rules **MUST** be recognized by v1-compliant tooling. Defaults are listed; unrecognized rules **MUST** be tolerated (forward-compatible with future versions).

Each default carries an evidence tag:
- **[supported]** — the default is backed by measurement. See [EVIDENCE.md](EVIDENCE.md).
- **[preliminary]** — the default is an educated guess or inherits from external research that was not validated in the Charter-audit context. The measurement that would confirm or revise it is tracked in [MEASUREMENT-PLAN.md](MEASUREMENT-PLAN.md).

A **[preliminary]** default may be revised in a minor version (`v1.1`) without breaking the schema or invalidating existing Charters.

| Rule | Default | Evidence | What it checks |
| --- | --- | --- | --- |
| `delta_e_threshold` | `2.0` | **[preliminary]** — inherits from CIEDE2000 perceptual research; not validated against AI-audit specifically. See [MEASUREMENT-PLAN.md §1](MEASUREMENT-PLAN.md#1-optimal-delta_e_threshold-for-ai-audit). | Maximum CIEDE2000 perceptual color distance between any color in produced UI and the nearest token color. Numeric, not a severity. |
| `wcag_level` | `AA` | **[preliminary]** — industry default, not validated against AI-audit catch rate. See [MEASUREMENT-PLAN.md §6](MEASUREMENT-PLAN.md#6-wcag_level-aa-as-the-right-ai-audit-default). | The WCAG conformance level required. One of `A`, `AA`, `AAA`. |
| `hardcoded_colors` | `error` | **[preliminary]** — informed by validation-arc Claim 3 (strong color tokens hold) but the *severity tier* (error vs warn) was not directly measured. See [MEASUREMENT-PLAN.md §2](MEASUREMENT-PLAN.md#2-severity-defaults-per-rule). | Any color literal (hex, `rgb()`, named color) not matching a token. |
| `hardcoded_spacing` | `warn` | **[supported]** — validation-arc Claim 3 places spacing in the lower-priority drift class ("drift is structural before chromatic," generalized). See [EVIDENCE.md §1](EVIDENCE.md#1-the-validation-arc-may-2026). | Any spacing literal (px, rem) not matching a spacing token. |
| `hardcoded_typography` | `warn` | **[preliminary]** — paired with `hardcoded_spacing` by analogy; not independently measured. | Any `font-family`, `font-size`, `line-height`, or `font-weight` not matching a typography token. |
| `off_token_typography` | `error` | **[preliminary]** — opinion, not measured. | Use of typography values that don't compose a defined typography token. |
| `unknown_components` | `error` | **[supported]** — validation-arc Test 5 (3/3 vs 3/3 clean separation): vague arm hand-rolled card surfaces *despite importing `Card`*. Erroring on unknown components is the direct response to that measured failure mode. See [EVIDENCE.md §1](EVIDENCE.md#1-the-validation-arc-may-2026). | Use of a component not in `components.allowed`. |
| `forbidden_components` | `error` | **[supported]** — same evidence as `unknown_components`; if `unknown` is error, `forbidden` must be at least as strict. | Use of a component in `components.forbidden`. Cannot be downgraded; severity field is ignored if present. |
| `inline_styles` | `warn` | **[preliminary]** — opinion (inline styles bypass token enforcement) but the severity tier was not measured. | Use of inline `style={{...}}` attributes. |
| `accessibility` | `error` | **[preliminary]** — pairs with `wcag_level`; severity tier is industry convention, not measured against AI output. | Any WCAG 2.1 AA violation at or below `wcag_level`. |

A reader skeptical of any default is invited to challenge it; the spec's bar for revising a default is a Charter-specific measurement with the methodology described in the corresponding `MEASUREMENT-PLAN.md` section.

### 5.3 Numeric rule values

Rules whose meaning is a threshold (e.g., `delta_e_threshold`) take a numeric value, not a severity. A numeric value of `0` means "no tolerance"; `Infinity` means "disable this check."

### 5.4 Custom rules

A Charter **MAY** include rules outside the v1 set. Tooling **MUST** preserve unknown rules during round-trip (read → write) and **SHOULD** warn that they are unrecognized rather than reject the Charter.

## 6. Profiles

The `profiles` field declares named overlays that override the base `rules` block in specific contexts.

```yaml
profiles:
  prototype:
    rules:
      hardcoded_colors: warn
      hardcoded_spacing: off
      wcag_level: A
  production:
    rules:
      hardcoded_colors: error
      hardcoded_spacing: error
      wcag_level: AAA
```

A profile applies its `rules` block as a shallow merge over the top-level `rules`. Tooling **MUST** support selecting a profile at validation time (e.g., `flint audit --profile production`). If no profile is selected, only the top-level `rules` apply.

A Charter **MAY** define any number of profiles. Profile names **MUST** be strings, **MUST** be unique within a Charter, and **MUST NOT** collide with the names `default` or `base` (reserved for future use).

## 7. Notes

The `notes` field is free-form, intended for human rationale and preserved by all Charter tooling.

```yaml
notes:
  visual_theme: |
    Citrine is warm, citrus-leaning, and avoids cool greys.
    The primary is amber, not orange — the orange-700s look muddy
    against the surface.
  accessibility: |
    AA is the floor. The primary/surface pair must clear 4.5:1
    contrast and we test against light *and* dark surfaces.
```

`notes` **MUST** be an object whose values are strings. Keys are arbitrary. The converter from `DESIGN.md` (see [`converters/design-md-to-charter/`](converters/design-md-to-charter/)) places preserved prose sections under `notes`.

Tooling **MUST NOT** parse `notes` content as rules. It is for humans.

## 8. Validation

A Charter is valid if it:

1. Conforms to the JSON Schema at [`v1/charter.schema.json`](v1/charter.schema.json) referenced by `$schema`
2. Does not declare a duplicate token path
3. Does not declare a duplicate profile name
4. Has every internal token reference resolving to an existing token

Tooling **MUST** report validation errors with file:line:column citations when the input is YAML.

## 9. File location

A Charter **SHOULD** be placed at the root of a project as `CHARTER.yaml` (preferred) or `CHARTER.json`. Tooling **SHOULD** also accept `charter.yaml`, `charter.json`, `.charter.yaml`, and `charter.config.yaml` for backward compatibility and for tools that prefer hidden or `config`-suffixed paths.

The uppercase `CHARTER.yaml` convention parallels other top-level project artifacts (`LICENSE`, `README.md`, `CHANGELOG.md`, `DESIGN.md`) and signals that the file is one of the project's normative documents. Lowercase variants remain valid.

Multiple Charters in a single project are out of scope for v1. (A future version may add a `charters` array for monorepo-scale scenarios.)

## 10. JSON / YAML equivalence

A Charter expressed in YAML **MUST** be equivalent to the same Charter expressed in JSON via the [YAML 1.2 → JSON mapping](https://yaml.org/spec/1.2.2/). Tooling **MUST** accept both, and **SHOULD** prefer YAML for human-edited Charters and JSON for machine-emitted Charters.

## 11. Forward compatibility

A Charter that targets a `$schema` URL the validator does not recognize **MUST** be rejected with a clear error. A Charter targeting a known `$schema` URL but containing unknown fields **MUST** be accepted with a warning, not rejected — this allows authors to use newer optional features without breaking older tools.

## 12. Open issues (v1 → v2)

The following are explicitly out of scope for v1 and are reserved for future versions:

- Multi-Charter monorepos
- Cross-Charter token references
- Token transformation pipelines (Style Dictionary–style platform outputs)
- Programmatic rule definitions (regex / AST predicates inline in the Charter)
- Signing / provenance (a Charter signed by a design-system maintainer)

Comments and proposals: [GitHub Issues](#) *(link pending repository setup)*.

---

**Status legend**

- **Draft** — open for feedback, may change before v1.0.0 release
- **Stable** — locked for the lifetime of the `$schema` URL
- **Deprecated** — still valid but discouraged; will be removed in a future major version
