# Evidence

The Charter spec makes design decisions and ships defaults. This document records which of those are backed by measurement, which are inherited from established external research, and which are preliminary opinions awaiting validation. The intent is to make the spec auditable: a reader should be able to decide, per claim, how much to trust it.

If a default is marked **[supported]** in [CHARTER.md](CHARTER.md), its evidence lives below. If a default is marked **[preliminary]**, its evidence is a gap — see [MEASUREMENT-PLAN.md](MEASUREMENT-PLAN.md) for what we're running to close it.

---

## 1. The validation arc (May 2026)

The most consequential body of evidence behind the Charter format is a five-test validation arc run 2026-05-18 to 2026-05-22. Method, results, and full artifact tree are public; the headline numbers are below.

**Method:**
- Five tests, increasing in venue scale (`shadcn-ui/taxonomy` → `create-t3-app` → matched-pair minimal venues → full taxonomy at six-section scale)
- Pre-registered locked predictions per test, written before any build was run
- Blind scoring by a separate agent that never saw the arms, the thesis, or the predictions
- Independent grep verification on every result claim
- 36+ scored builds total, N=3–4 per cell
- Each test has its own pre-registered predictions and full RESULTS document; pre-registered falsifiers fired twice across the arc and were honored

**Test-by-test summary:**

| # | Venue | Manipulation | Headline measurement | Status |
|---|---|---|---|---|
| 1 | `shadcn-ui/taxonomy`, Bookmark posts (CRUD) | Vague vs falsifiable spec, 4 reps × 2 arms | Published-only boundary: **falsifiable 4/4, vague 0/4.** Component reuse: **2.25 vs 0.5.** | Partial support |
| 2 | `create-t3-app`, Archive posts (CRUD + tRPC) | 2×2: `CLAUDE.md` × spec precision, 3 reps × 4 arms | Explicit double-archive boundary: **falsifiable 5/6 vs vague 1/6.** `CLAUDE.md` attribution falsified in this venue. | Confirmation + refinement |
| 3 | `shadcn-ui/taxonomy`, 3-tier pricing section | Vague vs falsifiable, 4 reps × 2 arms | **Zero brand liberties in 8/8 builds.** A strong importable component library suppressed all chromatic/typographic drift even under "make it on-brand." | Clean falsification of an author prediction |
| 4 | Matched-pair minimal venue, 3-tier pricing | 2×2: import library × spec precision | Import-vs-imitate axis **falsified** in a clean matched-pair. Mild `shadow-md`/`scale-105` emphasis liberties only. | Falsification |
| 5 | Full `shadcn-ui/taxonomy`, six-section landing | Vague vs falsifiable at real scale | **3/3 vs 3/3 clean arm separation.** Every falsifiable rep reference-quality; every vague rep hand-rolled three of six sections (features, stats, closing CTA) despite importing `Card`. | Confirmation at scale |

**The five durable claims the arc earned** (verbatim from the [validation-arc summary](../first-drafts/briefs/validation-run/SUMMARY.md)):

1. **Spec precision is the reliable knob.** Falsifiable specs reduce or eliminate drift on the boundaries the codebase doesn't already enforce.
2. **What's discoverable AND obvious gets discovered without a spec.** Use-case grids → `Card`. FAQ → `Accordion`. Hero → `Badge` + button variants.
3. **Drift is structural before it's chromatic.** With strong color tokens enforced, agents rarely reach for raw colors. What breaks first is "should this be a `Card` or a `<div>`?"
4. **Feature scale matters, but only when paired with non-obvious component fits.** Tests 3 and 4 (one section) showed near-ceiling behavior. Test 5 broke the ceiling at six sections, three ambiguous.
5. **`CLAUDE.md`'s value is conditional on discoverability.** It helped in the larger test-1 codebase. It added nothing measurable in test 2 where one canonical example router already taught the conventions.

### What this evidence supports in the spec

- **The `components.registry` + `components.allowed` mechanism** — Test 3 (8/8 zero-liberty builds) and Test 5 (3/3 vs 3/3 clean separation) jointly support the claim that an importable component allowlist is the load-bearing structural lever. This is the most measured claim in the spec.
- **The decision to make `unknown_components` default to `error`** — Test 5's vague arm hand-rolled three card surfaces *despite importing `Card`*. The mechanism failed not at the library boundary but at the use boundary. Erroring on unknown components is a direct response to that measured failure mode.
- **The decision to make `hardcoded_spacing` default to `warn` rather than `error`** — Claim 3 ("drift is structural before chromatic," generalized) suggests spacing is in the lower-priority drift class. Spacing literals were not the primary failure mode in any of the five tests.
- **Profiles as a feature** — the existence of `prototype` vs `production` profiles is informed by Claim 5: `CLAUDE.md`-style discoverability supports vary by venue. The same logic applies to a single project at different stages.
- **The whole concept of Charter** — Claims 1 + 3 are the empirical basis for the spec itself: the lever is precision-of-spec, and the failure mode that lever fixes is structural drift (which is where the rules apply).

### What this evidence does *not* support

- **Specific numeric thresholds** — the arc did not set `delta_e_threshold: 2.0`. That number comes from external perceptual research (see §3). The arc supports *that there should be such a threshold*; it does not validate 2.0 specifically as the right value for AI-compliance audit.
- **The severity tier of every rule** — only a few rules can be derived from the arc. The rest (`inline_styles: warn`, `off_token_typography: error`) are reasoned opinions, not measured.
- **Generalization beyond JSX / React / Tailwind** — every venue in the arc was JS/web/React. Vue, Svelte, Angular, plain HTML, and native targets are unmeasured.
- **Generalization beyond the author** — the same person designed every venue, spec, feature, and prediction. Blind scoring and independent grep mitigated this but did not eliminate it.

### Limitations the arc itself names

Quoted from the [arc summary](../first-drafts/briefs/validation-run/SUMMARY.md):

> N=3–4 per cell. All venues are JS/web/React. Taxonomy is high-quality real; not all real codebases are this clean. What would tighten it further: an even messier real venue (cal.com or vercel/commerce), larger N per cell, a multi-feature sequence, or a venue with actively inconsistent examples / no examples at all.

The spec should be read as supported on the axes the arc covers, and unproven on the axes it doesn't.

---

## 2. Adjacent findings

### 2.1 The Mason determinism gap

Flint's Mason (the JSX transform engine that produces AI-generated components) has a known determinism gap — same input does not always produce the same output. Logged as `project_mason_determinism_gap.md` in the working memory. This is *not* an argument against Charter; it's an argument *for* a Charter-aware linter that catches drift the generator introduced.

### 2.2 Retrieval baseline (Phase 0)

Charter v1 deliberately does *not* depend on a registry retrieval / "finder" mechanism. The measured retrieval baseline (May 2026) showed the finder at roughly 4% accuracy in the worst measured condition, with silent confabulation under no-match conditions. The reframed Phase 0 gates are `top-3 ≥ 0.95 AND no-match honesty = 1.0`. Until those gates are met, Charter routes around retrieval by being reference-anchored: the writer cites the components and the linter verifies them. This is reflected in the spec by allowing `components.allowed` to be an explicit enumeration rather than a similarity-matched discovery.

---

## 3. External research

The Charter spec leans on three bodies of well-established external research. These are cited where they appear in [CHARTER.md](CHARTER.md).

### 3.1 CIEDE2000 perceptual color distance

The `delta_e_threshold` rule uses the CIEDE2000 perceptual color distance metric (Sharma, Wu, and Dalal, 2005). The 2.0 default reflects the long-cited "just noticeable difference" threshold for trained observers under standard viewing conditions.

**What this supports:** that perceptual distance is the right unit for color drift, instead of RGB or HSL deltas.

**What this does not support:** that 2.0 is the optimal threshold for AI-generated UI audit specifically. A different threshold may catch more real drift with fewer false positives. **This is a [preliminary] default.**

### 3.2 W3C DTCG

Tokens use the W3C Design Tokens Community Group format (`$value`, `$type`, reference syntax). This is the emerging standard; Stitch's `DESIGN.md` also uses DTCG, which means Charter and `DESIGN.md` share a token format and the converter is lossless for the tokens section.

**What this supports:** format choice for tokens.

### 3.3 WCAG 2.1

The `wcag_level` rule and the default `AA` value derive from the W3C WCAG 2.1 standard. AA is the widely-adopted regulatory floor in the US (Section 508), EU (EN 301 549), and UK (PSBAR).

**What this supports:** the existence of a `wcag_level` rule and that a sensible default lies within `{A, AA, AAA}`.

**What this does not support:** that AA specifically maximizes catch rate vs false-positive rate on AI-generated UI. **This is a [preliminary] default in the AI-audit context** — though it's the right *industry* default.

---

## 4. What is not measured (gap inventory)

The following claims are made by the spec but are not yet backed by Charter-specific measurement. Each is tracked in [MEASUREMENT-PLAN.md](MEASUREMENT-PLAN.md) with the experiment we'd run to close it.

| Claim in spec | Status | Tracked in plan |
|---|---|---|
| `delta_e_threshold: 2.0` is the optimal AI-audit threshold | Preliminary (external default) | §1 |
| Severity defaults per rule (which is `error` vs `warn`) | Preliminary except where Test 5 / Claim 3 covers them | §2 |
| Charter-on reduces violations by ≥X% vs Charter-off, across multiple models | Not measured | §3 |
| Time-to-first-Charter for a real team is ≤Y minutes | Not measured | §4 |
| The DTCG → Charter conversion is lossless for the tokens section | Asserted from format equivalence, not empirically verified | §5 |
| `wcag_level: AA` is the right default for AI-audit, not just for industry | Preliminary | §6 |
| Cross-stack (Vue / Svelte / Angular / native) generalization | Not measured | §7 |
| Long-horizon enforcement (drift across many features over weeks) | Not measured | §8 |
| Adoption sticks: teams that adopt Charter keep using it | Not measured | §9 |

The spec is publishable in this state precisely because the *structure* of Charter is supported by the most consequential measurements, and the gaps are in *specific default values* that can be revised in a minor version without breaking the schema. A `v1.1` that revises `delta_e_threshold` based on new evidence does not invalidate `v1` Charters.

---

## 5. How this document is maintained

When a new measurement closes a gap in [MEASUREMENT-PLAN.md](MEASUREMENT-PLAN.md), the entry moves here and the corresponding tag in [CHARTER.md](CHARTER.md) flips from **[preliminary]** to **[supported]**. When a measurement contradicts a default, the default is revised in the next minor version and the old version's behavior is preserved under its existing `$schema` URL.

This file is part of the spec, not a footnote to it. Reviewers are explicitly invited to challenge anything here.

---

## 6. Sources and artifacts

- [Validation arc summary](../first-drafts/briefs/validation-run/SUMMARY.md) — five-test arc, durable claims
- [Test 5 winning falsifiable spec](../first-drafts/briefs/validation-run/test5/solutions-falsifiable.md) — the spec that produced 3/3 reference-quality builds
- Sharma, G., Wu, W., and Dalal, E. (2005). *The CIEDE2000 color-difference formula: Implementation notes, supplementary test data, and mathematical observations.* Color Research & Application, 30(1), 21–30.
- W3C Design Tokens Community Group. *Design Tokens Format Module* (Draft). https://www.designtokens.org/tr/drafts/
- W3C. *Web Content Accessibility Guidelines (WCAG) 2.1.* https://www.w3.org/TR/WCAG21/
