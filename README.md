# Compatible Histories

Research on relational complexity, invariant measures over compatible physical
histories, and a possible connection to cosmological expansion.

**[Research Project Site](https://jonland82.github.io/compatible-histories/)**

The work starts with an ensemble of possible objects or physical histories and
asks which alternatives remain compatible as additional information is imposed.
It then assigns invariant measure to the surviving alternatives and tests the
hypothesis that their rate of disappearance is related to cosmological
expansion.

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

### 1. The Relational Shape of Structural Complexity and Neighborhood Density

[Web edition](foundation/relational_shape.html) ·
[PDF](foundation/relational_shape.pdf) ·
[LaTeX](foundation/relational_shape.tex)

Pairwise distance is built by adding nonnegative contributions,
$d_n(x,y)\geq0$. Adding a coordinate therefore cannot reduce separation, so
every fixed-radius neighborhood is contained in the one before it:

$$
\delta_N(O_i,O_j)=\sum_{n=1}^{N}d_n(o_{in},o_{jn}),
\qquad
\mathcal N_r^{(N+1)}(O_i)\subseteq\mathcal N_r^{(N)}(O_i).
$$

This is the proved mathematical foundation. It does not assume dynamics or
identify the neighborhood with physical space.

This monotonic thinning is the mathematical seed of the cosmological program.
If inverse compatible-history measure is identified with relational volume,
thinning becomes expansion; accelerated expansion depends on the dynamics of
the thinning rate, not on thinning alone.

### 2. Hubble Scale from Time-Induced Complexity

[Web edition](accumulated_history/note/accumulated_time_cosmology.html) ·
[PDF](accumulated_history/note/accumulated_time_cosmology.pdf) ·
[LaTeX](accumulated_history/note/accumulated_time_cosmology.tex)

The paper lets accumulated history provide the distinguishing constraints. If
$\rho(t)$ is the surviving fraction of compatible histories, then
$C(t)=-\log_2\rho(t)$ is their distinguishing information in bits. The proposed
cosmological bridge is

$$
a_{\rm rel}(t)\propto 2^{C(t)/3},
\qquad
H_{\rm rel}(t)=\frac{\ln 2}{3}\frac{dC}{dt}.
$$

The simple law gives $H_0=1/t_0=70.85\,\mathrm{km\,s^{-1}\,Mpc^{-1}}$, but
DESI DR2 BAO data rule out a constant information rate per logarithmic time as
the complete expansion history.

### 3. Noether Constraints and the Measure of Compatible Histories

[Web edition](accumulated_history/noether_history_note/noether_compatible_histories.html) ·
[PDF](accumulated_history/noether_history_note/noether_compatible_histories.pdf) ·
[LaTeX](accumulated_history/noether_history_note/noether_compatible_histories.tex)

Known dynamics are first conditioned out so predictable expansion and
deterministic chaos do not count as new information. Noether constraints then
define the admissible alternatives, while Liouville measure $d\Gamma=dx\,dp$
weights them independently of canonical coordinates:

$$
\Delta C_\mu(n)
=-\log_2
\frac{\mu(\mathcal{A}_n\mid\mathcal{A}_{\lt n})}
     {\mu(\mathcal{P}_n\mid\mathcal{A}_{\lt n})}.
$$

The finite tests reject adjustable geometric tolerances and raw cell counts.
Liouville phase-volume density agrees across the tested grids and canonical
coordinate changes.

### 4. Invariant Measures on Compatible Classical Histories

[Web edition](accumulated_history/invariant_history_note/invariant_classical_histories.html) ·
[PDF](accumulated_history/invariant_history_note/invariant_classical_histories.pdf) ·
[LaTeX](accumulated_history/invariant_history_note/invariant_classical_histories.tex)

Reduced physical initial data carry a normalized measure $\nu_0$. Deterministic
dynamics maps each initial state to a complete history, inducing the history
measure by pushforward:

$$
\mu_{\mathcal{H}}=F_*\nu_0,
\qquad
C_{\rm surv}(t)
=-\log_2\!\int_{\mathcal{H}}W_t(\gamma)\,d\mu_{\mathcal{H}}(\gamma).
$$

The tested construction is invariant under nonlinear canonical transformations,
clock reparameterizations, and gauge fixing when the lapse and gauge determinant
are included. Extension to gravitational solution space—and its proposed
relation to $H(t)$—remains open.

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
