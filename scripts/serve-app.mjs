import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const port = Number(process.env.PORT ?? 5173);
const appDir = path.resolve("app");
const tipos = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
]);

function resolver(url) {
  const limpia = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const solicitada = limpia === "/" ? "/index.html" : limpia;
  const absoluta = path.resolve(appDir, `.${solicitada}`);
  const relativa = path.relative(appDir, absoluta);
  if (relativa.startsWith("..") || path.isAbsolute(relativa)) return undefined;
  return absoluta;
}

const server = createServer(async (req, res) => {
  const archivo = resolver(req.url ?? "/");
  if (!archivo) {
    res.writeHead(403);
    res.end("Ruta no permitida");
    return;
  }

  try {
    const info = await stat(archivo);
    if (!info.isFile()) throw new Error("No es archivo");
    res.writeHead(200, { "content-type": tipos.get(path.extname(archivo)) ?? "application/octet-stream" });
    createReadStream(archivo).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("No encontrado");
  }
});

server.listen(port, () => {
  console.log(`UCEMA Deck Agent app: http://localhost:${port}`);
});
