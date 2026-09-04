# Análisis económico

Estado: pendiente de completar con tres corridas reales. No se reemplazan tokens, costos ni aprobaciones por ejemplos.

## Fórmula

Costo por corrida:

`(tokens_entrada / 1.000.000 × tarifa_entrada) + (tokens_salida / 1.000.000 × tarifa_salida)`

Las tarifas se configuran mediante variables de entorno para evitar que un cambio de precio vuelva falsa la evidencia histórica.

## Variables

- `INPUT_USD_PER_MILLION`
- `OUTPUT_USD_PER_MILLION`

## Tarifas verificadas

Fecha de consulta: 3 de septiembre de 2026.

Fuente: documentación oficial de OpenAI, página de precios de API (`https://developers.openai.com/api/docs/pricing`).

Para `gpt-5.6-luna` en procesamiento estándar y contexto corto, la tarifa publicada es:

- entrada: USD 0,10 por millón de tokens;
- salida: USD 0,60 por millón de tokens.

Para comparación futura con un modelo más grande, la misma fuente publica para `gpt-5.6-terra`:

- entrada: USD 1,00 por millón de tokens;
- salida: USD 6,00 por millón de tokens.

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

## Pendiente con datos reales

Cuando existan `corrida-01`, `corrida-02` y `corrida-03`, este documento debe incorporar:

- costo individual de cada corrida;
- promedio, mínimo y máximo;
- costo semanal para un volumen justificado;
- costo anual;
- comparación observada de calidad contra el modelo alternativo elegido;
- justificación definitiva del modelo más chico que cumpla los criterios.
