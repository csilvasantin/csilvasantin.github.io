import {documentUrl} from './model.js';
export function validatePlaces(value){
  if(!Array.isArray(value?.places)||value.places.length>100)throw Error('Archivo de inmuebles no válido');
  const ids=new Set(),text=(value,max)=>{if(typeof value!=='string'||value.length>max)throw Error('Campo del inmueble no válido');return value.trim();};
  return {schemaVersion:1,places:value.places.map(p=>{
    const id=text(p.id,60);if(!/^[a-zA-Z0-9-]+$/.test(id)||ids.has(id))throw Error('Identificador de inmueble no válido');ids.add(id);
    const name=text(p.name,180);if(!name)throw Error('Escribe un nombre para el inmueble');
    if(!['pending','proposed','confirmed'].includes(p.status))throw Error('Estado de revisión no válido');
    const result={id,name,status:p.status};
    for(const [key,max] of [['inventoryId',60],['address',500],['unit',180],['owner',500],['purchaseYear',4],['cadastralRef',150],['use',180],['area',180],['notes',3000]])result[key]=text(p[key]??'',max);
    if(result.inventoryId&&!/^[a-zA-Z0-9-]+$/.test(result.inventoryId))throw Error('Referencia de inventario no válida');
    if(result.purchaseYear&&!/^\d{4}$/.test(result.purchaseYear))throw Error('Revisa el año de compra');
    const deed=text(p.deedUrl??'',2048);result.deedUrl=deed?documentUrl(deed):'';if(deed&&!result.deedUrl)throw Error('Usa un enlace de escritura de Google Drive');
    if(!Array.isArray(p.sources??[])||(p.sources??[]).length>12)throw Error('Demasiadas fuentes');
    result.sources=(p.sources??[]).map(s=>{const label=text(s.label,180),url=new URL(text(s.url,2048));if(url.protocol!=='https:'||url.username||url.password)throw Error('Fuente no válida');return {label,url:url.href};});
    return result;
  })};
}
export function importInventory(place,record){
  if(!record||!Array.isArray(record.cells)||record.cells.length!==16)throw Error('Selecciona un inmueble válido de Escrituras');
  const cell=i=>record.cells[i]?.text||'';
  return {...place,inventoryId:String(record.id),address:cell(1),unit:cell(2),purchaseYear:/^\d{4}$/.test(cell(3))?cell(3):'',cadastralRef:cell(4),use:cell(6)||cell(5),owner:cell(7),area:cell(12),deedUrl:documentUrl(record.cells[14]?.url)||''};
}
