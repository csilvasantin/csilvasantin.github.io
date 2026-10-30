import { filterRecords, sortRecords, safeUrl } from './table.js';
const $ = id => document.getElementById(id);
let data, sortColumn = 1, direction = 1;
const visible = new Set([0,1,2,3,6,7,9,14]);
function link(cell) { const url = safeUrl(cell.url); if (!url) return document.createTextNode(cell.text || '—'); const a = document.createElement('a'); a.href=url; a.textContent=cell.text || 'Abrir documento ↗'; a.target='_blank'; a.rel='noopener noreferrer'; return a; }
function detail(record) { $('detail-title').textContent=record.cells[0].text; $('detail-fields').replaceChildren(); data.headers.forEach((h,i)=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=h;dd.append(link(record.cells[i]));$('detail-fields').append(dt,dd);});$('detail').showModal(); }
function render() {
  const columns = [...visible].sort((a,b)=>a-b), records=sortRecords(filterRecords(data.records,{query:$('search').value,use:$('use').value,year:$('year').value,right:$('right').value}),sortColumn,direction);
  $('head').replaceChildren(); $('rows').replaceChildren();
  columns.forEach(i=>{const th=document.createElement('th'),b=document.createElement('button'); th.scope='col';th.setAttribute('aria-sort',i===sortColumn?(direction===1?'ascending':'descending'):'none');b.textContent=data.headers[i];b.onclick=()=>{direction=i===sortColumn?-direction:1;sortColumn=i;render();};th.append(b);$('head').append(th);});
  records.forEach(record=>{const tr=document.createElement('tr');columns.forEach(i=>{const td=document.createElement('td'),cell=record.cells[i];if(i===0){const b=document.createElement('button');b.className='property';b.textContent=cell.text;b.onclick=()=>detail(record);td.append(b);}else if(i===6){const badge=document.createElement('span');badge.className='badge';badge.textContent=cell.text||'Sin dato';td.append(badge);}else td.append(link(cell));tr.append(td);});$('rows').append(tr);});
  if(!records.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=columns.length;td.textContent='No hay inmuebles que coincidan. Prueba a cambiar los filtros.';tr.append(td);$('rows').append(tr);}
  $('count').textContent=`${records.length} de ${data.records.length} unidades · Orden: ${data.headers[sortColumn].toLocaleLowerCase('es')}`;
}
function populate(id,index){[...new Set(data.records.map(r=>r.cells[index].text).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true})).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;$(id).append(o);});}
async function init(){
  try {const response=await fetch('/escrituras/api/inventory',{credentials:'same-origin',cache:'no-store',redirect:'error'});
    if(response.status===401||response.status===403){$('status').textContent='Acceso restringido. Entra con una de las cuentas de Google autorizadas.';$('signin-wrap').hidden=false;return;}
    if(!response.ok || !(response.headers.get('content-type')||'').includes('application/json'))throw new Error('unavailable');
    data=await response.json();if(!Array.isArray(data.records)||!Array.isArray(data.headers)||data.headers.length!==16)throw new Error('invalid');
    $('total').textContent=data.records.length;$('documents').textContent=new Set(data.records.map(r=>r.cells[14].url).filter(Boolean)).size;
    const years=data.records.map(r=>Number(r.cells[3].text)).filter(Number.isFinite);$('years').textContent=years.length?`${Math.min(...years)}—${Math.max(...years)}`:'—';$('updated').textContent=new Intl.DateTimeFormat('es-ES',{dateStyle:'medium',timeZone:'Europe/Madrid'}).format(new Date(data.updatedAt+'T12:00:00Z'));
    const source=safeUrl(data.sourceUrl);if(source){$('source').href=source;$('source').hidden=false;} $('logout').hidden=false;
    populate('use',6);populate('year',3);populate('right',9);
    data.headers.forEach((h,i)=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=visible.has(i);input.disabled=i===0;input.onchange=()=>{if(input.checked)visible.add(i);else visible.delete(i);render();};label.append(input,document.createTextNode(' '+h));$('columns').append(label);});
    data.criteria.forEach(c=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=c.title;dd.textContent=c.text;$('criteria').append(dt,dd);});
    if(response.headers.get('X-Preview-Only')==='true'){$('status').textContent='Vista previa local · Copia del inventario. El inicio de sesión con Google todavía no está activado.';$('logout').hidden=true;}else $('status').hidden=true;
    $('inventory').hidden=false;render();
    const selected=data.records.find(r=>String(r.id)===new URLSearchParams(location.search).get('inmueble'));if(selected)detail(selected);
  }catch{$('status').classList.add('error');$('status').textContent='Entra con una de las cuentas de Google autorizadas para consultar el archivo privado. Si el dominio aún se está activando, vuelve a intentarlo en unos minutos.';$('signin-wrap').hidden=false;}
}
['search','use','year','right'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',()=>{if(data)render();}));
$('clear').onclick=()=>{['search','use','year','right'].forEach(id=>$(id).value='');render();};$('columns-toggle').onclick=()=>{const expanded=$('columns-toggle').getAttribute('aria-expanded')==='true';$('columns-toggle').setAttribute('aria-expanded',String(!expanded));$('columns').hidden=expanded;};$('close').onclick=()=>$('detail').close();
init();
