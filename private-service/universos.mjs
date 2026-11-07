// Universos de PortAventuraNeXT: hub /universos/ + 4 subsites. Solo propietario (gate en worker.mjs).
// Las imágenes NO están en Git: se guardan en R2 privado (prefijo universos/) y se sirven tras el gate.
const AVISO='Concepto ilustrativo; no representa acuerdos con las marcas.';
const FUENTES='Paneles: conceptos generados con IA (presentación «JPM Exit Considerations», 28-10-2026). Mapa del parque: PortAventura World, guía de accesibilidad 9752_GUIAS_ANE_A4_UK_V2, pág. 3.';
export const UNIVERSOS=[
 {slug:'netflixventura',nombre:'NetflixVentura',marca:'Netflix',img:'panel_netflix.jpg',color:'#e50914',alt:'Panel conceptual del parque con temática Netflix',desc:'Re-tematización conceptual del parque con series de Netflix. Aquí vive el gemelo digital: personajes digitales vinculados a figuras LEGO físicas, movidas a mano y observadas con los ojos remotos de AdmiraNeXT.',twin:true},
 {slug:'universalventura',nombre:'UniversalVentura',marca:'Universal',img:'panel_universal.jpg',color:'#468cff',alt:'Panel conceptual del parque con temática Universal',desc:'Re-tematización conceptual del parque con universos de Universal. Por ahora solo el concepto visual: sin gemelo digital ni inventario.'},
 {slug:'sonyventura',nombre:'SonyVentura',marca:'Sony',img:'panel_sony.jpg',color:'#dcdcdc',alt:'Panel conceptual del parque con temática Sony',desc:'Re-tematización conceptual del parque con franquicias de Sony. Por ahora solo el concepto visual: sin gemelo digital ni inventario.'},
 {slug:'skydanceventura',nombre:'SkydanceVentura',marca:'Skydance',img:'panel_skydance.jpg',color:'#ffaa28',alt:'Panel conceptual del parque con temática Skydance',desc:'Re-tematización conceptual del parque con títulos de Skydance. Por ahora solo el concepto visual: sin gemelo digital ni inventario.'},
];
export const IMAGENES=new Set(['montaje.jpg','mapa_parque.jpg',...UNIVERSOS.map(u=>u.img)]);
export const PREFIJOS=['/universos/',...UNIVERSOS.map(u=>`/${u.slug}/`)];
const css=`*{box-sizing:border-box}body{margin:0;background:linear-gradient(#0e1626,#1a2236);color:#f2f2f5;font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;min-height:100vh}
a{color:inherit}.wrap{max-width:1280px;margin:0 auto;padding:20px}.aviso{background:#2a1d00;border:1px solid #f5b942;color:#ffd98a;padding:8px 12px;border-radius:8px;font-size:13.5px;margin:0 0 14px}
h1{margin:6px 0 2px;font-size:clamp(22px,3.4vw,36px);text-align:center}.sub{color:#aabedc;text-align:center;margin:0 0 18px}
.mapa{display:grid;grid-template-columns:1fr 1.15fr 1fr;grid-template-rows:auto auto;gap:18px;align-items:center}
.mapa .centro{grid-column:2;grid-row:1/3}.p0{grid-column:1;grid-row:1}.p1{grid-column:3;grid-row:1}.p2{grid-column:1;grid-row:2}.p3{grid-column:3;grid-row:2}
.panel{display:block;text-decoration:none;border:5px solid var(--c);border-radius:6px;background:#000;box-shadow:0 10px 30px #0008;transition:transform .15s}
.panel:hover,.panel:focus-visible{transform:scale(1.03);outline:3px solid #fff;outline-offset:3px}.panel img,.centro img{display:block;width:100%;height:auto}
.panel span{display:block;text-align:center;font-weight:700;font-size:18px;padding:6px;background:#0b0f1a}.centro figure{margin:0;border:5px solid #fff;border-radius:6px;background:#fff}
.centro figcaption{color:#111;text-align:center;font-weight:700;padding:4px}.pie{color:#96a5be;font-size:12.5px;text-align:center;margin-top:18px}
nav.otros{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}nav.otros a{padding:7px 12px;border:1px solid #445;border-radius:20px;text-decoration:none}nav.otros a:focus-visible,nav.otros a:hover{border-color:#fff}
.hero{border:6px solid var(--c);border-radius:8px;background:#000;max-width:1100px;margin:0 auto}.hero img{display:block;width:100%;height:auto;cursor:zoom-in}
.cta{display:inline-block;background:var(--c);color:#fff;padding:9px 14px;border-radius:8px;text-decoration:none;font-weight:700}.desc{max-width:820px;margin:16px auto;font-size:16px}
@media(max-width:820px){.mapa{grid-template-columns:1fr 1fr}.mapa .centro{grid-column:1/3;grid-row:1}.p0{grid-column:1;grid-row:2}.p1{grid-column:2;grid-row:2}.p2{grid-column:1;grid-row:3}.p3{grid-column:2;grid-row:3}}
@media(max-width:520px){.mapa{grid-template-columns:1fr}.mapa>*{grid-column:1!important;grid-row:auto!important}}`;
const head=t=>`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><title>${t}</title><link rel="stylesheet" href="/universos/estilo.css"></head><body><main class="wrap"><p class="aviso" role="note">${AVISO}</p>`;
const pie=`<p class="pie">${FUENTES}</p></main></body></html>`;
const img=n=>`/universos/img/${n}`;
export function hubHtml(){return head('Universos · PortAventuraNeXT')+`<h1>PortAventura: un parque, cuatro universos posibles</h1><p class="sub">Mapa actual del parque en el centro · pulsa un universo para entrar</p>
<div class="mapa">${UNIVERSOS.map((u,i)=>`<a class="panel p${i}" style="--c:${u.color}" href="/${u.slug}/"><img src="${img(u.img)}" alt="${u.alt}" width="723" height="478"><span>${u.nombre}</span></a>`).join('')}
<div class="centro"><figure><img src="${img('mapa_parque.jpg')}" alt="Mapa actual de PortAventura Park" width="1400" height="943"><figcaption>Parque actual</figcaption></figure></div></div>
<p style="text-align:center;margin-top:14px"><a href="${img('montaje.jpg')}">Ver montaje completo</a> · <a href="/gemelodigital/tokenizado/">digitalTwin tokenizado</a></p>`+pie;}
export function subsiteHtml(u){return head(`${u.nombre} · PortAventuraNeXT`).replace('<body>',`<body style="--c:${u.color}">`)+`<p><a href="/universos/">← Volver al mapa de universos</a></p><h1>${u.nombre}</h1><p class="sub">PortAventura × ${u.marca} · concepto</p>
<div class="hero"><a href="${img(u.img)}" aria-label="Ampliar panel ${u.nombre}"><img src="${img(u.img)}" alt="${u.alt}" width="723" height="478"></a></div>
<p class="desc">${u.desc}</p>${u.twin?'<p style="text-align:center"><a class="cta" href="/gemelodigital/tokenizado/">Abrir el digitalTwin tokenizado de NetflixVentura</a></p>':''}
<nav class="otros" aria-label="Otros universos">${UNIVERSOS.filter(o=>o!==u).map(o=>`<a href="/${o.slug}/">${o.nombre}</a>`).join('')}<a href="/universos/">Mapa</a></nav>`+pie;}
const SEC={'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow, noarchive','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; img-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"};
export function isUniversosPath(p){return PREFIJOS.some(x=>p===x.slice(0,-1)||p.startsWith(x));}
// Llamar SOLO después de verificar propietario.
export async function serveUniversos(request,env,pathname){
  const bare=PREFIJOS.find(x=>pathname===x.slice(0,-1)||pathname===x+'index.html');
  if(bare)return new Response(null,{status:302,headers:{Location:bare,'Cache-Control':'private, no-store'}});
  const html=(b)=>new Response(request.method==='HEAD'?null:b,{headers:{...SEC,'Content-Type':'text/html; charset=utf-8'}});
  if(pathname==='/universos/')return html(hubHtml());
  if(pathname==='/universos/estilo.css')return new Response(request.method==='HEAD'?null:css,{headers:{...SEC,'Content-Type':'text/css; charset=utf-8'}});
  const u=UNIVERSOS.find(x=>pathname===`/${x.slug}/`);if(u)return html(subsiteHtml(u));
  const m=pathname.match(/^\/universos\/img\/([a-z_]+\.jpg)$/);
  if(m&&IMAGENES.has(m[1])){
    if(!env.INVENTORY)return new Response('{"error":"Storage unavailable"}',{status:503,headers:SEC});
    const o=await env.INVENTORY.get('universos/'+m[1]);if(!o)return new Response('{"error":"Not found"}',{status:404,headers:SEC});
    return new Response(request.method==='HEAD'?null:o.body,{headers:{...SEC,'Content-Type':'image/jpeg'}});
  }
  return new Response('{"error":"Not found"}',{status:404,headers:{...SEC,'Content-Type':'application/json'}});
}
