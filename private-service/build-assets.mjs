import {readFile,writeFile} from 'node:fs/promises';
const files={};
for(const section of ['escrituras','empresas','memorias']){
  for(const filename of ['style.css','app.js',section==='escrituras'?'table.js':'model.js']){
    files[`/${section}/${filename}`]=[filename.endsWith('.css')?'text/css':'text/javascript',await readFile(new URL(`../${section}/${filename}`,import.meta.url),'utf8')];
  }
}
for(const [path,filename,type] of [['/empresas/plan.js','../empresas/plan.js','text/javascript'],['/empresas/plan-ui.js','../empresas/plan-ui.js','text/javascript'],['/intranet/mascota.js','./mascota.js','text/javascript'],['/intranet/mascota.css','./mascota.css','text/css']])files[path]=[type,await readFile(new URL(filename,import.meta.url),'utf8')];
await writeFile(new URL('./assets.mjs',import.meta.url),'// Generado por build-assets.mjs; sin datos privados.\nexport default '+JSON.stringify(files)+';\n');
