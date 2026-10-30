// Vista de desarrollo local. Nunca publicar este servidor ni el inventario en GitHub Pages.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../escrituras/',import.meta.url));
const snapshot=process.argv[2];
if(!snapshot)throw new Error('Indica la ruta local de inventory.json');
const files={'/escrituras/':['index.html','text/html'],'/escrituras/style.css':['style.css','text/css'],'/escrituras/app.js':['app.js','text/javascript'],'/escrituras/table.js':['table.js','text/javascript']};
createServer(async(req,res)=>{try{if(!['127.0.0.1:8788','localhost:8788'].includes(req.headers.host)){res.writeHead(403);res.end();return;}const path=new URL(req.url,'http://127.0.0.1').pathname;res.setHeader('Cache-Control','no-store');if(path==='/escrituras/api/inventory'){res.setHeader('Content-Type','application/json');res.setHeader('X-Preview-Only','true');res.end(await readFile(snapshot));return;}const f=files[path];if(!f){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',f[1]+'; charset=utf-8');res.end(await readFile(root+f[0]));}catch{res.writeHead(500);res.end('Vista previa no disponible');}}).listen(8788,'127.0.0.1',()=>console.log('Vista previa local (sin autenticación Google): http://127.0.0.1:8788/escrituras/'));
