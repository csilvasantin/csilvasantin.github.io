// Vista de desarrollo local. Nunca publicar este servidor ni el inventario en GitHub Pages.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import pages from './pages.mjs';
import {answerQuestion} from './assistant.mjs';
import {pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const snapshot=process.argv[2];
if(!snapshot)throw new Error('Indica la ruta local de inventory.json');
const files={};for(const section of ['escrituras','empresas','memorias'])for(const [file,type] of [['index.html','text/html'],['style.css','text/css'],['app.js','text/javascript'],[section==='escrituras'?'table.js':'model.js','text/javascript']])files[`/${section}/${file==='index.html'?'':file}`]=[`${section}/${file}`,type];
const archives={'/empresas/api/companies':{data:{schemaVersion:1,companies:[]},version:0},'/memorias/api/memories':{data:{schemaVersion:1,memories:[]},version:0}};
archives['/empresas/api/family-plan']={data:{schemaVersion:1,holdingPlan:'',administratorPlan:'',continuityPlan:'',assistantName:'',assistantBrief:''},version:0};
archives['/empresas/api/places']={data:{schemaVersion:1,places:[]},version:0};
if(process.argv[3])for(const [path,file] of [['/empresas/api/companies','companies-initial.json'],['/empresas/api/family-plan','family-plan-initial.json'],['/empresas/api/places','places-initial.json']])archives[path].data=JSON.parse(await readFile(process.argv[3]+'/'+file,'utf8'));
const liveAI=process.argv[4]?(await import(pathToFileURL(process.argv[4]).href)).default:null;
const usage=new Map();
const previewEnv={AI:liveAI,INVENTORY:{get:async key=>{const values={'companies.json':archives['/empresas/api/companies'].data,'family-plan.json':archives['/empresas/api/family-plan'].data,'memories.json':archives['/memorias/api/memories'].data,'places.json':archives['/empresas/api/places'].data};const value=key==='inventory.json'?JSON.parse(await readFile(snapshot,'utf8')):values[key]||usage.get(key);return value?{httpEtag:'"preview"',json:async()=>value}:null;},put:async(key,body)=>{if(!key.startsWith('assistant-usage/'))throw Error('Solo contador de prueba');usage.set(key,JSON.parse(body));return {httpEtag:'"preview"'};}}};
createServer(async(req,res)=>{try{
  if(!['127.0.0.1:8788','localhost:8788'].includes(req.headers.host)){res.writeHead(403);res.end();return;}
  const path=new URL(req.url,'http://127.0.0.1').pathname;res.setHeader('Cache-Control','no-store');
  if(path==='/intranet/api/assistant'){
    if(req.method!=='POST'){res.writeHead(405);res.end();return;}
    const result=await answerQuestion(new Request(`http://${req.headers.host}${path}`,{method:'POST',headers:req.headers,body:ReadableStream.from(req),duplex:'half'}),previewEnv);
    res.writeHead(result.status,{'Content-Type':'application/json','X-Preview-Only':'true'});res.end(JSON.stringify(result.body));return;
  }
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
  if(pages[path]){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(pages[path].replace('</head>','<link rel="stylesheet" href="/intranet/mascota.css"><script type="module" src="/intranet/mascota.js"></script></head>'));return;}
  const extras={'/empresas/plan.js':'empresas/plan.js','/empresas/plan-ui.js':'empresas/plan-ui.js','/intranet/mascota.js':'private-service/mascota.js','/intranet/mascota.css':'private-service/mascota.css','/empresas/places.js':'empresas/places.js','/empresas/places-ui.js':'empresas/places-ui.js','/empresas/places.css':'empresas/places.css'};
  if(extras[path]){res.setHeader('Content-Type',path.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8');res.end(await readFile(root+extras[path]));return;}
  const file=files[path];if(!file){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file[1]+'; charset=utf-8');res.end(await readFile(root+file[0]));
}catch{res.writeHead(500);res.end('Vista previa no disponible');}}).listen(8788,'127.0.0.1',()=>console.log('Vista previa local (sin autenticación Google): http://127.0.0.1:8788/memorias/'));
