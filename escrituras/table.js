export function safeUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&['docs.google.com','drive.google.com','www.idealista.com'].includes(url.hostname)?url.href:null;}catch{return null;}}
const collator=new Intl.Collator('es',{numeric:true,sensitivity:'base'});
const normalize=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
export function filterRecords(records,{query='',use='',year='',right=''}={}){const words=normalize(query).trim().split(/\s+/).filter(Boolean);return records.filter(r=>{const text=normalize(r.cells.map(c=>c.text).join(' '));return words.every(w=>text.includes(w))&&(!use||r.cells[6].text===use)&&(!year||r.cells[3].text===year)&&(!right||r.cells[9].text===right);});}
export function sortRecords(records,column,direction=1){return [...records].sort((a,b)=>{const av=a.cells[column]?.text||'',bv=b.cells[column]?.text||'';if(!av||!bv)return av?-1:bv?1:0;return collator.compare(av,bv)*direction;});}
