import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleRequest} from './worker.mjs';
const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk=await crypto.subtle.exportKey('jwk',keys.publicKey);jwk.kid='k';
const fetcher=async()=>new Response(JSON.stringify({keys:[jwk]}));
const env={ACCESS_TEAM_DOMAIN:'test.cloudflareaccess.com',ACCESS_AUD:'aud',ALLOWED_EMAILS:'owner@example.com,owner2@example.com,family@example.com',OWNER_EMAILS:'owner@example.com,owner2@example.com',INVENTORY:{}};
const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
async function token(o={}){const now=Math.floor(Date.now()/1000);const p=[enc({alg:'RS256',kid:'k'}),enc({iss:'https://test.cloudflareaccess.com',aud:['aud'],iat:now,exp:now+600,email:'owner@example.com',...o})];const s=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',keys.privateKey,new TextEncoder().encode(p.join('.')));return p.join('.')+'.'+Buffer.from(s).toString('base64url');}
const B='/portaventuraNext/gemelodigital/tokenizado/';
const PATHS=[B,B+'style.css',B+'app.js',B.slice(0,-1),B+'index.html'];
const req=(path,t,host='www.carlossilva.info',method='GET')=>new Request(`https://${host}${path}`,{method,headers:t?{'Cf-Access-Jwt-Assertion':t}:{}});
test('anónimo, token falso y cabecera forjada: 401 sin contenido en ambos hosts',async()=>{
  for(const host of ['www.carlossilva.info','carlossilva.info'])for(const p of PATHS){
    for(const t of [null,'x.y.z']){const r=await handleRequest(req(p,t,host),env,fetcher);assert.equal(r.status,401,p);assert.doesNotMatch(await r.text(),/NetflixVentura|<table/);}
    const f=await handleRequest(new Request(`https://${host}${p}`,{headers:{'Cf-Access-Authenticated-User-Email':'owner@example.com'}}),env,fetcher);assert.equal(f.status,401);
  }});
test('cuenta familiar ajena con sesión válida: 403',async()=>{for(const p of PATHS){const r=await handleRequest(req(p,await token({email:'family@example.com'})),env,fetcher);assert.equal(r.status,403,p);assert.doesNotMatch(await r.text(),/NetflixVentura/);}});
test('cuenta fuera de toda lista: 401',async()=>{assert.equal((await handleRequest(req(B,await token({email:'x@example.com'})),env,fetcher)).status,401);});
test('ambas cuentas del propietario: 200 sin caché y cabeceras seguras',async()=>{for(const email of ['owner@example.com','OWNER2@example.com']){const r=await handleRequest(req(B,await token({email})),env,fetcher);assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/private, no-store/);assert.equal(r.headers.get('x-frame-options'),'DENY');assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.match(await r.text(),/digitalTwin tokenizado de <b>NetflixVentura/);}
  for(const [p,type] of [[B+'style.css','text/css'],[B+'app.js','text/javascript']]){const r=await handleRequest(req(p,await token()),env,fetcher);assert.equal(r.status,200);assert.match(r.headers.get('content-type'),new RegExp(type));}});
test('sin barra o index.html redirige a la ruta canónica solo tras autenticar',async()=>{for(const p of [B.slice(0,-1),B+'index.html']){const r=await handleRequest(req(p,await token()),env,fetcher);assert.equal(r.status,302);assert.equal(r.headers.get('location'),B);}});
test('subrutas, imágenes y API inexistentes: 404; escrituras: 405',async()=>{for(const p of [B+'foto.jpg',B+'api/estado',B+'../intranet/',B+'x/']){const r=await handleRequest(req(p,await token()),env,fetcher);assert.equal(r.status,404,p);}
  for(const m of ['POST','PUT','DELETE'])assert.equal((await handleRequest(req(B,await token(),'www.carlossilva.info',m),env,fetcher)).status,405);});
test('fail-closed sin OWNER_EMAILS ni Access configurado',async()=>{for(const e of [{...env,OWNER_EMAILS:''},{...env,OWNER_EMAILS:undefined},{...env,ACCESS_AUD:''},{}]){const r=await handleRequest(req(B,await token()),e,fetcher);assert.equal(r.status,503);}});
test('el propietario debe estar también en la política familiar (Access) para pasar',async()=>{const r=await handleRequest(req(B,await token({email:'solo-owner@example.com'})),{...env,OWNER_EMAILS:'solo-owner@example.com'},fetcher);assert.equal(r.status,401);});
test('rutas familiares no cambian para cuentas familiares',async()=>{const r=await handleRequest(req('/intranet/api/session',await token({email:'family@example.com'})),env,fetcher);assert.equal(r.status,200);});
test('variantes de mayúsculas no sirven la interfaz',async()=>{const r=await handleRequest(req('/portaventuranext/gemelodigital/tokenizado/',await token()),env,fetcher);assert.notEqual(r.status,200);});
test('fuente publicada sin correos reales ni secretos',async()=>{const {readFile}=await import('node:fs/promises');const s=await readFile(new URL('./tokenizado.mjs',import.meta.url),'utf8');assert.doesNotMatch(s,/@(gmail|admira)\.com/);assert.doesNotMatch(s,/<img|<video|<iframe/);});
const P='/gemelodigital/tokenizado/';
test('PortAventuraNeXT: anónimo 401, familiar 403, propietario 200 con assets en su base',async()=>{
  for(const host of ['www.portaventuranext.com','portaventuranext.com']){
    for(const p of [P,P+'app.js',P+'style.css',P.slice(0,-1)])assert.equal((await handleRequest(req(p,null,host),env,fetcher)).status,401,host+p);
    assert.equal((await handleRequest(req(P,await token({email:'family@example.com'}),host),env,fetcher)).status,403);
    const r=await handleRequest(req(P,await token(),host),env,fetcher);assert.equal(r.status,200);const h=await r.text();assert.match(h,new RegExp('href="'+P+'style.css"'));assert.match(h,/Importar JSON/);
    assert.equal((await handleRequest(req(P+'app.js',await token(),host),env,fetcher)).status,200);
    const red=await handleRequest(req(P.slice(0,-1),await token(),host),env,fetcher);assert.equal(red.headers.get('location'),P);
  }});
test('PortAventuraNeXT: el Worker no sirve nada familiar ni otras rutas en ese dominio',async()=>{for(const p of ['/intranet/','/escrituras/api/inventory','/portaventuraNext/gemelodigital/tokenizado/','/',P+'foto.jpg']){const r=await handleRequest(req(p,await token(),'www.portaventuranext.com'),env,fetcher);assert.equal(r.status,404,p);}});
test('importación valida formato en cliente',async()=>{const {tokenizadoAssets}=await import('./tokenizado.mjs');const js=tokenizadoAssets()['/portaventuraNext/gemelodigital/tokenizado/app.js'][1];assert.match(js,/function valida/);assert.match(js,/1048576/);});
