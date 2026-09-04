import { z } from "zod";

export const EntradaSchema = z.object({
  titulo: z.string().min(3),
  materia: z.string().min(2),
  perfil: z.enum(["docente", "alumno"]),
  duracion_minutos: z.number().int().min(5).max(120),
  estilo: z.enum(["academico", "ejecutivo", "visual"]),
  objetivo: z.string().min(10),
  instrucciones: z.string(),
  fuentes: z.array(z.string()).min(1),
});

export const FuenteRefSchema = z.object({
  fragmento_id: z.string(),
  archivo: z.string(),
});

export const SlideSchema = z.object({
  numero: z.number().int().positive(),
  tipo: z.enum(["portada", "objetivo", "contenido", "visual", "cierre"]),
  titulo: z.string(),
  bullets: z.array(z.string()),
  fuentes: z.array(FuenteRefSchema),
  nota_orador: z.string(),
});

export const DeckPlanSchema = z.object({
  status: z.literal("requiere_aprobacion"),
  resumen: z.string(),
  slides: z.array(SlideSchema).min(4),
  advertencias: z.array(z.string()),
  preguntas_para_usuario: z.array(z.string()),
  supervision: z.object({
    nivel: z.literal("L2"),
    accion_requerida: z.literal("revisar_y_aprobar"),
  }),
}).superRefine((plan, ctx) => {
  plan.slides.forEach((slide, index) => {
    if (slide.numero !== index + 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["slides", index, "numero"],
        message: "Los números de slide deben ser secuenciales desde 1.",
      });
    }

    if (["contenido", "objetivo"].includes(slide.tipo) && slide.fuentes.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["slides", index, "fuentes"],
        message: "Las slides de contenido u objetivo deben citar al menos una fuente.",
      });
    }
  });
});

export type Entrada = z.infer<typeof EntradaSchema>;
export type DeckPlan = z.infer<typeof DeckPlanSchema>;

export const deckPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "status",
    "resumen",
    "slides",
    "advertencias",
    "preguntas_para_usuario",
    "supervision"
  ],
  properties: {
    status: { type: "string", enum: ["requiere_aprobacion"] },
    resumen: { type: "string" },
    slides: {
      type: "array",
      minItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["numero", "tipo", "titulo", "bullets", "fuentes", "nota_orador"],
        properties: {
          numero: { type: "integer", minimum: 1 },
          tipo: {
            type: "string",
            enum: ["portada", "objetivo", "contenido", "visual", "cierre"]
          },
          titulo: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
          fuentes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["fragmento_id", "archivo"],
              properties: {
                fragmento_id: { type: "string" },
                archivo: { type: "string" }
              }
            }
          },
          nota_orador: { type: "string" }
        }
      }
    },
    advertencias: { type: "array", items: { type: "string" } },
    preguntas_para_usuario: { type: "array", items: { type: "string" } },
    supervision: {
      type: "object",
      additionalProperties: false,
      required: ["nivel", "accion_requerida"],
      properties: {
        nivel: { type: "string", enum: ["L2"] },
        accion_requerida: { type: "string", enum: ["revisar_y_aprobar"] }
      }
    }
  }
} as const;
