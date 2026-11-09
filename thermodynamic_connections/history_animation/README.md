# Accumulating histories: an interactive nearest-cluster experiment

Open **index.html** in a modern browser. No build, package installation, server, or internet connection is required. MathJax 3.2.2 is bundled locally in `vendor/` under its Apache 2.0 license. A simple static server also works:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

From the repository root, visit `http://127.0.0.1:8000/thermodynamic_connections/history_animation/`.

## The experiment

The default seeded realization contains 8 clusters with 24 constituents each. Every constituent is independently 1 with probability 0.30, otherwise 0, at every new coordinate. All clusters share that rule. The amplitude is fixed at `a = 1`.

The simulation retains each centroid's entire history. For each coordinate count `n`, it calculates every squared centroid distance from reference C1, finds the nearest cluster, divides that squared distance by `n`, and estimates binary entropy by inverting the model's distance equation. It does not smooth or force the data toward the limit.

- Predicted normalized squared distance: `r = 2 a² p(1-p) / m`.
- Measured normalized squared distance: `min_j sum_t (C1t - Cjt)² / n`.
- Entropy estimate: `h₂((1 - sqrt(1 - 2m r̂/a²))/2)`, with the measured ratio clipped to `[0, a²/(2m)]` to obtain `r̂`.
- True entropy density: `h₂(p) = -p ln p - (1-p) ln(1-p)`.
- Estimated total record entropy: `K m n ĥ`; true total: `K m n h₂(p)`.

The seed makes each realization reproducible. Change the probability, cluster count, or cluster size to restart with that model; **New realization** changes the seed. Playback pauses at 2,400 coordinates. The theorem concerns the infinite-record limit, so a finite run retains sampling error and need not converge monotonically. A minimum over several candidate distances also tends to underestimate their common limit at finite n.

## Reading the 3D plot accurately

This is a **radial embedding**, not ordinary physical xyz space and not a claim to preserve all distances of an n-dimensional dataset in three dimensions. Reference C1 is at the origin. Each other centroid is placed on an assigned, fixed display direction at its exact full-history distance from C1. All reference-to-centroid distances are therefore correct; distances between other centroids generally are not. The plot labels and explanatory text state this distinction.

The solid blue wire sphere has the measured nearest radius `R_n`. The dashed steel sphere has the asymptotically predicted radius `sqrt(n r)`. Small receding beads retain previous radii at intervals of 100 coordinates. Display scale is fixed throughout each run, using the full synthetic realization's maximum final radius; changing model parameters recalibrates it. Orbit and zoom adjust the camera only, never the measured values.

## Controls and accessibility

Play/pause, restart, append one coordinate, scrub the timeline, and change playback rate. Drag the 3D canvas to orbit and scroll to zoom. With the canvas focused, use arrow keys to orbit and `+` / `-` to zoom. **Reset view** restores the camera. Hover a centroid for its exact distance and latest coordinate value. Reduced-motion preferences start the animation paused; all controls remain available. The layout adapts to mobile screens, and numerical readouts accompany both canvas plots.

## Scope and source

This animates the theorem in [the two-page paper](../nearest_cluster_entropy.pdf) and [its LaTeX source](../nearest_cluster_entropy.tex). Here coordinates are independent recorded observations. Record entropy may grow at equilibrium without an increase in instantaneous physical entropy. The experiment demonstrates statistical inference under the shared law, not a derivation of the thermodynamic arrow of time.

Files: `model.js` contains the seeded mathematical model (also loadable with Node's `require`); `app.js` contains rendering and interaction; `styles.css` contains the dark blue/steel theme. MathJax dynamic typesetting follows the [MathJax 3.2 documentation](https://docs.mathjax.org/en/v3.2/web/typeset.html).

Run `node verify-model.cjs` from this folder to check exact full-history distances, nearest-radius monotonicity, seed reproducibility, coordinate-scale invariance, entropy bounds, and an independent longer-record convergence check.
