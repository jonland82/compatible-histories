# Conditional Novelty in Learned Dynamical Systems

## Working research note

**Status:** proposed machine-learning and statistics offshoot. This document is
a plan, not a statement that the estimator, theory, or experiments described
below have already been completed.

### One-sentence thesis

Estimate how much genuinely new information a dynamical system produces after
its predictable evolution has been learned and conditioned out.

## Why this is an ML problem

The compatible-histories program distinguishes predictable separation from the
loss of alternatives that remain compatible with an observed past. In the
existing controlled experiments, the dynamics can be specified exactly. In a
data-driven setting they are unknown and must instead be estimated.

Let a system evolve according to

$$
X_{t+1}=F(X_t)+\varepsilon_{t+1},
$$

where $F$ is the predictable part of the evolution and
$\varepsilon_{t+1}$ contains distinctions not resolved by the current state.
Machine learning supplies an estimate $\widehat F$, producing residuals

$$
\widehat\varepsilon_{t+1}
=X_{t+1}-\widehat F(X_t).
$$

The central statistical problem is then direct: when two histories cease to be
compatible in residual space, does that measure real innovation, or only
prediction error, finite data, hidden state, a poor representation, or an
arbitrary choice of coordinates?

The intended decomposition is

$$
\text{observed change}
=\text{predictable evolution}+\text{new information}.
$$

Deterministic expansion and deterministic chaos should not count as new
information when the relevant state and dynamics are known. Injected random
innovations should count, at their known rate. This gives the project unusually
clear negative and positive controls.

## Candidate estimand

Consider histories $H_i^{(N)}=(X_{i,0},\ldots,X_{i,N})$ that share a resolved
past. After fitting a predictive model on separate data, compare their residual
histories

$$
R_i^{(N)}
=\left(\widehat\varepsilon_{i,1},\ldots,
\widehat\varepsilon_{i,N}\right).
$$

For a residual-history distance $D_N$, a first conditional survival quantity is

$$
S_N(r)
=\Pr\!\left(
D_N\!\left(R_i^{(N)},R_j^{(N)}\right)\le r
\;\middle|\;
H_i^{(0)}\sim H_j^{(0)}
\right),
$$

with conditional novelty

$$
C_N(r)=-\log_2 S_N(r).
$$

Its increment,

$$
\Delta C_N(r)=C_{N+1}(r)-C_N(r),
$$

is measured in bits and represents the additional loss of compatible
alternatives after one more observation. The fixed-radius form is only a
starting point: dependence on $r$, dimension, and representation must be
addressed rather than hidden.

A more statistically useful target may use calibrated predictive regions
$A_{i,N}(\alpha)$ instead of a geometric radius:

$$
S_N(\alpha)
=\Pr\!\left(
R_j^{(N)}\in A_{i,N}(\alpha)
\;\middle|\;
H_i^{(0)}\sim H_j^{(0)}
\right).
$$

Alternatives worth comparing include conditional-density level sets,
sequential conformal regions, fixed-cardinality neighborhoods, and a
multiscale integral over $r$. The paper should select an estimand only after
testing which form has an interpretable null and stable finite-sample behavior.

## Proposed contributions

1. **A conditional-novelty estimand.** Formalize information production beyond
   predictable dynamics, rather than treating raw trajectory separation or
   prediction error as information.
2. **An honest estimator.** Use held-out trajectories or cross-fitting so that
   $\widehat F$ is not trained and evaluated on the same innovations.
3. **Finite-sample calibration.** Replace or supplement arbitrary distance
   thresholds with calibrated predictive regions or a principled multiscale
   statistic.
4. **Theory for false novelty.** Prove an oracle null for fully observed
   deterministic systems and bound apparent novelty in terms of predictive,
   calibration, and sampling errors.
5. **Representation and coordinate tests.** State exactly which transformations
   should leave the result invariant and identify the measure or score required
   for that invariance.
6. **A benchmark with known answers.** Evaluate methods on systems whose true
   innovation rate is zero or deliberately injected.

## Theoretical targets

### Oracle deterministic null

For a fully observed deterministic system,

$$
X_{t+1}=F(X_t),
$$

an oracle predictor gives $\varepsilon_{t+1}=0$. A valid method should therefore
report no continuing information production after conditioning, even if nearby
trajectories separate exponentially.

### Recovery of injected information

If an unresolved innovation $Z_{t+1}$ is independently injected at entropy
rate $h$,

$$
X_{t+1}=F(X_t,Z_{t+1}),
\qquad H(Z_{t+1})=h,
$$

the estimated asymptotic novelty rate should recover

$$
\lim_{N\to\infty}\frac{C_N}{N}=h
$$

under explicit identifiability and sampling assumptions.

### Learned-model error

With $F$ unknown, the key result should relate false novelty to the discrepancy
between $F$ and $\widehat F$. Schematically,

$$
\left|\widehat C_N-C_N^\star\right|
\le
\mathcal E_{\mathrm{pred}}
+\mathcal E_{\mathrm{cal}}
+\mathcal E_{\mathrm{sample}},
$$

where $C_N^\star$ is the oracle quantity. The actual theorem will require a
specific score, dependence assumptions, regularity conditions, and probability
statement; this expression is only the target decomposition.

### Invariance

Naive Euclidean residual distances generally change under a reparameterization
$Y=T(X)$. The goal is not to claim automatic invariance, but to determine when
a score built from a transformed measure or likelihood ratio satisfies

$$
C_N^{(X)}=C_N^{(Y)}.
$$

This is the ML connection to the program's Noether, Liouville, and pushforward
measure results. The strongest version would separate genuine stochastic
content from artifacts of coordinates, clocks, and learned representations.

## Experimental program

### Required controlled systems

| System | Expected result | Failure it detects |
|---|---:|---|
| Uniform deterministic expansion | $0$ bits after conditioning | Raw separation mistaken for novelty |
| Fully observed deterministic chaotic map | $0$ bits after conditioning | Chaos mistaken for information production |
| Dynamics with injected Bernoulli bits | Known bit rate | Failure to recover genuine innovation |
| Hidden-state or tape system | Positive when hidden; reduced when revealed | Representation insufficiency |
| Nonlinear coordinate transform | Same invariant estimate | Coordinate-dependent scoring |
| Time or sampling-rate change | Predictable transformation law | Clock-density artifacts |

### Methods to compare

- raw trajectory distance without conditioning;
- residual $k$-nearest-neighbor survival;
- conditional-density or likelihood-ratio scoring;
- sequential conformal predictive regions;
- a flexible learned dynamics model, such as a neural state-space model or
  conditional normalizing flow;
- an oracle model wherever the simulator exposes $F$.

### Evaluation metrics

- false bit rate on deterministic controls;
- absolute error in recovery of an injected information rate;
- predictive-region coverage and calibration error;
- stability across radius, neighborhood cardinality, and sample size;
- stability under coordinate and representation transformations;
- sensitivity to hidden state and model misspecification;
- computational cost as trajectory count, horizon, and dimension grow.

The existing history-survival scripts and invariance tests can supply initial
controlled cases, but the ML paper needs a clean benchmark harness, explicit
train/calibration/test splits, multiple learned predictors, and uncertainty
estimates. Existing results should not be presented as if they already validate
those additions.

## Positioning

The paper should lead with the statistical question, not cosmology:

> How can an observer estimate information production in a dynamical system
> without counting learnable evolution as new information?

The cosmological program is the motivating application and the source of the
compatible-history formalism. It can appear in the introduction and discussion,
while the central claims remain testable on standard dynamical systems.

The closest methodological neighbors are time-series prediction, conditional
density estimation, sequential conformal inference, system identification,
entropy-rate estimation, representation learning, and uncertainty
quantification. The novelty claim must be narrower than "prediction residuals
contain information." It should concern a calibrated compatible-history
estimand, its null behavior, and its invariance or robustness properties.

The natural primary arXiv category is `stat.ML` if the paper contains a new
estimator, statistical analysis, and substantive experiments. `cs.DS` is only a
natural fit if the work also contributes a new algorithmic or streaming method
with meaningful complexity guarantees.

## Possible paper structure

1. **Introduction:** why trajectory separation is not the same as new
   information.
2. **Problem formulation:** observed state, shared past, learned dynamics, and
   the target conditional novelty.
3. **Estimator:** sample splitting, predictive regions, and the survival
   statistic.
4. **Theory:** deterministic null, innovation recovery, estimation error, and
   transformation behavior.
5. **Controlled benchmark:** expansion, chaos, injected bits, hidden state, and
   coordinate changes.
6. **Real-data or higher-dimensional case study:** demonstrate practical use
   without relying on a known simulator.
7. **Connection to compatible histories:** explain the broader physical
   interpretation and its limits.
8. **Discussion:** identifiability, causal interpretation, and open problems.

## Candidate titles

- *Conditional Novelty in Dynamical Systems: Separating New Information from
  Predictable Evolution*
- *Estimating Information Production under Learned Dynamics*
- *Invariant Conditional Survival for Data-Driven Dynamical Systems*

## Questions to resolve before implementation

1. Is the principal object a novelty **rate**, a finite-horizon survival curve,
   or both?
2. Should compatibility be defined by predictive coverage, density ratios,
   fixed cardinality, or a multiscale statistic?
3. What dependence assumptions permit a useful finite-sample or asymptotic
   guarantee?
4. Which invariances are required: smooth coordinate changes, canonical
   transformations, learned invertible representations, or clock changes?
5. Is the observation process fully specified, or must hidden-state uncertainty
   be part of the estimand?
6. Which real dataset would demonstrate value beyond controlled simulations?

## Next-session checklist

1. Read the existing `history_survival` experiment code and identify the
   smallest reusable oracle benchmark.
2. Write a precise definition of the oracle target $C_N^\star$.
3. Choose one learned predictor and one deliberately misspecified predictor.
4. Implement trajectory-level train, calibration, and test splits.
5. Run the deterministic expansion, deterministic chaos, and injected-bit
   controls first.
6. Plot estimated bits per step against the known target, with uncertainty.
7. Test one nonlinear coordinate transformation before expanding the benchmark.
8. Only then decide whether conformal, density-based, or multiscale calibration
   is the main estimator.

## Immediate standard for success

The first milestone is deliberately narrow. A prototype succeeds if, using
held-out data and a learned predictor, it reports approximately zero novelty
for deterministic expansion and fully observed deterministic chaos, while
recovering the rate of independently injected bits. If it cannot pass those
three controls, broader physical interpretation should wait.
