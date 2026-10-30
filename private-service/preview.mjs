// Vista de desarrollo local. Nunca publicar este servidor ni el inventario en GitHub Pages.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const snapshot=process.argv[2];
if(!snapshot)throw new Error('Indica la ruta local de inventory.json');
const files={};for(const section of ['escrituras','empresas','memorias'])for(const [file,type] of [['index.html','text/html'],['style.css','text/css'],['app.js','text/javascript'],[section==='escrituras'?'table.js':'model.js','text/javascript']])files[`/${section}/${file==='index.html'?'':file}`]=[`${section}/${file}`,type];
const archives={'/empresas/api/companies':{data:{schemaVersion:1,companies:[]},version:0},'/memorias/api/memories':{data:{schemaVersion:1,memories:[]},version:0}};
createServer(async(req,res)=>{try{
  if(!['127.0.0.1:8788','localhost:8788'].includes(req.headers.host)){res.writeHead(403);res.end();return;}
  const path=new URL(req.url,'http://127.0.0.1').pathname;res.setHeader('Cache-Control','no-store');
  const archive=archives[path];
  if(archive){
    res.setHeader('Content-Type','application/json');res.setHeader('X-Preview-Only','true');
    if(req.method==='PUT'){
      if(req.headers.origin!==`http://${req.headers.host}`){res.writeHead(403);res.end();return;}
      if(req.headers['if-match']!==`"preview-${archive.version}"`){res.writeHead(412);res.end();return;}
      let body='';for await(const chunk of req){body+=chunk;if(body.length>4194304){res.writeHead(413);res.end();return;}}
      archive.data=JSON.parse(body);archive.version++;
    }
    res.setHeader('ETag',`"preview-${archive.version}"`);res.end(JSON.stringify(archive.data));return;
  }
  if(path==='/escrituras/api/inventory'){res.setHeader('Content-Type','application/json');res.setHeader('X-Preview-Only','true');res.end(await readFile(snapshot));return;}
  const file=files[path];if(!file){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file[1]+'; charset=utf-8');res.end(await readFile(root+file[0]));
}catch{res.writeHead(500);res.end('Vista previa no disponible');}}).listen(8788,'127.0.0.1',()=>console.log('Vista previa local (sin autenticación Google): http://127.0.0.1:8788/memorias/'));
