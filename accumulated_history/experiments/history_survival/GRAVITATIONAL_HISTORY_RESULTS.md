# First gravitational history-measure test

Run locally on 2026-09-06 with NumPy 2.1.3 and SciPy 1.15.3.

**Result:** the measure construction passes the tested invariances in a finite
gravitational model. The chosen raw record-survival score fails the held-out
expansion comparison. Complete-state dynamical conditioning gives zero
innovation, although the universe expands. This is a minisuperspace gate, not a
test of realistic late-time cosmology or a general falsification of the program.

## Model and reduced measure

Take classical spatially flat FLRW gravity on a compact unit-coordinate-volume
three-torus with a homogeneous free massless scalar, no cosmological constant,
and units 8*pi*G=1. Compact spatial topology makes total volume a physical
variable; no arbitrary noncompact fiducial cell is varied. Fix the scalar origin
as part of the stipulated record. With alpha=ln(a), the proper-time Hamiltonian
constraint is

```
H_constraint = exp(-3 alpha) * C
C = -p_alpha^2/12 + p_phi^2/2 = 0.
```

This follows from the reduced Lagrangian
`L = exp(3 alpha) * (-3 alpha_dot^2 + phi_dot^2/2) / N`.
Select the expanding branch `p_phi=p>0`, `p_alpha=-sqrt(6)*p`.
Orbit labels are `A=alpha-phi/sqrt(6)` and `p`.
On the section phi=0, the reduced symplectic volume is
`sqrt(6) dA dp` (up to orientation). Use its normalized restriction to
`A in [-0.2,0.2], p in [0.7,1.3]`. This stipulates a coarse initial ensemble;
it is not a uniquely derived cosmological prior.

Proper time t is measured from each history's phi=0 crossing. Exact solutions:

```
b = sqrt(3/2)
V(t) = exp(3 A) + b*p*t
alpha(t) = ln(V(t))/3
phi(t) = ln(1 + b*p*t*exp(-3 A))/b
H(t) = p/(sqrt(6)*V(t)).
```

The scalar-field-clock model is established in the literature; see
[Ashtekar, Pawlowski and Singh (2006)](https://arxiv.org/abs/gr-qc/0604013).
The experiment here uses only classical equations, with the normalization and
reduction derived above; it imports no quantum bounce or quantum measure.

## Protocol

The record is the scalar on the reference solution A=0,p=1. Define
`D(T)=integral_0^T [phi(t)-phi_ref(t)]^2 dt`,
`W(T)=exp[-D(T)/(2 sigma^2)]`, and `C_surv=-log2 E_prior[W]`.
The baseline sigma is 0.1 in the stipulated dimensionless units; 0.05 and 0.2
are sensitivity tests. These resolutions are assumed, not observationally
derived. Neither H nor observational data is used to define the score.
The record depends only on `p*exp(-3A)`, so it does not identify both orbit labels.

Before the first run, the script fixed evaluation times 0.5,1,2,4,8,
calibration interval [0.5,1], and a 10% maximum relative-error gate on each
subsequent interval. This is an exploratory protocol, not an external
preregistration. Fit just one coefficient `k=mean(H)/mean(dC/dt)` on the
calibration interval and hold it fixed. H is computed from the reference
gravitational solution, not DESI data. This comparison tests raw surviving
record weight; it must not be interpreted as a test of conditional innovations.

## Numerical validation

| Check | Observed discrepancy |
|---|---:|
| Independent proper-time Hamilton ODE vs exact solutions, three histories | 7.45e-11 |
| Densitized Hamiltonian constraint residual | 2.22e-16 |
| Ensemble quadrature, 64x64 to 128x128, C(4) | 8.9e-15 bits |
| Time midpoint quadrature, 256 to 512 slices, C(4) | 1.82e-7 bits |
| Nonlinear reduced coordinates Q=exp(A), P=p/Q | 4.4e-16 bits |
| Exponential reporting clock with proper-time Jacobian | 4.36e-6 bits |
| Same reporting clock omitting Jacobian | 0.22914 bits |
| Nonlinear gauge, weighted C(4) vs reduced reference | 8.81e-5 bits |
| Nonlinear gauge, reduced-volume relative error | 0.00613% |
| Gauge refinement, 65,536 to 262,144 Sobol samples | 1.01e-4 bits |

Canonical quadrature transforms the same physical prior and observable; it
does not independently integrate a transformed Hamiltonian. Clock tests
reparameterize the same proper-time record, rather than establishing
equivalence of distinct physical observation protocols.

The nonlinear gauge is `chi=phi-beta*alpha*p=0`, beta=0.6.
Writing `j=1-beta*p/sqrt(6)>0`, its orbit map is `A=j*alpha`.
The Faddeev-Popov determinant is `|{chi,C}|=p*j`. Integrating
delta(C) over the expanding p_alpha branch contributes sqrt(6)/p,
leaving the correct surface density `sqrt(6)*j d_alpha dp`.
Each orbit intersects this surface once throughout the tested domain.
Independent scrambled Sobol samples on a bounding surface rectangle are masked
back to the common prior domain. Target reduced area is 0.5878775383;
the finest estimate is 0.5879135548.

The missing-FP negative control was **inconclusive**: C(4)=2.38094468
versus the reduced reference 2.38082747, too small a discrepancy relative to
the observed sampling refinement to meet the prespecified 0.005-bit detection
threshold. Correct weighted gauge agreement passed. The first script run
exited unsuccessfully because it grouped this artifact-detection expectation
with numerical validation. Reporting was then separated into numerical checks
and negative-control outcomes; no parameters or thresholds were changed.
There are no replicate-seed uncertainty estimates in this first experiment.

## Expansion comparison

Baseline raw information at T=0.5,1,2,4,8 is
0.201813, 0.710581, 1.548324, 2.380828, 3.106122 bits.

| sigma | Fitted k | Error on [1,2] | Error on [2,4] | Error on [4,8] | 10% gate |
|---:|---:|---:|---:|---:|---|
| 0.05 | 0.114171 | -23.6% | -46.4% | -59.0% | Fail |
| 0.10 | 0.210925 | +20.9% | -1.8% | -24.1% | Fail |
| 0.20 | 0.600614 | +91.2% | +134.5% | +111.2% | Fail |

The permissive one-coefficient mapping fails for every tested resolution.
Changing the prior A half-width from 0.1 to 0.2 to 0.4 changes C(4)
from 1.58658 to 2.38083 to 3.38068 bits. Invariance does not remove physical
prior and resolution dependence.

Hard survival `W=1[D<=r^2]` is included as an exploratory fixed-radius check.
At T=4 its information is approximately 3.696, 2.731 and 1.708 bits at
r=0.05,0.1,0.2. These discontinuous-indicator estimates have not received
separate convergence validation and do not support a precision rate claim.

## Conditional null and interpretation

Given the complete preceding state, the exact next scalar value is

```
phi_next = phi + log(1+b*p*dt/exp(3 alpha))/b.
```

Comparison with the independent ODE trajectories gives a maximum residual
1.00e-10. Analytically it is zero. Under a compatibility functional built only
from these full-state prediction residuals, every deterministic solution has
weight one: conditional innovation information and its rate are zero.
Meanwhile H is positive. No finite coefficient maps that zero rate to H.

This is a complete-state conditioning null. With only a coarse past, later
records can reveal previously unresolved initial information; the test does
not prove that every coarse conditional information measure vanishes.
Raw record survival here quantifies discrimination among deterministic initial
conditions. Neither its increase nor successful gauge reduction derives an
expansion mechanism.

The next useful gate is a specified coarse observation process in a constrained
gravitational model with unresolved physical modes, including a justified
resolution and an explicit prediction-conditioned record likelihood. It must
separate learning hidden initial data from a proposed physical source of
expansion. Proceeding to a DESI fit with the present score is unsupported.
Full gravitational momentum constraints, spatial perturbations, causal local
records, clock-choice ambiguities, and the cosmological prior remain open.

## Reproduce

From the repository root:

```powershell
python .\accumulated_history\experiments\history_survival\run_gravitational_history.py
```

The script prints JSON containing parameters, checks and all comparison curves.
It exits nonzero on failed numerical checks. Scientific mapping failures and
inconclusive negative controls are reported as outcomes, not execution errors.
