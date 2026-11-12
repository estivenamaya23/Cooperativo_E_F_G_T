# PlasTrack

Dashboard web estático para explorar 15 pasadas satelitales **simuladas** sobre las islas Galápagos. Los valores incluidos son únicamente de ejemplo: no representan observaciones satelitales reales ni productos oficiales de Copernicus.

**Sitio publicado:** [https://estivenamaya23.github.io/Cooperativo_E_F_G_T/](https://estivenamaya23.github.io/Cooperativo_E_F_G_T/)

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

## Publicación en GitHub Pages

El proyecto está publicado desde la rama `main` y la carpeta raíz (`/`). Para comprobar la configuración, abre **Settings → Pages** en el repositorio. Al subir cambios a `main`, GitHub Pages vuelve a desplegar el sitio; revisa **Actions → pages build and deployment** y espera a que el flujo termine correctamente.

La URL pública es [https://estivenamaya23.github.io/Cooperativo_E_F_G_T/](https://estivenamaya23.github.io/Cooperativo_E_F_G_T/). Se verificó que la página, el JSON de muestra, JavaScript y CSS responden. El mapa base, las etiquetas y bibliotecas se obtienen de servicios externos y dependen de su disponibilidad y condiciones de uso.

## Archivos

- `index.html`, `styles.css`, `app.js`: interfaz y lógica del dashboard.
- `data_copernicus_sample.json`: 15 registros sintéticos de demostración.
- `docs/reporte-tecnico.md`: comparación de alternativas tecnológicas.
- `docs/presentacion-plastrack.pptx`: presentación de 10 diapositivas con notas del expositor y preguntas para la defensa.
- `BITACORA_IA.md`: prompt y registro del apoyo de IA.
