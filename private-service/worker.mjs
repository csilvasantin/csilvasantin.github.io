// Configuración privada del Worker; la lista de familiares no se publica en GitHub.
export function allowedEmails(env){return new Set(String(env.ALLOWED_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean));}
const HEADERS = {'Cache-Control':'private, no-store, max-age=0','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Vary':'Cf-Access-Jwt-Assertion'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
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
  if(url.pathname!=='/escrituras/api/inventory')return json({error:'Not found'},404);
  if(request.method!=='GET')return json({error:'Method not allowed'},405);
  if(!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD||!env.INVENTORY||!allowedEmails(env).size)return json({error:'Private service not configured'},503);
  try{await verifyAccess(request,env,fetcher);}catch{return json({error:'Authentication required'},401);}
  try{
    const object=await env.INVENTORY.get('inventory.json');
    if(!object)return json({error:'Inventory unavailable'},503);
    const inventory=await object.json();
    if(!Array.isArray(inventory.records)||inventory.headers?.length!==16)return json({error:'Inventory unavailable'},503);
    return json(inventory);
  }catch{return json({error:'Inventory unavailable'},503);}
}
export default {fetch(request,env){return handleRequest(request,env);}};
