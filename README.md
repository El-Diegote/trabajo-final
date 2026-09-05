# UCEMA Deck Agent

Sistema agéntico para transformar materiales académicos reales en una propuesta de presentación trazable y, después de una aprobación humana, en un archivo PowerPoint editable.

## Estado

Versión 1 verificable. El agente, el contrato, la salida estructurada, el registro de corridas, el control humano, la auditoría, los tests y la app visual están implementados. El repositorio público contiene tres corridas reales ejecutadas el 4 de septiembre de 2026 con fuentes anonimizadas y costos registrados. La generación de PPTX sigue bloqueada hasta aprobación humana explícita.

## Problema real

Preparar una presentación académica exige leer materiales, decidir qué es relevante, ordenar un relato y diseñar slides. El prototipo reduce ese trabajo sin reemplazar el juicio del docente o alumno ni atribuir a una fuente afirmaciones que no estén respaldadas.

## Objetivo del agente

Proponer un plan de slides adecuado al perfil, duración y estilo pedidos; fundamentar el contenido con fragmentos recuperados de las fuentes; declarar límites y detenerse antes de crear el PPTX para que una persona revise y apruebe.

## Contrato y componentes

- `prompts/system_prompt.md`: rol, objetivo, reglas, herramientas, salida y supervisión.
- `prompts/user_prompt.md`: plantilla de entrada de cada corrida.
- `src/agent.ts`: bucle agéntico con OpenAI Responses API y herramienta de búsqueda.
- `src/schema.ts`: esquema JSON estricto del resultado.
- `src/sources.ts`: lectura, fragmentación y búsqueda local de fuentes.
- `src/approve.ts`: punto de control humano y creación del PPTX.
- `corridas/`: evidencia inalterada de las ejecuciones reales.
- `DECISIONES.md`: historia de iteraciones, fallas y cambios de alcance.

## Mapa de los seis requisitos

| Requisito | Evidencia en el repositorio |
|---|---|
| Sistema completo | `src/agent.ts`, `src/sources.ts`, `src/schema.ts`, `src/approve.ts`, prompts, auditoría y app visual. |
| Corre de verdad | `corridas/corrida-01`, `corridas/corrida-02`, `corridas/corrida-03` con entrada, salida, herramientas y metadata reales. |
| Formato estricto | JSON Schema en `src/schema.ts`, validación Zod, `npm run auditar` y `docs/EVALUACION-AGENTE.md`. |
| Historia del proceso | `DECISIONES.md`, fallas técnicas, retests, fuentes anonimizadas y decisiones posteriores a corridas. |
| Análisis económico | `docs/ANALISIS-ECONOMICO.md` y `metadata.json` de cada corrida con tokens, tarifas y costo. |
| Gobierno y riesgo | `docs/GOBIERNO-Y-RIESGO.md`, `docs/SEGURIDAD-ANTI-INGENIERIA-SOCIAL.md`, niveles L0-L4, aprobación humana y controles de secretos/rutas. |

## Supervisión

El agente trabaja en L1 para leer y buscar fragmentos, y en L2 para proponer el plan. La generación del PPTX requiere aprobación humana. La publicación o uso institucional queda en L3 y debe ser firmada por el usuario responsable.

## Instalación

Requisitos: Node.js 20 o superior y una clave de OpenAI.

En Windows PowerShell, si `npm` queda bloqueado por política de scripts, usar `npm.cmd`:

    cd "C:\TRABAJO FINAL - C IA"
    & "C:\Program Files\nodejs\npm.cmd" ci
    $env:AGENT_MODEL = "gpt-5.6-luna"
    $env:INPUT_USD_PER_MILLION = "0.10"
    $env:OUTPUT_USD_PER_MILLION = "0.60"
    & "C:\Program Files\nodejs\npm.cmd" run ci

Antes de ejecutar corridas reales, verificar que la variable `OPENAI_API_KEY` exista en el entorno de usuario. No pegar claves en archivos del repositorio.

En macOS/Linux:

    npm ci
    export AGENT_MODEL="gpt-5.6-luna"
    export INPUT_USD_PER_MILLION="0.10"
    export OUTPUT_USD_PER_MILLION="0.60"
    npm run ci

Antes de ejecutar corridas reales, exportar `OPENAI_API_KEY` en la terminal o cargarla desde un gestor de secretos.

No se debe versionar `.env` ni ninguna clave. El modelo se define con `AGENT_MODEL`; la elección final debe justificarse con las corridas y el criterio “el modelo más chico que realiza bien la tarea”.

## Reproducir una corrida

Cada carpeta de corrida debe contener:

- `entrada.json`: parámetros y rutas de fuentes;
- `salida.json`: respuesta estructurada exacta del agente;
- `metadata.json`: fecha, modelo, tokens, costo, herramientas y estado humano;
- `fuentes/` o referencias a archivos versionados y anonimizados;
- `resultado.pptx`: solamente después de la aprobación.

Las tres corridas finales ya versionadas se ejecutan desde:

    npm run agente -- --input entradas/corrida-01.json --output corridas/corrida-01
    npm run agente -- --input entradas/corrida-02.json --output corridas/corrida-02
    npm run agente -- --input entradas/corrida-03.json --output corridas/corrida-03

Si se vuelve a correr una de ellas, hacerlo en una carpeta nueva para no sobrescribir evidencia histórica. Para generar un PPTX luego de revisión humana:

    npm run aprobar -- --run corridas/corrida-01 --por "Nombre y apellido"

## Pruebas

    npm test
    npm run check
    npm run auditar

## App visual

La carpeta `app/` contiene un tablero estático para revisar el entregable como una aplicación:

    npm run app

Alternativa sin npm:

    python -m http.server 5173 -d app

Luego abrir `http://localhost:5173`.

## Limitaciones actuales

- La primera versión procesa fuentes textuales: TXT, MD, CSV, JSON y HTML.
- PDF, DOCX, audio y análisis remoto de enlaces quedan fuera del alcance inicial.
- El agente no autentica usuarios ni valida oficialmente contenidos o marca UCEMA.
- Los PDF originales no se versionan: se transformaron en fuentes `.md` anonimizadas y publicables.
- Los PPTX no se generan automáticamente: requieren firma humana previa y validación visual posterior.
- La comparación contra `gpt-5.6-terra` es económica; no se declara una prueba empírica de calidad no ejecutada.

## Documentación

- [Arquitectura](docs/ARQUITECTURA.md)
- [Gobierno y riesgo](docs/GOBIERNO-Y-RIESGO.md)
- [Seguridad anti ingeniería social](docs/SEGURIDAD-ANTI-INGENIERIA-SOCIAL.md)
- [Análisis económico](docs/ANALISIS-ECONOMICO.md)
- [Checklist de entrega](docs/CHECKLIST-ENTREGA.md)
- [Informe final](docs/INFORME-FINAL.md)
- [Guía para agente evaluador](docs/EVALUACION-AGENTE.md)
- [Plan de corridas](corridas/README.md)
- [Fuentes reales anonimizadas](fuentes/README.md)
- [Decisiones](DECISIONES.md)
