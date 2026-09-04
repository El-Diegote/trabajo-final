import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

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
  "docs/INFORME-FINAL.md",
  "docs/EVALUACION-AGENTE.md",
  "fuentes/README.md",
  "fuentes/corrida-01-liderazgo-locus-competencias-caso.md",
  "fuentes/corrida-02-liderazgo-evidencia-insuficiente.md",
  "fuentes/corrida-03-liderazgo-falla-controlada.md",
  "entradas/corrida-01.json",
  "entradas/corrida-02.json",
  "entradas/corrida-03.json",
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

const ignorarDirectorios = new Set([".git", "node_modules", "dist"]);
const patronesSecretos = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /ghp_[A-Za-z0-9_]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
];
const patronOpenAiKey = /OPENAI_API_KEY[ \t]*=[ \t]*["']?([^\r\n"']+)/g;

async function existe(ruta) {
  try {
    await access(ruta);
    return true;
  } catch {
    return false;
  }
}

async function leerJson(ruta, errores, etiqueta) {
  try {
    return JSON.parse(await readFile(ruta, "utf8"));
  } catch {
    errores.push(`${etiqueta}: falta o no contiene JSON válido`);
    return undefined;
  }
}

function numeroNoNegativo(valor) {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= 0;
}

function validarCosto(metadata, corrida, errores) {
  const uso = metadata?.uso;
  const costo = metadata?.costo;
  if (!Number.isInteger(uso?.input_tokens) || uso.input_tokens < 0) {
    errores.push(`${corrida}: metadata.uso.input_tokens inválido`);
  }
  if (!Number.isInteger(uso?.output_tokens) || uso.output_tokens < 0) {
    errores.push(`${corrida}: metadata.uso.output_tokens inválido`);
  }
  if (!Number.isInteger(uso?.total_tokens) || uso.total_tokens < 0) {
    errores.push(`${corrida}: metadata.uso.total_tokens inválido`);
  }
  if (uso && uso.total_tokens !== uso.input_tokens + uso.output_tokens) {
    errores.push(`${corrida}: metadata.uso.total_tokens no coincide con entrada + salida`);
  }

  if (!numeroNoNegativo(costo?.tarifa_entrada_por_millon)) {
    errores.push(`${corrida}: tarifa de entrada inválida`);
  }
  if (!numeroNoNegativo(costo?.tarifa_salida_por_millon)) {
    errores.push(`${corrida}: tarifa de salida inválida`);
  }
  if (!numeroNoNegativo(costo?.costo_estimado)) {
    errores.push(`${corrida}: costo estimado inválido`);
  }

  if (uso && costo) {
    const esperado =
      (uso.input_tokens / 1_000_000) * costo.tarifa_entrada_por_millon +
      (uso.output_tokens / 1_000_000) * costo.tarifa_salida_por_millon;
    if (Number(esperado.toFixed(8)) !== costo.costo_estimado) {
      errores.push(`${corrida}: costo estimado no coincide con tokens y tarifas`);
    }
  }
}

function validarReferencias(salida, herramientas, corrida, errores) {
  const fragmentos = new Set();
  for (const llamada of Array.isArray(herramientas) ? herramientas : []) {
    for (const item of Array.isArray(llamada?.resultado) ? llamada.resultado : []) {
      if (item?.id && item?.archivo) fragmentos.add(`${item.archivo}#${item.id}`);
    }
  }

  for (const [indice, slide] of (salida?.slides ?? []).entries()) {
    if ((slide?.tipo === "contenido" || slide?.tipo === "objetivo") && !slide?.fuentes?.length) {
      errores.push(`${corrida}: slide ${indice + 1} no cita fuentes`);
    }
    for (const fuente of slide?.fuentes ?? []) {
      const clave = `${fuente.archivo}#${fuente.fragmento_id}`;
      if (!fragmentos.has(clave)) errores.push(`${corrida}: referencia inexistente ${clave}`);
    }
  }
}

async function validarCorrida(base, corrida, errores) {
  const entrada = await leerJson(path.join(base, "entrada.json"), errores, `${corrida}: entrada.json`);
  const salida = await leerJson(path.join(base, "salida.json"), errores, `${corrida}: salida.json`);
  const metadata = await leerJson(path.join(base, "metadata.json"), errores, `${corrida}: metadata.json`);
  const herramientas = await leerJson(
    path.join(base, "herramientas.json"),
    errores,
    `${corrida}: herramientas.json`
  );

  if (!entrada || !salida || !metadata || !herramientas) return;

  if (metadata.run_id !== corrida) errores.push(`${corrida}: metadata.run_id no coincide con la carpeta`);
  if (!metadata.fecha || Number.isNaN(Date.parse(metadata.fecha))) {
    errores.push(`${corrida}: metadata.fecha inválida`);
  }
  if (typeof metadata.modelo !== "string" || metadata.modelo.length < 2) {
    errores.push(`${corrida}: metadata.modelo ausente`);
  }
  if (salida.status !== "requiere_aprobacion") {
    errores.push(`${corrida}: salida.status debe ser requiere_aprobacion`);
  }
  if (!Array.isArray(herramientas) || herramientas.length === 0) {
    errores.push(`${corrida}: no registra herramientas reales`);
  }
  if (!Array.isArray(metadata.herramientas_usadas) || metadata.herramientas_usadas.length === 0) {
    errores.push(`${corrida}: metadata.herramientas_usadas ausente`);
  }

  validarCosto(metadata, corrida, errores);
  validarReferencias(salida, herramientas, corrida, errores);

  const pptx = path.join(base, "resultado.pptx");
  const aprobacion = path.join(base, "aprobacion.json");
  const tienePptx = await existe(pptx);
  const tieneAprobacion = await existe(aprobacion);
  if (tienePptx && !tieneAprobacion) errores.push(`${corrida}: resultado.pptx sin aprobacion.json`);
  if (!tienePptx && tieneAprobacion) errores.push(`${corrida}: aprobacion.json sin resultado.pptx`);
  if (tienePptx && (await stat(pptx)).size === 0) errores.push(`${corrida}: resultado.pptx está vacío`);
  if (tieneAprobacion) await leerJson(aprobacion, errores, `${corrida}: aprobacion.json`);
}

async function recorrerArchivos(dir, archivos = []) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    if (ignorarDirectorios.has(entrada.name)) continue;
    const ruta = path.join(dir, entrada.name);
    if (entrada.isDirectory()) await recorrerArchivos(ruta, archivos);
    else archivos.push(ruta);
  }
  return archivos;
}

async function validarSecretos(root, errores) {
  for (const archivo of await recorrerArchivos(root)) {
    const relativa = path.relative(root, archivo).replaceAll("\\", "/");
    const contenido = await readFile(archivo, "utf8").catch(() => "");
    for (const patron of patronesSecretos) {
      if (patron.test(contenido)) errores.push(`Posible secreto versionado en ${relativa}`);
    }
    for (const match of contenido.matchAll(patronOpenAiKey)) {
      const valor = match[1]?.trim();
      if (valor && valor !== "..." && valor !== "<clave>") {
        errores.push(`Posible secreto versionado en ${relativa}`);
      }
    }
  }
}

export async function auditar(root = process.cwd()) {
  const errores = [];
  const advertencias = [];

  for (const archivo of obligatorios) {
    if (!(await existe(path.join(root, archivo)))) errores.push(`Falta archivo obligatorio: ${archivo}`);
  }

  const corridasDir = path.join(root, "corridas");
  const entradas = await readdir(corridasDir, { withFileTypes: true }).catch(() => []);
  const corridas = entradas.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  if (corridas.length < 3) {
    advertencias.push(`Faltan ${3 - corridas.length} corrida(s) reales para la entrega final.`);
  }

  for (const corrida of corridas) {
    await validarCorrida(path.join(corridasDir, corrida), corrida, errores);
  }

  await validarSecretos(root, errores);
  return { errores, advertencias, corridas };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { errores, advertencias, corridas } = await auditar();

  if (errores.length) {
    console.error("Auditoría fallida:");
    for (const error of errores) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`Auditoría aprobada: estructura completa y ${corridas.length} corrida(s) detectada(s).`);
  }

  for (const advertencia of advertencias) console.log(`Advertencia: ${advertencia}`);
}
