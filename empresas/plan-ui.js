import {validateFamilyPlan} from './plan.js';
const $=id=>document.getElementById(id);let plan,version;
const labels={holdingPlan:'Proyecto de holding',administratorPlan:'Administración',continuityPlan:'Continuidad familiar',assistantBrief:'La mascota de la familia'};
function render(){
  $('family-plan-fields').replaceChildren();
  for(const [key,title] of Object.entries(labels)){
    const article=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=plan[key]||'Pendiente de completar.';article.append(h,p);$('family-plan-fields').append(article);
  }
}
async function load(){try{
  const r=await fetch('/empresas/api/family-plan',{credentials:'same-origin',cache:'no-store',redirect:'error'});if(!r.ok)throw Error();
  plan=validateFamilyPlan(await r.json());version=(r.headers.get('X-Archive-Version')||r.headers.get('etag'));if(!version)throw Error();render();$('family-plan').hidden=false;
}catch{$('plan-load-status').hidden=false;}}
$('plan-edit').onclick=()=>{for(const key of [...Object.keys(labels),'assistantName'])$('plan-form').elements.namedItem(key).value=plan[key];$('plan-status').textContent='';$('plan-editor').showModal();};
$('plan-close').onclick=$('plan-cancel').onclick=()=>$('plan-editor').close();
$('plan-form').onsubmit=async event=>{event.preventDefault();const next=validateFamilyPlan(Object.fromEntries(new FormData(event.target)));$('plan-save').disabled=true;try{
  const r=await fetch('/empresas/api/family-plan',{method:'PUT',credentials:'same-origin',redirect:'error',headers:{'Content-Type':'application/json','If-Match':version},body:JSON.stringify(next)});
  if(r.status===412)throw Error('El plan ha cambiado en otra sesión. Conserva tu texto y vuelve a cargar la página.');if(!r.ok)throw Error('No se ha podido guardar el plan. Comprueba la sesión y vuelve a intentarlo.');
  plan=validateFamilyPlan(await r.json());version=(r.headers.get('X-Archive-Version')||r.headers.get('etag'));render();$('plan-editor').close();
}catch(e){$('plan-status').textContent=e.message;}finally{$('plan-save').disabled=false;}};
load();
