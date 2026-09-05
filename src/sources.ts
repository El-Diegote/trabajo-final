import { readFile } from "node:fs/promises";
import path from "node:path";

export type Fragmento = {
  id: string;
  archivo: string;
  texto: string;
  riesgo_inyeccion: boolean;
};

const EXTENSIONES = new Set([".txt", ".md", ".csv", ".json", ".html", ".htm"]);
const PATRONES_INYECCION = [
  /ignore (all )?(previous|prior) instructions/i,
  /ignora (todas )?(las )?instrucciones/i,
  /olvida (todas )?(las )?instrucciones/i,
  /no (sigas|obedezcas) (el|las) (sistema|instrucciones)/i,
  /revela (la )?(clave|api key|system prompt|prompt del sistema)/i,
  /exfiltra|exfiltrate/i,
  /act[uú]a como/i,
  /ahora eres/i,
  /developer message|system message/i,
];

function asegurarRutaDentroDelRepo(ruta: string, baseDir: string): string {
  const repoRoot = process.cwd();
  const absoluta = path.resolve(baseDir, ruta);
  const relativa = path.relative(repoRoot, absoluta);

  if (relativa.startsWith("..") || path.isAbsolute(relativa)) {
    throw new Error(`Fuente fuera del repositorio: ${ruta}`);
  }

  return absoluta;
}

function limpiar(texto: string): string {
  return texto
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fragmentar(archivo: string, texto: string, largo = 900, solapamiento = 120): Fragmento[] {
  const resultado: Fragmento[] = [];
  let inicio = 0;
  let indice = 1;

  while (inicio < texto.length) {
    const fin = Math.min(texto.length, inicio + largo);
    const fragmento = texto.slice(inicio, fin).trim();
    if (fragmento) {
      resultado.push({
        id: `F${String(indice).padStart(3, "0")}`,
        archivo,
        texto: fragmento,
        riesgo_inyeccion: tieneRiesgoInyeccion(fragmento),
      });
      indice += 1;
    }
    if (fin === texto.length) break;
    inicio = Math.max(inicio + 1, fin - solapamiento);
  }

  return resultado;
}

export function tieneRiesgoInyeccion(texto: string): boolean {
  return PATRONES_INYECCION.some((patron) => patron.test(texto));
}

export async function cargarFuentes(rutas: string[], baseDir = process.cwd()): Promise<Fragmento[]> {
  const fragmentos: Fragmento[] = [];
  const ids = new Set<string>();

  for (const ruta of rutas) {
    const absoluta = asegurarRutaDentroDelRepo(ruta, baseDir);
    const extension = path.extname(absoluta).toLowerCase();
    if (!EXTENSIONES.has(extension)) {
      throw new Error(`Formato no admitido en v1: ${ruta}`);
    }

    const contenido = limpiar(await readFile(absoluta, "utf8"));
    if (!contenido) throw new Error(`Fuente vacía: ${ruta}`);

    const prefijo = path.basename(ruta).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    for (const fragmento of fragmentar(path.basename(ruta), contenido)) {
      const id = `${prefijo}-${fragmento.id}`;
      if (ids.has(id)) throw new Error(`Fragmento duplicado: ${id}`);
      ids.add(id);
      fragmentos.push({ ...fragmento, id });
    }
  }

  return fragmentos;
}

function palabras(texto: string): Set<string> {
  return new Set(
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((p) => p.length >= 4)
  );
}

export function buscarFragmentos(
  fragmentos: Fragmento[],
  consulta: string,
  maxResultados: number
): Fragmento[] {
  const buscadas = palabras(consulta);

  return fragmentos
    .map((fragmento) => {
      const contenidas = palabras(fragmento.texto);
      const puntaje = [...buscadas].filter((p) => contenidas.has(p)).length;
      return { fragmento, puntaje };
    })
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, maxResultados)
    .map(({ fragmento }) => fragmento);
}
