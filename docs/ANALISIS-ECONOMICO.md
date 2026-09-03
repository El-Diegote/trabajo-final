# Análisis económico

## Fórmula

Costo por corrida:

`(tokens_entrada / 1.000.000 × tarifa_entrada) + (tokens_salida / 1.000.000 × tarifa_salida)`

Las tarifas se configuran mediante variables de entorno para evitar que un cambio de precio vuelva falsa la evidencia histórica.

## Variables

- `INPUT_USD_PER_MILLION`
- `OUTPUT_USD_PER_MILLION`

Cada corrida guarda el modelo, tokens, tarifas aplicadas y costo calculado. Para la entrega final se informarán:

- promedio y rango de las tres corridas;
- costo semanal según volumen esperado;
- proyección anual;
- comparación de al menos dos modelos;
- justificación del modelo más pequeño que supere los criterios de calidad.

## Criterios mínimos de calidad

- salida válida según esquema;
- uso real de la herramienta;
- ninguna afirmación sin fragmento;
- cantidad de slides adecuada;
- advertencias ante evidencia insuficiente;
- aprobación humana registrada.

Las tarifas finales deben contrastarse con la página oficial de precios el día de cerrar el informe.
