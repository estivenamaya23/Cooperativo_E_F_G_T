"use strict";

const DATA_URL = "data_copernicus_sample.json";
const SUITABILITY_THRESHOLD = 70;
const galapagosCenter = [-0.739, -90.31];
const CDN_URLS = {
  leaflet: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  heat: "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js",
  chart: "https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js",
};

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
  map: document.getElementById("map"),
  tableBody: document.getElementById("passes-table-body"),
};

const state = {
  allPasses: [],
  filteredPasses: [],
  zoneField: null,
  map: null,
  markerLayer: null,
  heatLayer: null,
  charts: { cloud: null, fitness: null },
};
const dataErrors = new Set();

function showDataError(message) {
  dataErrors.add(message);
  elements.dataError.textContent = [...dataErrors].join(" ");
  elements.dataError.hidden = false;
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
  try {
    if (!window.L) {
      await loadScript(CDN_URLS.leaflet);
    }
    if (!window.L.heatLayer) {
      await loadScript(CDN_URLS.heat);
    }
  } catch (error) {
    showDataError(`Mapa/capa de calor no disponible: ${error.message}`);
  }

  try {
    if (!window.Chart) {
      await loadScript(CDN_URLS.chart);
    }
  } catch (error) {
    showDataError(`Gráficos no disponibles: ${error.message}`);
  }
}

function showFilterError(message) {
  elements.filterError.textContent = message;
  elements.filterError.hidden = !message;
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

function average(passes, field) {
  if (passes.length === 0) {
    return null;
  }

  return passes.reduce((sum, pass) => sum + pass[field], 0) / passes.length;
}

function formatLocation(pass) {
  const location = state.zoneField ? pass[state.zoneField] : null;
  return typeof location === "string" && location.trim() ? location : "No incluida en el JSON";
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

  elements.kpiTotal.textContent = passes.length.toLocaleString("es-ES");
  elements.kpiCloud.textContent = formatPercent(average(passes, "nubosidad_pct"));
  elements.kpiFitness.textContent = formatPercent(average(passes, "aptitud_sensor_pct"));
  elements.kpiSuitable.textContent = passes
    .filter((pass) => pass.aptitud_sensor_pct >= SUITABILITY_THRESHOLD)
    .length.toLocaleString("es-ES");
  elements.kpiBest.textContent = `${bestPass.fecha} · ${bestPass.id}`;
  elements.kpiBestHint.textContent = `Lugar: ${formatLocation(bestPass)}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

function markerColor(pass) {
  if (pass.aptitud_sensor_pct >= 70) {
    return "#23845b";
  }
  if (pass.aptitud_sensor_pct >= 40) {
    return "#d29a16";
  }
  return "#c6473c";
}

function createPopup(pass) {
  return `
    <div class="popup-title">${escapeHtml(pass.id)} · ${escapeHtml(pass.satelite)}</div>
    <div>Fecha: ${escapeHtml(pass.fecha)}</div>
    <div>Isla/Zona: ${escapeHtml(formatLocation(pass))}</div>
    <div>Nubosidad: ${formatPercent(pass.nubosidad_pct)}</div>
    <div>Aptitud: ${formatPercent(pass.aptitud_sensor_pct)}</div>
    <div>ID pasada: ${escapeHtml(pass.id)}</div>
  `;
}

function initializeMap() {
  const leaflet = window.L;
  if (!leaflet) {
    throw new Error("Leaflet no está disponible. Comprueba la conexión al CDN.");
  }

  state.map = leaflet.map(elements.map).setView(galapagosCenter, 7);
  leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(state.map).on("tileerror", () => {
    showDataError("No se pudieron cargar los mosaicos del mapa. Los marcadores pueden seguir disponibles.");
  });

  state.markerLayer = leaflet.layerGroup().addTo(state.map);
  if (typeof leaflet.heatLayer === "function") {
    state.heatLayer = leaflet.heatLayer([], {
      radius: 28,
      blur: 22,
      maxZoom: 11,
      gradient: { 0.2: "#39b6c4", 0.55: "#ffdb55", 0.85: "#ed5542" },
    });
    if (elements.heatToggle.checked) {
      state.heatLayer.addTo(state.map);
    }
  } else {
    elements.heatToggle.disabled = true;
    showDataError("Leaflet.heat no está disponible. El mapa y los marcadores se mostrarán sin la capa de calor.");
  }

  elements.map.classList.remove("map-unavailable");
}

function updateMap(passes) {
  if (!state.map || !state.markerLayer) {
    return;
  }

  state.markerLayer.clearLayers();
  const markers = [];

  for (const pass of passes) {
    const marker = window.L.circleMarker([pass.latitud, pass.longitud], {
      radius: 8,
      color: "#ffffff",
      weight: 2,
      fillColor: markerColor(pass),
      fillOpacity: 0.95,
    }).bindPopup(createPopup(pass));
    marker.addTo(state.markerLayer);
    markers.push(marker);
  }

  if (state.heatLayer) {
    state.heatLayer.setLatLngs(passes.map((pass) => [
      pass.latitud,
      pass.longitud,
      pass.aptitud_sensor_pct / 100,
    ]));
  }

  if (markers.length > 1) {
    state.map.fitBounds(window.L.featureGroup(markers).getBounds().pad(0.2), { maxZoom: 8 });
  } else if (markers.length === 1) {
    state.map.setView([passes[0].latitud, passes[0].longitud], 8);
  } else {
    state.map.setView(galapagosCenter, 7);
  }
}

function renderTable(passes) {
  elements.tableBody.replaceChildren();

  if (passes.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "table-empty";
    cell.textContent = "Sin datos para el filtro seleccionado.";
    row.append(cell);
    elements.tableBody.append(row);
    return;
  }

  for (const pass of passes) {
    const row = document.createElement("tr");
    const values = [
      pass.fecha,
      formatLocation(pass),
      formatPercent(pass.nubosidad_pct),
      formatPercent(pass.aptitud_sensor_pct),
    ];

    for (const value of values) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }

    const statusCell = document.createElement("td");
    const suitable = pass.aptitud_sensor_pct >= SUITABILITY_THRESHOLD;
    const status = document.createElement("span");
    status.className = suitable ? "status status-good" : "status status-low";
    status.textContent = suitable ? "Apta" : "No apta";
    statusCell.append(status);
    row.append(statusCell);

    const idCell = document.createElement("td");
    idCell.textContent = pass.id;
    row.append(idCell);
    elements.tableBody.append(row);
  }
}

function updateChart(kind, passes) {
  const chartState = state.charts[kind];
  const canvas = document.getElementById(`chart-${kind}`);
  const emptyMessage = document.getElementById(`chart-${kind}-empty`);
  const field = kind === "cloud" ? "nubosidad_pct" : "aptitud_sensor_pct";
  const label = kind === "cloud" ? "Nubosidad" : "Aptitud";

  if (passes.length === 0) {
    if (state.charts[kind]) {
      state.charts[kind].destroy();
      state.charts[kind] = null;
    }
    canvas.hidden = true;
    emptyMessage.hidden = false;
    return;
  }

  canvas.hidden = false;
  emptyMessage.hidden = true;
  const sortedPasses = [...passes].sort((first, second) => first.fecha.localeCompare(second.fecha));
  const labels = sortedPasses.map((pass) => pass.fecha);
  const values = sortedPasses.map((pass) => pass[field]);

  if (chartState) {
    chartState.data.labels = labels;
    chartState.data.datasets[0].data = values;
    chartState.update();
    return;
  }

  if (!window.Chart) {
    throw new Error("Chart.js no está disponible. Comprueba la conexión al CDN.");
  }

  state.charts[kind] = new window.Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        borderColor: kind === "cloud" ? "#3478b8" : "#087e83",
        backgroundColor: kind === "cloud" ? "#3478b8" : "#087e83",
        pointBackgroundColor: "#ffffff",
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
    state.filteredPasses = state.allPasses.filter((pass) => {
      const inDateRange = (!from || pass.fecha >= from) && (!to || pass.fecha <= to);
      const inLocation = !state.zoneField || !selectedLocation || pass[state.zoneField] === selectedLocation;
      return inDateRange && inLocation;
    });

    showFilterError("");
    renderDashboard(state.filteredPasses);
  } catch (error) {
    showFilterError(error.message);
  }
}

function renderDashboard(passes) {
  renderKpis(passes);
  renderTable(passes);

  try {
    updateMap(passes);
  } catch (error) {
    showDataError(`No se pudo actualizar el mapa: ${error.message}`);
  }

  for (const kind of ["cloud", "fitness"]) {
    try {
      updateChart(kind, passes);
    } catch (error) {
      document.getElementById(`chart-${kind}`).hidden = true;
      document.getElementById(`chart-${kind}-empty`).textContent = error.message;
      document.getElementById(`chart-${kind}-empty`).hidden = false;
      showDataError(error.message);
    }
  }
}

function initializeLocationFilter(passes) {
  state.zoneField = ["isla", "zona"].find((field) => passes.some((pass) => (
    typeof pass[field] === "string" && pass[field].trim()
  ))) || null;

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
}

async function loadDashboard() {
  try {
    // DATOS SIMULADOS - FINES ACADÉMICOS: el JSON local es una muestra sintética.
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`${DATA_URL} no está disponible (HTTP ${response.status}).`);
    }

    const passes = await response.json();
    if (!Array.isArray(passes) || passes.length === 0 || !passes.every(isValidPass)) {
      throw new Error("El JSON debe ser un arreglo no vacío de registros con campos y valores válidos.");
    }

    await loadVisualizationLibraries();
    state.allPasses = passes;
    state.filteredPasses = [...passes];
    const latestDate = passes.reduce((latest, pass) => pass.fecha > latest ? pass.fecha : latest, passes[0].fecha);
    elements.subtitle.textContent = `${passes.length} pasadas satelitales simuladas tipo Copernicus sobre Galápagos`;
    elements.updated.textContent = `Última fecha del dataset: ${latestDate}`;

    initializeLocationFilter(passes);
    bindControls();

    try {
      initializeMap();
    } catch (error) {
      elements.map.classList.add("map-unavailable");
      elements.map.textContent = "Mapa no disponible.";
      elements.heatToggle.disabled = true;
      showDataError(`Mapa no disponible: ${error.message}`);
    }

    renderDashboard(state.filteredPasses);
  } catch (error) {
    showDataError(`No se pudieron cargar los datos: ${error.message}`);
    console.error("Error al cargar PlasTrack:", error);
  }
}

loadDashboard();
