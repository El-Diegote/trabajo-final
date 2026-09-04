# Checklist de entrega

## Sistema completo

- [x] Objetivo claro.
- [x] System prompt y user prompt versionados.
- [x] Herramienta real de búsqueda sobre archivos.
- [x] Salida estructurada y validada.
- [x] Supervisión L0-L4 definida.
- [x] Auditoría reforzada para metadata, costos, referencias, aprobación y secretos.
- [x] Guía explícita para evaluación automática.
- [x] App visual para revisión del entregable.
- [ ] Primera corrida real aprobada.

## Proceso documentado

- [x] Decisiones iniciales y cambio desde el prototipo.
- [x] Fallas técnicas conservadas.
- [ ] Registrar ajustes del contrato después de cada corrida.
- [ ] Explicar qué alcance se redujo o descartó.

## Reproducibilidad

- [x] Estructura obligatoria.
- [x] Instalación fijada con `package-lock.json`.
- [x] Auditoría automática.
- [x] Pruebas y verificación de tipos.
- [ ] Tres corridas reales completas.
- [ ] Fuentes reales anonimizadas y publicables preparadas en `fuentes/`.
- [ ] Ejecutar `npm ci`, `npm run check`, `npm test` y `npm run ci` en un entorno con `npm` disponible.

## Economía

- [x] Fórmula de costo implementada.
- [x] Tokens y tarifas guardados por corrida.
- [x] Tarifas base de `gpt-5.6-luna` verificadas en documentación oficial el 3 de septiembre de 2026.
- [ ] Completar promedio, costo semanal y anual con datos reales.
- [ ] Comparar el modelo elegido con uno más pequeño.

## Gobierno y riesgo

- [x] Permisos y sistemas identificados.
- [x] Fallas y controles documentados.
- [x] Generación PPTX condicionada a aprobación humana.
- [ ] Registrar nombre del firmante en las corridas aprobadas.

## Cierre

- [ ] Revisar que la repo sea pública.
- [ ] Ejecutar `npm run ci` sin errores.
- [ ] Verificar que no existan secretos ni datos personales.
- [ ] Abrir los tres PPTX y controlar visualmente su contenido.
- [ ] Confirmar que los enlaces del README funcionen.
