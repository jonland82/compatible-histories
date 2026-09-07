"""Classical flat FLRW + massless scalar: finite gravitational history gate.

See GRAVITATIONAL_HISTORY_RESULTS.md for derivation, protocol and limitations.
No observed expansion data enters the prior or compatibility functional.
Run from the repository root with Python, NumPy and SciPy.
"""
from __future__ import annotations

import json
import math

import numpy as np
from numpy.polynomial.legendre import leggauss
from scipy.integrate import solve_ivp
from scipy.stats import qmc

SQ6 = math.sqrt(6)
B = math.sqrt(1.5)
A_BOUND = 0.2
P_LO, P_HI = 0.7, 1.3
BETA = 0.6
SIGMA = 0.1
TIMES = (0.5, 1.0, 2.0, 4.0, 8.0)


def field(t, a, p):
    return np.log1p(B * p * t * np.exp(-3 * a)) / B


def ensemble(n=64, canonical=False, width=A_BOUND):
    nodes, weights = leggauss(n)
    p = P_LO + (nodes + 1) * (P_HI - P_LO) / 2
    if canonical:
        q = math.exp(-width) + (nodes + 1) * (math.exp(width) - math.exp(-width)) / 2
        a = np.log(q)
        aw = weights / q  # dQ dP = dQ dp / Q, P=p/Q
    else:
        a, aw = width * nodes, weights
    aa, pp = np.meshgrid(a, p, indexing="ij")
    ww = aw[:, None] * weights[None, :]
    return aa.ravel(), pp.ravel(), ww.ravel()


def information(a, p, weights, end, sigma=SIGMA, steps=256,
                clock="linear", lapse=True, hard=False):
    # Continuous squared scalar-record discrepancy in proper time.
    integral = np.zeros_like(a)
    for u in (np.arange(steps) + 0.5) / steps:
        if clock == "linear":
            t, dt = end * u, end / steps
        elif clock == "exponential":
            t = end * np.expm1(2 * u) / np.expm1(2)
            dt = end * 2 * np.exp(2 * u) / np.expm1(2) / steps
        else:
            raise ValueError(clock)
        if not lapse:
            dt = end / steps
        residual = field(t, a, p) - field(t, 0.0, 1.0)
        integral += residual**2 * dt
    if hard:
        z = np.average(integral <= sigma**2, weights=weights)
        return float(-np.log2(z)) if z else float("inf")
    return float(-np.log2(np.average(np.exp(-integral / (2 * sigma**2)), weights=weights)))


def gauge(power):
    u = qmc.Sobol(2, scramble=True, seed=20260906).random_base2(power)
    bound = A_BOUND / (1 - BETA * P_HI / SQ6)
    alpha = (2 * u[:, 0] - 1) * bound
    p = P_LO + u[:, 1] * (P_HI - P_LO)
    jac = 1 - BETA * p / SQ6
    a = alpha * jac  # chi=phi-beta*alpha*p=0; A=alpha-phi/sqrt(6)
    mask = np.abs(a) <= A_BOUND
    area = SQ6 * 2 * bound * (P_HI - P_LO) * np.mean(mask * jac)
    return {
        "samples": 2**power,
        "area": float(area),
        "correct_bits": information(a[mask], p[mask], jac[mask], 4, steps=128),
        # Omitting FP leaves 1/|dC/dp_alpha| proportional to 1/p.
        "no_fp_bits": information(a[mask], p[mask], 1 / p[mask], 4, steps=128),
    }


def main():
    base = ensemble()
    reference = information(*base, 4)
    fine = information(*ensemble(128), 4)
    temporal = information(*base, 4, steps=512)
    canonical = information(*ensemble(canonical=True), 4)
    clock = information(*base, 4, clock="exponential")
    naive_clock = information(*base, 4, clock="exponential", lapse=False)
    gauges = [gauge(power) for power in (16, 18)]
    gauge_reference = information(*base, 4, steps=128)
    target_area = SQ6 * 2 * A_BOUND * (P_HI - P_LO)

    # Independent Hamilton-equation integration in proper time, N=1.
    # H_constraint=e^(-3 alpha)*(-p_alpha^2/12+p^2/2).
    def rhs(t, z):
        alpha, phi, pa, p = z
        c = -pa**2 / 12 + p**2 / 2
        factor = math.exp(-3 * alpha)
        return [-factor * pa / 6, factor * p, 3 * factor * c, 0]

    max_flow_error = 0.0
    max_constraint = 0.0
    max_innovation = 0.0
    for a, p in [(-0.2, 0.7), (0.0, 1.0), (0.2, 1.3)]:
        sol = solve_ivp(rhs, (0, 8), [a, 0, -SQ6 * p, p],
                        t_eval=np.linspace(0, 8, 129), rtol=1e-11, atol=1e-13)
        if not sol.success:
            raise RuntimeError(sol.message)
        alpha, phi, pa, momentum = sol.y
        exact_alpha = np.log(np.exp(3 * a) + B * p * sol.t) / 3
        max_flow_error = max(max_flow_error, float(np.max(np.abs(alpha - exact_alpha))),
                             float(np.max(np.abs(phi - field(sol.t, a, p)))))
        max_constraint = max(max_constraint, float(np.max(np.abs(-pa**2 / 12 + momentum**2 / 2))))
        # One-step scalar prediction from the complete preceding state.
        predicted = phi[:-1] + np.log1p(B * momentum[:-1] * np.diff(sol.t)
                                      * np.exp(-3 * alpha[:-1])) / B
        max_innovation = max(max_innovation, float(np.max(np.abs(phi[1:] - predicted))))

    curves = []
    for sigma in (0.05, 0.1, 0.2):
        bits = [0.0] + [information(*base, t, sigma=sigma) for t in TIMES]
        bounds = np.array((0.0,) + TIMES)
        rate = np.diff(bits) / np.diff(bounds)
        h = np.diff(np.log1p(B * bounds)) / (3 * np.diff(bounds))
        # Predeclared sole calibration interval [0.5,1]; subsequent intervals held out.
        coupling = h[1] / rate[1]
        relative = coupling * rate / h - 1
        curves.append({"sigma": sigma, "bits": bits[1:], "rate": rate.tolist(),
                       "mean_H": h.tolist(), "calibrated_coupling": float(coupling),
                       "held_out_relative_errors": relative[2:].tolist()})

    hard = {str(r): [information(*base, t, sigma=r, hard=True) for t in TIMES]
            for r in (0.05, 0.1, 0.2)}
    checks = {
        "Hamilton_flow_matches_exact_solution": max_flow_error < 1e-8,
        "Hamilton_constraint_preserved": max_constraint < 1e-9,
        "ensemble_refinement": abs(reference - fine) < 1e-4,
        "temporal_refinement": abs(reference - temporal) < 1e-4,
        "canonical_measure": abs(reference - canonical) < 1e-5,
        "clock_with_lapse": abs(reference - clock) < 1e-4,
        "gauge_area": abs(gauges[-1]["area"] / target_area - 1) < 1e-3,
        "gauge_information": abs(gauges[-1]["correct_bits"] - gauge_reference) < 1e-3,
        "gauge_refinement": abs(gauges[-1]["correct_bits"] - gauges[0]["correct_bits"]) < 1e-3,
        "complete_state_conditioning_null": max_innovation < 1e-8,
    }
    report = {
        "protocol": {"prior_A": [-A_BOUND, A_BOUND], "prior_p": [P_LO, P_HI],
                     "sigma": SIGMA, "times": TIMES, "held_out_error_threshold": 0.1},
        "checks": checks,
        "negative_controls": {
            "clock_without_lapse_detected": abs(reference - naive_clock) > 0.01,
            "missing_FP_artifact_detected": abs(gauges[-1]["no_fp_bits"] - gauge_reference) > 0.005,
        },
        "flow_max_error": max_flow_error, "constraint_max_error": max_constraint,
        "conditioned_max_scalar_innovation": max_innovation,
        "C_at_4": {"base": reference, "ensemble_128": fine, "steps_512": temporal,
                   "canonical": canonical, "clock_lapse": clock, "clock_naive": naive_clock},
        "gauge_reference_bits": gauge_reference, "gauge_target_area": target_area,
        "gauges": gauges, "soft_rate_comparison": curves, "hard_survival_bits": hard,
        "prior_width_sensitivity_C_at_4": {
            str(width): information(*ensemble(width=width), 4) for width in (0.1, 0.2, 0.4)},
        "held_out_mapping_passes": [
            all(abs(e) < 0.1 for e in row["held_out_relative_errors"]) for row in curves],
    }
    print(json.dumps(report, indent=2))
    if not all(checks.values()):
        raise SystemExit("Numerical validation gate failed; inspect checks.")


if __name__ == "__main__":
    main()
