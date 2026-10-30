// No se muestra ningún enlace privado hasta que el servidor confirma la sesión.
try {
  const response=await fetch('/intranet/api/session',{credentials:'same-origin',cache:'no-store',redirect:'error'});
  if(response.ok&&(await response.json()).authenticated===true){
    const navigation=document.getElementById('family-navigation');
    navigation.replaceChildren();navigation.setAttribute('aria-label','Zona protegida');
    for(const [title,path] of [['Inicio','/intranet/'],['Memorias','/memorias/'],['Escrituras','/escrituras/'],['Empresas','/empresas/'],['Documentación','/docs/'],['Salir','/cdn-cgi/access/logout']]){
      const link=document.createElement('a');link.textContent=title;link.href=path;
      link.style.cssText='padding:10px 12px;border-radius:8px;background:#245e4e;color:#fff;text-decoration:none';navigation.append(link);
    }
  }
}catch{/* La portada pública conserva únicamente la entrada a la zona protegida. */}
