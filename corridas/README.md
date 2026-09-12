# Corridas reales

Esta carpeta contiene la evidencia exacta de seis ejecuciones reales.

## Estado

Se registraron seis corridas reales. Los archivos de `ejemplos/` son insumos de prueba y no cuentan como evidencia.

## Casos ejecutados

| Corrida | Escenario | Estado | Tokens totales | Costo USD |
|---|---|---|---:|---:|
| `corrida-01` | Documento suficiente y legible | `requiere_aprobacion` | 5.764 | 0,00138090 |
| `corrida-02` | Entrada ambigua o evidencia insuficiente | `requiere_aprobacion` | 4.121 | 0,00114960 |
| `corrida-03` | Fuente contradictoria o difícil de interpretar | `requiere_aprobacion` | 3.678 | 0,00098430 |
| `corrida-04` | Hábitos sostenibles para gestión del tiempo | `requiere_aprobacion` | 6.096 | 0,00147410 |
| `corrida-05` | Delegación efectiva para liderazgo | `requiere_aprobacion` | 8.160 | 0,00169250 |
| `corrida-06` | Integración: presencia, hábitos y delegación | `requiere_aprobacion` | 9.520 | 0,00195350 |

Cada carpeta incluye `entrada.json`, `salida.json`, `herramientas.json` y `metadata.json`.

## Fuentes preparadas

El usuario aportó tres PDF académicos sobre locus de control, dirección por competencias y un caso de liderazgo. Se transformaron en fuentes `.md` anonimizadas y publicables para evitar subir documentos completos o datos innecesarios al repositorio público:

- `fuentes/corrida-01-liderazgo-locus-competencias-caso.md`
- `fuentes/corrida-02-liderazgo-evidencia-insuficiente.md`
- `fuentes/corrida-03-liderazgo-falla-controlada.md`

Las entradas usadas están en `entradas/`.

El 12 de septiembre de 2026 se agregaron pruebas con PDFs reales de Gestión del Tiempo. Se prepararon fuentes breves y publicables sobre hábitos, presencia, movimiento Slow y delegación:

- `fuentes/corrida-04-gestion-tiempo-habitos.md`
- `fuentes/corrida-05-delegacion-lideres.md`
- `fuentes/corrida-06-presencia-slow.md`
- `fuentes/corrida-06-gestion-tiempo-integrada.md`

## Regla de integridad

No editar manualmente `salida.json` ni los tokens de `metadata.json`. Si se modifica un prompt o una entrada, ejecutar una nueva corrida con otro identificador.

## Intentos no versionados

Los intentos técnicos descartados pueden conservarse localmente en carpetas `corridas/_*/`, ignoradas por Git. No cuentan como corridas finales de entrega.
