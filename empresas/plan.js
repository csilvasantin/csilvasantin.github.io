export function validateFamilyPlan(value){
  const result={schemaVersion:1};
  for(const [key,max] of [['holdingPlan',3000],['administratorPlan',1500],['continuityPlan',3000],['assistantName',80],['assistantBrief',2000]]){
    const text=value?.[key]??'';
    if(typeof text!=='string'||text.length>max)throw Error('Revisa los campos del plan familiar');
    result[key]=text.trim();
  }
  return result;
}
