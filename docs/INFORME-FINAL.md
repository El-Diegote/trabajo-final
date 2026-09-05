# Informe final

Estado: actualizado con tres corridas reales. La generación del PPTX sigue pendiente de aprobación humana explícita.

## 1. Resumen ejecutivo

UCEMA Deck Agent es un sistema agéntico de línea de comandos que transforma fuentes académicas textuales en un plan de presentación estructurado, trazable y sujeto a revisión humana. La versión entregable incluye tres corridas reales, costos calculados, test/retest, auditoría automática y una app visual para revisar el estado del proyecto. La generación del PowerPoint queda bloqueada hasta registrar una aprobación.

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

| Corrida | Escenario | Resultado observado | Tokens entrada | Tokens salida | Costo USD |
|---|---|---|---:|---:|---:|
| `corrida-01` | Caso normal con evidencia suficiente | Recomendación prudente: reconocer desempeño y desarrollar antes de promover. | 4.155 | 1.609 | 0,00138090 |
| `corrida-02` | Evidencia insuficiente | No inventa conclusión; arma estructura, faltantes y preguntas. | 2.646 | 1.475 | 0,00114960 |
| `corrida-03` | Fuente contradictoria | Falla segura; suspende juicio y solicita revisión humana. | 2.445 | 1.233 | 0,00098430 |

Los ejemplos en `ejemplos/` siguen siendo ficticios y no cuentan como evidencia.

## 12. Resultados

La auditoría estructural se ejecutó correctamente y detecta tres corridas. Las tres salidas quedaron en estado `requiere_aprobacion`, usaron `buscar_fragmentos`, registraron tokens, costos, herramientas y referencias a fragmentos versionados. Ninguna generó PPTX porque no existe todavía una firma humana.

## 13. Fallas observadas

Durante una revisión anterior, `npm ci` no pudo ejecutarse porque `npm` no estaba disponible en el entorno local. Después de instalar Node.js, `npm run ci` finalizó correctamente. También se detectaron riesgos de rutas arbitrarias, referencias insuficientes, costos sin tarifa y sobrescritura de aprobación; quedaron corregidos o documentados.

## 14. Iteraciones del prompt y retest

Antes de ejecutar las corridas finales se endureció el sistema: fuentes dentro del repositorio, rechazo de rutas arbitrarias, referencias obligatorias para slides de objetivo/contenido, control de secretos, validación de costos y bloqueo de aprobaciones repetidas. Las pruebas pasaron antes y después de esos ajustes.

No se modificaron los prompts después de las corridas finales porque las salidas cumplieron el objetivo esperado: caso normal, evidencia insuficiente y falla controlada. Se documentó la decisión de mantener el contrato v1 para no mover el criterio de evaluación después de observar resultados.

## 15. Análisis económico

La fórmula, tarifas base, costos reales, promedio, mínimo, máximo y proyección semanal/anual están documentados en `docs/ANALISIS-ECONOMICO.md`. La comparación con otro modelo es económica; no se inventó una evaluación cualitativa no ejecutada.

## 16. Gobierno

La aprobación humana es obligatoria antes del PPTX. El sistema no autoaprueba, no publica, no autentica usuarios y no declara aval institucional. La firma queda registrada en `aprobacion.json` solo si una persona decide convertir una salida en archivo PowerPoint.

## 17. Riesgos

Los riesgos principales son fuentes insuficientes, datos sensibles, referencias inexistentes, costos inesperados y uso indebido del entregable. Los controles están en `docs/GOBIERNO-Y-RIESGO.md` y `scripts/auditar-repo.mjs`.

La defensa específica contra ingeniería social y prompt injection está documentada en `docs/SEGURIDAD-ANTI-INGENIERIA-SOCIAL.md`. El principio operativo es que las fuentes son evidencia no confiable: pueden informar el contenido, pero no pueden modificar reglas, pedir secretos, simular aprobación ni cambiar el nivel de supervisión.

## 18. Limitaciones

No se validó visualmente ningún PPTX real porque todavía no hubo aprobación humana para generarlo.

## 19. Aprendizajes

Un agente único con herramienta determinística permite mostrar ciclo agéntico, trazabilidad y supervisión sin agregar complejidad innecesaria.

## 20. Próximos pasos

Solicitar aprobación humana para la corrida elegida, generar y validar el PPTX, registrar el firmante y cerrar el PR. Estos pasos son deliberadamente posteriores al análisis agéntico porque pertenecen al control humano del entregable.
