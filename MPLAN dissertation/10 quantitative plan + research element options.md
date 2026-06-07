# Quantitative Plan (no interviews) + Research-Element Options

You've decided: **no interviews**; make the research *logically solid with quantitative data*. Good — this section makes the quant the spine and keeps ethics light (observation of public behaviour/fabric only, no personal data).

---

## Part 1 — The "one element": options for Thames regeneration research

You asked me to brainstorm. Here are six measurable elements, scored on what matters for *your* design — especially **confound-robustness** (how immune the measure is to technology/taste, per file `09`):

| # | Research element | What you'd measure (quant) | Confound-robust? | Verdict |
|---|---|---|---|---|
| 1 | **Publicness of public space** *(current)* | Németh–Schmidt control index; Varna–Tiesdell star; your delivery hierarchy; access points; rules count; hostile-design count | **High** — driven by ownership/rules/management (regulation), not tech/taste | ★ **Recommended** |
| 2 | **Affordable housing & tenure** | % affordable; social vs "affordable rent" split; on-site vs commuted-sum; units/ha | **Very high** — almost purely regulation/viability output | ★ Strong alternative or *second variable* |
| 3 | **Defensive / "hostile" design** | Counts of anti-homeless features, armrests, skate-deterrents, restricted seating, gating | High — a management/regulation choice | Great *sub-component* of #1 |
| 4 | **Green / open space provision** | % publicly accessible green; Urban Greening Factor; tree canopy %; m² per resident | Medium — partly regulation (UGF), partly taste/tech | Good secondary metric |
| 5 | **Permeability / connectivity** | Block size; through-routes; access points; space-syntax integration | Medium — also driven by design fashion (Urban Renaissance) | Use as supporting GIS metric |
| 6 | **Density & height** | Units/ha; habitable rooms/ha; building height | **Low** — heavily confounded by construction technology | ✗ Avoid as main element |

**Recommendation:** keep **publicness (#1)** as the headline element, *sharpened* to foreground **access rights, management rules, and defensive design (#3)**, and carry **affordable housing % (#2)** as a **second, purely-regulatory variable**. Two regulation-driven variables moving together across regimes makes the argument far harder to dismiss as taste/tech — and both are easy, accurate numbers.

> Why not density/aesthetics: those are exactly the measures your confound critique kills. Publicness and affordable-housing % are the measures that *survive* it. That contrast is itself a point you can make in the dissertation.

---

## Part 2 — The quantitative dataset (one row per space)

Build a single tidy table, `data/publicness_scores.csv`, one row per exemplar (including both halves of each failed-and-rebuilt pair). Suggested columns:

| Field | Type | Source |
|---|---|---|
| `site_id`, `site_name` | text | — |
| `year_built` / `year_consented` | int | planning records |
| `phase` (1–5) | int | your periodisation (`08`) |
| `regime_index` | 0–10 scale | **see Part 3** — coded "how market-led/deregulated the consent regime was" |
| `ownership` (public / POPS / estate) | category | land registry / planning docs |
| `nemeth_control` | 0–1 | observation index (`03` §3a) |
| `vt_ownership`,`vt_control`,`vt_civility`,`vt_config`,`vt_animation` | 1–5 each | Varna–Tiesdell star |
| `hierarchy_score` | 0–6 | your public-benefit delivery hierarchy |
| `access_points` | count | GIS / site |
| `rules_count` | count | posted signage |
| `hostile_features` | count | observation |
| `pct_public_area` | % | GIS |
| `green_pct` | % | GIS / OS Greenspace |
| `affordable_pct` | % | planning records / S106 |
| `pair_id` | text | links old↔new and contemporaneous pairs |

This single table feeds every chart below.

---

## Part 3 — The "regulatory regime index" (your clever, easy-to-interpret centrepiece)

To make "regulation" itself a *number* you can plot, code each scheme's consent regime on a simple additive 0–10 scale of market-led-ness (higher = more deregulated/market-led). Example sub-scores (0–2 each):

1. Land ownership at delivery (public=0 … private master-developer=2)
2. Consent route (full planning control=0 … UDC/Enterprise Zone/PD/viability-led=2)
3. Public access secured in perpetuity? (statutory adopted=0 … revocable private licence=2)
4. Affordable housing secured (policy-compliant on-site=0 … commuted/none=2)
5. Management (public/local authority=0 … private estate management=2)

Then the headline figure of the whole dissertation:

> **Scatter: `regime_index` (x) vs `publicness` (y), one point per space, labelled by year.**

If publicness falls as the regime becomes more market-led — *and the points cluster by regime rather than by decade* — you have visual, quantitative evidence that **regulation, not time/tech, drives publicness**. That single, easy-to-read chart answers your whole research question.

---

## Part 4 — Charts & simple statistics (honest about small N)

- **Trajectory line:** publicness vs year (the longitudinal story).
- **Paired bars:** old vs new for each failed-and-rebuilt pair (P1–P3) — the "same site, different regime" difference.
- **Contemporaneous paired bars:** same-era pairs (controls tech/taste) — the cleanest evidence.
- **Radar small-multiples:** Varna–Tiesdell star per exemplar.
- **Difference scores (Δ):** new − old publicness per pair; report the mean Δ by confound-control type.
- **Regime-vs-publicness scatter** (Part 3) — the centrepiece.

**Statistics honesty:** with ~6–10 spaces this is an *intensive comparative design*, not statistical inference. Report descriptive indices, difference scores and the scatter pattern; explicitly say you are not claiming statistical significance, only analytical (theory-testing) generalisation. Markers reward this candour (see `07`).

> Tooling: `data/` CSV + a short `analysis/` Python (pandas/matplotlib) script regenerates every figure; GIS metrics from QGIS (OS Open Greenspace, OSM, London Datastore). No interviews → ethics is observation-only.

---

## Part 5 — How this satisfies your supervisor and the brief
- **Quantitative + interpretable:** every claim is a number or a one-glance chart.
- **Logically solid:** the regime index + matched pairs make the causal claim defensible.
- **Anchored to Clifford:** deregulation (high regime index) → lower publicness, tested over time; re-regulation (the Charter) tested as a reversal.
- **No interviews:** lighter ethics, faster clearance.
