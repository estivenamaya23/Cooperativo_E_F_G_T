# Benchmarking de herramientas BI para el prototipo PlasTrack

**Actividad Cooperativa — Unidad 1: benchmarking de herramientas de BI y prototipado del dashboard PlasTrack con IA**
**Universidad Técnica de Cotopaxi**

## Resumen

Este trabajo compara Power BI, Looker Studio y una implementación web con JavaScript (Leaflet.js y Chart.js) para el caso académico PlasTrack: visualizar pasadas satelitales simuladas sobre Galápagos. La comparación considera integración de datos JSON/CSV, capacidades geográficas, gráficos, facilidad de uso, publicación/rendimiento web y costos/licencias. Se eligió JavaScript porque el requisito es un sitio estático, sin backend, que lea un JSON junto al proyecto y permita personalizar un mapa interactivo. El prototipo se publica en GitHub Pages y presenta KPI, marcadores, densidad espacial y tendencias. Sus 15 registros son sintéticos; no representan mediciones de Copernicus ni sostienen conclusiones ambientales.

**Palabras clave:** inteligencia de negocios, visualización geográfica, Leaflet, Chart.js, GitHub Pages, datos sintéticos.

## 1. Introducción

Las herramientas de BI y las bibliotecas web resuelven necesidades parcialmente distintas. Una plataforma BI facilita la creación de informes visuales y su conexión con fuentes; una biblioteca web ofrece más control sobre la interfaz y el comportamiento, pero requiere implementar y mantener el código. Para seleccionar una alternativa útil al prototipo, se compararon las capacidades documentadas por sus proveedores y su ajuste al requisito concreto: cargar un arreglo JSON con coordenadas, calcular indicadores y publicar HTML, CSS y JavaScript como sitio estático.

## 2. Metodología

Se realizó una comparación cualitativa de documentación oficial de Microsoft, Google, Leaflet, Chart.js, GitHub y Esri (referencias al final). Los criterios fueron: (1) facilidad de uso y mantenimiento; (2) manejo de JSON/CSV; (3) mapas y geoespacial; (4) gráficos; (5) arquitectura y dependencias que inciden en el rendimiento web; (6) licenciamiento, precios y condiciones de uso; y (7) ajuste al alcance de PlasTrack.

No se ejecutó una prueba de rendimiento entre productos ni se compararon planes pagados con configuraciones equivalentes. Por ello, las apreciaciones de rendimiento y costos son cualitativas; cualquier decisión de compra requiere consultar precios, licencias, límites y términos vigentes de cada proveedor. El análisis no declara una herramienta universalmente superior.

## 3. Comparación de alternativas

| Criterio | Power BI | Looker Studio | JavaScript: Leaflet.js + Chart.js |
|---|---|---|---|
| Facilidad de uso | Entorno visual con modelado y creación de informes. Puede requerir aprendizaje de Power Query, modelo semántico y administración. | Editor visual para crear y compartir informes; el usuario configura fuentes, dimensiones, métricas y visualizaciones. | Requiere conocimientos de HTML, CSS y JavaScript. No tiene editor visual, pero permite adaptar cada elemento de la aplicación. |
| JSON/CSV | Power Query documenta un conector JSON y opciones para conectarse a fuentes de datos. La forma del JSON puede requerir transformación y modelado antes de su uso. | Se conecta mediante conectores y fuentes disponibles en el producto. La conexión al JSON específico puede requerir un conector compatible, preparación o conversión. | `fetch` carga directamente el archivo JSON estático del proyecto. Para CSV se tendría que incorporar un analizador o transformar el archivo. |
| Mapas y geoespacial | Incluye visuales de mapa y campos de ubicación/coordenadas. Algunos visuales usan servicios de geocodificación; hay que revisar tratamiento de datos y configuración organizacional. | Ofrece Geo charts que relacionan dimensión geográfica y métrica, con áreas de zoom configurables; su forma de representación está definida por el producto. | Leaflet permite capas, marcadores, popups, controles y mapas base. Leaflet.heat agrega una capa de densidad configurable sobre coordenadas. |
| Gráficos | Catálogo de visualizaciones integradas y personalizadas según el producto y la configuración. | Gráficos configurables desde el editor, sujetos a los tipos de campos y conectores disponibles. | Chart.js genera gráficos en el navegador; PlasTrack utiliza un gráfico de líneas con nubosidad y aptitud por fecha. |
| Publicación y rendimiento | El informe se consume mediante el servicio correspondiente. El rendimiento depende del modelo, consultas, visuales, capacidad y red. | El informe se comparte desde el servicio; el rendimiento depende de la fuente, conectores, informe y red. | GitHub Pages sirve archivos estáticos directamente. No requiere servidor de aplicación ni compilación; el navegador descarga los archivos, las bibliotecas CDN y los mosaicos externos. El rendimiento depende del tamaño de datos, dispositivo y servicios externos. |
| Costos, licencias y términos | Consultar los planes y condiciones de Microsoft según el uso. También revisar los requisitos de capacidad y la documentación de mapas/geocodificación. No se asigna un precio en este informe. | La documentación del producto describe la herramienta estándar como gratuita; revisar la oferta vigente, funciones Pro, conectores, cuotas y términos aplicables. No se asigna un precio. | Verificar licencias de las bibliotecas y términos de uso de CDN y proveedor del mapa. GitHub Pages tiene límites y condiciones propios. No se estiman costos de infraestructura o servicio externo. |
| Ajuste al caso | Alternativa pertinente para informes de BI y modelos de datos; implica configurar un proyecto dentro del entorno Power BI para este dashboard estático. | Alternativa pertinente para informes compartibles; el mapa y la conexión al JSON específico deben resolverse con las fuentes/conectores del producto. | Ajuste directo al prototipo: consume el JSON del repositorio, personaliza mapa y gráfico y publica los archivos estáticos juntos. Requiere mantenimiento del código. |

## 4. Selección y arquitectura del prototipo

Se seleccionó JavaScript con Leaflet.js y Chart.js por el ajuste al alcance, no por una comparación de velocidad medida. La aplicación carga `data_copernicus_sample.json` mediante una ruta relativa. `app.js` valida estructura y rangos, calcula las tarjetas y genera las visualizaciones desde los registros. Leaflet muestra los puntos y ventanas emergentes, y Leaflet.heat representa la concentración espacial de registros; Chart.js grafica nubosidad y aptitud por fecha. El sitio funciona sin backend ni paso de compilación y está publicado en GitHub Pages.

La muestra contiene 15 registros entre el 1 y el 29 de octubre de 2026. Para los valores actuales, el prototipo calcula 28,5 % de nubosidad promedio, 77,6 % de aptitud promedio y 11 pasadas con aptitud igual o superior al umbral definido de 70 %. Son resultados aritméticos de datos sintéticos, no indicadores observados en Galápagos.

## 5. Limitaciones y consideraciones

- Los datos de muestra son ficticios. El prototipo no constituye un producto oficial de Copernicus ni un sistema de monitoreo operativo.
- La capa de calor visualiza la distribución de registros; no equivale a contaminación, nubosidad ni intensidad física medida.
- El mapa base, las etiquetas y las bibliotecas se obtienen de servicios externos. Su disponibilidad y términos pueden cambiar; se debe respetar la atribución y las condiciones del proveedor.
- El rendimiento no se midió en dispositivos o redes comparables. No se debe inferir superioridad de rendimiento frente a las plataformas BI.
- Antes de reemplazar la muestra, el equipo debe validar la procedencia, esquema, unidades, calidad y permiso de publicación de los datos oficiales.

## 6. Conclusión

Para un dashboard de demostración con un conjunto pequeño y local de registros JSON, Leaflet y Chart.js permiten una experiencia geográfica y gráfica personalizada con despliegue estático. Power BI y Looker Studio ofrecen alternativas adecuadas cuando se priorizan sus flujos visuales de BI, conectores y colaboración. La elección depende del contexto, mantenimiento, capacidades requeridas, tratamiento de datos y condiciones vigentes; las fuentes oficiales deben revisarse antes de una adopción distinta.

## Referencias

Fuentes oficiales consultadas el 12 de noviembre de 2026:

1. Microsoft Learn. *Data sources in Power BI Desktop*. <https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-data-sources>
2. Microsoft Learn. *Power Query JSON connector*. <https://learn.microsoft.com/en-us/power-query/connectors/json>
3. Microsoft Learn. *Tips and Tricks for maps (including Bing Maps integration)*. <https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-map-tips-and-tricks>
4. Google. *Geo chart reference — Looker Studio*. <https://docs.cloud.google.com/data-studio/geo-chart-reference>
5. Google. *Data Studio documentation*. <https://docs.cloud.google.com/data-studio/>
6. Leaflet. *Leaflet documentation and API reference*. <https://leafletjs.com/> · <https://leafletjs.com/reference.html>
7. Chart.js. *Documentation*. <https://www.chartjs.org/docs/latest/>
8. GitHub Docs. *What is GitHub Pages?* <https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages>
9. Esri. *Master Agreements; Products and Services Terms of Use*. <https://www.esri.com/en-us/legal/terms/master-agreement>

Los precios, disponibilidad de planes, requisitos de publicación, licencias y términos están sujetos a cambios. Verificar las páginas vigentes del proveedor antes de su uso.
