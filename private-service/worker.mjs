// Configuración privada del Worker; la lista de familiares no se publica en GitHub.
import {validateCompanies} from '../empresas/model.js';
import {validateMemories} from '../memorias/model.js';
import pages from './pages.mjs';
import assets from './assets.mjs';
import {validateFamilyPlan} from '../empresas/plan.js';
import {answerQuestion} from './assistant.mjs';
export function allowedEmails(env){return new Set(String(env.ALLOWED_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean));}
const HEADERS = {'Cache-Control':'private, no-store, max-age=0','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Vary':'Cf-Access-Jwt-Assertion'};
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{...HEADERS,...headers}});
function bytes(segment){return Uint8Array.from(atob(segment.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
function decode(segment){return JSON.parse(new TextDecoder().decode(bytes(segment)));}
export async function verifyAccess(request,env,fetcher=fetch){
  if(!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD)throw new Error('Access not configured');
  const domain=env.ACCESS_TEAM_DOMAIN;
  if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain))throw new Error('Invalid team domain');
  const token=request.headers.get('Cf-Access-Jwt-Assertion');
  if(!token||token.length>16384)throw new Error('Missing assertion');
  const parts=token.split('.');if(parts.length!==3)throw new Error('Malformed assertion');
  const header=decode(parts[0]),claims=decode(parts[1]),issuer=`https://${domain}`;
  if(header.alg!=='RS256'||typeof header.kid!=='string')throw new Error('Invalid algorithm');
  const now=Math.floor(Date.now()/1000);
  if(claims.iss!==issuer || !Number.isFinite(claims.exp) || claims.exp<=now || !Number.isFinite(claims.iat) || claims.iat>now+60 || (claims.nbf!==undefined&&(!Number.isFinite(claims.nbf)||claims.nbf>now+60)))throw new Error('Invalid issuer or lifetime');
  const audiences=Array.isArray(claims.aud)?claims.aud:[claims.aud];
  if(!audiences.includes(env.ACCESS_AUD))throw new Error('Invalid audience');
  const email=typeof claims.email==='string'?claims.email.toLowerCase():'';
  if(!allowedEmails(env).has(email))throw new Error('Not authorized');
  const response=await fetcher(`${issuer}/cdn-cgi/access/certs`,{cf:{cacheTtl:300,cacheEverything:true}});
  if(!response.ok)throw new Error('Identity keys unavailable');
  const jwks=await response.json(),jwk=jwks.keys?.find(k=>k.kid===header.kid&&k.kty==='RSA');
  if(!jwk)throw new Error('Unknown signing key');
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const valid=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,bytes(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
  if(!valid)throw new Error('Invalid signature');
  return {email,sub:claims.sub};
}
export async function handleRequest(request,env,fetcher=fetch){
  const url=new URL(request.url);
  const login=url.pathname==='/escrituras/api/login'?'/escrituras/':url.pathname==='/empresas/api/login'?'/empresas/':url.pathname==='/memorias/api/login'?'/memorias/':null;
  const companies=url.pathname==='/empresas/api/companies';
  const memories=url.pathname==='/memorias/api/memories';
  const session=url.pathname==='/intranet/api/session';
  const plan=url.pathname==='/empresas/api/family-plan';
  const assistant=url.pathname==='/intranet/api/assistant';
  const canonical=/^\/(intranet|memorias|escrituras|empresas|docs)(?:\/index\.html)?\/?$/.test(url.pathname)?'/'+url.pathname.split('/')[1]+'/':url.pathname;
  const page=pages[canonical],asset=assets[url.pathname];
  if(!login&&!companies&&!memories&&!session&&!plan&&!assistant&&!page&&!asset&&url.pathname!=='/escrituras/api/inventory')return json({error:'Not found'},404);
  if(assistant?request.method!=='POST':!['GET',...(companies||memories||plan?['PUT']:[])].includes(request.method))return json({error:'Method not allowed'},405);
  if(!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD||!env.INVENTORY||!allowedEmails(env).size)return json({error:'Private service not configured'},503);
  try{await verifyAccess(request,env,fetcher);}catch{return json({error:'Authentication required'},401);}
  if(session)return json({authenticated:true});
  if(assistant){const result=await answerQuestion(request,env);return json(result.body,result.status);}
  if(plan)return handleArchive(request,env,{key:'family-plan.json',validate:validateFamilyPlan,empty:validateFamilyPlan({}),maxBytes:49152});
  if(page||asset){
    if(page&&url.pathname!==canonical)return new Response(null,{status:302,headers:{Location:canonical,'Cache-Control':'private, no-store'}});
    const html=page?.replace('</head>','<link rel="stylesheet" href="/intranet/mascota.css"><script type="module" src="/intranet/mascota.js"></script></head>');
    return new Response(html||asset[1],{headers:{...HEADERS,'Content-Type':`${page?'text/html':asset[0]}; charset=utf-8`,'X-Robots-Tag':'noindex, nofollow, noarchive','Content-Security-Policy':"frame-ancestors 'none'",'X-Frame-Options':'DENY'}});
  }
  if(login)return new Response(null,{status:302,headers:{Location:login,'Cache-Control':'private, no-store'}});
  if(companies)return handleArchive(request,env);
  if(memories)return handleArchive(request,env,{key:'memories.json',validate:validateMemories,empty:{schemaVersion:1,memories:[]},maxBytes:4194304});
  try{
    const object=await env.INVENTORY.get('inventory.json');
    if(!object)return json({error:'Inventory unavailable'},503);
    const inventory=await object.json();
    if(!Array.isArray(inventory.records)||inventory.headers?.length!==16)return json({error:'Inventory unavailable'},503);
    return json(inventory);
  }catch{return json({error:'Inventory unavailable'},503);}
}
async function handleArchive(request,env,archive={key:'companies.json',validate:validateCompanies,empty:{schemaVersion:1,companies:[]},maxBytes:262144}){
  try{
    if(request.method==='GET'){
      const object=await env.INVENTORY.get(archive.key);
      return json(object?archive.validate(await object.json()):archive.empty,200,{ETag:object?.httpEtag||'"empty"'});
    }
    if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Origin not allowed'},403);
    if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
    const version=request.headers.get('If-Match');
    if(!version||!/^"[a-zA-Z0-9-]{1,128}"$/.test(version))return json({error:'Current version required'},428);
    const reader=request.body?.getReader();if(!reader)return json({error:'Body required'},400);
    let size=0;const chunks=[];
    for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>archive.maxBytes){await reader.cancel();return json({error:'Request too large'},413);}chunks.push(value);}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    let value;try{value=archive.validate(JSON.parse(new TextDecoder().decode(bytes)));}catch{return json({error:'Invalid archive entry'},400);}
    const condition=new Headers(version==='"empty"'?{'If-None-Match':'*'}:{'If-Match':version});
    const saved=await env.INVENTORY.put(archive.key,JSON.stringify(value),{onlyIf:condition,httpMetadata:{contentType:'application/json',cacheControl:'private, no-store'}});
    if(!saved)return json({error:'Archive changed; reload before saving'},412);
    return json(value,200,{ETag:saved.httpEtag});
  }catch{return json({error:'Private archive unavailable'},503);}
}
export default {fetch(request,env){return handleRequest(request,env);}};
