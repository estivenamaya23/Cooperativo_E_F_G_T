"use strict";

const DATA_URL = "data_copernicus_sample.json";
const SUITABILITY_THRESHOLD = 70;
const galapagosCenter = [-0.739, -90.31];
const CDN_URLS = {
  leaflet: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  chart: "https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js",
};
const APTITUDE_GROUPS = [
  { key: "suitable", label: "Apto (≥ 70 %)", color: "#23845b" },
  { key: "medium", label: "Medio (40–69 %)", color: "#d29a16" },
  { key: "unsuitable", label: "No apto (< 40 %)", color: "#c6473c" },
];

const elements = {
  dataError: document.getElementById("data-error"),
  filterError: document.getElementById("filter-error"),
  kpiTotal: document.getElementById("kpi-total"),
  kpiCloud: document.getElementById("kpi-cloud"),
  kpiFitness: document.getElementById("kpi-fitness"),
  kpiSuitable: document.getElementById("kpi-suitable"),
  kpiBest: document.getElementById("kpi-best"),
  kpiBestHint: document.getElementById("kpi-best-hint"),
  subtitle: document.getElementById("dataset-summary"),
  updated: document.getElementById("dataset-updated"),
  zoneFilter: document.getElementById("zone-filter"),
  dateFrom: document.getElementById("date-from"),
  dateTo: document.getElementById("date-to"),
  heatToggle: document.getElementById("heat-toggle"),
  mapCount: document.getElementById("map-count"),
  map: document.getElementById("map"),
  mapError: document.getElementById("map-error"),
  tableBody: document.getElementById("passes-table-body"),
  descriptiveStatsBody: document.getElementById("descriptive-stats-body"),
  distributionLegend: document.getElementById("distribution-legend"),
  correlationValue: document.getElementById("correlation-value"),
  correlationDescription: document.getElementById("correlation-description"),
  extremeBest: document.getElementById("extreme-best"),
  extremeWorst: document.getElementById("extreme-worst"),
  extremeCloud: document.getElementById("extreme-cloud"),
  zoneStatsBody: document.getElementById("zone-stats-body"),
};

const state = {
  allPasses: [],
  filteredPasses: [],
  zoneField: null,
  map: null,
  markerLayer: null,
  heatLayer: null,
  markerByPass: new Map(),
  charts: { cloud: null, fitness: null, distribution: null },
  libraryErrors: { leaflet: null, chart: null },
};

function showDataError(message) {
  elements.dataError.textContent = message;
  elements.dataError.hidden = false;
}

function showFilterError(message) {
  elements.filterError.textContent = message;
  elements.filterError.hidden = !message;
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`No se pudo cargar ${url}.`));
    document.head.append(script);
  });
}

async function loadVisualizationLibraries() {
  const results = await Promise.allSettled([
    window.L ? Promise.resolve() : loadScript(CDN_URLS.leaflet),
    window.Chart ? Promise.resolve() : loadScript(CDN_URLS.chart),
  ]);

  if (results[0].status === "rejected" || !window.L) {
    state.libraryErrors.leaflet = "Leaflet no cargó. Revisa conexión / CDN";
  }
  if (results[1].status === "rejected" || !window.Chart) {
    state.libraryErrors.chart = "Chart.js no cargó. Revisa conexión / CDN";
  }
}

function isValidCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function isValidPass(pass) {
  return pass !== null
    && typeof pass === "object"
    && typeof pass.id === "string"
    && typeof pass.satelite === "string"
    && isValidCalendarDate(pass.fecha)
    && Number.isFinite(pass.latitud)
    && pass.latitud >= -90
    && pass.latitud <= 90
    && Number.isFinite(pass.longitud)
    && pass.longitud >= -180
    && pass.longitud <= 180
    && Number.isFinite(pass.nubosidad_pct)
    && pass.nubosidad_pct >= 0
    && pass.nubosidad_pct <= 100
    && Number.isFinite(pass.aptitud_sensor_pct)
    && pass.aptitud_sensor_pct >= 0
    && pass.aptitud_sensor_pct <= 100;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`;
}

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return value.toLocaleString("es-ES", { maximumFractionDigits: digits });
}

function average(passes, field) {
  if (passes.length === 0) {
    return null;
  }
  return passes.reduce((sum, pass) => sum + pass[field], 0) / passes.length;
}

function getLocationField(passes) {
  return ["isla", "zona", "island", "zone"].find((field) => passes.some((pass) => (
    typeof pass[field] === "string" && pass[field].trim()
  ))) || null;
}

function formatLocation(pass) {
  const location = state.zoneField ? pass[state.zoneField] : null;
  return typeof location === "string" && location.trim() ? location : "No incluida en el JSON";
}

function formatPassSummary(pass, field) {
  if (!pass) {
    return "—";
  }
  return `${pass.fecha} · ${formatLocation(pass)} · ${pass.id} (${formatPercent(pass[field])})`;
}

function renderKpis(passes) {
  if (passes.length === 0) {
    elements.kpiTotal.textContent = "—";
    elements.kpiCloud.textContent = "—";
    elements.kpiFitness.textContent = "—";
    elements.kpiSuitable.textContent = "—";
    elements.kpiBest.textContent = "—";
    elements.kpiBestHint.textContent = "Sin datos para el filtro seleccionado.";
    return;
  }

  const bestPass = passes.reduce((best, pass) => (
    pass.aptitud_sensor_pct > best.aptitud_sensor_pct ? pass : best
  ));
  const suitableCount = passes.filter((pass) => pass.aptitud_sensor_pct >= SUITABILITY_THRESHOLD).length;

  elements.kpiTotal.textContent = passes.length.toLocaleString("es-ES");
  elements.kpiCloud.textContent = formatPercent(average(passes, "nubosidad_pct"));
  elements.kpiFitness.textContent = formatPercent(average(passes, "aptitud_sensor_pct"));
  elements.kpiSuitable.textContent = suitableCount.toLocaleString("es-ES");
  elements.kpiBest.textContent = `${bestPass.fecha} · ${formatLocation(bestPass)}`;
  elements.kpiBestHint.textContent = `ID ${bestPass.id} · mayor aptitud (${formatPercent(bestPass.aptitud_sensor_pct)})`;
}

function median(values) {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function describe(values) {
  if (values.length === 0) {
    return null;
  }
  const total = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / total;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / total;
  return {
    mean,
    median: median(values),
    minimum,
    maximum,
    standardDeviation: Math.sqrt(variance),
    range: maximum - minimum,
    total,
  };
}

function appendCell(row, value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = value;
  if (className) {
    cell.className = className;
  }
  row.append(cell);
  return cell;
}

function renderDescriptiveStats(passes) {
  const cloud = describe(passes.map((pass) => pass.nubosidad_pct));
  const fitness = describe(passes.map((pass) => pass.aptitud_sensor_pct));
  const measures = [
    ["Media", "mean"],
    ["Mediana", "median"],
    ["Mínimo", "minimum"],
    ["Máximo", "maximum"],
    ["Desviación estándar", "standardDeviation"],
    ["Rango", "range"],
    ["Total", "total"],
  ];
  elements.descriptiveStatsBody.replaceChildren();

  for (const [label, key] of measures) {
    const row = document.createElement("tr");
    appendCell(row, label);
    appendCell(row, cloud ? (key === "total" ? String(cloud[key]) : formatPercent(cloud[key])) : "—");
    appendCell(row, fitness ? (key === "total" ? String(fitness[key]) : formatPercent(fitness[key])) : "—");
    elements.descriptiveStatsBody.append(row);
  }
}

function aptitudeGroup(pass) {
  if (pass.aptitud_sensor_pct >= 70) {
    return "suitable";
  }
  return pass.aptitud_sensor_pct >= 40 ? "medium" : "unsuitable";
}

function renderDistributionLegend(counts, total) {
  elements.distributionLegend.replaceChildren();

  for (const group of APTITUDE_GROUPS) {
    const count = counts[group.key];
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const item = document.createElement("div");
    item.className = "distribution-item";

    const label = document.createElement("div");
    label.className = "distribution-item-heading";
    const name = document.createElement("span");
    name.textContent = group.label;
    const value = document.createElement("strong");
    value.textContent = total > 0
      ? `${count} · ${formatNumber(percentage)} %`
      : "0 · —";
    label.append(name, value);

    const track = document.createElement("div");
    track.className = "distribution-track";
    const bar = document.createElement("span");
    bar.className = "distribution-bar";
    bar.style.width = `${percentage}%`;
    bar.style.backgroundColor = group.color;
    track.append(bar);
    item.append(label, track);
    elements.distributionLegend.append(item);
  }
}

function showChartMessage(kind, message) {
  const canvas = document.getElementById(`chart-${kind}`);
  const messageElement = document.getElementById(`chart-${kind}-message`);
  canvas.hidden = true;
  messageElement.textContent = message;
  messageElement.hidden = false;
}

function showMapError(message, instructions = "Comprueba la conexión y el CDN; luego recarga la página. El contenedor, controles y leyenda del mapa permanecen visibles.") {
  elements.mapError.replaceChildren();
  const heading = document.createElement("strong");
  heading.textContent = message;
  const detail = document.createElement("span");
  detail.textContent = instructions;
  elements.mapError.append(heading, detail);
  elements.mapError.hidden = false;
}

function clearMapError() {
  elements.mapError.replaceChildren();
  elements.mapError.hidden = true;
}

function markerColor(pass) {
  if (pass.aptitud_sensor_pct >= 70) {
    return "#23845b";
  }
  return pass.aptitud_sensor_pct >= 40 ? "#d29a16" : "#c6473c";
}

function heatColor(cloudiness) {
  if (cloudiness >= 70) {
    return "#d94135";
  }
  return cloudiness >= 40 ? "#ef8b32" : "#287fbd";
}

function createPopup(pass) {
  const popup = document.createElement("div");
  popup.className = "map-popup";
  const details = [
    ["Fecha", pass.fecha],
    ["Isla/Zona", formatLocation(pass)],
    ["Nubosidad", formatPercent(pass.nubosidad_pct)],
    ["Aptitud", formatPercent(pass.aptitud_sensor_pct)],
    ["ID Pasada", pass.id],
  ];

  const title = document.createElement("strong");
  title.className = "popup-title";
  title.textContent = `${pass.id} · ${pass.satelite}`;
  popup.append(title);
  for (const [label, value] of details) {
    const line = document.createElement("div");
    line.textContent = `${label}: ${value}`;
    popup.append(line);
  }
  return popup;
}

function initializeMap() {
  if (state.map) {
    return;
  }
  const L = window.L;
  if (!L) {
    throw new Error("Leaflet no cargó. Revisa conexión / CDN");
  }
  if (elements.map._leaflet_id) {
    throw new Error("El contenedor del mapa ya fue inicializado.");
  }

  state.map = L.map('map', { zoomControl: false, attributionControl: false }).setView(galapagosCenter, 7);
  const tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    maxZoom: 19,
  });
  tileLayer.on("tileerror", () => {
    showMapError(
      "No se pudieron cargar las teselas de OpenStreetMap.",
      "Comprueba tu conexión y que tile.openstreetmap.org esté accesible. La atribución y las capas de datos se conservan."
    );
  });
  tileLayer.addTo(state.map);
  L.control.zoom({ position: "topright" }).addTo(state.map);

  state.heatLayer = L.layerGroup().addTo(state.map);
  state.markerLayer = L.layerGroup().addTo(state.map);
  elements.heatToggle.disabled = false;
  clearMapError();
  window.requestAnimationFrame(() => state.map?.invalidateSize());
}

function updateMap(passes) {
  elements.mapCount.textContent = `${passes.length} pasadas en mapa`;
  if (!state.map || !state.markerLayer || !state.heatLayer) {
    return;
  }
  const L = window.L;

  state.markerLayer.clearLayers();
  state.heatLayer.clearLayers();
  state.markerByPass.clear();

  for (const pass of passes) {
    const marker = L.circleMarker([pass.latitud, pass.longitud], {
      radius: 8,
      color: "#ffffff",
      weight: 2,
      fillColor: markerColor(pass),
      fillOpacity: 0.95,
    }).bindPopup(createPopup(pass));
    marker.addTo(state.markerLayer);
    state.markerByPass.set(pass, marker);

    const radius = 1200 + (pass.nubosidad_pct * 150);
    L.circle([pass.latitud, pass.longitud], {
      radius,
      color: heatColor(pass.nubosidad_pct),
      fillColor: heatColor(pass.nubosidad_pct),
      fillOpacity: 0.35,
      weight: 1,
    }).addTo(state.heatLayer);
  }

  if (elements.heatToggle.checked) {
    state.heatLayer.addTo(state.map);
  } else {
    state.map.removeLayer(state.heatLayer);
  }
}

function showPassOnMap(pass) {
  const marker = state.markerByPass.get(pass);
  if (!state.map || !marker) {
    if (!state.map) {
      showMapError(state.libraryErrors.leaflet || "Leaflet no cargó. Revisa conexión / CDN");
    }
    return;
  }
  state.map.flyTo([pass.latitud, pass.longitud], 10);
  marker.openPopup();
}

function renderTable(passes) {
  elements.tableBody.replaceChildren();
  if (passes.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "table-empty";
    cell.textContent = "Sin datos para el filtro seleccionado.";
    row.append(cell);
    elements.tableBody.append(row);
    return;
  }

  for (const pass of passes) {
    const row = document.createElement("tr");
    row.className = "pass-row";
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `Centrar mapa en la pasada ${pass.id}, ${pass.fecha}`);
    appendCell(row, pass.fecha);
    appendCell(row, formatLocation(pass));
    appendCell(row, formatPercent(pass.nubosidad_pct));
    appendCell(row, formatPercent(pass.aptitud_sensor_pct));

    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    const group = APTITUDE_GROUPS.find((item) => item.key === aptitudeGroup(pass));
    status.className = `status status-${group.key}`;
    status.textContent = group.label;
    statusCell.append(status);
    row.append(statusCell);

    row.addEventListener("click", () => showPassOnMap(pass));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showPassOnMap(pass);
      }
    });
    elements.tableBody.append(row);
  }
}

function createTrendChart(kind, passes) {
  const chart = state.charts[kind];
  if (!window.Chart) {
    showChartMessage(kind, state.libraryErrors.chart || "Chart.js no cargó. Revisa conexión / CDN y recarga.");
    return;
  }
  if (passes.length === 0) {
    if (chart) {
      chart.data.labels = [];
      chart.data.datasets[0].data = [];
      chart.update();
    }
    showChartMessage(kind, "Sin datos para el filtro seleccionado.");
    return;
  }

  const sortedPasses = [...passes].sort((first, second) => first.fecha.localeCompare(second.fecha));
  const field = kind === "cloud" ? "nubosidad_pct" : "aptitud_sensor_pct";
  const label = kind === "cloud" ? "Nubosidad" : "Aptitud";
  const color = kind === "cloud" ? "#3478b8" : "#087e83";
  const labels = sortedPasses.map((pass) => pass.fecha);
  const values = sortedPasses.map((pass) => pass[field]);
  const canvas = document.getElementById(`chart-${kind}`);

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
    canvas.hidden = false;
    document.getElementById(`chart-${kind}-message`).hidden = true;
    return;
  }

  try {
    state.charts[kind] = new window.Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label,
          data: values,
          borderColor: color,
          backgroundColor: color,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: color,
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.28,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, boxWidth: 8, padding: 18, color: "#526574" },
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatPercent(context.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Fecha", color: "#647789" },
            ticks: { color: "#647789", maxRotation: 45, minRotation: 0 },
            grid: { display: false },
          },
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: "Porcentaje (%)", color: "#647789" },
            ticks: { color: "#647789", callback: (value) => `${value} %` },
            grid: { color: "#e9eff3" },
          },
        },
      },
    });
    canvas.hidden = false;
    document.getElementById(`chart-${kind}-message`).hidden = true;
  } catch (error) {
    showChartMessage(kind, `No se pudo dibujar el gráfico: ${error.message}`);
  }
}

function createDistributionChart(counts, total) {
  const kind = "distribution";
  const canvas = document.getElementById("chart-distribution");
  const chart = state.charts.distribution;

  if (!window.Chart) {
    showChartMessage(kind, state.libraryErrors.chart || "Chart.js no cargó. Revisa conexión / CDN y recarga.");
    return;
  }
  if (total === 0) {
    if (chart) {
      chart.data.datasets[0].data = [0, 0, 0];
      chart.update();
    }
    showChartMessage(kind, "Sin datos para el filtro seleccionado.");
    return;
  }

  const values = APTITUDE_GROUPS.map((group) => counts[group.key]);
  if (chart) {
    chart.data.datasets[0].data = values;
    chart.update();
    canvas.hidden = false;
    document.getElementById(`chart-${kind}-message`).hidden = true;
    return;
  }

  try {
    state.charts.distribution = new window.Chart(canvas, {
      type: "doughnut",
      data: {
        labels: APTITUDE_GROUPS.map((group) => group.label),
        datasets: [{
          data: values,
          backgroundColor: APTITUDE_GROUPS.map((group) => group.color),
          borderColor: "#ffffff",
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const percentage = total > 0 ? (context.parsed / total) * 100 : 0;
                return `${context.label}: ${context.parsed} (${formatNumber(percentage)} %)`;
              },
            },
          },
        },
      },
    });
    canvas.hidden = false;
    document.getElementById(`chart-${kind}-message`).hidden = true;
  } catch (error) {
    showChartMessage(kind, `No se pudo dibujar la distribución: ${error.message}`);
  }
}

function pearsonCorrelation(passes) {
  if (passes.length < 2) {
    return null;
  }
  const cloudMean = average(passes, "nubosidad_pct");
  const fitnessMean = average(passes, "aptitud_sensor_pct");
  let covariance = 0;
  let cloudSquareSum = 0;
  let fitnessSquareSum = 0;

  for (const pass of passes) {
    const cloudDifference = pass.nubosidad_pct - cloudMean;
    const fitnessDifference = pass.aptitud_sensor_pct - fitnessMean;
    covariance += cloudDifference * fitnessDifference;
    cloudSquareSum += cloudDifference ** 2;
    fitnessSquareSum += fitnessDifference ** 2;
  }
  const denominator = Math.sqrt(cloudSquareSum * fitnessSquareSum);
  if (denominator === 0) {
    return null;
  }
  return covariance / denominator;
}

function correlationInterpretation(value) {
  if (!Number.isFinite(value)) {
    return "No calculable con menos de dos datos o sin variación.";
  }
  if (value < -0.7) {
    return "Correlación fuerte negativa.";
  }
  if (value <= -0.3) {
    return "Correlación moderada negativa.";
  }
  return "Correlación débil.";
}

function renderDistribution(passes) {
  const counts = { suitable: 0, medium: 0, unsuitable: 0 };
  for (const pass of passes) {
    counts[aptitudeGroup(pass)] += 1;
  }
  renderDistributionLegend(counts, passes.length);
  createDistributionChart(counts, passes.length);
}

function renderExtremes(passes) {
  if (passes.length === 0) {
    elements.extremeBest.textContent = "—";
    elements.extremeWorst.textContent = "—";
    elements.extremeCloud.textContent = "—";
    return;
  }

  const best = passes.reduce((current, pass) => (
    pass.aptitud_sensor_pct > current.aptitud_sensor_pct ? pass : current
  ));
  const worst = passes.reduce((current, pass) => (
    pass.aptitud_sensor_pct < current.aptitud_sensor_pct ? pass : current
  ));
  const cloudiest = passes.reduce((current, pass) => (
    pass.nubosidad_pct > current.nubosidad_pct ? pass : current
  ));
  elements.extremeBest.textContent = formatPassSummary(best, "aptitud_sensor_pct");
  elements.extremeWorst.textContent = formatPassSummary(worst, "aptitud_sensor_pct");
  elements.extremeCloud.textContent = formatPassSummary(cloudiest, "nubosidad_pct");
}

function renderCorrelation(passes) {
  const value = pearsonCorrelation(passes);
  elements.correlationValue.textContent = Number.isFinite(value)
    ? `r = ${value.toFixed(2)}`
    : "r = —";
  elements.correlationDescription.textContent = correlationInterpretation(value);
}

function renderZoneStats(passes) {
  elements.zoneStatsBody.replaceChildren();
  if (!state.zoneField) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "table-empty";
    cell.textContent = "El JSON no contiene isla/zona; no se inventan ubicaciones.";
    row.append(cell);
    elements.zoneStatsBody.append(row);
    return;
  }

  const groups = new Map();
  for (const pass of passes) {
    const location = pass[state.zoneField];
    if (typeof location !== "string" || !location.trim()) {
      continue;
    }
    if (!groups.has(location)) {
      groups.set(location, []);
    }
    groups.get(location).push(pass);
  }

  const sortedGroups = [...groups.entries()].sort((first, second) => (
    first[0].localeCompare(second[0], "es")
  ));
  if (sortedGroups.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "table-empty";
    cell.textContent = "Sin zonas para el filtro seleccionado.";
    row.append(cell);
    elements.zoneStatsBody.append(row);
    return;
  }

  for (const [location, records] of sortedGroups) {
    const row = document.createElement("tr");
    appendCell(row, location);
    appendCell(row, formatPercent(average(records, "nubosidad_pct")));
    appendCell(row, formatPercent(average(records, "aptitud_sensor_pct")));
    appendCell(row, records.length.toLocaleString("es-ES"));
    elements.zoneStatsBody.append(row);
  }
}

function renderStatistics(passes) {
  renderDescriptiveStats(passes);
  renderDistribution(passes);
  renderCorrelation(passes);
  renderExtremes(passes);
  renderZoneStats(passes);
}

function renderDashboard(passes) {
  renderKpis(passes);
  renderStatistics(passes);
  updateMap(passes);
  renderTable(passes);
  createTrendChart("cloud", passes);
  createTrendChart("fitness", passes);
}

function getDateFilterValue(value, label) {
  if (!value) {
    return null;
  }
  if (!isValidCalendarDate(value)) {
    throw new Error(`${label}: usa una fecha real con formato AAAA-MM-DD.`);
  }
  return value;
}

function applyFilters() {
  try {
    const from = getDateFilterValue(elements.dateFrom.value, "Desde");
    const to = getDateFilterValue(elements.dateTo.value, "Hasta");
    if (from && to && from > to) {
      throw new Error("La fecha Desde no puede ser posterior a Hasta.");
    }

    const selectedLocation = elements.zoneFilter.value;
    const filteredPasses = state.allPasses.filter((pass) => {
      const inDateRange = (!from || pass.fecha >= from) && (!to || pass.fecha <= to);
      const inLocation = !state.zoneField
        || !selectedLocation
        || pass[state.zoneField] === selectedLocation;
      return inDateRange && inLocation;
    });

    state.filteredPasses = filteredPasses;
    showFilterError("");
    renderDashboard(state.filteredPasses);
  } catch (error) {
    showFilterError(error.message);
  }
}

function initializeLocationFilter(passes) {
  state.zoneField = getLocationField(passes);
  if (!state.zoneField) {
    elements.zoneFilter.replaceChildren(new Option("Isla/Zona no incluida en el JSON", ""));
    elements.zoneFilter.disabled = true;
    return;
  }

  const locations = [...new Set(passes
    .map((pass) => pass[state.zoneField])
    .filter((location) => typeof location === "string" && location.trim()))]
    .sort((first, second) => first.localeCompare(second, "es"));
  elements.zoneFilter.replaceChildren(new Option("Todas las zonas", ""));
  for (const location of locations) {
    elements.zoneFilter.add(new Option(location, location));
  }
  elements.zoneFilter.disabled = false;
}

function bindControls() {
  document.getElementById("filter-form").addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });

  document.getElementById("reset-filters").addEventListener("click", () => {
    elements.dateFrom.value = "";
    elements.dateTo.value = "";
    elements.zoneFilter.value = "";
    applyFilters();
  });

  elements.heatToggle.addEventListener("change", () => {
    if (!state.map || !state.heatLayer) {
      return;
    }
    if (elements.heatToggle.checked) {
      state.heatLayer.addTo(state.map);
    } else {
      state.map.removeLayer(state.heatLayer);
    }
  });

  document.getElementById("center-map").addEventListener("click", () => {
    if (state.map) {
      state.map.setView(galapagosCenter, 7);
    } else {
      showMapError(state.libraryErrors.leaflet || "Leaflet no cargó. Revisa conexión / CDN");
    }
  });
}

function initializeChartSections() {
  for (const kind of ["cloud", "fitness", "distribution"]) {
    if (!window.Chart) {
      showChartMessage(kind, state.libraryErrors.chart || "Chart.js no cargó. Revisa conexión / CDN y recarga.");
    }
  }
}

async function loadPasses() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`${DATA_URL} no está disponible (HTTP ${response.status}).`);
  }

  let passes;
  try {
    passes = await response.json();
  } catch {
    throw new Error(`${DATA_URL} contiene JSON malformado.`);
  }
  if (!Array.isArray(passes) || passes.length === 0 || !passes.every(isValidPass)) {
    throw new Error("El JSON debe ser un arreglo no vacío de registros con campos y valores válidos.");
  }
  return passes;
}

async function loadDashboard() {
  bindControls();
  const [dataResult] = await Promise.allSettled([
    loadPasses(),
    loadVisualizationLibraries(),
  ]);

  if (window.L) {
    try {
      initializeMap();
    } catch (error) {
      showMapError(`No se pudo inicializar Leaflet: ${error.message}`);
      elements.heatToggle.disabled = true;
    }
  } else {
    showMapError(state.libraryErrors.leaflet || "Leaflet no cargó. Revisa conexión / CDN");
    elements.heatToggle.disabled = true;
  }

  initializeChartSections();
  if (dataResult.status === "rejected") {
    showDataError(`No se pudieron cargar los datos: ${dataResult.reason.message}`);
    console.error("Error al cargar PlasTrack:", dataResult.reason);
    state.allPasses = [];
    state.filteredPasses = [];
    elements.subtitle.textContent = "No se pudo cargar el archivo de pasadas simuladas.";
    elements.updated.textContent = "Fecha del dataset: —";
    initializeLocationFilter([]);
    renderDashboard([]);
    return;
  }

  const passes = dataResult.value;
  state.allPasses = passes;
  state.filteredPasses = [...passes];
  const latestDate = passes.reduce((latest, pass) => (
    pass.fecha > latest ? pass.fecha : latest
  ), passes[0].fecha);
  elements.subtitle.textContent = `${passes.length} pasadas satelitales simuladas tipo Copernicus sobre Galápagos`;
  elements.updated.textContent = `Última fecha del dataset: ${latestDate}`;

  initializeLocationFilter(passes);
  renderDashboard(state.filteredPasses);
}

loadDashboard();
