# Contributing to Charter

Charter is open source. The spec is a contract; the implementation is a market. We want both to grow.

## Three kinds of contribution

**1. Replication and counter-evidence.**
The defaults in [CHARTER.md §5.2](CHARTER.md#52-defined-rules-v1) are tagged `[supported]` or `[preliminary]`. Every claim in [EVIDENCE.md](EVIDENCE.md) is open to challenge. If you run a measurement that contradicts a default, open an issue with the methodology, the data, and the conclusion. The affected default will be re-examined. **A replication that disproves a default is a contribution, not a critique.**

**2. New converters.**
If you build a converter from a format Charter doesn't yet bridge to (Tokens Studio, Theo, Knapsack, a private design-tokens format), open a PR with a `SPEC.md` describing the conversion and the implementation. See [converters/README.md](converters/README.md) for the contract every converter must meet.

**3. Spec changes.**
Changes to [CHARTER.md](CHARTER.md) require:
- An explicit problem statement: what real-world Charter doesn't capture today.
- A proposed change with backward-compatibility analysis.
- For breaking changes: a migration story.

Spec changes are scoped to minor versions when additive (new optional fields, new rule defaults) and to major versions when breaking (renamed required fields, removed rules). Breaking changes ship under a new `$schema` URL.

## Process

1. Open an issue first for anything non-trivial. A 30-line PR is welcome without prior discussion; a spec change is not.
2. Reference the section of [CHARTER.md](CHARTER.md), [EVIDENCE.md](EVIDENCE.md), or [PHILOSOPHY.md](PHILOSOPHY.md) you're modifying.
3. For default changes: include the measurement data or a citation to where it lives.
4. Run `npx ajv validate -s schema/charter.schema.json -d examples/*.yaml --spec=draft2020` before submitting — all examples must validate against any proposed schema change.

## Code of conduct

Be honest about what's measured and what isn't. Don't dress up an opinion as evidence. Don't dismiss evidence because it inconveniences your opinion.

## License

By contributing, you agree that your contributions are licensed under Apache 2.0, the same license as the project. See [LICENSE](LICENSE).
