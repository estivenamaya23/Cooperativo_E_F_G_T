# Bitácora de apoyo de IA

## Prompt utilizado

> Trabaja en este repositorio para completar el proyecto académico “PlasTrack”. Primero revisa los archivos existentes y conserva lo que ya sirva. Luego crea un dashboard web estático que pueda publicarse en GitHub Pages, sin backend ni pasos de compilación.
>
> **OBJETIVO**  
> Mostrar 15 pasadas satelitales SIMULADAS sobre las islas Galápagos. Los datos son de ejemplo, no observaciones reales. Si el repositorio no contiene data_copernicus_sample.json, crea ese archivo con 15 registros simulados y explica en el README cómo reemplazarlo por el archivo oficial de la clase.
>
> **TECNOLOGÍAS**  
> - HTML, CSS y JavaScript sencillo.  
> - Leaflet.js para el mapa interactivo.  
> - Leaflet.heat para representar concentración de pasadas o zonas de acumulación.  
> - Chart.js para los gráficos.  
> - Carga los datos desde data_copernicus_sample.json.  
> - Usa enlaces CDN estables y rutas relativas compatibles con GitHub Pages.
>
> **FUNCIONES DEL DASHBOARD**  
> 1. Tarjetas KPI dinámicas: número de pasadas, nubosidad promedio, aptitud promedio del sensor y número de pasadas aptas. Define como apta una pasada con aptitud del sensor de 70 % o más, y muestra este umbral en la página.  
> 2. Mapa centrado en Galápagos con marcadores para cada pasada y una capa de calor. Al seleccionar un marcador, muestra fecha, satélite, nubosidad y aptitud.  
> 3. Gráfico de líneas con nubosidad y aptitud del sensor por fecha.  
> 4. Diseño adaptable a celular y computadora, con etiquetas legibles y leyenda.  
> 5. Si no se pueden cargar los datos, muestra un mensaje claro en la página.
>
> **FORMATO DE CADA REGISTRO**
> ```json
> {
>   "id": "P01",
>   "fecha": "2026-10-01",
>   "satelite": "Sentinel-2A",
>   "latitud": -0.72,
>   "longitud": -90.31,
>   "nubosidad_pct": 12,
>   "aptitud_sensor_pct": 91
> }
> ```
>
> **ENTREGABLES DEL REPOSITORIO**  
> - index.html  
> - styles.css  
> - app.js  
> - data_copernicus_sample.json si no existe  
> - README.md con instrucciones para abrir y publicar el sitio en GitHub Pages  
> - docs/reporte-tecnico.md con un cuadro comparativo de Power BI, Looker Studio y JavaScript (Leaflet.js y Chart.js), comparando mapas/geoespacial, integración JSON/CSV, facilidad de uso, rendimiento web y costos/licencias. No inventes precios exactos; indica que deben verificarse según los planes vigentes. Justifica la elección de JavaScript para este dashboard estático.  
> - BITACORA_IA.md con este prompt y una breve explicación de qué partes del proyecto se generaron o revisaron con IA.
>
> **CRITERIOS**  
> - El sitio debe leer los valores del JSON y calcular las tarjetas y el gráfico; no escribas resultados fijos en el HTML.  
> - Mantén el código ordenado, con nombres claros y comentarios útiles.  
> - No afirmes que el sitio está publicado ni que funciona en producción. Déjalo preparado y escribe los pasos para que yo lo publique.  
> - No hagas commit ni push. Al terminar, resume qué archivos creaste y cómo puedo abrir el sitio y publicarlo en GitHub Pages.

## Trabajo generado o revisado con IA

Se usó IA para revisar el README y los archivos preexistentes; generar la página, estilos adaptables, lógica para leer y validar el JSON, cálculo dinámico de indicadores, marcadores y capa de calor Leaflet, gráfico Chart.js y datos sintéticos; mejorar la presentación del mapa con cartografía satelital y controles; redactar/revisar el reporte comparativo con referencias oficiales; y crear una presentación de 10 diapositivas con notas para exponer, reparto sugerido para cuatro integrantes y preguntas de defensa. La interfaz, el reporte y la presentación identifican los datos como simulados. GitHub Pages quedó publicado desde `main` y la URL pública se comprobó junto con la carga de la página y sus archivos principales. Antes de entregar, el equipo debe completar los nombres y la fecha de la portada, revisar y personalizar el material, y sustituir los registros sintéticos por los datos oficiales de la clase si corresponde.

## Revisión y ampliación del tablero

Se usó IA para inspeccionar la estructura real del JSON, realizar un benchmarking con documentación oficial consultada el 16 de noviembre de 2026 y ampliar el dashboard con filtros de fechas, mapas y gráficos actualizables, KPI, tabla de registros, validación estricta de calendario y mensajes de error. El código carga **DATOS SIMULADOS - FINES ACADÉMICOS** desde un JSON local; no se agregaron valores de isla/zona porque esos campos no existen en la muestra. La comparación de costos, licencias y rendimiento distingue información verificada de datos marcados como no verificados. Los cambios no fueron enviados mediante commit ni push.
