import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { DeckPlanSchema, EntradaSchema } from "../src/schema.js";
import { buscarFragmentos, cargarFuentes } from "../src/sources.js";

test("acepta una entrada válida", () => {
  const entrada = EntradaSchema.parse({
    titulo: "Estrategia empresarial",
    materia: "Management",
    perfil: "alumno",
    duracion_minutos: 10,
    estilo: "academico",
    objetivo: "Explicar una decisión estratégica con evidencia.",
    instrucciones: "",
    fuentes: ["ejemplos/caso-01/fuente.md"]
  });
  assert.equal(entrada.perfil, "alumno");
});

test("rechaza una salida sin aprobación humana", () => {
  assert.throws(() =>
    DeckPlanSchema.parse({
      status: "aprobado",
      resumen: "Prueba",
      slides: [],
      advertencias: [],
      preguntas_para_usuario: [],
      supervision: { nivel: "L2", accion_requerida: "revisar_y_aprobar" }
    })
  );
});

test("rechaza slides de contenido sin fuentes trazables", () => {
  assert.throws(() =>
    DeckPlanSchema.parse({
      status: "requiere_aprobacion",
      resumen: "Prueba",
      slides: [
        { numero: 1, tipo: "portada", titulo: "Portada", bullets: [], fuentes: [], nota_orador: "" },
        { numero: 2, tipo: "objetivo", titulo: "Objetivo", bullets: ["Objetivo"], fuentes: [], nota_orador: "" },
        { numero: 3, tipo: "contenido", titulo: "Contenido", bullets: ["Dato"], fuentes: [], nota_orador: "" },
        { numero: 4, tipo: "cierre", titulo: "Cierre", bullets: [], fuentes: [], nota_orador: "" }
      ],
      advertencias: [],
      preguntas_para_usuario: [],
      supervision: { nivel: "L2", accion_requerida: "revisar_y_aprobar" }
    })
  );
});

test("la búsqueda devuelve fragmentos trazables", () => {
  const resultado = buscarFragmentos(
    [
      { id: "A-F001", archivo: "a.md", texto: "La estrategia requiere elegir y renunciar." },
      { id: "B-F001", archivo: "b.md", texto: "Contenido no relacionado." }
    ],
    "elección estratégica",
    1
  );
  assert.equal(resultado[0].id, "A-F001");
});

test("rechaza fuentes fuera del repositorio", async () => {
  await assert.rejects(() => cargarFuentes(["..\\fuera.md"]), /fuera del repositorio/);
});

test("la auditoría detecta aprobaciones sin PPTX", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ucema-auditoria-"));
  const obligatorios = [
    "README.md",
    "AGENTS.md",
    "DECISIONES.md",
    "prompts/system_prompt.md",
    "prompts/user_prompt.md",
    "corridas/README.md",
    "docs/ARQUITECTURA.md",
    "docs/GOBIERNO-Y-RIESGO.md",
    "docs/ANALISIS-ECONOMICO.md",
    "docs/CHECKLIST-ENTREGA.md",
    "src/agent.ts",
    "src/schema.ts",
    "src/sources.ts",
    "src/approve.ts",
    "scripts/auditar-repo.mjs",
    ".github/workflows/ci.yml",
    "tests/agent.test.ts",
    "ejemplos/caso-01/entrada.json",
    "ejemplos/caso-01/fuente.md",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    ".env.example",
    ".gitignore",
  ];

  try {
    for (const archivo of obligatorios) {
      await mkdir(path.dirname(path.join(root, archivo)), { recursive: true });
      await writeFile(path.join(root, archivo), archivo.endsWith(".json") ? "{}\n" : "ok\n");
    }

    const corrida = path.join(root, "corridas", "corrida-01");
    await mkdir(corrida, { recursive: true });
    await writeFile(path.join(corrida, "entrada.json"), JSON.stringify({ fuentes: ["fuente.md"] }));
    await writeFile(
      path.join(corrida, "salida.json"),
      JSON.stringify({
        status: "requiere_aprobacion",
        slides: [
          {
            numero: 1,
            tipo: "contenido",
            titulo: "Contenido",
            bullets: ["Dato"],
            fuentes: [{ archivo: "fuente.md", fragmento_id: "fuente-F001" }],
            nota_orador: ""
          }
        ]
      })
    );
    await writeFile(
      path.join(corrida, "metadata.json"),
      JSON.stringify({
        run_id: "corrida-01",
        fecha: "2026-09-03T00:00:00.000Z",
        modelo: "gpt-test",
        uso: { input_tokens: 100, output_tokens: 50, total_tokens: 150 },
        costo: {
          tarifa_entrada_por_millon: 1,
          tarifa_salida_por_millon: 2,
          costo_estimado: 0.0002
        },
        herramientas_usadas: ["buscar_fragmentos"]
      })
    );
    await writeFile(
      path.join(corrida, "herramientas.json"),
      JSON.stringify([
        {
          nombre: "buscar_fragmentos",
          argumentos: { consulta: "dato", max_resultados: 1 },
          resultado: [{ id: "fuente-F001", archivo: "fuente.md", texto: "Dato" }]
        }
      ])
    );
    await writeFile(path.join(corrida, "aprobacion.json"), JSON.stringify({ decision: "aprobado" }));

    const { auditar } = await import(pathToFileURL(path.resolve("scripts/auditar-repo.mjs")).href);
    const resultado = await auditar(root);
    assert.ok(resultado.errores.some((error: string) => error.includes("aprobacion.json sin resultado.pptx")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
