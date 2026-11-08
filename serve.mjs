// Local HTTP preview: node serve.mjs (or pass a different port).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2] || 4174);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
http.createServer(async (request,response) => {
  try {
    const route = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    if (route.split('/').some(part => part.startsWith('.'))) {response.writeHead(403).end('Forbidden'); return;}
    const filename = path.resolve(root,'.' + (route.endsWith('/') ? route + 'index.html' : route));
    if (!filename.startsWith(root + path.sep)) {response.writeHead(403).end('Forbidden'); return;}
    const body = await readFile(filename);
    response.writeHead(200,{'Content-Type':types[path.extname(filename)] || 'application/octet-stream','Cache-Control':'no-store'});
    response.end(body);
  } catch {response.writeHead(404).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:' + port));

