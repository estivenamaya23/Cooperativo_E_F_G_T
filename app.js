"use strict";

const SUITABILITY_THRESHOLD = 70;
const DATA_URL = "data_copernicus_sample.json";
const galapagosCenter = [-0.75, -90.35];

const errorElement = document.getElementById("data-error");
let map;
let chart;

function showError(message) {
  errorElement.textContent = message;
  errorElement.hidden = false;
}

function isValidPass(pass) {
  return pass !== null
    && typeof pass === "object"
    && typeof pass.id === "string"
    && typeof pass.satelite === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(pass.fecha)
    && Number.isFinite(Date.parse(`${pass.fecha}T00:00:00Z`))
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
  return `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`;
}

function renderKpis(passes) {
  const average = (field) => passes.reduce((sum, pass) => sum + pass[field], 0) / passes.length;
  const suitableCount = passes.filter((pass) => pass.aptitud_sensor_pct >= SUITABILITY_THRESHOLD).length;

  document.getElementById("kpi-total").textContent = passes.length.toLocaleString("es-ES");
  document.getElementById("kpi-cloud").textContent = formatPercent(average("nubosidad_pct"));
  document.getElementById("kpi-suitability").textContent = formatPercent(average("aptitud_sensor_pct"));
  document.getElementById("kpi-suitable").textContent = suitableCount.toLocaleString("es-ES");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

function renderMap(passes) {
  if (!window.L || typeof L.heatLayer !== "function") {
    throw new Error("No se pudieron cargar Leaflet o Leaflet.heat desde el CDN.");
  }

  map = L.map("map", { zoomControl: false }).setView(galapagosCenter, 7);
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri — Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 19,
  }).addTo(map);
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
    attribution: "&copy; Esri",
    maxZoom: 19,
  }).addTo(map);
  L.control.zoom({ position: "topright" }).addTo(map);
  L.control.scale({ position: "bottomleft", metric: true, imperial: false, maxWidth: 120 }).addTo(map);

  const heatPoints = passes.map((pass) => [pass.latitud, pass.longitud, 0.65]);
  L.heatLayer(heatPoints, {
    radius: 28,
    blur: 22,
    maxZoom: 11,
    gradient: { 0.2: "#39b6c4", 0.55: "#ffdb55", 0.85: "#ed5542" },
  }).addTo(map);

  const markers = passes.map((pass) => {
    const suitable = pass.aptitud_sensor_pct >= SUITABILITY_THRESHOLD;
    const statusClass = suitable ? "" : " low";
    const status = suitable ? "Apta" : "Bajo umbral";
    const popup = `
      <div class="popup-title">${escapeHtml(pass.id)} · ${escapeHtml(pass.satelite)}</div>
      <div>Fecha: ${escapeHtml(pass.fecha)}</div>
      <div>Nubosidad: ${formatPercent(pass.nubosidad_pct)}</div>
      <div>Aptitud del sensor: ${formatPercent(pass.aptitud_sensor_pct)}</div>
      <span class="popup-status${statusClass}">${status} (umbral ${SUITABILITY_THRESHOLD} %)</span>
    `;

    return L.circleMarker([pass.latitud, pass.longitud], {
      radius: 8,
      color: "#ffffff",
      weight: 2.5,
      fillColor: suitable ? "#23845b" : "#bf7423",
      fillOpacity: 1,
      className: suitable ? "pass-marker--suitable" : "pass-marker--low",
    }).bindPopup(popup, { maxWidth: 250 }).addTo(map);
  });

  if (markers.length > 1) {
    const bounds = L.featureGroup(markers).getBounds();
    map.fitBounds(bounds.pad(0.3), { maxZoom: 7 });
  }
}

function renderChart(passes) {
  if (!window.Chart) {
    throw new Error("No se pudo cargar Chart.js desde el CDN.");
  }

  const sortedPasses = [...passes].sort((first, second) => first.fecha.localeCompare(second.fecha));
  const labels = sortedPasses.map((pass) => pass.fecha);
  const context = document.getElementById("passes-chart");

  chart = new Chart(context, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Nubosidad",
          data: sortedPasses.map((pass) => pass.nubosidad_pct),
          borderColor: "#3478b8",
          backgroundColor: "#3478b8",
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#3478b8",
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.28,
        },
        {
          label: "Aptitud del sensor",
          data: sortedPasses.map((pass) => pass.aptitud_sensor_pct),
          borderColor: "#087e83",
          backgroundColor: "#087e83",
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#087e83",
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.28,
        },
      ],
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
            label: (contextItem) => `${contextItem.dataset.label}: ${formatPercent(contextItem.parsed.y)}`,
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

async function loadDashboard() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`El archivo ${DATA_URL} no está disponible (HTTP ${response.status}).`);
    }

    const passes = await response.json();
    if (!Array.isArray(passes) || passes.length === 0 || !passes.every(isValidPass)) {
      throw new Error("El JSON debe ser un arreglo no vacío con todos los campos y valores válidos del formato documentado.");
    }

    if (!window.L || !window.Chart) {
      throw new Error("No se pudieron cargar las bibliotecas del dashboard. Revisa tu conexión a internet e inténtalo de nuevo.");
    }

    renderKpis(passes);
    renderMap(passes);
    renderChart(passes);
  } catch (error) {
    showError(`No se pudo cargar el dashboard: ${error.message}`);
    console.error("Error al inicializar PlasTrack:", error);
  }
}

loadDashboard();
