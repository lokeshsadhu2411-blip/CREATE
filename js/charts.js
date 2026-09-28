// ===================================================================
// FITNEXA AI: Interactive Canvas Charts Engine
// Responsive, high-DPI rendering for weight, workouts, calories, and strength
// ===================================================================

const FitnexaCharts = (function () {
  let activeRange = 'days7';

  function getAccentColors() {
    const isLight = document.documentElement.classList.contains('theme-light');
    const isEnergy = document.documentElement.classList.contains('theme-energy');
    const isMinimal = document.documentElement.classList.contains('theme-minimal');

    if (isEnergy) {
      return {
        primary: '#84cc16', // neon lime
        secondary: '#06b6d4',
        accent: '#f59e0b',
        text: '#f8fafc',
        grid: 'rgba(255, 255, 255, 0.08)'
      };
    }
    if (isLight) {
      return {
        primary: '#2563eb', // deep royal blue
        secondary: '#059669',
        accent: '#7c3aed',
        text: '#475569',
        grid: 'rgba(0, 0, 0, 0.06)'
      };
    }
    if (isMinimal) {
      return {
        primary: '#94a3b8',
        secondary: '#cbd5e1',
        accent: '#64748b',
        text: '#cbd5e1',
        grid: 'rgba(255, 255, 255, 0.05)'
      };
    }
    // Dark / Midnight default
    return {
      primary: '#10b981', // emerald
      secondary: '#06b6d4', // cyan
      accent: '#6366f1',  // indigo
      text: '#94a3b8',
      grid: 'rgba(255, 255, 255, 0.08)'
    };
  }

  function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || 500;
    const height = 240;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
  }

  // Draw Line/Area Chart (Weight or Calories)
  function drawLineChart(canvasId, labels, data, unit = 'kg', title = '') {
    const setup = setupCanvas(canvasId);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getAccentColors();

    const padding = { top: 30, right: 25, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const minVal = Math.min(...data) * 0.98;
    const maxVal = Math.max(...data) * 1.02;
    const range = (maxVal - minVal) || 1;

    // Grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = padding.top + (chartH / steps) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = (maxVal - (range / steps) * i).toFixed(1);
      ctx.fillStyle = colors.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}`, padding.left - 8, y + 4);
    }

    // Coordinates
    const points = data.map((val, idx) => {
      const x = padding.left + (chartW / (data.length - 1 || 1)) * idx;
      const y = padding.top + chartH - ((val - minVal) / range) * chartH;
      return { x, y, val };
    });

    // Area Gradient Fill
    if (points.length > 0) {
      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad.addColorStop(0, colors.primary + '33');
      grad.addColorStop(1, colors.primary + '00');

      ctx.beginPath();
      ctx.moveTo(points[0].x, padding.top + chartH);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Smooth Line
    ctx.beginPath();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Points & Labels
    points.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Bottom X label
      ctx.fillStyle = colors.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[idx] || '', p.x, height - 10);
    });
  }

  // Draw Bar Chart (Workout Frequency / Duration)
  function drawBarChart(canvasId, labels, data, unit = 'min') {
    const setup = setupCanvas(canvasId);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getAccentColors();

    const padding = { top: 30, right: 25, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data, 60);
    const colW = Math.min(36, (chartW / data.length) * 0.55);

    // Grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = Math.round(maxVal - (maxVal / 3) * i);
      ctx.fillStyle = colors.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}${unit}`, padding.left - 8, y + 4);
    }

    // Bars
    data.forEach((val, idx) => {
      const centerX = padding.left + (chartW / data.length) * (idx + 0.5);
      const x = centerX - colW / 2;
      const bH = (val / maxVal) * chartH;
      const y = padding.top + chartH - bH;

      // Rounded Bar
      ctx.fillStyle = idx === data.length - 1 ? colors.secondary : colors.primary;
      ctx.beginPath();
      const r = 5;
      ctx.moveTo(x, y + r);
      ctx.arcTo(x, y, x + colW, y, r);
      ctx.arcTo(x + colW, y, x + colW, y + bH, r);
      ctx.lineTo(x + colW, padding.top + chartH);
      ctx.lineTo(x, padding.top + chartH);
      ctx.closePath();
      ctx.fill();

      // Top value text
      ctx.fillStyle = colors.text;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${val}`, centerX, y - 6);

      // Bottom X label
      ctx.fillText(labels[idx] || '', centerX, height - 10);
    });
  }

  // Draw Multi-Line Strength Progression (Bench vs Squat)
  function drawStrengthChart(canvasId, labels, benchData, squatData) {
    const setup = setupCanvas(canvasId);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getAccentColors();

    const padding = { top: 30, right: 25, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allData = [...benchData, ...squatData];
    const minVal = Math.floor(Math.min(...allData) * 0.9);
    const maxVal = Math.ceil(Math.max(...allData) * 1.05);
    const range = maxVal - minVal || 1;

    // Grid
    ctx.strokeStyle = colors.grid;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = Math.round(maxVal - (range / 4) * i);
      ctx.fillStyle = colors.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}kg`, padding.left - 8, y + 4);
    }

    function renderLine(dataArr, strokeColor, labelText) {
      const points = dataArr.map((val, idx) => ({
        x: padding.left + (chartW / (dataArr.length - 1 || 1)) * idx,
        y: padding.top + chartH - ((val - minVal) / range) * chartH,
        val
      }));

      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      });
    }

    renderLine(benchData, colors.primary, 'Bench');
    renderLine(squatData, colors.secondary, 'Squat');

    // Bottom labels
    labels.forEach((lbl, idx) => {
      const x = padding.left + (chartW / (labels.length - 1 || 1)) * idx;
      ctx.fillStyle = colors.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, x, height - 10);
    });
  }

  // Refresh all charts for the current range
  function renderAll(range = activeRange) {
    activeRange = range;
    const dataSet = window.FITNEXA_DATA.chartsData[range] || window.FITNEXA_DATA.chartsData.days7;

    // Weight Chart
    drawLineChart('chart-weight', dataSet.labels, dataSet.weight, 'kg');

    // Workout Consistency (Duration / Minutes)
    drawBarChart('chart-workout-freq', dataSet.labels, dataSet.duration, 'm');

    // Calories Burned Chart
    drawLineChart('chart-calories', dataSet.labels, dataSet.calories, 'kcal');

    // Strength Progression Chart
    drawStrengthChart('chart-strength', dataSet.labels, dataSet.strength.bench, dataSet.strength.squat);
  }

  // Window resize handler
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderAll(activeRange);
    }, 200);
  });

  return {
    renderAll,
    setRange: function (range) {
      renderAll(range);
    }
  };
})();

window.FitnexaCharts = FitnexaCharts;
