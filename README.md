# UCEMA Deck Agent

Sistema agéntico para transformar materiales académicos reales en una propuesta de presentación trazable y, después de una aprobación humana, en un archivo PowerPoint editable.

## Estado

Versión 1 en construcción. El agente, el contrato, la salida estructurada, el registro de corridas y el control humano están implementados. Las tres corridas exigidas deben ejecutarse con datos reales y conservarse sin alterar.

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

## Supervisión

El agente trabaja en L1 para leer y buscar fragmentos, y en L2 para proponer el plan. La generación del PPTX requiere aprobación humana. La publicación o uso institucional queda en L3 y debe ser firmada por el usuario responsable.

## Instalación

Requisitos: Node.js 20 o superior y una clave de OpenAI.

    npm ci
    cp .env.example .env
    export OPENAI_API_KEY="..."
    export INPUT_USD_PER_MILLION="0.10"
    export OUTPUT_USD_PER_MILLION="0.60"
    npm run check
    npm run agente -- --input ejemplos/caso-01/entrada.json --output corridas/corrida-01
    npm run aprobar -- --run corridas/corrida-01 --por "Nombre y apellido"

No se debe versionar `.env` ni ninguna clave. El modelo se define con `AGENT_MODEL`; la elección final debe justificarse con las corridas y el criterio “el modelo más chico que realiza bien la tarea”.

## Reproducir una corrida

Cada carpeta de corrida debe contener:

- `entrada.json`: parámetros y rutas de fuentes;
- `salida.json`: respuesta estructurada exacta del agente;
- `metadata.json`: fecha, modelo, tokens, costo, herramientas y estado humano;
- `fuentes/` o referencias a archivos versionados y anonimizados;
- `resultado.pptx`: solamente después de la aprobación.

## Pruebas

    npm test
    npm run check
    npm run auditar

## Limitaciones actuales

- La primera versión procesa fuentes textuales: TXT, MD, CSV, JSON y HTML.
- PDF, DOCX, audio y análisis remoto de enlaces quedan fuera del alcance inicial.
- El agente no autentica usuarios ni valida oficialmente contenidos o marca UCEMA.
- Todavía no existen tres corridas reales: deben ejecutarse y documentarse; no se reemplazan por ejemplos fabricados.

## Documentación

- [Arquitectura](docs/ARQUITECTURA.md)
- [Gobierno y riesgo](docs/GOBIERNO-Y-RIESGO.md)
- [Análisis económico](docs/ANALISIS-ECONOMICO.md)
- [Checklist de entrega](docs/CHECKLIST-ENTREGA.md)
- [Informe final](docs/INFORME-FINAL.md)
- [Plan de corridas](corridas/README.md)
- [Decisiones](DECISIONES.md)
