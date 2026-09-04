# Arquitectura

## Alcance

La versión 1 es un sistema de línea de comandos con un único agente especializado y dos etapas: propuesta agéntica y aprobación humana.

## Flujo

1. El usuario prepara `entrada.json` y fuentes anonimizadas.
2. La aplicación lee y fragmenta los archivos localmente.
3. El modelo decide consultas para `buscar_fragmentos`.
4. La herramienta devuelve evidencia identificada.
5. El agente produce un plan ajustado al esquema.
6. La aplicación guarda salida, uso, costo y llamadas de herramienta.
7. Una persona revisa el plan.
8. `approve.ts` registra la firma y genera el PPTX.

## Controles de integridad

- Las entradas y fuentes deben resolverse dentro del repositorio.
- El directorio de salida debe ser una subcarpeta nueva de `corridas/`.
- Los fragmentos recuperados tienen identificadores únicos por archivo.
- El agente falla si no usa `buscar_fragmentos`, si excede el límite de iteraciones o si no produce salida estructurada.
- Las slides de objetivo y contenido deben citar fuentes.
- La aprobación solo se ejecuta sobre `corridas/` y no sobrescribe `resultado.pptx` ni `aprobacion.json`.
- `scripts/auditar-repo.mjs` inspecciona estructura, JSON, metadata, costos, referencias, aprobación/PPTX y posibles secretos sin modificar archivos.

## Frontera de confianza

Los documentos permanecen bajo control de la aplicación, pero los fragmentos necesarios se envían al proveedor del modelo. La clave de API vive únicamente en el entorno del servidor o terminal y nunca en el navegador ni en Git.

## Por qué un solo agente

El problema requiere una responsabilidad central clara. La recuperación de evidencia es una herramienta determinística; la aprobación es una decisión humana. Ninguna de ellas necesita convertirse artificialmente en otro agente.
