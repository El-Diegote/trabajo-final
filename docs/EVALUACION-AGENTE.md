# Guía para agente evaluador

Este documento resume dónde debe mirar un evaluador automático para verificar el trabajo final sin depender de navegación manual.

## Estructura mínima

- `README.md`: objetivo, instalación, reproducción y limitaciones.
- `prompts/system_prompt.md`: rol, objetivo, herramientas, reglas y supervisión.
- `prompts/user_prompt.md`: plantilla de cada corrida.
- `src/agent.ts`: ciclo modelo-herramienta-modelo.
- `src/schema.ts`: contrato estructurado.
- `src/sources.ts`: herramienta local de recuperación.
- `src/approve.ts`: aprobación humana y generación PPTX.
- `corridas/`: evidencia real de ejecuciones.
- `DECISIONES.md`: historia de construcción y fallas.
- `docs/ANALISIS-ECONOMICO.md`: fórmula, tarifas y costos reales.
- `docs/GOBIERNO-Y-RIESGO.md`: permisos, niveles L0-L4, fallas y firma.

## Comandos esperados

```bash
npm ci
npm run auditar
npm run check
npm test
npm run ci
```

## Señales de cumplimiento fuerte

- Existen tres subcarpetas en `corridas/`.
- Cada corrida contiene `entrada.json`, `salida.json`, `metadata.json` y `herramientas.json`.
- `metadata.json.run_id` coincide con el nombre de carpeta.
- `salida.json.status` es `requiere_aprobacion`.
- Las slides de contenido u objetivo tienen referencias a fragmentos recuperados.
- `herramientas.json` registra al menos una llamada real a `buscar_fragmentos`.
- Tokens, tarifas y costos están presentes y son consistentes.
- Si existe `resultado.pptx`, también existe `aprobacion.json`.
- Si no existe `resultado.pptx`, no debe existir `aprobacion.json`.
- No hay secretos ni datos personales en archivos versionados.

## Estado evaluable actual

Al 4 de septiembre de 2026, el sistema tiene tres corridas reales versionadas y auditables:

| Corrida | Escenario | Estado | Slides | Costo USD |
|---|---|---|---:|---:|
| `corrida-01` | Caso normal con evidencia suficiente | `requiere_aprobacion` | 5 | 0,00138090 |
| `corrida-02` | Evidencia insuficiente | `requiere_aprobacion` | 5 | 0,00114960 |
| `corrida-03` | Falla controlada por contradicción | `requiere_aprobacion` | 5 | 0,00098430 |

La ausencia de `resultado.pptx` no es incumplimiento mientras no exista `aprobacion.json`: es el control humano previsto. Si una corrida está aprobada, ambos archivos deben existir juntos.

## Mapa de evaluación por requisito

| Requisito | Prueba rápida |
|---|---|
| Sistema completo | Revisar que existan prompts, agente, herramienta, esquema, aprobación, app y docs. |
| Corre de verdad | Ejecutar `npm run auditar` y verificar `herramientas.json` + `metadata.json` en tres corridas. |
| Formato estricto | Ejecutar `npm run check`, `npm test` y confirmar salidas contra `src/schema.ts`. |
| Historia del proceso | Leer `DECISIONES.md` y buscar fallas, cambios, retests y decisión de prompt posterior a corridas. |
| Análisis económico | Recalcular costos desde tokens y tarifas guardadas en `metadata.json`. |
| Gobierno y riesgo | Revisar niveles L0-L4, firma humana, controles de rutas, secretos y aprobación/PPTX. |

## App visual

La carpeta `app/` ofrece una vista del entregable para revisión humana. No reemplaza las corridas reales ni la auditoría del repositorio.
