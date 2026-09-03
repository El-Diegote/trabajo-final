import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pptxgen from "pptxgenjs";
import { DeckPlanSchema } from "./schema.js";

function argumento(nombre: string): string {
  const indice = process.argv.indexOf(nombre);
  if (indice === -1 || !process.argv[indice + 1]) {
    throw new Error(`Falta el argumento ${nombre}`);
  }
  return process.argv[indice + 1];
}

async function main() {
  const runDir = path.resolve(argumento("--run"));
  const aprobadoPor = argumento("--por").trim();
  if (aprobadoPor.length < 3) throw new Error("El responsable de aprobación no es válido.");

  const plan = DeckPlanSchema.parse(
    JSON.parse(await readFile(path.join(runDir, "salida.json"), "utf8"))
  );

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = aprobadoPor;
  pptx.subject = "Presentación académica generada con revisión humana";
  pptx.title = plan.slides[0]?.titulo ?? "Presentación";
  pptx.company = "MBA UCEMA - Trabajo final";

  for (const item of plan.slides) {
    const slide = pptx.addSlide();
    slide.background = { color: "F5F8FC" };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.18,
      line: { color: "0057A8" },
      fill: { color: "0057A8" },
    });
    slide.addText(item.titulo, {
      x: 0.7,
      y: 0.5,
      w: 11.9,
      h: 0.7,
      fontFace: "Aptos Display",
      fontSize: 27,
      bold: true,
      color: "16324F",
      margin: 0,
    });
    slide.addText(
      item.bullets.map((text) => ({ text, options: { bullet: { indent: 18 } } })),
      {
        x: 0.9,
        y: 1.55,
        w: 11.5,
        h: 4.8,
        fontFace: "Aptos",
        fontSize: 19,
        color: "263746",
        breakLine: true,
        paraSpaceAfterPt: 12,
        valign: "top",
      }
    );
    const refs = item.fuentes.map((f) => `${f.archivo} · ${f.fragmento_id}`).join(" | ");
    slide.addText(refs || "Sin fuente: portada, transición o propuesta visual", {
      x: 0.7,
      y: 7.08,
      w: 11.9,
      h: 0.2,
      fontFace: "Aptos",
      fontSize: 8,
      color: "657786",
      margin: 0,
    });
    slide.addNotes(item.nota_orador);
  }

  const salidaPptx = path.join(runDir, "resultado.pptx");
  await pptx.writeFile({ fileName: salidaPptx });
  await writeFile(
    path.join(runDir, "aprobacion.json"),
    JSON.stringify(
      {
        decision: "aprobado",
        aprobado_por: aprobadoPor,
        fecha: new Date().toISOString(),
        nivel: "L2",
        archivo_generado: "resultado.pptx",
      },
      null,
      2
    ) + "\n"
  );

  console.log(`PPTX generado después de aprobación: ${salidaPptx}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
