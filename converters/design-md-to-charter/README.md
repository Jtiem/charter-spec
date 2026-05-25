# `DESIGN.md` → Charter converter

If you have a `DESIGN.md` (Google's open-source design system spec, Apache 2.0), you have most of a Charter already. This converter produces a draft `charter.yaml` from any conforming `DESIGN.md`.

## What gets converted

- **Tokens** (color, typography, spacing, etc.) — losslessly. DTCG fields pass through verbatim.
- **Prose sections** (Visual Theme & Atmosphere, Typography Rules, etc.) — preserved verbatim under the Charter's `notes` field.
- **Frontmatter** — `name` and `version` extracted into Charter top-level; the rest preserved under `notes.frontmatter`.

## What the converter does NOT do

- **Infer `components.allowed`** — DESIGN.md has no formal component allowlist. The converter emits an empty list and a `# TODO` comment. You populate it.
- **Adjust `rules` from prose** — the converter emits the [CHARTER.md](../../CHARTER.md) defaults verbatim. Review and tighten before shipping to production.

This is intentional. The converter produces a *draft* Charter; the author finishes it.

## Specification

The full conversion mapping (including snake_case key naming, error semantics, and round-trip guarantees) is in [`SPEC.md`](SPEC.md). Any implementation that follows this spec is a conforming converter.

## Reference implementation

Coming soon in `src/`. The spec is sufficient for any party to implement the converter independently.

## Example output

See [`examples/charter.from-design-md.yaml`](../../examples/charter.from-design-md.yaml) for what this converter produces for a typical DESIGN.md input. The source DESIGN.md for that example will be published alongside the reference implementation.

## CLI surface (reference)

```
charter-from-design-md <input.md> [-o <output.yaml>] [--report <report.json>]
```

Default output: `charter.yaml` in the current directory.

## License

Apache 2.0, same as the spec.
