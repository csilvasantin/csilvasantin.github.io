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
const U=['/universos/','/netflixventura/','/universalventura/','/sonyventura/','/skydanceventura/'];
const imgEnv={...env,INVENTORY:{get:async k=>k.startsWith('universos/')?{body:'JPEGDATA'}:null}};
test('universos: anónimo/forjado 401 y familiar 403 en páginas, css e imágenes',async()=>{for(const host of ['www.portaventuranext.com','portaventuranext.com'])for(const p of [...U,...U.map(x=>x.slice(0,-1)),'/universos/estilo.css','/universos/img/panel_sony.jpg','/universos/img/montaje.jpg']){
  for(const t of [null,'x.y.z']){const r=await handleRequest(req(p,t,host),imgEnv,fetcher);assert.equal(r.status,401,host+p);assert.doesNotMatch(await r.text(),/JPEGDATA|Ventura/);}
  const f=await handleRequest(req(p,await token({email:'family@example.com'}),host),imgEnv,fetcher);assert.equal(f.status,403,p);assert.doesNotMatch(await f.text(),/JPEGDATA/);}});
test('universos: propietario ve hub con 4 enlaces y subsites distintos con navegación',async()=>{const t=await token();
  const hub=await (await handleRequest(req('/universos/',t,'www.portaventuranext.com'),imgEnv,fetcher)).text();
  for(const s of U.slice(1))assert.match(hub,new RegExp(`href="${s}"`));assert.match(hub,/Concepto ilustrativo; no representa acuerdos con las marcas/);
  const bodies=new Set();for(const s of U.slice(1)){const r=await handleRequest(req(s,t,'www.portaventuranext.com'),imgEnv,fetcher);assert.equal(r.status,200);const h=await r.text();bodies.add(h);
    assert.match(h,/href="\/universos\/"/);for(const o of U.slice(1).filter(x=>x!==s))assert.match(h,new RegExp(`href="${o}"`));assert.match(h,/no representa acuerdos/);
    assert.equal(/gemelodigital\/tokenizado/.test(h),s==='/netflixventura/');}
  assert.equal(bodies.size,4);});
test('universos: canonical slash, imagen solo propietario, imagen desconocida 404, POST 405',async()=>{const t=await token();
  const r=await handleRequest(req('/sonyventura',t,'www.portaventuranext.com'),imgEnv,fetcher);assert.equal(r.status,302);assert.equal(r.headers.get('location'),'/sonyventura/');
  const i=await handleRequest(req('/universos/img/panel_sony.jpg',t,'www.portaventuranext.com'),imgEnv,fetcher);assert.equal(i.status,200);assert.equal(i.headers.get('content-type'),'image/jpeg');assert.match(i.headers.get('cache-control'),/no-store/);
  for(const p of ['/universos/img/input.png','/universos/img/../x.jpg','/universos/otra'])assert.equal((await handleRequest(req(p,t,'www.portaventuranext.com'),imgEnv,fetcher)).status,404,p);
  assert.equal((await handleRequest(req('/universos/',t,'www.portaventuranext.com','POST'),imgEnv,fetcher)).status,405);});
test('universos no existen en carlossilva.info',async()=>{assert.equal((await handleRequest(req('/universos/',await token(),'www.carlossilva.info'),imgEnv,fetcher)).status,404);});
test('tokenizado en PortAventuraNeXT enlaza al mapa',async()=>{const h=await (await handleRequest(req('/gemelodigital/tokenizado/',await token(),'www.portaventuranext.com'),env,fetcher)).text();assert.match(h,/href="\/universos\/"/);});
test('Stranger Things: hitbox mapeado al rótulo real y capas neón solo propietario',async()=>{const m=await import('./universos.mjs');
  const z=m.pct(m.ST.zona),l=m.pct(m.ST.letras);assert.deepEqual(z,{left:31.535,top:9.623,width:14.661,height:11.297});assert.deepEqual(l,{left:32.089,top:10.669,width:13.555,height:7.113});
  assert.ok(l.left>=z.left&&l.top>=z.top&&l.left+l.width<=z.left+z.width&&l.top+l.height<=z.top+z.height);assert.ok(z.width<20&&z.height<15);
  const t=await token();const h=await (await handleRequest(req('/netflixventura/',t,'www.portaventuranext.com'),imgEnv,fetcher)).text();
  assert.match(h,/<button type="button" class="st-hot"[^>]*aria-pressed="false"[^>]*aria-label="Zona Stranger Things/);assert.match(h,/left:31.535%;top:9.623%;width:14.661%;height:11.297%/);
  assert.doesNotMatch(h,/<a [^>]*>[^<]*<img class="base"/);assert.doesNotMatch(h,/<a[^>]*>\s*<button/);assert.match(h,/Stranger Things · zona seleccionada/);assert.match(h,/src="\/universos\/netflix.js"/);
  for(const o of ['/sonyventura/','/universalventura/','/skydanceventura/'])assert.doesNotMatch(await (await handleRequest(req(o,t,'www.portaventuranext.com'),imgEnv,fetcher)).text(),/st-hot/);
  for(const p of ['/universos/img/st_neon_stranger.png','/universos/netflix.js']){assert.equal((await handleRequest(req(p,null,'www.portaventuranext.com'),imgEnv,fetcher)).status,401);assert.equal((await handleRequest(req(p,await token({email:'family@example.com'}),'www.portaventuranext.com'),imgEnv,fetcher)).status,403);}
  const png=await handleRequest(req('/universos/img/st_neon_things.png',t,'www.portaventuranext.com'),imgEnv,fetcher);assert.equal(png.status,200);assert.equal(png.headers.get('content-type'),'image/png');
  assert.equal((await handleRequest(req('/universos/img/input.png',t,'www.portaventuranext.com'),imgEnv,fetcher)).status,404);});
test('Stranger Things: CSS neón lento, reduced-motion fijo, JS teclado/aria',async()=>{const m=await import('./universos.mjs');const t=await token();
  const css=await (await handleRequest(req('/universos/estilo.css',t,'www.portaventuranext.com'),imgEnv,fetcher)).text();
  for(const d of css.match(/animation:neon-[ab] ([\d.]+)s/g))assert.ok(parseFloat(d.split(' ')[1])>=1);
  assert.match(css,/prefers-reduced-motion:reduce\)\{\.neon,\.neon-s,\.neon-t\{animation:none!important/);assert.match(css,/\.st-hot:focus-visible\{outline/);assert.match(css,/\.mapa-int\.sel \.neon\{opacity:1\}|\.mapa-int\.sel \.neon\{/);
  const js=m.netflixJs;assert.match(js,/aria-pressed/);assert.match(js,/Escape/);assert.match(js,/preventDefault/);
  // botón nativo: Enter/Espacio disparan click; simulación de estado
  const els={};const mk=id=>els[id]={attrs:{},classList:{s:new Set(),toggle(c,on){on?this.s.add(c):this.s.delete(c)},contains(c){return this.s.has(c)}},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},hidden:true,handlers:{},addEventListener(e,f){this.handlers[e]=f},focus(){}};
  ['mapa-int','st-hot','st-info','ampliar'].forEach(mk);els['st-hot'].attrs['aria-pressed']='false';
  const doc={getElementById:id=>els[id],handlers:{},addEventListener(e,f){this.handlers[e]=f}};new Function('document',js)(doc);
  els['st-hot'].handlers.click({preventDefault(){}});assert.equal(els['st-hot'].attrs['aria-pressed'],'true');assert.equal(els['st-info'].hidden,false);assert.ok(els['mapa-int'].classList.contains('sel'));
  doc.handlers.keydown({key:'Escape'});assert.equal(els['st-hot'].attrs['aria-pressed'],'false');assert.equal(els['st-info'].hidden,true);
  els['ampliar'].handlers.click();assert.ok(els['mapa-int'].classList.contains('ampliado'));});
