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

## 2026-09-03 - Endurecimiento de auditoría y controles

**Decisión:** reforzar validaciones sin cambiar la arquitectura de agente único.

**Cambios:** se restringieron entradas, fuentes y aprobaciones al repositorio y a `corridas/`; se impidió sobrescribir `resultado.pptx` o `aprobacion.json`; se exigieron fuentes para slides de objetivo/contenido; se agregó validación de límite de iteraciones, salida final estructurada, costos, referencias y posibles secretos.

**Motivo:** cerrar riesgos comprobables de rutas arbitrarias, aprobaciones repetidas, referencias inexistentes y evidencia incompleta antes de ejecutar corridas reales.

**Falla observada:** `npm ci` no pudo ejecutarse porque `npm` no está disponible en el PATH local ni en el runtime empaquetado de Codex. El comando falló con: `The term 'npm' is not recognized as a name of a cmdlet, function, script file, or executable program.`

**Resultado parcial:** la auditoría pura con Node sí se ejecutó correctamente y dejó solo la advertencia esperada de tres corridas reales pendientes.

**Verificación alternativa:** se instaló temporalmente con `pnpm install --no-lockfile` para obtener `node_modules` gitignorado. Ese comando terminó con `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild@0.28.2`, pero dejó disponibles `tsc` y las dependencias necesarias. Con el Node empaquetado de Codex en `PATH`, la secuencia equivalente `node scripts/auditar-repo.mjs`, `tsc --noEmit`, `tsc` y `node --test dist/tests/*.test.js` finalizó correctamente con 6 pruebas aprobadas.

**Comandos npm bloqueados:** `npm run auditar`, `npm run check`, `npm test` y `npm run ci` fallaron por la misma causa: `npm` no está disponible en el entorno local.

## 2026-09-03 - Tarifas base verificadas

**Decisión:** mantener en `.env.example` las tarifas de `gpt-5.6-luna` estándar: USD 0,10 por millón de tokens de entrada y USD 0,60 por millón de tokens de salida.

**Fuente:** documentación oficial de OpenAI, `https://developers.openai.com/api/docs/pricing`, consultada el 3 de septiembre de 2026.

**Pendiente:** recalcular y comparar costos con los tokens reales de las tres corridas cuando existan.

## 2026-09-03 - Fuentes candidatas para corridas reales

**Decisión:** tratar los tres PDF aportados por el usuario como fuentes candidatas, no como evidencia lista para versionar.

**Motivo:** son técnicamente legibles y relevantes para liderazgo y gestión de equipos, pero el repositorio es público. Antes de ejecutar corridas reales deben convertirse en fuentes textuales anonimizadas y publicables, evitando subir papers completos, casos protegidos o datos personales innecesarios.

**Pendiente:** preparar archivos `.md` en `fuentes/`, configurar `OPENAI_API_KEY` fuera del repositorio y ejecutar las tres corridas reales.

## 2026-09-03 - Conversión anonimizada de fuentes y retest

**Decisión:** convertir los tres PDF candidatos en fuentes Markdown breves, anonimizadas y publicables, sin copiar los documentos completos.

**Motivo:** el repositorio es público y será leído por un agente evaluador. La evidencia debe ser reconstruible, pero no debe exponer material protegido, nombres propios innecesarios ni datos sensibles.

**Resultado:** se crearon tres fuentes en `fuentes/` y tres entradas listas para ejecutar en `entradas/`, cubriendo caso normal, evidencia insuficiente y falla controlada.

**Test y retest:** se agregaron pruebas para fuentes preparadas, auditoría consistente, aprobación sin PPTX, `run_id` falso, costo inconsistente, herramientas ausentes, referencias inventadas y secretos versionados. La secuencia local equivalente de CI pasó dos veces con auditoría aprobada, TypeScript sin errores y 11 pruebas aprobadas.

**Bloqueo restante:** no se ejecutaron corridas reales porque `OPENAI_API_KEY` no está disponible en el entorno local. No se debe pegar la clave en el chat.
