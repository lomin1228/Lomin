# Methodology — Mixed Methods (with an interpretable quantitative core)

Design philosophy (from your notes): *problem-driven*, comparative, with **measurable + non-measurable variables** and **discourse analysis**. The quantitative work must be **accurate and easy to interpret** — so the spine is a *published, replicable scoring index*, not bespoke statistics no examiner can check.

---

## 1. Research question and objectives (CONFIRMED: London longitudinal — full detail in `08`)

**RQ:**
> How has the *publicness* of public space produced through London's riverside regeneration changed across successive phases of urban policy from the post-war era to the present, and what explains the trajectory?

**Objectives (these organise the chapters):**
1. **Periodise** London regeneration policy into defensible phases (documentary/historical).
2. **Select one comparable riverside public-space exemplar per phase** along a single transect.
3. **Measure** the publicness of each exemplar with one consistent instrument (index + GIS + your delivery hierarchy).
4. **Explain** the trajectory through the periodisation of neoliberalisation + the viability mechanism.
5. **Adjudicate** the *privatisation* (Minton) vs *public-isation* (Carmona) debate against the longitudinal data; assess the Public London Charter (2020).

---

## 2. Case selection logic (longitudinal "most similar across time" design)

Hold **site type and geography roughly constant** (Thames riverside, central London) so that variation in publicness maps onto the **era / delivery model**. One exemplar per phase, ideally along one **walkable South Bank transect**:

| Phase | Exemplar | Delivery model | Neoliberal phase |
|---|---|---|---|
| Welfarist (1945–79) | Festival of Britain / Southbank Centre | state-led, publicly owned | pre/proto |
| Property-led (1979–97) | London Docklands / Canary Wharf (LDDC) | UDC, market-led | roll-back |
| Urban Renaissance (1997–2010) | More London / The Scoop | partnership + POPS | roll-out |
| Viability/austerity (2010–20) | **One Blackfriars** *(your existing work)* | private + commuted-sum | deepening |
| Charter era (2017–now) | Public London Charter-era scheme | re-regulated POPS | correction |

Take all five, or a tighter 3–4 — **fewer, deeper exemplars score higher**. See `08 London longitudinal design.md` for the full table, citations and the debate.

> **Fallback only (not the plan):** the earlier three-city comparison (London Royal Docks / HK Kai Tak / NYC Hudson Yards) is preserved in `08`'s notes in case scope changes. The student has chosen the longitudinal route.

### Scoring historical/past spaces
Past phases are scored by triangulating: (a) **archival** evidence — historic plans, photos, the original design intent and management rules of the era; (b) **present-day observation** of what survives of each space; (c) secondary historical accounts. The instrument (below) is applied consistently; limitations of retrospective scoring are stated explicitly.

---

## 3. The quantitative core — measuring "publicness" (easy to interpret)

You will produce **one number and one picture per space**, fully comparable across sites.

### 3a. Németh & Schmidt (2011) control index — primary instrument
An **observation checklist**: for each space, record presence/absence of features across four dimensions. Score = proportion of controlling features present. Lower control = more "open/public".

| Dimension | Example coded features (presence = 1) |
|---|---|
| **Laws/rules** | posted conduct rules, "no skateboarding/loitering/photography", restricted hours, alcohol bans |
| **Surveillance & policing** | CCTV count, security guards, secondary policing presence |
| **Design/image (territoriality)** | gates, walls, symbolic boundaries, paving change signalling "private", sponsor branding |
| **Access & comfort (positive)** | seating provision, free seating vs consumption-only, public toilets, shade, entrances/permeability |

Output: a **control score** and a **comfort/openness score** per site → a **2-axis scatter** (the Németh–Schmidt quadrant). Trivially interpretable: top-right = open & comfortable; bottom-left = controlled & hostile.

### 3a-bis. YOUR "public benefit delivery hierarchy" — the original instrument
From your One Blackfriars work. Score each public space on six binary/graded steps: **provided → accessible → affordable → advertised → used → beneficial**. A space can score 6/6 (genuinely public) or, like the One Blackfriars viewing lounge, "provided" but failing on accessibility/affordability. This is your *methodological contribution* — combine it with the two published indices below for triangulation.

### 3b. Varna & Tiesdell (2010) "star model" — secondary, for a radar chart
Score each space 1–5 on **ownership, control, civility, physical configuration, animation** → overlay three **radar "stars"**. The single most memorable figure in the dissertation.

### 3c. GIS spatial metrics (QGIS) — the "GIS analysis of features" your supervisor suggested
Computed per site and normalised (per hectare / per resident):
- **Area of publicly accessible open space** and **% of total site**.
- **Accessibility:** number/width of entrances, network distance from nearest transit, walkability/permeability.
- **Green space %** and tree canopy.
- **Provision counts:** benches, toilets, drinking fountains per 100 m of frontage.

Data sources: OpenStreetMap, OS Open Greenspace / OS Open Map, London Datastore, NYC Open Data (POPS dataset exists!), HK Lands/Planning Dept open data. Outputs: choropleth/figure maps + a comparison bar chart.

### 3d. Optional behaviour mapping (Gehl-style)
Timed pedestrian/activity counts at fixed points → who actually uses the space, when. Light-touch, observation-only (no personal data) → minimal ethics.

### 3e. Viability sensitivity analysis — the *mechanism*, quantified (from BPLN0041)
Use the government **Development Appraisal Tool (DAT)** Excel models you already hold (`../bpln0041/FW_ Economics of viability/`). Vary GDV, developer profit and sales rate to show numerically how the **residual land value** (`RLV = GDV − costs − profit − obligations`) determines how much public realm / affordable housing a scheme can "afford". This is the quantitative bridge from *neoliberalisation* → *delivery model* → *degraded publicness*. Optionally add **hedonic pricing** (Green Book 2026 §8.14; Gibbons, Mourato & Resende 2014) to value the public space itself.

---

## 4. The qualitative core

- **Document/discourse analysis** of the planning frameworks you already hold (OAPFs, design guides, master plans): *how is "public realm"/"publicness" framed, by whom, and what is promised vs delivered?* Code with NVivo or by hand. This directly uses your supervisor's interest in "who is producing the reports".
- **Direct structured observation field notes** (the qualitative companion to the index): the "Ritz-Carlton" type observation — hostile design, staff behaviour, atmosphere.
- **(Optional) semi-structured interviews** with planners/managers/users → richer, but triggers **full ethics by June**. Recommend *deferring* unless London-only frees capacity.

---

## 5. Triangulation / analytical strategy

For each site: **(promise)** documents → **(form)** GIS + index → **(use)** behaviour mapping. Then cross-case comparison → locate each on the neoliberalisation pathway → adjudicate Minton vs Carmona.

---

## 6. Ethics (your notes: "auto-fail without this")

- Observation of **public behaviour in public space, no identifying data, no recording of individuals** → typically *low-risk*, but still complete the Bartlett ethics questionnaire.
- **Photographs:** avoid identifiable individuals; photograph fabric/features, not faces.
- **Interviews (if added):** information sheet + consent form + secure data storage + GDPR data-management plan. This is the part that *must* be cleared by June.
- Add the **risk assessment** (lone fieldwork, travel to HK/NYC — or use street-level imagery + open data if you can't travel).

> Feasibility flag: visiting HK *and* NYC for primary observation in person is the biggest risk. Mitigation: do **London primary** (in person) + **HK/NYC secondary** (official street imagery, open POPS datasets, published photos) — and say so transparently. Or go London-only.

---

## 7. Validity / limitations to pre-empt
- Indices are **observer-dependent** → publish your coding sheet, score twice, report inter-rater reliability if possible.
- Three cities = **small N** → this is *intensive comparative case study*, not statistical generalisation. Frame as theory-testing (variegation), per Brenner/Peck/Theodore.
- Cross-context comparability of "public space" (HK vs UK vs US legal definitions) → handle explicitly as a finding, not a flaw.
