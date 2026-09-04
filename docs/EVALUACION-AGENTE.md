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
- `docs/ANALISIS-ECONOMICO.md`: fórmula, tarifas y costos reales cuando existan.
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

## Señales de incumplimiento actual

Al 3 de septiembre de 2026, el sistema tiene fuentes reales anonimizadas listas para correr, pero todavía no tiene tres corridas reales ni costos reales. Es una limitación declarada, no una evidencia fabricada.

## App visual

La carpeta `app/` ofrece una vista del entregable para revisión humana. No reemplaza las corridas reales ni la auditoría del repositorio.
