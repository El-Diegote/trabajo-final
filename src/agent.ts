import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { EntradaSchema, DeckPlanSchema, deckPlanJsonSchema } from "./schema.js";
import { buscarFragmentos, cargarFuentes } from "./sources.js";

type ToolLog = {
  nombre: string;
  argumentos: unknown;
  resultado: unknown;
};

type Usage = {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
};

function argumento(nombre: string): string {
  const indice = process.argv.indexOf(nombre);
  if (indice === -1 || !process.argv[indice + 1]) {
    throw new Error(`Falta el argumento ${nombre}`);
  }
  return process.argv[indice + 1];
}

function completarPlantilla(plantilla: string, entrada: ReturnType<typeof EntradaSchema.parse>): string {
  const valores: Record<string, string> = {
    titulo: entrada.titulo,
    materia: entrada.materia,
    perfil: entrada.perfil,
    duracion_minutos: String(entrada.duracion_minutos),
    estilo: entrada.estilo,
    objetivo: entrada.objetivo,
    instrucciones: entrada.instrucciones || "Ninguna",
  };

  let resultado = plantilla;
  for (const [clave, valor] of Object.entries(valores)) {
    resultado = resultado.replaceAll(`{{${clave}}}`, valor);
  }
  return resultado;
}

function sumarUso(acumulado: Usage, usage: any): Usage {
  return {
    input_tokens: acumulado.input_tokens + Number(usage?.input_tokens ?? 0),
    output_tokens: acumulado.output_tokens + Number(usage?.output_tokens ?? 0),
    total_tokens: acumulado.total_tokens + Number(usage?.total_tokens ?? 0),
  };
}

function calcularCosto(uso: Usage) {
  const tarifaEntrada = Number(process.env.INPUT_USD_PER_MILLION ?? "0");
  const tarifaSalida = Number(process.env.OUTPUT_USD_PER_MILLION ?? "0");
  const costo =
    (uso.input_tokens / 1_000_000) * tarifaEntrada +
    (uso.output_tokens / 1_000_000) * tarifaSalida;

  return {
    moneda: "USD",
    tarifa_entrada_por_millon: tarifaEntrada,
    tarifa_salida_por_millon: tarifaSalida,
    costo_estimado: Number(costo.toFixed(8)),
  };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Falta OPENAI_API_KEY. Configurala fuera del repositorio.");
  }

  const inputPath = path.resolve(argumento("--input"));
  const outputDir = path.resolve(argumento("--output"));
  const entradaRaw = JSON.parse(await readFile(inputPath, "utf8"));
  const entrada = EntradaSchema.parse(entradaRaw);
  const fragmentos = await cargarFuentes(entrada.fuentes);
  const systemPrompt = await readFile(path.resolve("prompts/system_prompt.md"), "utf8");
  const userTemplate = await readFile(path.resolve("prompts/user_prompt.md"), "utf8");
  const userPrompt =
    completarPlantilla(userTemplate, entrada) +
    "\n\nFuentes disponibles:\n" +
    [...new Set(fragmentos.map((f) => f.archivo))].map((f) => `- ${f}`).join("\n");

  const client = new OpenAI();
  const model = process.env.AGENT_MODEL ?? "gpt-5.6-luna";
  const toolLog: ToolLog[] = [];
  let uso: Usage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

  const tools: any[] = [
    {
      type: "function",
      name: "buscar_fragmentos",
      description:
        "Busca evidencia en las fuentes locales cargadas y devuelve fragmentos con identificador y archivo.",
      strict: true,
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["consulta", "max_resultados"],
        properties: {
          consulta: { type: "string" },
          max_resultados: { type: "integer", minimum: 1, maximum: 10 },
        },
      },
    },
  ];

  const base: any = {
    model,
    instructions: systemPrompt,
    tools,
    text: {
      format: {
        type: "json_schema",
        name: "plan_presentacion",
        strict: true,
        schema: deckPlanJsonSchema,
      },
    },
  };

  let response: any = await client.responses.create({
    ...base,
    input: [{ role: "user", content: userPrompt }],
  });
  uso = sumarUso(uso, response.usage);

  for (let vuelta = 0; vuelta < 6; vuelta += 1) {
    const llamadas = response.output.filter((item: any) => item.type === "function_call");
    if (!llamadas.length) break;

    const resultados = llamadas.map((llamada: any) => {
      if (llamada.name !== "buscar_fragmentos") {
        throw new Error(`Herramienta no permitida: ${llamada.name}`);
      }

      const args = JSON.parse(llamada.arguments);
      const encontrados = buscarFragmentos(fragmentos, args.consulta, args.max_resultados);
      toolLog.push({ nombre: llamada.name, argumentos: args, resultado: encontrados });

      return {
        type: "function_call_output",
        call_id: llamada.call_id,
        output: JSON.stringify(encontrados),
      };
    });

    response = await client.responses.create({
      ...base,
      previous_response_id: response.id,
      input: resultados,
    });
    uso = sumarUso(uso, response.usage);
  }

  if (!toolLog.length) throw new Error("El agente no utilizó la herramienta obligatoria.");

  const salida = DeckPlanSchema.parse(JSON.parse(response.output_text));
  const ahora = new Date().toISOString();

  await mkdir(outputDir, { recursive: false });
  await writeFile(path.join(outputDir, "entrada.json"), JSON.stringify(entrada, null, 2) + "\n");
  await writeFile(path.join(outputDir, "salida.json"), JSON.stringify(salida, null, 2) + "\n");
  await writeFile(path.join(outputDir, "herramientas.json"), JSON.stringify(toolLog, null, 2) + "\n");
  await writeFile(
    path.join(outputDir, "metadata.json"),
    JSON.stringify(
      {
        run_id: path.basename(outputDir),
        fecha: ahora,
        modelo: model,
        prompt_version: "v1",
        prompt_sha256: createHash("sha256").update(systemPrompt + userTemplate).digest("hex"),
        uso,
        costo: calcularCosto(uso),
        herramientas_usadas: toolLog.map((x) => x.nombre),
        estado_humano: "pendiente",
      },
      null,
      2
    ) + "\n"
  );

  console.log(`Corrida guardada en ${outputDir}`);
  console.log("Estado: requiere aprobación humana");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
