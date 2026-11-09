/* Canvas 3D radial embedding: every reference-to-centroid distance is exact. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const model = window.ClusterHistoryModel;
  const scene = $('scene');
  const chart = $('chart');
  const sceneContext = scene.getContext('2d');
  const chartContext = chart.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = {
    data: null, n: 1, playing: !reducedMotion, rate: 60, seed: 1829,
    yaw: -0.46, pitch: -0.25, zoom: 1, dragging: false,
    pointer: { x: -100, y: -100 }, projected: [],
    width: 0, height: 0, chartWidth: 0, chartHeight: 0,
    lastFrame: 0, accumulator: 0, lastMath: 0, mathReady: false,
    mathBusy: false, mathPending: true, lastUI: 0, chartDirty: true
  };
  const format = (value, digits = 4) => value.toFixed(digits);
  const integer = value => Math.round(value).toLocaleString('en-US');
  const colors = { blue: '#65c5ff', white: '#e5f3ff', steel: '#6b86a5', grid: '#263e5b' };
  const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  const clusterName = i => 'C' + String(i + 1).split('').map(digit => subscripts[Number(digit)]).join('');

  function setRangeProgress(input) {
    const progress = 100 * (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
    input.style.setProperty('--progress', progress + '%');
  }

  function rebuild({ newSeed = false } = {}) {
    if (newSeed) state.seed += 997;
    state.data = model.generate({
      K: Number($('clusters').value), m: Number($('members').value),
      p: Number($('probability').value) / 100, seed: state.seed
    });
    state.n = 1;
    state.accumulator = 0;
    state.chartDirty = true;
    state.mathPending = true;
    const d = state.data;
    $('probability-value').value = Math.round(d.p * 100) + '%';
    $('target-value').textContent = format(d.r, 5);
    $('target-calculation').textContent = `2 × ${d.a}² × ${format(d.p, 2)} × ${format(1 - d.p, 2)} / ${d.m} = ${format(d.r, 5)}`;
    $('entropy-actual').textContent = format(d.h);
    $('entropy-marker').style.left = Math.min(100, d.h / Math.LN2 * 100) + '%';
    $('seed-label').textContent = 'REPRODUCIBLE SEED ' + state.seed;
    setRangeProgress($('probability'));
    updateUI();
    updatePlayback();
  }

  function updatePlayback() {
    $('play-icon').textContent = state.playing ? 'Ⅱ' : '▶';
    $('play-label').textContent = state.playing ? 'Pause' : state.n === state.data.N ? 'Replay' : 'Play';
    $('play').setAttribute('aria-label', state.playing ? 'Pause animation' : 'Play animation');
    $('status').textContent = state.playing ? 'Accumulating independent coordinates' : state.n === state.data.N ? 'Record complete · replay or explore' : 'Paused · explore the record';
    $('step').disabled = state.n === state.data.N;
    document.body.classList.toggle('paused', !state.playing);
    if (!state.playing) {
      $('announcement').textContent = `Paused at ${state.n} coordinates. Measured ratio ${format(state.data.ratio[state.n], 5)}, predicted value ${format(state.data.r, 5)}.`;
    }
  }

  function setStep(n, pause = false) {
    state.n = Math.max(1, Math.min(state.data.N, Math.round(n)));
    state.chartDirty = true;
    state.mathPending = true;
    if (pause || state.n === state.data.N) {
      state.playing = false;
      state.accumulator = 0;
      updatePlayback();
    }
    updateUI();
  }

  function updateUI() {
    const { data: d, n } = state;
    const j = d.nearest[n];
    const error = (d.ratio[n] - d.r) / d.r * 100;
    $('scene-record').textContent = `n = ${integer(n)} coordinate${n === 1 ? '' : 's'}`;
    $('coordinate-count').textContent = integer(n);
    $('timeline').value = n;
    setRangeProgress($('timeline'));
    $('nearest-label').textContent = clusterName(j);
    $('nearest-distance').textContent = `R = ${format(d.radius[n])}`;
    $('nearest-detail').textContent = `C₁ → ${clusterName(j)}`;
    $('observed-value').textContent = format(d.ratio[n], 5);
    $('distance-error').textContent = `${error > 0 ? '+' : ''}${format(error, 1)}% from theory`;
    $('entropy-estimate').textContent = format(d.entropyEstimate[n]);
    $('entropy-meter').style.width = Math.min(100, d.entropyEstimate[n] / Math.LN2 * 100) + '%';
    $('total-entropy').textContent = `Estimated record: ${integer(d.K * d.m * n * d.entropyEstimate[n])} nats · True record: ${integer(d.K * d.m * n * d.h)} nats`;
    chart.setAttribute('aria-label', `At ${n} coordinates, squared nearest distance divided by n is ${format(d.ratio[n], 5)}. The predicted limit is ${format(d.r, 5)}.`);
  }

  async function updateMath(now) {
    if (!state.mathReady || state.mathBusy || !state.mathPending || now - state.lastMath < 280) return;
    state.mathBusy = true;
    state.mathPending = false;
    state.lastMath = now;
    const { data: d, n } = state;
    const element = $('live-math');
    try {
      MathJax.typesetClear([element]);
      element.textContent = `\\(\\frac{R_{${n}}^2}{${n}}=\\frac{${format(d.radius[n], 4)}^2}{${n}}\\approx ${format(d.ratio[n], 5)}\\)`;
      await MathJax.typesetPromise([element]);
    } catch (error) {
      element.textContent = `R² / n = ${format(d.radius[n])}² / ${n} ≈ ${format(d.ratio[n], 5)}`;
      console.error('Equation rendering:', error);
    } finally {
      state.mathBusy = false;
    }
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    for (const [canvas, context, sceneCanvas] of [[scene, sceneContext, true], [chart, chartContext, false]]) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (sceneCanvas) { state.width = rect.width; state.height = rect.height; }
      else { state.chartWidth = rect.width; state.chartHeight = rect.height; }
    }
    state.chartDirty = true;
  }

  function direction(index) {
    // Assigned display angles, independent of the measured data.
    const count = state.data.K - 1;
    const y = 1 - 2 * (index - 0.5) / count;
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    const ring = Math.sqrt(1 - y * y);
    return [Math.cos(angle) * ring, y, Math.sin(angle) * ring];
  }

  function worldPoint(index, n) {
    if (index === 0) return [0, 0, 0];
    const radius = Math.sqrt(state.data.squaredDistances[index][n]);
    return direction(index).map(value => value * radius);
  }

  function displayScale() {
    const d = state.data;
    const maximumDistance = Math.max(...d.squaredDistances.slice(1).map(series => Math.sqrt(series[d.N])));
    return Math.max(maximumDistance, Math.sqrt(d.N * d.r)) * 1.13;
  }

  function project(point, extent) {
    const [x, y, z] = point;
    const cy = Math.cos(state.yaw), sy = Math.sin(state.yaw);
    const cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
    const xx = x * cy + z * sy;
    const zz = -x * sy + z * cy;
    const yy = y * cp - zz * sp;
    const depth = y * sp + zz * cp;
    const perspective = 4 * extent / (4 * extent - depth);
    const scale = Math.min(state.width * 0.90, state.height) * 0.42 / extent * state.zoom;
    return { x: state.width * 0.51 + xx * scale * perspective, y: state.height * 0.50 - yy * scale * perspective, depth, perspective };
  }

  function line3D(points, color, width = 1, dash = [], extent) {
    const ctx = sceneContext;
    ctx.beginPath();
    points.forEach((point, i) => {
      const p = project(point, extent);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawSphere(radius, color, dash, extent, latitudeCount = 3) {
    for (let plane = 0; plane < latitudeCount; plane++) {
      const points = [];
      for (let step = 0; step <= 96; step++) {
        const a = step / 96 * 2 * Math.PI;
        const c = radius * Math.cos(a), s = radius * Math.sin(a);
        points.push(plane === 0 ? [c, s, 0] : plane === 1 ? [c, 0, s] : [0, c, s]);
      }
      line3D(points, color, 0.8, dash, extent);
    }
  }

  function drawScene(now) {
    const ctx = sceneContext;
    const { data: d, n, width: w, height: h } = state;
    ctx.clearRect(0, 0, w, h);
    const extent = displayScale();
    const ground = -0.83 * extent;
    for (let i = -5; i <= 5; i++) {
      const s = i / 5 * extent;
      line3D([[s, ground, -extent], [s, ground, extent]], '#243c562b', 0.7, [], extent);
      line3D([[-extent, ground, s], [extent, ground, s]], '#243c562b', 0.7, [], extent);
    }
    const origin = project([0, 0, 0], extent);
    for (let axis = 0; axis < 3; axis++) {
      const a = [0, 0, 0], b = [0, 0, 0];
      a[axis] = -extent * 0.93; b[axis] = extent * 0.93;
      line3D([a, b], '#57799c33', 0.7, [2, 5], extent);
    }
    const predictedRadius = Math.sqrt(n * d.r);
    const measuredRadius = d.radius[n];
    const radiusPixels = Math.max(1, Math.abs(project([measuredRadius, 0, 0], extent).x - origin.x));
    const glow = ctx.createRadialGradient(origin.x, origin.y, 1, origin.x, origin.y, Math.max(8, radiusPixels * 1.3));
    glow.addColorStop(0, '#3b9edd0e'); glow.addColorStop(0.8, '#3b9edd04'); glow.addColorStop(1, '#3b9edd00');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    drawSphere(predictedRadius, '#9db3ce83', [4, 5], extent);
    drawSphere(measuredRadius, '#65c5ff66', [], extent);

    // Beads retain earlier measured radii along the assigned display directions.
    const nearestIndex = d.nearest[n];
    for (let j = 1; j < d.K; j++) {
      const active = j === nearestIndex;
      const history = [[0, 0, 0]];
      const stride = Math.max(1, Math.floor(d.N / 42));
      for (let t = stride; t < n; t += stride) history.push(worldPoint(j, t));
      history.push(worldPoint(j, n));
      line3D(history, active ? '#65c5ff88' : '#57759755', active ? 1.3 : 0.8, [], extent);
      for (let t = 100; t < n; t += 100) {
        const bead = project(worldPoint(j, t), extent);
        ctx.beginPath();ctx.arc(bead.x, bead.y, 1.25, 0, Math.PI * 2);
        ctx.fillStyle = active ? '#65c5ff66' : '#7992af44';ctx.fill();
      }
    }
    state.projected = [];
    const nodes = Array.from({ length: d.K }, (_, i) => ({ index: i, ...project(worldPoint(i, n), extent) })).sort((a, b) => a.depth - b.depth);
    for (const node of nodes) {
      const reference = node.index === 0;
      const active = node.index === nearestIndex;
      const color = reference ? colors.white : active ? colors.blue : colors.steel;
      const size = (reference ? 5.1 : active ? 5.7 : 4.4) * node.perspective;
      const haloSize = size * (active ? 4.5 : 3.6);
      const halo = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, haloSize);
      halo.addColorStop(0, reference ? '#d3ecff44' : active ? '#65c5ff4a' : '#789ab522');
      halo.addColorStop(1, '#4d90c000');
      ctx.fillStyle = halo;ctx.beginPath();ctx.arc(node.x, node.y, haloSize, 0, Math.PI * 2);ctx.fill();
      ctx.fillStyle = color;ctx.beginPath();ctx.arc(node.x, node.y, size, 0, Math.PI * 2);ctx.fill();
      if (reference || active) {
        const pulse = reducedMotion || !state.playing ? 0 : Math.sin(now / 450) * 1.2;
        ctx.strokeStyle = reference ? '#d3ecff66' : '#65c5ff99';
        ctx.lineWidth = 0.8;ctx.beginPath();ctx.arc(node.x, node.y, size + 4 + pulse, 0, Math.PI * 2);ctx.stroke();
      }
      const labelX = node.x + size + 8;
      const labelY = node.y + (reference ? -8 : -4);
      ctx.font = `${active || reference ? '500' : '400'} 11px 'Segoe UI', sans-serif`;
      ctx.fillStyle = reference ? '#e5f3ff' : active ? '#86d3ff' : '#91a8c4';
      ctx.fillText(clusterName(node.index), labelX, labelY);
      if (active && measuredRadius > 0.01) {
        const midpoint = { x: (origin.x + node.x) / 2, y: (origin.y + node.y) / 2 };
        ctx.font = "10px Consolas, monospace";
        ctx.fillStyle = '#b2ddff';ctx.fillText('R = ' + format(measuredRadius, 3), midpoint.x + 7, midpoint.y - 9);
      }
      state.projected.push({ ...node, size });
    }
    // A display-axis triad makes camera orientation explicit, without claiming physical xyz.
    const axisOrigin = { x: w - 45, y: h - 74 };
    ['x', 'y', 'z'].forEach((name, i) => {
      const v = [0, 0, 0];v[i] = extent * 0.20;
      const point = project(v, extent);
      const dx = point.x - origin.x, dy = point.y - origin.y;
      ctx.strokeStyle = ['#72b0d8', '#91a7c2', '#566e8e'][i];
      ctx.beginPath();ctx.moveTo(axisOrigin.x, axisOrigin.y);ctx.lineTo(axisOrigin.x + dx, axisOrigin.y + dy);ctx.stroke();
      ctx.fillStyle = '#7c99b8';ctx.font = '9px Segoe UI';ctx.fillText(name, axisOrigin.x + dx + 3, axisOrigin.y + dy - 2);
    });
    updateTooltip();
  }

  function drawChart() {
    const ctx = chartContext;
    const { chartWidth: w, chartHeight: h, data: d, n } = state;
    ctx.clearRect(0, 0, w, h);
    const left = w < 450 ? 53 : 63, right = 20, top = 24, bottom = 30;
    const plotWidth = w - left - right, plotHeight = h - top - bottom;
    let maximum = d.r * 1.8;
    for (let i = 10; i <= d.N; i++) maximum = Math.max(maximum, d.ratio[i] * 1.05);
    const x = value => left + (value - 1) / (d.N - 1) * plotWidth;
    const y = value => top + (1 - value / maximum) * plotHeight;
    ctx.font = '9px Consolas, monospace';
    for (let i = 0; i <= 4; i++) {
      const value = maximum / 4 * i;
      ctx.strokeStyle = '#31435b55';ctx.lineWidth = 0.7;
      ctx.beginPath();ctx.moveTo(left, y(value));ctx.lineTo(w - right, y(value));ctx.stroke();
      ctx.fillStyle = '#6f88a6';ctx.textAlign = 'right';ctx.fillText(format(value, 4), left - 10, y(value) + 3);
    }
    const ticks = w < 450 ? [1, 800, 1600, 2400] : [1, 400, 800, 1200, 1600, 2000, 2400];
    for (const tick of ticks) {
      ctx.fillStyle = '#6f88a6';ctx.textAlign = tick === 1 ? 'left' : tick === d.N ? 'right' : 'center';
      ctx.fillText(integer(tick), x(tick), h - 10);
    }
    ctx.strokeStyle = '#b2c7dfb0';ctx.setLineDash([5, 5]);ctx.lineWidth = 1;
    ctx.beginPath();ctx.moveTo(left, y(d.r));ctx.lineTo(w - right, y(d.r));ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle = '#9bb3ce';ctx.textAlign = 'right';ctx.font = '10px Segoe UI';
    ctx.fillText('r = ' + format(d.r, 5), w - right - 2, y(d.r) - 8);
    ctx.save();ctx.beginPath();ctx.rect(left, top, plotWidth, plotHeight);ctx.clip();
    ctx.beginPath();ctx.moveTo(x(1), y(d.ratio[1]));
    const stride = Math.max(1, Math.floor(n / (plotWidth * 2)));
    for (let i = 2; i <= n; i += stride) ctx.lineTo(x(i), y(d.ratio[i]));
    ctx.lineTo(x(n), y(d.ratio[n]));
    ctx.strokeStyle = colors.blue;ctx.lineWidth = 1.7;ctx.lineJoin = 'round';ctx.stroke();
    ctx.lineTo(x(n), top + plotHeight);ctx.lineTo(left, top + plotHeight);ctx.closePath();
    const fill = ctx.createLinearGradient(0, top, 0, top + plotHeight);fill.addColorStop(0, '#58b8fb27');fill.addColorStop(1, '#58b8fb02');
    ctx.fillStyle = fill;ctx.fill();
    ctx.strokeStyle = '#65c5ff33';ctx.lineWidth = 1;ctx.beginPath();ctx.moveTo(x(n), top);ctx.lineTo(x(n), top + plotHeight);ctx.stroke();
    ctx.fillStyle = '#a7e0ff';ctx.beginPath();ctx.arc(x(n), y(d.ratio[n]), 3, 0, Math.PI * 2);ctx.fill();
    ctx.restore();ctx.textAlign = 'left';
    state.chartDirty = false;
  }

  function updateTooltip() {
    const tooltip = $('tooltip');
    const hit = state.dragging ? null : state.projected.find(node => Math.hypot(node.x - state.pointer.x, node.y - state.pointer.y) < node.size + 10);
    if (!hit) { tooltip.hidden = true; return; }
    const d = state.data;
    tooltip.hidden = false;
    tooltip.textContent = hit.index === 0 ? 'C₁ · reference centroid history\nAll displayed radii are measured from here.' :
      `${clusterName(hit.index)} · centroid history\nDistance from C₁: ${format(Math.sqrt(d.squaredDistances[hit.index][state.n]))}\nLatest coordinate average: ${format(d.centroids[hit.index][state.n])}`;
    tooltip.style.left = Math.min(state.width - 245, Math.max(10, hit.x + 15)) + 'px';
    tooltip.style.top = Math.max(14, hit.y - 67) + 'px';
  }

  $('play').addEventListener('click', () => {
    if (state.n === state.data.N) setStep(1);
    state.playing = !state.playing;state.accumulator = 0;updatePlayback();
  });
  $('restart').addEventListener('click', () => { setStep(1);state.accumulator = 0;updatePlayback(); });
  $('step').addEventListener('click', () => setStep(state.n + 1, true));
  $('timeline').addEventListener('input', event => setStep(Number(event.target.value), true));
  $('speed').addEventListener('change', event => { state.rate = Number(event.target.value); });
  $('probability').addEventListener('input', () => rebuild());
  $('members').addEventListener('change', () => rebuild());
  $('clusters').addEventListener('change', () => rebuild());
  $('new-sample').addEventListener('click', () => rebuild({ newSeed: true }));
  $('reset-view').addEventListener('click', () => { state.yaw = -0.46;state.pitch = -0.25;state.zoom = 1; });
  let lastPointer = null;
  scene.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    state.dragging = true;lastPointer = { x: event.clientX, y: event.clientY };scene.setPointerCapture(event.pointerId);
  });
  scene.addEventListener('pointermove', event => {
    const rect = scene.getBoundingClientRect();
    state.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (state.dragging && lastPointer) {
      state.yaw += (event.clientX - lastPointer.x) * 0.007;
      state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch + (event.clientY - lastPointer.y) * 0.007));
      lastPointer = { x: event.clientX, y: event.clientY };
    }
  });
  function releasePointer() { state.dragging = false;lastPointer = null; }
  scene.addEventListener('pointerup', releasePointer);
  scene.addEventListener('pointercancel', releasePointer);
  scene.addEventListener('lostpointercapture', releasePointer);
  scene.addEventListener('pointerleave', () => { state.pointer = { x: -100, y: -100 }; });
  scene.addEventListener('wheel', event => { event.preventDefault();state.zoom = Math.max(0.6, Math.min(1.8, state.zoom * Math.exp(-event.deltaY * 0.001))); }, { passive: false });
  scene.addEventListener('keydown', event => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') state.yaw -= 0.1;
    if (event.key === 'ArrowRight') state.yaw += 0.1;
    if (event.key === 'ArrowUp') state.pitch = Math.min(1.2, state.pitch + 0.1);
    if (event.key === 'ArrowDown') state.pitch = Math.max(-1.2, state.pitch - 0.1);
    if (event.key === '+' || event.key === '=') state.zoom = Math.min(1.8, state.zoom + 0.1);
    if (event.key === '-') state.zoom = Math.max(0.6, state.zoom - 0.1);
  });
  document.addEventListener('visibilitychange', () => { state.lastFrame = 0;state.accumulator = 0; });
  window.addEventListener('math-ready', () => { state.mathReady = true;state.mathPending = true;resize(); });
  if (window.MathJax?.startup?.document) { state.mathReady = true; }
  new ResizeObserver(resize).observe(document.querySelector('.workspace'));
  window.addEventListener('resize', resize);

  function frame(now) {
    const elapsed = state.lastFrame ? Math.min(100, now - state.lastFrame) : 0;
    state.lastFrame = now;
    if (state.playing && !document.hidden) {
      state.accumulator += elapsed / 1000 * state.rate;
      const steps = Math.floor(state.accumulator);
      if (steps > 0) { state.accumulator -= steps;setStep(state.n + steps); }
    }
    drawScene(now);
    if (state.chartDirty) drawChart();
    updateMath(now);
    requestAnimationFrame(frame);
  }

  rebuild();resize();requestAnimationFrame(frame);
})();
