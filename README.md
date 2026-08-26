# Compatible Histories

Research on relational complexity, invariant measures over compatible physical
histories, and a possible connection to cosmological expansion.

**[Research Project Site](https://jonland82.github.io/compatible-histories/)**

The program began with structural-complexity observations made during the
LeanDojo experiments and developed into an independent four-paper sequence.
The repository preserves that provenance and keeps mathematical results,
validated finite-system constructions, and cosmological hypotheses explicitly
separate.

## Current scientific status

- **Proved:** appending nonnegative distinguishing coordinates to an additive
  distance produces nested, nonincreasing fixed-radius neighborhoods.
- **Validated in finite classical systems:** conditional history measures can
  remove predictable dynamics; reduced Liouville measure induces a measure on
  complete deterministic histories; the tested construction survives nonlinear
  canonical transformations, clock changes, and gauge fixing when the required
  determinant is included.
- **Ruled out as complete cosmology:** a constant number of effective history
  bits per logarithmic interval of cosmic time does not fit the DESI DR2 BAO
  expansion history.
- **Open hypothesis:** the invariant conditional rate at which physically
  compatible histories disappear may have a dynamical relation to cosmological
  expansion. No derivation from gravitational dynamics has yet been obtained.

See [PROGRAM.md](PROGRAM.md) for the detailed claims, falsified baselines, and
next research gates.

## Four-paper sequence

1. [The Relational Shape of Structural Complexity and Neighborhood Density](foundation/relational_shape.pdf)
   establishes the neighborhood-thinning theorem.
2. [Hubble Scale from Time-Induced Complexity](accumulated_history/note/accumulated_time_cosmology.pdf)
   proposes accumulated history as the distinguishing complexity, identifies
   the present Hubble-scale correspondence, and tests fixed-rate laws against
   DESI DR2 BAO data.
3. [Noether Constraints and the Measure of Compatible Histories](accumulated_history/noether_history_note/noether_compatible_histories.pdf)
   replaces arbitrary geometric proximity and raw state counts with physical
   admissibility and invariant Liouville phase volume.
4. [Invariant Measures on Compatible Classical Histories](accumulated_history/invariant_history_note/invariant_classical_histories.pdf)
   constructs a complete-history measure by pushforward from reduced phase
   space and tests canonical, temporal, and gauge invariance.

Each paper directory contains its LaTeX source and compiled PDF. Figure sources
are included where applicable.

## Repository map

- `foundation/` - relational-shape theorem and first paper.
- `accumulated_history/` - papers two through four, cosmological benchmarks,
  DESI tests, causal-volume diagnostics, and compatible-history experiments.
- `spatial_neighborhoods/` - related spatial-neighborhood and binding studies.
- `references/` - bibliography shared by the papers.
- `archive/no_go_paper/` - the completed first-round cosmology and simulation
  synthesis retained as a falsified baseline.

## Reproducing the active experiments

From the repository root:

```powershell
python .\accumulated_history\experiments\history_survival\run_history_survival.py
python .\accumulated_history\experiments\history_survival\run_multiscale_identifiability.py
python .\accumulated_history\experiments\history_survival\run_noether_cardinality.py
python .\accumulated_history\experiments\history_survival\run_noether_invariance.py
python .\accumulated_history\experiments\history_survival\run_history_pushforward.py
python .\accumulated_history\experiments\history_survival\run_history_measure_extensions.py
python .\accumulated_history\experiments\history_survival\run_constrained_history_gauge.py
```

The cosmological shape and causal-volume tests are documented under
`accumulated_history/experiments/expansion_history/` and
`accumulated_history/experiments/causal_volume/`.

## Provenance

This repository was extracted with history from the
`complexity_neighborhoods/` directory of
[`jonland82/leandojo-experiments`](https://github.com/jonland82/leandojo-experiments).
The original repository remains unchanged until this migration is reviewed.
