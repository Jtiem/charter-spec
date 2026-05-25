# Changelog

All notable changes to the Charter specification are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Charter versioning follows [Semantic Versioning](https://semver.org/) at the schema level — breaking changes increment the major version and ship under a new `$schema` URL.

## [v1.0.0-draft] — 2026-05-24

The first public draft of the Charter spec.

### Added

- [CHARTER.md](CHARTER.md) — normative specification (sections 1–12)
- [README.md](README.md) — adoption guide and minimal example
- [PHILOSOPHY.md](PHILOSOPHY.md) — design decisions and rationale
- [COMPARISON.md](COMPARISON.md) — Charter vs `DESIGN.md`, `tokens.json`, Style Dictionary, Tailwind config, Figma Variables, Markdown style guides
- [EVIDENCE.md](EVIDENCE.md) — what's measured, what's preliminary, what's external
- [MEASUREMENT-PLAN.md](MEASUREMENT-PLAN.md) — experiments to run before `v1.0.0` final
- [schema/charter.schema.json](schema/charter.schema.json) — JSON Schema (draft 2020-12)
- [examples/charter.minimal.yaml](examples/charter.minimal.yaml) — smallest valid Charter
- [examples/charter.complete.yaml](examples/charter.complete.yaml) — fully populated Charter (Citrine)
- [examples/charter.from-design-md.yaml](examples/charter.from-design-md.yaml) — converter output sample (Northwind)
- [converters/design-md-to-charter/SPEC.md](converters/design-md-to-charter/SPEC.md) — `DESIGN.md` → Charter conversion specification

### Status

- All defaults in [CHARTER.md §5.2](CHARTER.md#52-defined-rules-v1) are tagged `[supported]` or `[preliminary]`. See [EVIDENCE.md](EVIDENCE.md) for the citation per tag.
- The schema URL `https://usecharter.dev/v1/charter.schema.json` is reserved but not yet hosted; current adopters should pin to the JSON Schema in this repo.

### Open issues for `v1.0.0` final

- Run measurements §1–§5 in [MEASUREMENT-PLAN.md](MEASUREMENT-PLAN.md) and revise any `[preliminary]` default that the data contradicts.

### Note

This draft adopts the `CHARTER.md` filename for the normative spec (the file was originally drafted as `SPEC.md`) to parallel Google's `DESIGN.md` branding pattern — the brand and the headline file share a name. The recommended user-facing filename is `CHARTER.yaml` at the project root (lowercase `charter.yaml`, `.charter.yaml`, and `charter.config.yaml` remain accepted).
- Publish reference converter for `DESIGN.md` → Charter.
- Host the schema at `https://usecharter.dev/v1/charter.schema.json`.
