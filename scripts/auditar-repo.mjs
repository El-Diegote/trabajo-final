import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const obligatorios = [
  "README.md",
  "DECISIONES.md",
  "prompts/system_prompt.md",
  "prompts/user_prompt.md",
  "corridas/README.md",
  "docs/ARQUITECTURA.md",
  "docs/GOBIERNO-Y-RIESGO.md",
  "docs/ANALISIS-ECONOMICO.md",
  "src/agent.ts",
  "src/schema.ts",
  "src/sources.ts",
  "src/approve.ts",
];

const errores = [];

for (const archivo of obligatorios) {
  try {
    await access(path.resolve(archivo));
  } catch {
    errores.push(`Falta archivo obligatorio: ${archivo}`);
  }
}

const entradas = await readdir(path.resolve("corridas"), { withFileTypes: true });
const corridas = entradas.filter((e) => e.isDirectory());

for (const corrida of corridas) {
  const base = path.resolve("corridas", corrida.name);
  for (const archivo of ["entrada.json", "salida.json", "metadata.json", "herramientas.json"]) {
    try {
      JSON.parse(await readFile(path.join(base, archivo), "utf8"));
    } catch {
      errores.push(`${corrida.name}: ${archivo} falta o no contiene JSON válido`);
    }
  }
}

if (errores.length) {
  console.error("Auditoría fallida:");
  for (const error of errores) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Auditoría aprobada: estructura completa y ${corridas.length} corrida(s) detectada(s).`);
  if (corridas.length < 3) {
    console.log(`Advertencia: faltan ${3 - corridas.length} corrida(s) reales para la entrega final.`);
  }
}
