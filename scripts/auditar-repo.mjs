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
  "docs/SEGURIDAD-ANTI-INGENIERIA-SOCIAL.md",
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
const extensionesFuente = new Set([".txt", ".md", ".csv", ".json", ".html", ".htm"]);

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

function numeroPositivo(valor) {
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0;
}

async function validarEntrada(entrada, root, corrida, errores) {
  if (!Array.isArray(entrada?.fuentes) || entrada.fuentes.length === 0) {
    errores.push(`${corrida}: entrada.fuentes debe contener al menos una fuente`);
    return;
  }
  for (const fuente of entrada.fuentes) {
    if (typeof fuente !== "string" || fuente.trim().length === 0) {
      errores.push(`${corrida}: entrada.fuentes contiene una ruta inválida`);
      continue;
    }
    const absoluta = path.resolve(root, fuente);
    const relativa = path.relative(root, absoluta);
    if (relativa.startsWith("..") || path.isAbsolute(relativa)) {
      errores.push(`${corrida}: entrada.fuentes contiene ruta fuera del repositorio`);
      continue;
    }
    if (!extensionesFuente.has(path.extname(absoluta).toLowerCase())) {
      errores.push(`${corrida}: entrada.fuentes contiene formato no admitido`);
    }
    if (!(await existe(absoluta))) errores.push(`${corrida}: fuente declarada no existe: ${fuente}`);
  }
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

  if (!numeroPositivo(costo?.tarifa_entrada_por_millon)) {
    errores.push(`${corrida}: tarifa de entrada inválida`);
  }
  if (!numeroPositivo(costo?.tarifa_salida_por_millon)) {
    errores.push(`${corrida}: tarifa de salida inválida`);
  }
  if (!numeroPositivo(costo?.costo_estimado)) {
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
    if (llamada?.nombre !== "buscar_fragmentos") {
      errores.push(`${corrida}: herramienta no permitida o ausente`);
    }
    const args = llamada?.argumentos;
    if (
      typeof args?.consulta !== "string" ||
      !Number.isInteger(args?.max_resultados) ||
      args.max_resultados < 1 ||
      args.max_resultados > 10
    ) {
      errores.push(`${corrida}: argumentos inválidos en buscar_fragmentos`);
    }
    for (const item of Array.isArray(llamada?.resultado) ? llamada.resultado : []) {
      if (
        typeof item?.archivo !== "string" ||
        item.archivo.includes("/") ||
        item.archivo.includes("\\") ||
        item.archivo.includes("..")
      ) {
        errores.push(`${corrida}: archivo inseguro en resultado de herramienta`);
      }
      if (typeof item?.id !== "string" || !/^[A-Za-z0-9._-]+-F\d{3}$/.test(item.id)) {
        errores.push(`${corrida}: id inválido en resultado de herramienta`);
      }
      if (item?.id && item?.archivo) fragmentos.add(`${item.archivo}#${item.id}`);
    }
  }

  for (const [indice, slide] of (salida?.slides ?? []).entries()) {
    if ((slide?.tipo === "contenido" || slide?.tipo === "objetivo") && !slide?.fuentes?.length) {
      errores.push(`${corrida}: slide ${indice + 1} no cita fuentes`);
    }
    for (const fuente of slide?.fuentes ?? []) {
      const clave = `${fuente.archivo}#${fuente.fragmento_id}`;
      if (
        typeof fuente.archivo !== "string" ||
        fuente.archivo.includes("/") ||
        fuente.archivo.includes("\\") ||
        fuente.archivo.includes("..")
      ) {
        errores.push(`${corrida}: referencia de archivo insegura`);
      }
      if (typeof fuente.fragmento_id !== "string" || !/^[A-Za-z0-9._-]+-F\d{3}$/.test(fuente.fragmento_id)) {
        errores.push(`${corrida}: fragmento_id con formato inválido`);
      }
      if (!fragmentos.has(clave)) errores.push(`${corrida}: referencia inexistente ${clave}`);
    }
  }
}

function validarSalidaEstructurada(salida, corrida, errores) {
  if (salida?.status !== "requiere_aprobacion") {
    errores.push(`${corrida}: salida.status debe ser requiere_aprobacion`);
  }
  if (typeof salida?.resumen !== "string" || salida.resumen.trim().length < 20) {
    errores.push(`${corrida}: salida.resumen ausente o demasiado breve`);
  }
  if (!Array.isArray(salida?.slides) || salida.slides.length < 4) {
    errores.push(`${corrida}: salida.slides debe contener al menos 4 slides`);
  }
  for (const [indice, slide] of (Array.isArray(salida?.slides) ? salida.slides : []).entries()) {
    if (slide?.numero !== indice + 1) errores.push(`${corrida}: numeración de slides no secuencial`);
    if (!["portada", "objetivo", "contenido", "visual", "cierre"].includes(slide?.tipo)) {
      errores.push(`${corrida}: slide ${indice + 1} tiene tipo inválido`);
    }
    if (typeof slide?.titulo !== "string" || slide.titulo.trim().length < 3) {
      errores.push(`${corrida}: slide ${indice + 1} no tiene título válido`);
    }
    if (!Array.isArray(slide?.bullets) || slide.bullets.length === 0) {
      errores.push(`${corrida}: slide ${indice + 1} no tiene bullets`);
    }
    if (typeof slide?.nota_orador !== "string" || slide.nota_orador.trim().length === 0) {
      errores.push(`${corrida}: slide ${indice + 1} no tiene nota de orador`);
    }
  }
  if (!Array.isArray(salida?.advertencias)) errores.push(`${corrida}: advertencias debe ser un array`);
  if (!Array.isArray(salida?.preguntas_para_usuario)) {
    errores.push(`${corrida}: preguntas_para_usuario debe ser un array`);
  }
  if (
    salida?.supervision?.nivel !== "L2" ||
    salida?.supervision?.accion_requerida !== "revisar_y_aprobar"
  ) {
    errores.push(`${corrida}: supervision inválida`);
  }
}

async function validarCorrida(base, corrida, errores, root) {
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
  if (typeof metadata.prompt_version !== "string" || metadata.prompt_version.length < 1) {
    errores.push(`${corrida}: metadata.prompt_version ausente`);
  }
  if (typeof metadata.prompt_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(metadata.prompt_sha256)) {
    errores.push(`${corrida}: metadata.prompt_sha256 inválido`);
  }
  await validarEntrada(entrada, root, corrida, errores);
  validarSalidaEstructurada(salida, corrida, errores);
  if (!Array.isArray(herramientas) || herramientas.length === 0) {
    errores.push(`${corrida}: no registra herramientas reales`);
  }
  if (!Array.isArray(metadata.herramientas_usadas) || metadata.herramientas_usadas.length === 0) {
    errores.push(`${corrida}: metadata.herramientas_usadas ausente`);
  } else if (metadata.herramientas_usadas.some((nombre) => nombre !== "buscar_fragmentos")) {
    errores.push(`${corrida}: metadata registra herramientas no permitidas`);
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
  if (tieneAprobacion) {
    const aprobacionJson = await leerJson(aprobacion, errores, `${corrida}: aprobacion.json`);
    if (aprobacionJson) {
      if (aprobacionJson.decision !== "aprobado") errores.push(`${corrida}: aprobacion.decision inválida`);
      if (typeof aprobacionJson.aprobado_por !== "string" || aprobacionJson.aprobado_por.trim().length < 3) {
        errores.push(`${corrida}: aprobacion.aprobado_por inválido`);
      }
      if (!aprobacionJson.fecha || Number.isNaN(Date.parse(aprobacionJson.fecha))) {
        errores.push(`${corrida}: aprobacion.fecha inválida`);
      }
      if (aprobacionJson.nivel !== "L2") errores.push(`${corrida}: aprobacion.nivel debe ser L2`);
      if (aprobacionJson.archivo_generado !== "resultado.pptx") {
        errores.push(`${corrida}: aprobacion.archivo_generado inválido`);
      }
      if (metadata.estado_humano !== "aprobado") {
        errores.push(`${corrida}: metadata.estado_humano debe ser aprobado cuando existe PPTX`);
      }
    }
  } else if (metadata.estado_humano !== "pendiente") {
    errores.push(`${corrida}: metadata.estado_humano debe ser pendiente sin aprobación`);
  }
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
  const corridas = entradas
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .map((e) => e.name)
    .sort();
  if (corridas.length < 3) {
    advertencias.push(`Faltan ${3 - corridas.length} corrida(s) reales para la entrega final.`);
  }

  for (const corrida of corridas) {
    await validarCorrida(path.join(corridasDir, corrida), corrida, errores, root);
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
