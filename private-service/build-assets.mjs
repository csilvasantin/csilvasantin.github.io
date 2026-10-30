import {readFile,writeFile} from 'node:fs/promises';
const files={};
for(const section of ['escrituras','empresas','memorias']){
  for(const filename of ['style.css','app.js',section==='escrituras'?'table.js':'model.js']){
    files[`/${section}/${filename}`]=[filename.endsWith('.css')?'text/css':'text/javascript',await readFile(new URL(`../${section}/${filename}`,import.meta.url),'utf8')];
  }
}
await writeFile(new URL('./assets.mjs',import.meta.url),'// Generado por build-assets.mjs; sin datos privados.\nexport default '+JSON.stringify(files)+';\n');
