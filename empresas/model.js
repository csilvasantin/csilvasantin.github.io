export function validIban(value) {
  const iban=String(value).replace(/\s/g,'').toUpperCase();
  if(!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban))return false;
  if(iban.startsWith('ES')&&iban.length!==24)return false;
  let remainder=0;
  for(const c of iban.slice(4)+iban.slice(0,4))for(const d of (/[A-Z]/.test(c)?String(c.charCodeAt(0)-55):c))remainder=(remainder*10+Number(d))%97;
  return remainder===1;
}
export function maskIban(value){const s=String(value).replace(/\s/g,'');return s.length>4?'•••• •••• •••• '+s.slice(-4):'••••';}
export function documentUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&['drive.google.com','docs.google.com'].includes(u.hostname)?u.href:null;}catch{return null;}}
export function validateCompanies(value){
  const text=(s,max,required=false)=>{if(typeof s!=='string'||s.length>max||(required&&!s.trim()))throw Error('Campo no válido');return s.trim();};
  if(!Array.isArray(value?.companies)||value.companies.length>200)throw Error('Registro no válido');
  const ids=new Set();
  return {schemaVersion:1,companies:value.companies.map(c=>{
    const id=text(c.id,60,true);if(!/^[a-zA-Z0-9-]+$/.test(id)||ids.has(id))throw Error('Identificador no válido');ids.add(id);
    if(!Array.isArray(c.deeds)||c.deeds.length>100||!Array.isArray(c.accounts)||c.accounts.length>50)throw Error('Demasiados registros');
    return {id,name:text(c.name,180,true),taxId:text(c.taxId,40),notes:text(c.notes,3000),deeds:c.deeds.map(d=>{const url=documentUrl(d.url);if(!url)throw Error('La escritura necesita un enlace de Google Drive válido');const date=text(d.date,10);if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Fecha no válida');return {name:text(d.name,180,true),date,url,notes:text(d.notes,1000)};}),accounts:c.accounts.map(a=>{const iban=text(a.iban,50,true).replace(/\s/g,'').toUpperCase();if(!validIban(iban))throw Error('Revisa el IBAN: formato o dígitos de control incorrectos');return {bank:text(a.bank,120,true),iban,holder:text(a.holder,180,true),notes:text(a.notes,1000)};})};
  })};
}
