# Análisis económico

Estado: actualizado con tres corridas reales ejecutadas el 4 de septiembre de 2026. No se reemplazaron tokens, costos ni aprobaciones por ejemplos.

## Fórmula

Costo por corrida:

`(tokens_entrada / 1.000.000 × tarifa_entrada) + (tokens_salida / 1.000.000 × tarifa_salida)`

Las tarifas se configuran mediante variables de entorno para evitar que un cambio de precio vuelva falsa la evidencia histórica.

## Variables

- `INPUT_USD_PER_MILLION`
- `OUTPUT_USD_PER_MILLION`

## Tarifas verificadas

Fecha de consulta: 4 de septiembre de 2026.

Fuente: documentación oficial de OpenAI, página de precios de API (`https://developers.openai.com/api/docs/pricing`).

Para `gpt-5.6-luna` en procesamiento estándar y contexto corto, la tarifa publicada es:

- entrada: USD 0,10 por millón de tokens;
- salida: USD 0,60 por millón de tokens.

Para comparación futura con un modelo más grande, la misma fuente publica para `gpt-5.6-terra`:

- entrada: USD 1,00 por millón de tokens;
- salida: USD 6,00 por millón de tokens.

Cada corrida guarda el modelo, tokens, tarifas aplicadas y costo calculado.

## Costos reales registrados

| Corrida | Caso | Tokens entrada | Tokens salida | Costo USD |
|---|---|---:|---:|---:|
| `corrida-01` | Caso normal | 4.155 | 1.609 | 0,00138090 |
| `corrida-02` | Evidencia insuficiente | 2.646 | 1.475 | 0,00114960 |
| `corrida-03` | Falla controlada | 2.445 | 1.233 | 0,00098430 |

Total de las tres corridas: USD 0,00351480.

Promedio por corrida: USD 0,00117160.

Mínimo: USD 0,00098430.

Máximo: USD 0,00138090.

## Proyección operativa

Supuesto de volumen: 15 corridas por semana. El supuesto equivale a tres casos académicos con hasta cinco iteraciones semanales entre prueba, revisión y ajuste.

Costo semanal estimado con `gpt-5.6-luna`: USD 0,01757400.

Costo anual estimado con 52 semanas: USD 0,91384800.

## Lectura de negocio

El costo directo de inferencia no es el principal riesgo económico en esta escala. El valor está en reducir tiempo de lectura, armado de estructura y revisión de consistencia, manteniendo trazabilidad de fuentes. El costo relevante pasa a ser el tiempo humano de revisión y la calidad de las fuentes preparadas.

Con los datos observados, el sistema permite varias iteraciones académicas por menos de un dólar anual en el supuesto usado. Esa conclusión depende del modelo, de las tarifas vigentes y del tamaño de las fuentes; por eso cada corrida guarda tarifas y tokens en su propia metadata.

## Comparación de modelo

Con los mismos tokens observados, `gpt-5.6-terra` costaría aproximadamente diez veces más que `gpt-5.6-luna`, porque sus tarifas publicadas son USD 1,00 por millón de tokens de entrada y USD 6,00 por millón de tokens de salida.

Promedio estimado por corrida con `gpt-5.6-terra`: USD 0,01171600.

No se ejecutó una comparación empírica de calidad contra `gpt-5.6-terra`; por lo tanto, no se afirma superioridad cualitativa. La elección actual de `gpt-5.6-luna` se justifica porque las tres corridas cumplieron el esquema, usaron herramienta real, registraron trazabilidad y respondieron con advertencias ante evidencia insuficiente o contradictoria.

## Criterios mínimos de calidad

- salida válida según esquema;
- uso real de la herramienta;
- ninguna afirmación sin fragmento;
- cantidad de slides adecuada;
- advertencias ante evidencia insuficiente;
- aprobación humana registrada.

En la entrega actual, los primeros cinco criterios se cumplieron en las tres corridas. El sexto solo aplica después de que una persona apruebe una corrida para generar el PPTX.

## Pendiente

La comparación de calidad contra otro modelo queda pendiente si se requiere una evaluación experimental adicional. Para la entrega actual, la comparación documentada es económica y no inventa resultados no ejecutados.
