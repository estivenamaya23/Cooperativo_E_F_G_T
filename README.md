# PlasTrack - Galápagos

Dashboard web estático para explorar 15 pasadas satelitales simuladas tipo Copernicus sobre Galápagos.

> **DATOS SIMULADOS - FINES ACADÉMICOS.** El JSON incluido es sintético; no contiene observaciones satelitales reales ni productos oficiales de Copernicus.

## Abrir localmente

Desde la raíz del repositorio:

```bash
python3 -m json.tool data_copernicus_sample.json
python3 -m http.server 8000
```

Abre <http://localhost:8000>. Se requiere conexión a internet para descargar Leaflet, Leaflet.heat, Chart.js y los mosaicos del mapa base de OpenStreetMap. Abrir `index.html` directamente como archivo puede bloquear `fetch()` del JSON.

## Datos que usa el dashboard

Se verificaron los campos del archivo: `id`, `fecha`, `satelite`, `latitud`, `longitud`, `nubosidad_pct` y `aptitud_sensor_pct`. **No hay campos `isla` ni `zona`**; por ello, el filtro Isla/Zona queda desactivado, y las ubicaciones se muestran como “No incluida en el JSON”. No se inventan localizaciones.

Los KPI, la tabla, los marcadores y los dos gráficos leen el archivo local. El filtro por fecha valida fechas de calendario reales en formato `AAAA-MM-DD`; una pasada es apta cuando su aptitud es de 70 % o más. El toggle de calor muestra una capa ponderada por aptitud simulada, no concentración física observada. La fecha más reciente que se muestra se deriva de la fecha mayor del dataset, no del momento de modificación del archivo.

Para reemplazar el ejemplo por datos oficiales de la clase, conserva una copia del JSON y reemplaza el arreglo por registros compatibles. Revisa primero sus nombres de campo, tipos, unidades, coordenadas y permiso de publicación. Si el nuevo archivo no incluye `isla` o `zona`, la interfaz informará que esa dimensión no está disponible. No publiques credenciales ni datos con restricciones.

## Publicar en GitHub Pages

El proyecto usa la estructura existente en la raíz: `index.html`, `styles.css`, `app.js` y `data_copernicus_sample.json`; no requiere backend ni build. Para publicar cambios, selecciona en GitHub **Settings → Pages → Deploy from a branch**, elige una rama y la carpeta raíz (`/`), y espera el resultado en **Actions**.

La URL configurada en la documentación anterior respondió HTTP 200 el 16 de noviembre de 2026, antes de estos cambios locales. Esta versión modificada no se ha publicado porque no se hizo commit ni push. La configuración actual de Pages/Actions y la disponibilidad futura están **no verificadas**.

El mapa usa teselas estándar de OpenStreetMap con atribución enlazada a la licencia. Sus servidores públicos son best-effort, tienen capacidad limitada y política de uso; no son un servicio de teselas ilimitado. Revisa las condiciones antes de escalar el uso.

## Estructura existente

- `index.html`: interfaz y referencias CDN.
- `styles.css`: diseño adaptable.
- `app.js`: carga y validación del JSON, filtros, KPI, mapa y gráficos.
- `data_copernicus_sample.json`: 15 registros sintéticos, no modificados.
- `docs/reporte-tecnico.md`: benchmarking y decisión técnica.
- `BITACORA_IA.md`: registro del uso de IA.
