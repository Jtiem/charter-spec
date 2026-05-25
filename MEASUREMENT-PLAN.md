# Measurement Plan

The Charter spec is publishable at `v1.0.0-draft` because the *structure* of the format is supported by measured findings (see [EVIDENCE.md](EVIDENCE.md)). The *specific default values* — thresholds, severity assignments, generalization claims — are partly preliminary. This document lists what we will measure before stamping `v1.0.0` final, with specific experiments, success criteria, and what we'd publish either way.

A revised default does not break the schema. A `v1.1` Charter that ships a different `delta_e_threshold` default is still validated by `v1` tooling. The risk of publishing now is low; the cost of waiting is the format-war window narrowing.

Every section below maps to a row in [EVIDENCE.md §4](EVIDENCE.md#4-what-is-not-measured-gap-inventory).

---

## §1. Optimal `delta_e_threshold` for AI-audit

**Question.** Is `2.0` the threshold that maximizes catch rate of meaningful color drift while minimizing false-positive flags on near-matches that humans would accept?

**Why we don't know.** `2.0` is the human-perceptual just-noticeable-difference; nothing in the validation arc tested AI-output color drift against varying thresholds.

**Experiment.**
- Corpus: 200+ AI-generated components, sampled across `gpt-4`, `claude-3.7-sonnet`, `gemini-2.5-pro`, with and without a Charter.
- For each component, compute CIEDE2000 distance from every color in the output to the nearest charter token.
- Hand-label each color use as "drift" / "acceptable" by two independent reviewers (designer + engineer); use the union for catch-rate and intersection for false-positive rate.
- Sweep `delta_e_threshold` from `0.5` to `5.0` in 0.5 steps. Plot catch vs FP curve.

**Success criterion for confirming `2.0`.** If `2.0` lands within the knee of the ROC curve (within 10% of the best F1), keep it. If a different value beats `2.0`'s F1 by ≥15%, revise the default in `v1.1`.

**Publish either way.** Yes. The dataset and per-threshold metrics will be published as a companion `evidence-deltaE-v1.json` artifact in this repo.

---

## §2. Severity defaults per rule

**Question.** Are the severity assignments in [CHARTER.md §5.2](CHARTER.md#52-defined-rules-v1) — `hardcoded_colors: error`, `hardcoded_spacing: warn`, `inline_styles: warn`, `off_token_typography: error`, etc. — calibrated to real failure-mode frequency, or are they educated guesses?

**Why we don't know.** Only `unknown_components: error` is directly supported by the validation arc (Test 5: vague arm hand-rolled card surfaces). The rest are reasoned defaults.

**Experiment.**
- Corpus: same 200+ AI-generated components from §1.
- For each rule, classify each violation by reviewer agreement: "must-block" / "should-warn" / "tolerable."
- Compute the cumulative distribution per rule.
- Set the default to `error` if ≥70% of violations are "must-block." Set to `warn` if 30–70%. Set to `off` if <30%.

**Success criterion.** Severity assignments line up with measured must-block proportions. If a default contradicts the data by more than one tier (e.g., `error` for a rule where only 20% of violations are must-block), revise in `v1.1`.

**Publish either way.** Yes. Per-rule histograms published as `evidence-severity-v1.json`.

---

## §3. Charter-on vs Charter-off violation rate

**Question.** Does adding a Charter to a project measurably reduce violations across multiple models?

**Why we don't know.** The validation arc tested falsifiable-spec vs vague-spec, not Charter-with-linter vs no-Charter. The presence of a *linter that reads the Charter* is the load-bearing addition; the arc tested the spec half but not the enforcement half end-to-end.

**Experiment.**
- Three model families (Anthropic, OpenAI, Google), two task scales (single feature, six-section landing).
- Three conditions per cell: (a) no Charter, (b) Charter as prompt context only, (c) Charter + post-hoc linter that surfaces violations to the model for self-correction.
- Pre-register predictions before running.
- Blind-score outputs against a fixed rubric (importable component reuse, off-token color count, structural drift count).
- N ≥ 5 per cell.

**Success criterion.** Condition (c) produces ≥40% fewer violations than condition (a) on the six-section task, across at least 2 of 3 model families. If not, the spec needs to be honest that Charter-as-prompt + Charter-as-linter is the load-bearing pairing, not Charter alone.

**Publish either way.** Yes. Full per-cell results in `evidence-end-to-end-v1.json`.

---

## §4. Time-to-first-Charter

**Question.** How long does it take a real team (not the author) to write their first valid `charter.yaml`?

**Why we don't know.** Adoption friction was never measured.

**Experiment.**
- Recruit five teams: two with an existing design system (one mature, one early), two without (greenfield), one with a `DESIGN.md` already (run through the converter).
- Provide them only [README.md](README.md), [CHARTER.md](CHARTER.md), and the minimal example.
- Measure: time to first valid Charter (schema-valid), time to first Charter the team is comfortable shipping (rules + components blocks populated), and the rough qualitative pain points.

**Success criterion.** Median time-to-valid ≤ 15 minutes for the converter path, ≤ 60 minutes for greenfield. Median time-to-shippable ≤ 4 hours. If these are off by more than 2x, the spec needs a "Getting started in 15 minutes" tutorial as a peer to [README.md](README.md), and the converter needs to produce a more complete output.

**Publish either way.** Yes. Anonymized session logs + summary in `evidence-adoption-v1.md`.

---

## §5. DTCG → Charter conversion is lossless for tokens

**Question.** Can any valid DTCG `tokens.json` be wrapped in a Charter envelope without information loss?

**Why we don't know.** Asserted from format equivalence; not empirically validated against the corpus of real DTCG-format token files in the wild.

**Experiment.**
- Collect 20+ real-world DTCG token files (Open Props, system-ui-org, public design systems).
- Run the converter (see [converters/design-md-to-charter/](converters/design-md-to-charter/)) on each.
- Round-trip: Charter → DTCG export → compare to original. Diff every field.

**Success criterion.** Zero information loss on the tokens section for 100% of inputs. Any loss is a bug to fix before `v1.0.0` final.

**Publish either way.** Yes. Round-trip diffs as test fixtures in `tests/dtcg-round-trip/`.

---

## §6. `wcag_level: AA` as the right AI-audit default

**Question.** Is `AA` the level where AI-generated UI catches the most real accessibility failures with the fewest false positives, or is `A` enough for prototyping and `AAA` warranted by default?

**Why we don't know.** AA is the industry default — driven by regulation (Section 508, EN 301 549, PSBAR), not by AI-output measurement.

**Experiment.**
- Corpus: same 200+ AI-generated components from §1.
- Run automated `axe-core` audits at A, AA, and AAA levels.
- Cross-check against manual review by an accessibility specialist on a 50-component subsample.
- Compute: per-level violation rate, false-positive rate, "would block real users" rate.

**Success criterion.** AA produces the highest "would-block-real-users" catch rate per false positive. If AAA is materially better, the default flips. If A is materially worse, the existing default holds (this is the expected outcome).

**Publish either way.** Yes. Per-level distributions in `evidence-wcag-v1.json`.

---

## §7. Cross-stack generalization

**Question.** Do the spec's findings hold for Vue, Svelte, Angular, plain HTML, and native (SwiftUI / Compose)?

**Why we don't know.** Every venue in the validation arc was JSX / React / Tailwind.

**Experiment.**
- Replicate the §3 experiment (Charter-on vs Charter-off) with Vue + Svelte at minimum. Angular and native are lower priority.
- Use framework-equivalent component libraries: PrimeVue (Vue), shadcn-svelte (Svelte).
- Same N per cell, same blind-scoring rubric adapted for non-JSX syntax.

**Success criterion.** Effect direction holds across all three frameworks (Charter-on reduces violations). Magnitude can vary by ±30% without invalidating the spec. If a framework shows the *opposite* direction, the spec needs to ship a framework-specific note in [CHARTER.md §3.1](CHARTER.md#31-categories).

**Publish either way.** Yes. Per-framework summary in `evidence-cross-stack-v1.json`.

---

## §8. Long-horizon enforcement (multi-feature drift)

**Question.** Does Charter-enforced consistency hold across many features built over weeks, or does drift compound?

**Why we don't know.** The validation arc was at most a six-section landing page. Real teams build dozens of features over months; whether Charter compounds (drift trends down) or merely arrests (drift stays flat) is unknown.

**Experiment.**
- Cohort: three teams agreeing to a 6-week trial with a real product backlog.
- Instrumentation: Flint or equivalent Charter-aware linter running on every PR.
- Outcome: violation density (violations per 1000 lines of new UI code) week-over-week.

**Success criterion.** Violation density is stable or decreasing across weeks. A monotonic increase indicates Charter is insufficient and the spec needs additions (decay rules, deprecation tracking, etc.).

**Publish either way.** Yes. Per-team time-series in `evidence-longhorizon-v1.md`.

---

## §9. Adoption stickiness

**Question.** Do teams that adopt Charter keep using it after 60 days?

**Why we don't know.** Adoption was never tracked over time.

**Experiment.**
- Survey + telemetry from §8 cohort and from any public adopters who opt in.
- Track: Charter file edits per week, lint runs per week, PRs that touch the Charter.

**Success criterion.** ≥60% of teams that wrote a Charter are still running the linter on PRs at 60 days.

**Publish either way.** Yes. Aggregate adoption curve in `evidence-stickiness-v1.md`.

---

## Cadence

- **Now → v1.0.0-draft (already published).** Spec is open for review. EVIDENCE.md cites what we have. This file cites what we'll measure.
- **Next 8–12 weeks.** Run §1, §2, §3, §4, §5. These are the load-bearing measurements. §1 and §2 directly affect the defaults table; §3 directly affects the "does Charter actually work end-to-end?" claim.
- **v1.0.0-rc.** Land §1–§5 results, revise defaults if warranted, freeze the schema.
- **v1.0.0 final.** Ship. Begin §6–§9 as continuous measurement in the background.
- **v1.1.** Roll in any revised defaults from §6–§9.

## Community contribution

Outside replications, additional model families, and additional stacks are explicitly invited. The corpus, scoring rubric, and pre-registration templates will be open-sourced alongside the first experiment results. A replication that contradicts our measurements is a contribution, not a critique — open an issue, attach the data, and the affected default will be re-examined.

---

## What this document is not

This is not a roadmap of features. It is a roadmap of evidence. Features can be discussed in [GitHub Issues](#); evidence gaps live here.
