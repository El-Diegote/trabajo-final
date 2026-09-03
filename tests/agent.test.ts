import assert from "node:assert/strict";
import test from "node:test";
import { DeckPlanSchema, EntradaSchema } from "../src/schema.js";
import { buscarFragmentos } from "../src/sources.js";

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
