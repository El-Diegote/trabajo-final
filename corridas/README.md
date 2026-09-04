# Corridas reales

Esta carpeta contendrá la evidencia exacta de al menos tres ejecuciones reales.

## Estado

Todavía no se registraron corridas reales. Los archivos de `ejemplos/` son insumos de prueba y no cuentan como evidencia.

## Casos planificados

1. Documento suficiente y legible.
2. Entrada ambigua o evidencia insuficiente.
3. Fuente contradictoria, vacía o no admitida.

## Fuentes preparadas

El usuario aportó tres PDF académicos sobre locus de control, dirección por competencias y un caso de liderazgo. Se transformaron en fuentes `.md` anonimizadas y publicables para evitar subir documentos completos o datos innecesarios al repositorio público:

- `fuentes/corrida-01-liderazgo-locus-competencias-caso.md`
- `fuentes/corrida-02-liderazgo-evidencia-insuficiente.md`
- `fuentes/corrida-03-liderazgo-falla-controlada.md`

Las entradas listas para correr están en `entradas/`.

## Regla de integridad

No editar manualmente `salida.json` ni los tokens de `metadata.json`. Si se modifica un prompt o una entrada, ejecutar una nueva corrida con otro identificador.

## Bloqueo actual

No se ejecutaron corridas reales en esta revisión porque `OPENAI_API_KEY` no está disponible en el entorno local. Las pruebas y ejemplos no cuentan como corridas reales.
