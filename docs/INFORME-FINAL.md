# Informe final

Estado: borrador técnico. Las secciones dependientes de corridas reales permanecen pendientes hasta preparar fuentes anonimizadas y publicables, ejecutar el agente con `OPENAI_API_KEY` y registrar aprobaciones humanas explícitas.

## 1. Resumen ejecutivo

UCEMA Deck Agent es un sistema agéntico de línea de comandos que transforma fuentes académicas textuales en un plan de presentación estructurado, trazable y sujeto a revisión humana. La generación del PowerPoint queda bloqueada hasta registrar una aprobación.

## 2. Problema real

Preparar una presentación académica exige seleccionar evidencia, ordenar un relato y diseñar slides sin atribuir al material fuente afirmaciones no respaldadas.

## 3. Usuario y necesidad

El usuario principal es un alumno o docente que necesita acelerar la preparación de una presentación manteniendo trazabilidad, control humano y reproducibilidad.

## 4. Alcance

La versión actual admite fuentes textuales locales en TXT, MD, CSV, JSON, HTML y HTM. PDF, DOCX, OCR, navegación web y publicación automática quedan fuera del alcance validado.

## 5. Objetivo del agente

Proponer un plan de slides en español, adaptado a duración, perfil y estilo, usando evidencia recuperada por herramienta y declarando límites cuando la evidencia no alcanza.

## 6. Contrato

El contrato está definido en `prompts/system_prompt.md`, `prompts/user_prompt.md` y `src/schema.ts`. El estado final permitido es `requiere_aprobacion`.

## 7. Arquitectura

La arquitectura usa un agente único con OpenAI Responses API, una herramienta local `buscar_fragmentos`, validación Zod y generación PPTX separada en `src/approve.ts`.

## 8. Herramientas

La herramienta real implementada es `buscar_fragmentos`, que opera sobre fragmentos cargados desde fuentes locales declaradas y devuelve identificador, archivo y texto.

## 9. Esquema de salida

La salida contiene estado, resumen, slides, advertencias, preguntas para el usuario y supervisión. Las slides de objetivo y contenido deben citar fuentes.

## 10. Niveles L0-L4

Los niveles están documentados en `docs/GOBIERNO-Y-RIESGO.md`. El agente opera en L1-L2; uso institucional, publicación o cambios de alcance quedan en L3-L4.

## 11. Tres corridas

Pendiente. No existen todavía tres corridas reales reconstruibles. Los ejemplos en `ejemplos/` son ficticios y no cuentan como evidencia. Hay tres PDF candidatos de liderazgo, pero deben convertirse en fuentes textuales anonimizadas antes de usarse.

## 12. Resultados

Pendiente de corridas reales. La auditoría estructural se ejecutó correctamente y detecta que faltan tres corridas reales.

## 13. Fallas observadas

Durante esta revisión, `npm ci` no pudo ejecutarse porque `npm` no está disponible en el entorno local. También se detectaron riesgos de rutas arbitrarias, referencias insuficientes y sobrescritura de aprobación, ya corregidos.

## 14. Iteraciones del prompt

Pendiente de corridas reales. Los prompts iniciales están versionados y se ajustarán solo con evidencia de ejecución.

## 15. Análisis económico

La fórmula y tarifas base están documentadas en `docs/ANALISIS-ECONOMICO.md`. Falta completar costos reales, promedio, mínimo, máximo, proyección semanal/anual y comparación de calidad con corridas reales.

## 16. Gobierno

La aprobación humana es obligatoria antes del PPTX. El sistema no autoaprueba, no publica y no declara aval institucional.

## 17. Riesgos

Los riesgos principales son fuentes insuficientes, datos sensibles, referencias inexistentes, costos inesperados y uso indebido del entregable. Los controles están en `docs/GOBIERNO-Y-RIESGO.md` y `scripts/auditar-repo.mjs`.

## 18. Limitaciones

No se validó visualmente ningún PPTX real. No se ejecutaron llamadas a la API porque falta `OPENAI_API_KEY`. Las fuentes candidatas todavía no fueron convertidas en material publicable.

## 19. Aprendizajes

Un agente único con herramienta determinística permite mostrar ciclo agéntico, trazabilidad y supervisión sin agregar complejidad innecesaria.

## 20. Próximos pasos

Proveer tres fuentes reales anonimizadas, configurar `OPENAI_API_KEY` fuera del repositorio, ejecutar tres corridas, solicitar aprobación humana para las corridas aprobables y completar economía, evaluación de rúbrica y cierre del PR.
