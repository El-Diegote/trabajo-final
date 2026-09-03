# Gobierno y riesgo

| Elemento | Permiso | Nivel | Riesgo | Control |
|---|---|---:|---|---|
| Leer fuentes locales declaradas | Solo lectura | L1 | Archivo incorrecto o sensible | Extensiones permitidas y anonimización |
| Buscar fragmentos | Solo sobre fuentes cargadas | L1 | Evidencia incompleta | IDs de fragmento y registro de llamadas |
| Proponer slides | Sin efectos externos | L2 | Error, omisión o invención | JSON estricto y revisión humana |
| Generar PPTX | Escribe en carpeta de corrida | L2 | Entregable incorrecto | Firma previa obligatoria |
| Entregar o publicar | Fuera del agente | L3 | Uso institucional indebido | Responsable humano identificado |

## Fallas previstas

- Fuente ilegible o vacía: detener la corrida.
- Evidencia insuficiente: advertir y preguntar.
- Respuesta fuera del esquema: marcar error; no generar PPTX.
- Error de API: conservar mensaje técnico sin registrar secretos.
- Costo inesperado: limitar tamaño de fuentes y revisar tokens.
- Contenido incorrecto: rechazar el plan y documentar el motivo.

## Firma

La persona indicada en `metadata.json.aprobacion.aprobado_por` asume la revisión del contenido. La firma no implica aval institucional de UCEMA.
