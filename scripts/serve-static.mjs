import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT || 4174);
const host = process.env.HOST || "127.0.0.1";
const basePath = process.env.BASE_PATH || "";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml"
};

function safePath(url = "/") {
  let cleanUrl = decodeURIComponent(url.split("?")[0] || "/");
  if (basePath && cleanUrl.startsWith(basePath)) {
    cleanUrl = cleanUrl.slice(basePath.length) || "/";
  }

  const requested = cleanUrl === "/" ? "/index.html" : cleanUrl;
  const filePath = resolve(root, `.${requested}`);

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

const server = createServer(async (request, response) => {
  const filePath = safePath(request.url);

  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(body);
  } catch {
    try {
      const fallback = await readFile(resolve(root, "404.html"));
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(fallback);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  }
});

server.listen(port, host, () => {
  console.log(`Command portfolio preview running at http://${host}:${port}`);
});
