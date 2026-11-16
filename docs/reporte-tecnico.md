# PlasTrack: benchmarking y decisión de visualización

## Alcance y datos inspeccionados

Este es un prototipo académico, estático y sin backend. **DATOS SIMULADOS - FINES ACADÉMICOS:** los valores no son observaciones satelitales reales ni productos oficiales de Copernicus.

Se inspeccionó `data_copernicus_sample.json`: tiene 15 registros con los campos `id`, `fecha`, `satelite`, `latitud`, `longitud`, `nubosidad_pct` y `aptitud_sensor_pct`. No contiene `isla` ni `zona`; no se asignaron nombres de islas ficticios. El filtro geográfico queda inactivo y los campos de presentación indican que esa dimensión no está en la fuente.

## Matriz comparativa

| Criterio | Power BI | Looker Studio / Data Studio | Leaflet.js + Chart.js |
|---|---|---|---|
| **Capas geoespaciales / calor** | Azure Maps acepta campos de latitud y longitud y dispone de visualización de mapas. La documentación consultada describe puntos/burbujas; el soporte nativo específico para una capa heatmap en la configuración considerada: **no verificado**. Con 15 puntos el conjunto es pequeño; rendimiento a 10.000: **no verificado**. | Geo charts requieren una dimensión geográfica y métrica y muestran regiones o marcadores. Un heatmap de densidad de puntos arbitrarios: **no verificado** en la documentación consultada. El límite publicado para Geo charts es 5.000 filas; 10.000 registros requieren filtrar/agregar o usar otra visualización. | Leaflet muestra teselas OSM y marcadores en coordenadas; círculos `L.circle` coloreados por nubosidad representan zonas simuladas con radio proporcional al porcentaje y pueden ocultarse independientemente de los marcadores. No son áreas medidas. Capacidad y rendimiento a 10.000 círculos: **no verificado**. |
| **Integración Copernicus JSON / CSV** | Power BI Desktop: **Obtener datos → JSON**, seleccionar archivo; Power Query detecta y aplana tablas, y se puede transformar y cargar. Para una URL JSON documentada, Power Query indica usar el conector Web. No equivale por sí mismo a una integración autenticada con API de Copernicus; API específica, credenciales y actualización: **no verificado**. CSV puede importarse por conectores documentados. | El conector oficial documentado permite subir CSV a un dataset, tras iniciar sesión y crear una fuente. La carga CSV se documenta como gratuita y sus datasets se almacenan en Cloud Storage; la característica puede estar en despliegue gradual. Importar directamente este JSON local o una API Copernicus desde conectores estándar: **no verificado**. Conversión JSON→CSV o conector compatible sería necesaria si no hay fuente adecuada. | `fetch("data_copernicus_sample.json")` carga directamente el archivo local al sitio; sin conversión ni API. CSV requeriría agregar parser o convertirlo. Para correr localmente debe servirse por HTTP y no abrirse como `file://`. |
| **Costos de licenciamiento** | **Freemium**, según página oficial: cuenta gratuita para crear; compartir/publicar reportes puede requerir Pro o Premium según el escenario. No se incluyen precios. Costos/condiciones de Azure Maps o uso a escala: **no verificado** para este caso. | **Gratuito** según documentación oficial de Data Studio y de la carga CSV. Requiere iniciar sesión para crear la fuente CSV. Costos, límites y permisos de compartir para cada audiencia: verificar planes/condiciones vigentes; no se presuponen. | Leaflet se distribuye con licencia BSD-2-Clause y Chart.js con MIT. El CDN no tiene costo o límite de servicio aquí verificado. Datos OSM abiertos no significan que los servidores públicos de teselas sean ilimitados: servicio best-effort y capacidad limitada. GitHub Pages, su elegibilidad y límites deben revisarse según condiciones vigentes; no se atribuye costo cero a servicios externos sin verificación. |
| **Usabilidad / curva de aprendizaje** | Editor drag-and-drop para visuales; importación, modelado y actualización de fuentes requieren familiarizarse con Power Query y el modelo. Tiempo para MVP: **no verificado**; depende de la experiencia y la fuente. | Editor visual drag-and-drop y configuración de conectores, dimensiones y métricas. La importación CSV añade pasos; acceso requiere inicio de sesión para crear la fuente. Tiempo para MVP: **no verificado**. | Requiere HTML, CSS y JavaScript; ofrece control fino de interfaz, filtros y capas. Tiempo para MVP: **no verificado**, pues depende del equipo. |
| **Rendimiento web / peso / carga** | Servicio y visualizaciones dependen de infraestructura y configuración de Power BI/Azure. Comparación controlada o peso del producto para este dataset: **no verificado**. Los mapas usan recursos remotos. | Se procesa/visualiza desde el servicio, según fuente y consulta. Comparación controlada o peso del producto: **no verificado**. Carga CSV documentada almacena datasets en Cloud Storage. | El mapa y bibliotecas se descargan desde CDN/proveedor; los datos son estáticos. No se hizo prueba comparativa controlada ni de tiempo de carga. El dashboard dibuja un marcador y un círculo por registro; rendimiento a 10.000 registros y en distintos dispositivos: **no verificado**. |
| **Personalización / control del código** | Personalización visual mediante campos, panel de formato y visuales; control detallado de la aplicación queda en la plataforma. | Personalización visual y campos calculados desde el editor; control sujeto a tipos de visual y conectores disponibles. | HTML/CSS/JS editables; control directo de colores, tooltip, interacciones, filtros y lógica. El mantenimiento del código recae en el equipo. |
| **Trabajo offline / sin cuenta** | Power BI Desktop puede trabajar con archivos locales, pero publicación y mapas online dependen de servicios. Flujo completo sin cuenta/red: **no verificado**. | Crear fuentes CSV requiere iniciar sesión. Trabajo offline y requisitos de cuenta para visualizar/compartir en cada escenario: **no verificado**. | El JSON queda en el sitio, pero la configuración actual carga bibliotecas de CDN y teselas OSM externas: no funciona completamente offline. Se podría valorar autohospedar recursos/mapas, sujeto a licencias y alcance, no implementado. |
| **Despliegue / compartir** | Compartir reportes desde Power BI depende del método de publicación, licencias y audiencia; compartir sin licencias: consultar requisitos vigentes. No es una publicación directa del HTML/JSON en GitHub Pages. | Compartir se realiza desde el servicio mediante permisos/fuentes. Exportar el reporte como aplicación estática propia: no verificado. | Archivos estáticos pueden servirse desde GitHub Pages, que admite HTML/CSS/JS del repositorio. La URL del repositorio respondió HTTP 200 al revisarse el 16-11-2026 antes de estos cambios; la versión actual no se ha publicado. Settings/Actions y disponibilidad posterior: no verificados. |

### Fuentes oficiales consultadas

- Microsoft Power Query, conector JSON: <https://learn.microsoft.com/en-us/power-query/connectors/json>
- Microsoft Azure Maps para Power BI, inicio, datos de latitud/longitud y visual: <https://learn.microsoft.com/en-us/azure/azure-maps/power-bi-visual-get-started>
- Microsoft, planes Power BI: <https://www.microsoft.com/en-us/microsoft-fabric/features/power-bi/pricing>
- Google Data Studio, documentación del producto y descripción no-cost: <https://docs.cloud.google.com/data-studio/>
- Google Data Studio, carga CSV, pasos, almacenamiento y despliegue gradual: <https://docs.cloud.google.com/data-studio/upload-csv-files>
- Google Data Studio, Geo charts, dimensión geográfica y límite de filas: <https://docs.cloud.google.com/data-studio/geo-chart-reference>
- Leaflet: <https://leafletjs.com/> · licencia BSD-2-Clause: <https://raw.githubusercontent.com/Leaflet/Leaflet/main/LICENSE>
- Chart.js: <https://www.chartjs.org/docs/latest/> · licencia MIT: <https://github.com/chartjs/Chart.js/blob/master/LICENSE.md>
- GitHub Pages: <https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages>
- Política oficial de teselas OSM: <https://operations.osmfoundation.org/policies/tiles/>
- Licencia y atribución OSM: <https://www.openstreetmap.org/copyright>

Fuentes consultadas el 16 de noviembre de 2026. Si un producto, plan o proveedor cambia, las características y condiciones deben volver a verificarse. Las estimaciones de tiempo, comparaciones de rendimiento y escalabilidad no medidas se marcan como **no verificado**.

## Decisión para este proyecto

Se elige **Leaflet.js + Chart.js** para este caso de 15 pasadas simuladas, dataset JSON local, presupuesto no especificado y destino estático.
1. `fetch()` consume el archivo que ya existe sin convertirlo a CSV ni llevarlo a un servicio BI.
2. Leaflet dibuja coordenadas y permite popups; círculos `L.circle` con radio proporcional a nubosidad aportan una capa visual de acumulación con un toggle independiente.
3. Chart.js permite separar las tendencias de nubosidad y aptitud y actualizarlas al cambiar el rango de fechas.
4. HTML/CSS/JS se publican junto al JSON en GitHub Pages, sin backend ni paso de compilación.
5. El equipo conserva el control del código y no tiene que modelar una fuente en una plataforma externa para este prototipo.
6. La contrapartida es mantener el código y depender de CDN y teselas externas.

La decisión no significa que sea superior en general. No se incorporan campos `isla`/`zona`, porque la fuente inspeccionada no los tiene. Mejor pasada se expresa con fecha e ID; el lugar se indica como no incluido.

## Verificación de ejecución

Desde la raíz del repositorio:

```bash
python3 -m json.tool data_copernicus_sample.json
python3 -m http.server 8000
```

Abrir <http://localhost:8000>. Comprobaciones ejecutadas para esta entrega: `node --check app.js`, parseo JSON, validación automatizada de fechas límite y prueba de mensajes para JSON 404/inválido/vacío y CDN ausente. La interacción visual en navegador real y pruebas a 360 px / 1280 px: **no verificado** en este entorno.
