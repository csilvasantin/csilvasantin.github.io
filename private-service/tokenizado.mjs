// digitalTwin tokenizado de NetflixVentura (PortAventura × Netflix).
// Plantilla servida solo por el Worker tras Access + lista de propietario (OWNER_EMAILS).
// Sin datos reales: ni inventario LEGO, ni fotos, ni cámaras, ni posiciones. El estado manual
// vive solo en el navegador del propietario (localStorage) hasta definir almacenamiento privado.
export const BASE='/portaventuraNext/gemelodigital/tokenizado/';
const css=`:root{--bg:#0b0b0f;--panel:#15151c;--line:#2a2a36;--red:#e50914;--txt:#f2f2f5;--mut:#9a9aaa;--ok:#3ecf8e;--warn:#f5b942}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}
header{padding:28px 24px 12px;border-bottom:1px solid var(--line)}h1{margin:0;font-size:26px;letter-spacing:.3px}h1 b{color:var(--red)}
.sub{color:var(--mut);margin:6px 0 0}.wrap{max-width:1180px;margin:0 auto;padding:20px 24px}
.notes{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:20px}
.note{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 14px;font-size:13.5px;color:var(--mut)}.note strong{color:var(--txt);display:block;margin-bottom:2px}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0 14px}button,select,input{font:inherit;color:var(--txt);background:#1d1d26;border:1px solid var(--line);border-radius:8px;padding:7px 10px}
button{cursor:pointer}button.primary{background:var(--red);border-color:var(--red)}table{width:100%;border-collapse:collapse;background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}
th,td{padding:9px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;font-size:14px}th{color:var(--mut);font-weight:600;font-size:12.5px;text-transform:uppercase;letter-spacing:.4px}
td input,td select{width:100%}.tag{display:inline-block;font-size:11.5px;padding:2px 7px;border-radius:20px;border:1px solid var(--line);color:var(--mut)}.tag.ej{border-color:var(--warn);color:var(--warn)}
.tok{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;color:var(--mut)}.muted{color:var(--mut);font-size:13px}a{color:#ff6b72}footer{color:var(--mut);font-size:12.5px;padding:18px 24px 40px;max-width:1180px;margin:0 auto}
@media(max-width:760px){table,thead,tbody,tr,td,th{display:block}thead{display:none}td{border:0;padding:4px 10px}tr{border-bottom:1px solid var(--line);padding:8px 0}}`;
const js=`const KEY='netflixventura.gemelo.v1';
const EJEMPLOS=[['Stranger Things','Eleven'],['Stranger Things','Mike Wheeler'],['Stranger Things','Dustin Henderson'],['Stranger Things','Lucas Sinclair'],['Stranger Things','Will Byers'],['Stranger Things','Max Mayfield'],['Stranger Things','Jim Hopper'],['Stranger Things','Steve Harrington']]
 .map(([serie,personaje])=>({serie,personaje,figura:'',zona:'',estado:'sin-figura',nota:'',ejemplo:true}));
const ESTADOS={'sin-figura':'Sin figura LEGO asignada','asignada':'Figura asignada (sin colocar)','colocada':'Colocada a mano en la maqueta','vista':'Comprobada por mí en ojos remotos'};
const $=s=>document.querySelector(s);
function load(){try{const v=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(v?.filas))return v.filas;}catch{}return EJEMPLOS.map(x=>({...x}));}
let filas=load();
function slug(s){return String(s).normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'');}
function token(f){return f.figura.trim()?'NV-'+slug(f.serie).slice(0,6)+'-'+slug(f.personaje)+' (pendiente)':'— sin vínculo —';}
function save(){localStorage.setItem(KEY,JSON.stringify({version:1,guardado:new Date().toISOString(),filas}));$('#estado').textContent='Guardado en este navegador · '+new Date().toLocaleTimeString('es-ES');}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}
function render(){
 const filtro=$('#filtro').value;
 $('#cuerpo').innerHTML=filas.map((f,i)=>filtro&&f.estado!==filtro?'':\`<tr>
 <td><input data-i="\${i}" data-k="serie" value="\${esc(f.serie)}" aria-label="Serie"></td>
 <td><input data-i="\${i}" data-k="personaje" value="\${esc(f.personaje)}" aria-label="Personaje digital"> \${f.ejemplo?'<span class="tag ej">ejemplo</span>':'<span class="tag">real</span>'}</td>
 <td><input data-i="\${i}" data-k="figura" value="\${esc(f.figura)}" placeholder="Describe tu figura real" aria-label="Figura LEGO"></td>
 <td><input data-i="\${i}" data-k="zona" value="\${esc(f.zona)}" placeholder="Zona de la maqueta" aria-label="Zona"></td>
 <td><select data-i="\${i}" data-k="estado" aria-label="Estado">\${Object.entries(ESTADOS).map(([k,v])=>\`<option value="\${k}"\${k===f.estado?' selected':''}>\${v}</option>\`).join('')}</select></td>
 <td class="tok">\${esc(token(f))}</td>
 <td><button data-del="\${i}" title="Quitar fila">✕</button></td></tr>\`).join('');
 const n=k=>filas.filter(f=>f.estado===k).length;
 $('#resumen').textContent=\`\${filas.length} personajes · \${n('colocada')} colocados a mano · \${n('vista')} comprobados en ojos remotos · \${filas.filter(f=>f.ejemplo).length} siguen siendo ejemplo\`;
}
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.k==null)return;const f=filas[+t.dataset.i];f[t.dataset.k]=t.value;if(t.dataset.k!=='estado')f.ejemplo=false;save();if(t.tagName==='SELECT')render();else{const c=t.closest('tr').querySelector('.tok');c.textContent=token(f);}});
document.addEventListener('click',e=>{const d=e.target.dataset?.del;if(d!=null){filas.splice(+d,1);save();render();}});
$('#nueva').onclick=()=>{filas.push({serie:'',personaje:'',figura:'',zona:'',estado:'sin-figura',nota:'',ejemplo:false});save();render();};
$('#filtro').onchange=render;
$('#exportar').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({version:1,filas},null,2)],{type:'application/json'}));a.download='netflixventura-gemelo.json';a.click();};
$('#reset').onclick=()=>{if(confirm('¿Volver a los ejemplos? Se borra lo guardado en este navegador.')){localStorage.removeItem(KEY);filas=load();render();}};
render();`;
const html=`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer">
<title>digitalTwin tokenizado · NetflixVentura</title><link rel="stylesheet" href="${BASE}style.css"><script type="module" src="${BASE}app.js"></script></head>
<body><header><div class="wrap" style="padding:0"><h1>digitalTwin tokenizado de <b>NetflixVentura</b></h1>
<p class="sub">PortAventura × Netflix · personajes digitales de Stranger Things y otras series de Netflix, correlacionados con figuras físicas LEGO.</p></div></header>
<main class="wrap">
<section class="notes">
<div class="note"><strong>Fase inicial: movimiento a mano</strong>Las figuras se mueven manualmente. Sin motores, sensores ni compras. El estado lo marcas tú.</div>
<div class="note"><strong>Ojos remotos AdmiraNeXT</strong>La observación se hace con los <a href="https://www.admiranext.com/ojosremotos" target="_blank" rel="noopener noreferrer">ojos remotos existentes</a> (requiere tu sesión allí). El vídeo no está integrado en esta página.</div>
<div class="note"><strong>Token = identidad del vínculo</strong>El identificador une personaje digital y figura física. No es financiero ni está en blockchain; formato pendiente de definir.</div>
<div class="note"><strong>Ejemplos vs. datos reales</strong>Las filas marcadas <span class="tag ej">ejemplo</span> son solo de partida. Al editarlas pasan a <span class="tag">real</span>. Nada se envía al servidor: se guarda en este navegador.</div>
</section>
<div class="bar"><button class="primary" id="nueva">+ Añadir personaje</button>
<select id="filtro" aria-label="Filtrar por estado"><option value="">Todos los estados</option><option value="sin-figura">Sin figura</option><option value="asignada">Asignada</option><option value="colocada">Colocada a mano</option><option value="vista">Comprobada en ojos remotos</option></select>
<button id="exportar">Exportar JSON</button><button id="reset">Volver a ejemplos</button><span class="muted" id="estado"></span></div>
<p class="muted" id="resumen"></p>
<table><thead><tr><th>Serie</th><th>Personaje digital</th><th>Figura LEGO física</th><th>Zona maqueta</th><th>Estado manual</th><th>Token de vínculo</th><th></th></tr></thead><tbody id="cuerpo"></tbody></table>
</main><footer>Acceso exclusivo del propietario · servido tras verificación de identidad · sin caché.</footer></body></html>`;
export const tokenizadoPages={[BASE]:html};
export const tokenizadoAssets={[BASE+'style.css']:['text/css',css],[BASE+'app.js']:['text/javascript',js]};
export function ownerEmails(env){return new Set(String(env.OWNER_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean));}
export function isTokenizadoPath(pathname){return pathname==='/portaventuraNext/gemelodigital/tokenizado'||pathname.startsWith(BASE);}
