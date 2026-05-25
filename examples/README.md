# Examples

Three example Charters, each demonstrating a different use case:

- [`charter.minimal.yaml`](charter.minimal.yaml) — the smallest valid Charter. Start here if you're hand-writing your first Charter.
- [`charter.complete.yaml`](charter.complete.yaml) — a fully populated Charter for a fictional "Citrine" design system. Demonstrates every v1 field. Use as a *reference*, not a template — most real Charters will be smaller.
- [`charter.from-design-md.yaml`](charter.from-design-md.yaml) — what the [`DESIGN.md` → Charter converter](../converters/design-md-to-charter/) emits for a typical input. Shows how prose is preserved under `notes`, and which fields the converter leaves for the author to populate.

All three are valid against [`schema/charter.schema.json`](../schema/charter.schema.json).

## Verifying

```bash
# Node (ajv)
npx ajv validate -s ../schema/charter.schema.json -d charter.minimal.yaml --spec=draft2020

# Python (check-jsonschema)
check-jsonschema --schemafile ../schema/charter.schema.json charter.minimal.yaml
```

## Contributing examples

Real-world Charter examples from production teams are welcome. Open a PR adding the file here, with a top comment explaining the design system it describes and any non-obvious choices.
