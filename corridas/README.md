# Corridas reales

Esta carpeta contiene la evidencia exacta de tres ejecuciones reales.

## Estado

Se registraron tres corridas reales. Los archivos de `ejemplos/` son insumos de prueba y no cuentan como evidencia.

## Casos ejecutados

| Corrida | Escenario | Estado | Tokens totales | Costo USD |
|---|---|---|---:|---:|
| `corrida-01` | Documento suficiente y legible | `requiere_aprobacion` | 5.764 | 0,00138090 |
| `corrida-02` | Entrada ambigua o evidencia insuficiente | `requiere_aprobacion` | 4.121 | 0,00114960 |
| `corrida-03` | Fuente contradictoria o difícil de interpretar | `requiere_aprobacion` | 3.678 | 0,00098430 |

Cada carpeta incluye `entrada.json`, `salida.json`, `herramientas.json` y `metadata.json`.

## Fuentes preparadas

El usuario aportó tres PDF académicos sobre locus de control, dirección por competencias y un caso de liderazgo. Se transformaron en fuentes `.md` anonimizadas y publicables para evitar subir documentos completos o datos innecesarios al repositorio público:

- `fuentes/corrida-01-liderazgo-locus-competencias-caso.md`
- `fuentes/corrida-02-liderazgo-evidencia-insuficiente.md`
- `fuentes/corrida-03-liderazgo-falla-controlada.md`

Las entradas usadas están en `entradas/`.

## Regla de integridad

No editar manualmente `salida.json` ni los tokens de `metadata.json`. Si se modifica un prompt o una entrada, ejecutar una nueva corrida con otro identificador.

## Intentos no versionados

Los intentos técnicos descartados pueden conservarse localmente en carpetas `corridas/_*/`, ignoradas por Git. No cuentan como corridas finales de entrega.
