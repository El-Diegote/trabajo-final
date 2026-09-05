# Gobierno y riesgo

| Elemento | Permiso | Nivel | Riesgo | Control |
|---|---|---:|---|---|
| Leer fuentes locales declaradas | Solo lectura | L1 | Archivo incorrecto o sensible | Extensiones permitidas y anonimización |
| Buscar fragmentos | Solo sobre fuentes cargadas | L1 | Evidencia incompleta | IDs de fragmento y registro de llamadas |
| Proponer slides | Sin efectos externos | L2 | Error, omisión o invención | JSON estricto y revisión humana |
| Generar PPTX | Escribe en carpeta de corrida | L2 | Entregable incorrecto | Firma previa obligatoria |
| Entregar o publicar | Fuera del agente | L3 | Uso institucional indebido | Responsable humano identificado |

## Niveles L0-L4

- L0: operaciones determinísticas sin modelo, como auditoría de archivos y validación JSON.
- L1: lectura local, fragmentación y búsqueda de evidencia en fuentes declaradas.
- L2: propuesta del plan de slides y generación del PPTX únicamente después de aprobación humana.
- L3: uso, entrega o publicación del material por parte de una persona responsable.
- L4: cambios de alcance institucional, publicación oficial o decisiones que requieran aval externo; fuera del agente.

## Fallas previstas

- Fuente ilegible o vacía: detener la corrida.
- Evidencia insuficiente: advertir y preguntar.
- Respuesta fuera del esquema: marcar error; no generar PPTX.
- Error de API: conservar mensaje técnico sin registrar secretos.
- Costo inesperado: limitar tamaño de fuentes y revisar tokens.
- Contenido incorrecto: rechazar el plan y documentar el motivo.
- Intento de usar rutas fuera del repositorio: rechazar la corrida.
- Intento de aprobar dos veces o sobrescribir PPTX: rechazar la acción.

## Evidencia de controles ejecutados

- `corrida-01` muestra el flujo normal: el agente usa evidencia, recomienda con cautela y deja advertencias.
- `corrida-02` muestra control ante evidencia incompleta: evita completar datos faltantes y pide revisión.
- `corrida-03` muestra falla segura: ante contradicciones, suspende la recomendación y no fuerza una conclusión.
- `npm run ci` valida auditoría, TypeScript y 11 pruebas automatizadas.
- El repositorio público no versiona `.env`, claves API ni los PDF originales; versiona solo fuentes anonimizadas en `.md`.

## Datos y privacidad

Los documentos originales se trataron como material fuente del usuario, no como instrucciones del sistema. Para publicar el repositorio se sustituyeron por síntesis anonimizadas, suficientes para reconstruir el comportamiento agéntico sin exponer nombres propios, papers completos ni datos innecesarios.

La clave `OPENAI_API_KEY` se configura fuera de Git mediante variables de entorno. El agente solo registra tokens, costos, modelo, fecha, prompt hash y nombres de herramientas, no secretos.

## Firma

La persona indicada en `metadata.json.aprobacion.aprobado_por` asume la revisión del contenido. La firma no implica aval institucional de UCEMA.
