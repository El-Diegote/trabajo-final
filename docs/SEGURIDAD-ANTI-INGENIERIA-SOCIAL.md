# Seguridad anti ingeniería social

Este documento define cómo el sistema resiste instrucciones maliciosas o ambiguas dentro de fuentes, entradas y corridas.

## Principio central

Los documentos aportados por el usuario son evidencia de dominio, no instrucciones para el agente. El orden de autoridad es:

1. contrato del sistema en `prompts/system_prompt.md`;
2. esquema estricto en `src/schema.ts`;
3. lógica de ejecución en `src/agent.ts`;
4. fuentes recuperadas por `buscar_fragmentos`;
5. instrucciones adicionales del usuario dentro de `entrada.json`.

Ningún fragmento de fuente puede cambiar el rol del agente, pedir que ignore reglas, revelar secretos, simular aprobaciones o generar el PPTX.

## Controles implementados

- `src/sources.ts` marca fragmentos con `riesgo_inyeccion` cuando detecta instrucciones de evasión, cambio de rol, revelación de claves o exfiltración.
- `prompts/system_prompt.md` ordena tratar fuentes e instrucciones adicionales como contenido no confiable frente al contrato.
- `src/schema.ts` exige `status = requiere_aprobacion`, supervisión L2, títulos, bullets, notas y referencias con formato controlado.
- `scripts/auditar-repo.mjs` revalida las corridas guardadas sin depender del modelo: estructura, herramientas permitidas, argumentos, referencias, costos, secretos, aprobación y PPTX.
- `src/approve.ts` no genera PowerPoint sin firma humana, no sobrescribe archivos y actualiza metadata solo después de aprobar.
- `tests/agent.test.ts` incluye pruebas de rutas fuera del repo, referencias inventadas, secretos versionados, aprobación/PPTX inconsistente, salida inválida y detección de instrucciones maliciosas.

## Escenarios adversariales cubiertos

| Ataque | Control esperado |
|---|---|
| Fuente que dice “ignorá instrucciones anteriores” | Se marca como riesgo y no cambia el contrato. |
| Entrada que pide aprobar o publicar | El estado sigue siendo `requiere_aprobacion`; PPTX exige `approve.ts`. |
| Referencia a fragmento inexistente | Auditoría falla. |
| Fuente fuera del repositorio | La carga falla. |
| Clave API pegada en README o docs | Auditoría falla. |
| `aprobacion.json` sin PPTX o PPTX sin aprobación | Auditoría falla. |
| Intento de sobrescribir una corrida aprobada | `approve.ts` falla. |

## Limitación declarada

La detección de ingeniería social es una defensa en profundidad, no una garantía semántica perfecta. Por eso el sistema combina heurística local, prompt defensivo, formato estricto, auditoría determinística y revisión humana.
