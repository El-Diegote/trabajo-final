# DECISIONES

Historia real de construcción del sistema. Las fallas se conservan porque explican cómo se ajustó el alcance.

## 2026-08-17 - Prototipo inicial basado en reglas

**Decisión:** crear una interfaz estática capaz de leer documentos y generar slides mediante selección de oraciones y frecuencia de palabras.

**Resultado:** la interfaz y la descarga PPTX funcionaron, pero el sistema no era agéntico: no había modelo, contrato operativo, herramientas elegidas por un agente ni trazabilidad de evidencia.

## 2026-09-03 - Separar el trabajo final del prototipo

**Decisión:** crear el repositorio público `El-Diegote/trabajo-final`.

**Motivo:** preservar el prototipo anterior y construir una entrega alineada explícitamente con la rúbrica.

## 2026-09-03 - Un agente especializado

**Decisión:** usar un solo agente planificador en lugar de varios agentes.

**Alternativas:** arquitectura multiagente con especialistas en contenido, diseño y validación.

**Motivo:** un agente único es suficiente para el alcance, reduce costo y facilita reconstruir las tres corridas. Agregar agentes sin necesidad haría más difícil justificar las decisiones.

## 2026-09-03 - Responses API con bucle visible

**Decisión:** implementar explícitamente el ciclo modelo → herramienta → resultado de herramienta → modelo.

**Motivo:** permite mostrar con claridad qué herramienta pidió el agente y qué resultado recibió, algo central para la reproducibilidad.

## 2026-09-03 - Salida estructurada y fuentes trazables

**Decisión:** exigir una salida ajustada a un JSON Schema y referencias a fragmentos identificables.

**Motivo:** el evaluador automático debe poder leer la salida y un tercero debe poder verificar el origen del contenido.

## 2026-09-03 - Aprobación antes del PPTX

**Decisión:** separar la propuesta del agente de la generación del archivo.

**Motivo:** el agente trabaja en L2. El usuario revisa el plan y firma la aprobación antes de ejecutar una acción que produce el entregable.

## 2026-09-03 - Alcance textual inicial

**Decisión:** admitir TXT, MD, CSV, JSON y HTML en la primera versión.

**Alternativas:** incluir desde el comienzo PDF, DOCX, audio, OCR y navegación web.

**Motivo:** entregar primero un sistema pequeño, real y comprobable. Los formatos adicionales se incorporarán solo si las corridas muestran que son necesarios.

## 2026-09-03 - Controles automáticos en el repositorio

**Decisión:** agregar una auditoría determinística y un flujo de integración continua para cada pull request.

**Motivo:** la estructura obligatoria y las pruebas no deben depender de una revisión manual. La auditoría también informa cuántas corridas reales faltan sin fabricar evidencia.

**Falla observada:** la primera ejecución de `npm install` intentó usar una carpeta de caché no disponible en el entorno; se repitió con una caché temporal y la instalación terminó correctamente. La ejecución inicial de pruebas con `tsx --test` intentó abrir un canal IPC no permitido; el script se reemplazó por compilación TypeScript seguida de `node --test`.

**Resultado:** verificación de tipos aprobada y tres pruebas aprobadas.

## Pendientes que deben registrar una decisión

- Modelo definitivo y comparación contra uno más pequeño.
- Resultado de cada corrida y cambios de prompt.
- Incorporación o descarte de PDF/DOCX.
- Tarifas verificadas al momento de calcular costos finales.
