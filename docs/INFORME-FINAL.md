# Informe final

Estado: actualizado con tres corridas reales. La generación del PPTX sigue pendiente de aprobación humana explícita.

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

Se ejecutaron tres corridas reales reconstruibles en `corridas/`.

- `corrida-01`: caso normal con evidencia suficiente para una recomendación prudente de desarrollo antes de promover.
- `corrida-02`: evidencia insuficiente; el agente evita cerrar una recomendación y explicita preguntas.
- `corrida-03`: falla controlada ante fuente contradictoria; el agente suspende juicio y solicita revisión.

Los ejemplos en `ejemplos/` siguen siendo ficticios y no cuentan como evidencia.

## 12. Resultados

La auditoría estructural se ejecutó correctamente y detecta tres corridas. Las tres salidas quedaron en estado `requiere_aprobacion`, usaron `buscar_fragmentos` y registraron tokens, costos y herramientas.

## 13. Fallas observadas

Durante una revisión anterior, `npm ci` no pudo ejecutarse porque `npm` no estaba disponible en el entorno local. Después de instalar Node.js, `npm run ci` finalizó correctamente. También se detectaron riesgos de rutas arbitrarias, referencias insuficientes, costos sin tarifa y sobrescritura de aprobación; quedaron corregidos o documentados.

## 14. Iteraciones del prompt

No se modificaron los prompts después de las corridas porque las salidas cumplieron el objetivo esperado: caso normal, evidencia insuficiente y falla controlada. Se documentó la decisión de mantener el contrato v1.

## 15. Análisis económico

La fórmula, tarifas base, costos reales, promedio, mínimo, máximo y proyección semanal/anual están documentados en `docs/ANALISIS-ECONOMICO.md`. La comparación con otro modelo es económica; no se inventó una evaluación cualitativa no ejecutada.

## 16. Gobierno

La aprobación humana es obligatoria antes del PPTX. El sistema no autoaprueba, no publica y no declara aval institucional.

## 17. Riesgos

Los riesgos principales son fuentes insuficientes, datos sensibles, referencias inexistentes, costos inesperados y uso indebido del entregable. Los controles están en `docs/GOBIERNO-Y-RIESGO.md` y `scripts/auditar-repo.mjs`.

## 18. Limitaciones

No se validó visualmente ningún PPTX real porque todavía no hubo aprobación humana para generarlo.

## 19. Aprendizajes

Un agente único con herramienta determinística permite mostrar ciclo agéntico, trazabilidad y supervisión sin agregar complejidad innecesaria.

## 20. Próximos pasos

Solicitar aprobación humana para la corrida aprobable, generar y validar el PPTX, actualizar el checklist final y cerrar el PR.
