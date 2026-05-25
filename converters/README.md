# Converters

Tools that turn other formats into Charters.

| Converter | Status | Description |
| --- | --- | --- |
| [`design-md-to-charter/`](design-md-to-charter/) | Spec complete; reference implementation in progress | Convert a Google DESIGN.md into a draft Charter |
| `tailwind-to-charter/` | Planned | Convert a `tailwind.config.{js,ts}` into a Charter with tokens populated |
| `style-dictionary-to-charter/` | Planned | Convert a Style Dictionary input directory into a Charter |
| `figma-variables-to-charter/` | Planned | Pull Figma Variables via the REST API into a Charter |
| `charter-to-style-dictionary/` | Planned | Emit a Style Dictionary–compatible token tree from a Charter (for downstream platform pipelines) |

Each converter has its own subdirectory with a `SPEC.md` (the normative conversion mapping) and a `README.md` (usage). Reference implementations live under `src/` within each converter's directory.

Converters are intentionally specified, not just implemented. A team that wants to write their own converter in their own language should be able to do so from the spec alone.

## Contributing a new converter

If you want to add a converter for a format Charter doesn't yet bridge to:

1. Open an issue describing the source format and the conversion shape.
2. Draft a `SPEC.md` modeled on `design-md-to-charter/SPEC.md` (input description, field mapping, lossy/lossless contracts, warning semantics).
3. Submit a PR adding the directory.

Reference implementations are welcome but not required for spec acceptance.
