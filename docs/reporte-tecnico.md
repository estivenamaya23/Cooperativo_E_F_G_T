# Reporte técnico: selección de tecnología para PlasTrack

## Comparación de alternativas

| Criterio | Power BI | Looker Studio | JavaScript (Leaflet.js y Chart.js) |
|---|---|---|---|
| Facilidad de uso | Interfaz visual para crear informes. Modelado de datos y administración pueden requerir aprendizaje. | Interfaz visual orientada a informes y colaboración; la curva depende de la fuente y del diseño. | Requiere conocimientos básicos de HTML, CSS y JavaScript. No ofrece un editor visual, pero permite controlar la interfaz en código. |
| Integración JSON/CSV | Integra fuentes mediante conectores; JSON puede requerir transformación o preparación según su estructura. | Integra fuentes y conectores compatibles; JSON puede requerir un conector o conversión previa. | `fetch` carga directamente el JSON estático del proyecto. CSV requeriría agregar un analizador o convertirlo a JSON. |
| Mapas y geoespacial | Incluye visualizaciones geográficas; capacidades y disponibilidad dependen de la configuración y del visual utilizado. | Ofrece visualizaciones geográficas para campos compatibles; la personalización geoespacial avanzada puede ser limitada. | Leaflet aporta mapas, marcadores y popups; Leaflet.heat representa la acumulación espacial de pasadas. |
| Gráficos | Ofrece distintos tipos de visualización configurables desde el entorno de informes. | Ofrece gráficos configurables desde el editor de informes, según la fuente y sus capacidades. | Chart.js crea gráficos en el navegador; este dashboard presenta dos series calculadas directamente desde el JSON. |
| Rendimiento web | Depende del modelo, las consultas, el servicio y la complejidad del informe. | Depende de la fuente, las consultas, los conectores y la carga del informe servido por la plataforma. | Los archivos se sirven estáticamente, sin servidor de aplicación. El navegador descarga bibliotecas y mosaicos; el rendimiento depende del volumen y de servicios externos. |
| Costos/licencias | Verificar planes, licencias, capacidad y condiciones vigentes de Microsoft; no se indican precios exactos. | Verificar planes, conectores y condiciones vigentes de Google y terceros; no se indican precios exactos. | Verificar las licencias y términos vigentes de las bibliotecas, CDN y proveedor de mapas. Los costos o límites de servicios externos pueden cambiar; no se indican precios exactos. |
| Ajuste a este proyecto | Adecuado para informes empresariales, pero agrega una plataforma de BI para un sitio estático pequeño. | Adecuado para informes compartibles, aunque la carga directa de este JSON y el mapa personalizado pueden requerir configuración adicional. | Se ajusta al requisito: publica HTML, CSS, JS y JSON en GitHub Pages sin backend ni compilación y permite personalizar mapa y gráfico. |

## Justificación de la elección

Se elige JavaScript con Leaflet.js y Chart.js porque el objetivo es un dashboard pequeño y estático que lea un JSON local al sitio, muestre un mapa interactivo y gráficos calculados en el navegador. HTML, CSS y JavaScript permiten publicar los archivos directamente en GitHub Pages sin backend ni compilación, y evitan depender de un servicio de BI para la visualización.

Esta decisión requiere mantener el código y depender de CDN y mosaicos externos para las bibliotecas y el mapa base. El archivo incluido contiene únicamente datos sintéticos para demostración. Si se reemplaza por el archivo oficial de la clase, se debe conservar el esquema documentado y comprobar las condiciones aplicables a esos datos antes de publicarlos. Las características, planes, licencias y términos de los servicios pueden cambiar; deben verificarse en sus fuentes oficiales vigentes antes de elegirlos para otro uso.
