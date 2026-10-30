export function validateMemories(value){
  if(!Array.isArray(value?.memories)||value.memories.length>100)throw Error('El archivo admite hasta 100 memorias.');
  const ids=new Set();
  const field=(value,max,required=false)=>{if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw Error('Revisa el título y el texto de la memoria.');return value.trim();};
  return {schemaVersion:1,memories:value.memories.map(memory=>{
    const id=field(memory.id,60,true);if(!/^[a-zA-Z0-9-]+$/.test(id)||ids.has(id))throw Error('Identificador de memoria no válido.');ids.add(id);
    const date=field(memory.date,10);if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date))throw Error('Revisa la fecha de la memoria.');
    return {id,title:field(memory.title,180,true),date,author:field(memory.author,180),text:field(memory.text,12000,true)};
  })};
}
export function findMemories(memories,query=''){
  const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
  const words=normalize(query).trim().split(/\s+/).filter(Boolean);
  return memories.filter(memory=>{const haystack=normalize([memory.title,memory.author,memory.text,memory.date].join(' '));return words.every(word=>haystack.includes(word));}).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||a.title.localeCompare(b.title,'es'));
}
