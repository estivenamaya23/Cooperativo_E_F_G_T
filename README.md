# PlasTrack

Dashboard web estático para explorar 15 pasadas satelitales **simuladas** sobre las islas Galápagos. Los valores incluidos son únicamente de ejemplo: no representan observaciones satelitales reales ni productos oficiales de Copernicus.

## Abrir el dashboard en tu computadora

1. Descarga o clona este repositorio.
2. Desde la carpeta del proyecto, inicia un servidor estático local:

   ```bash
   python3 -m http.server 8000
   ```

3. Abre <http://localhost:8000> en tu navegador.

No hay backend ni pasos de compilación. Se necesita conexión a internet para descargar Leaflet, Leaflet.heat, Chart.js y los mosaicos del mapa desde sus CDN/proveedores. Si abres `index.html` directamente como archivo, el navegador puede bloquear la carga del JSON; usa el servidor estático indicado.

## Datos

El dashboard carga `data_copernicus_sample.json` mediante una ruta relativa. Cada registro debe tener esta estructura:

```json
{
  "id": "P01",
  "fecha": "2026-10-01",
  "satelite": "Sentinel-2A",
  "latitud": -0.72,
  "longitud": -90.31,
  "nubosidad_pct": 12,
  "aptitud_sensor_pct": 91
}
```

Para reemplazar la muestra simulada por el archivo oficial de la clase:

1. Conserva una copia de la muestra, si la necesitas.
2. Reemplaza el contenido de `data_copernicus_sample.json` por el JSON oficial. Debe ser un arreglo de registros con los campos y tipos indicados arriba; la fecha debe usar `AAAA-MM-DD` y los porcentajes deben ser números entre 0 y 100.
3. No incluyas credenciales, tokens ni datos que no deban publicarse en un repositorio público.
4. Recarga el dashboard. Las tarjetas, los marcadores, la capa de calor y el gráfico se calculan a partir del contenido cargado.

El umbral de pasada apta es una aptitud del sensor de **70 % o más**.

## Publicar en GitHub Pages

1. Añade estos archivos al repositorio y súbelos a GitHub mediante tu flujo habitual: `index.html`, `styles.css`, `app.js`, `data_copernicus_sample.json`, `README.md`, `docs/reporte-tecnico.md`, `docs/presentacion-plastrack.pptx` y `BITACORA_IA.md`.
2. En la página del repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama que contiene estos archivos y la carpeta raíz (`/`) como origen; guarda los cambios.
5. Espera a que GitHub Pages complete la publicación y consulta la URL que aparece en **Settings → Pages**.

Este repositorio queda preparado para ese flujo; estas instrucciones no implican que el sitio ya esté publicado. El mapa base y las bibliotecas se obtienen de servicios externos, sujetos a disponibilidad y a sus condiciones de uso.

## Archivos

- `index.html`, `styles.css`, `app.js`: interfaz y lógica del dashboard.
- `data_copernicus_sample.json`: 15 registros sintéticos de demostración.
- `docs/reporte-tecnico.md`: comparación de alternativas tecnológicas.
- `docs/presentacion-plastrack.pptx`: presentación de 10 diapositivas con notas del expositor y preguntas para la defensa.
- `BITACORA_IA.md`: prompt y registro del apoyo de IA.
