# Área privada de carlossilva.info

## Empresas

`/empresas/` contiene fichas de empresa (nombre, NIF/CIF, notas), escrituras enlazadas a Google Drive y cuentas bancarias (banco, titular e IBAN). No hay datos de ejemplo en producción. La cuenta se muestra enmascarada en el listado; el formulario permite verla para editarla y verifica su checksum.

`GET /empresas/api/companies` y `PUT /empresas/api/companies` utilizan el mismo JWT y lista privada de usuarios que Escrituras. El archivo `companies.json` se guarda exclusivamente en R2 privado. Cada modificación requiere origen coincidente y una versión ETag válida, y la escritura condicional evita sobreescribir cambios de otra persona. Se limitan tamaño, estructura y destinos de enlaces. Nunca guardar números de cuenta en Git ni en archivos estáticos.

Al activar Cloudflare Access, añadir también `www.carlossilva.info/empresas` y `carlossilva.info/empresas`, incluidas sus subrutas, con el mismo proveedor Google y las mismas cuentas autorizadas. Para usar la misma `ACCESS_AUD`, deben ser destinos de la misma aplicación Access.

La interfaz estática está en `/escrituras/`. No contiene el inventario, nombres de titulares, direcciones ni enlaces a las escrituras. Los datos se obtienen exclusivamente de `GET /escrituras/api/inventory` tras validar un JWT firmado por Cloudflare Access y la lista privada de cinco cuentas del secreto `ALLOWED_EMAILS`.

## Infraestructura comprobada el 30/10/2026

- carlossilva.info: DNS en GoDaddy (`ns71/ns72.domaincontrol.com`), web en GitHub Pages (`csilvasantin/csilvasantin.github.io`, rama main).
- admira.shop: DNS/proxy en Cloudflare (`matteo/paris.ns.cloudflare.com`).
- Zona Cloudflare creada (Free), pendiente de delegar desde GoDaddy. Los 13 registros de servicio se han contrastado con los 16 de GoDaddy (los otros 3 son NS/SOA). DNSSEC está apagado.
- Wrangler renovado y Worker desplegado en ambas rutas. Bucket R2 privado creado, copia de 23 unidades guardada, acceso público r2.dev deshabilitado y sin dominios públicos.
- Proyecto Google independiente `carlos-silva-archivo-privado`, sin facturación. Formulario OAuth preparado; pendiente de consentimiento, creación del cliente e integración con Access.
- El Worker permanece cerrado (503) sin `ACCESS_AUD` y `ALLOWED_EMAILS`. La interfaz distingue este estado de un inicio de sesión correcto.
- El inventario es una copia de la hoja, no una sincronización automática. No modificar la hoja fuente para publicar la web.

## Activación

1. En la misma cuenta Cloudflare que admira.shop, añadir la zona carlossilva.info. Copiar **todos** los registros existentes, incluidos MX, TXT, SPF, DKIM y DMARC. Mantener los destinos de GitHub Pages. Cambiar los nameservers en GoDaddy sólo a los asignados por Cloudflare y comprobar web/correo.
2. Activar proxy para los registros web del dominio raíz y www. Configurar TLS Full (strict), conservando el certificado válido de GitHub Pages.
3. En Zero Trust, configurar Google como proveedor de identidad (cuentas Google normales y de Workspace). Documentación: https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/google/
4. Crear una aplicación Access con ambos hostnames `carlossilva.info/escrituras` y `www.carlossilva.info/escrituras`, incluyendo sus subrutas. Login únicamente con Google; política Allow únicamente para:
   Las cinco direcciones autorizadas se mantienen en el secreto `ALLOWED_EMAILS` del Worker y en la política Access. No publicarlas en este repositorio.
   No añadir políticas Bypass, Everyone ni acceso general por dominio. Sesión de 6 horas.
5. Crear un bucket R2 **privado** `carlossilva-private`, sin r2.dev ni dominio público. Subir la copia local como objeto `inventory.json` con Wrangler (`r2 object put carlossilva-private/inventory.json --file <ruta-local> --remote`). Nunca incluir esa copia en Git, Pages, logs ni assets.
6. En `wrangler.toml`, completar `ACCESS_AUD` (Application Audience de la aplicación Access). `ACCESS_TEAM_DOMAIN` ya está configurado. Son identificadores, no contraseñas. Configurar el secreto `ALLOWED_EMAILS` con las direcciones verificadas, separadas por comas. Desplegar el Worker con las dos rutas indicadas. Workers.dev y preview URLs permanecen desactivados.
7. Publicar la interfaz en Pages. Añadir un enlace «Escrituras» en la portada cuando esté operativo.
8. Verificar con sesión cerrada, cuenta permitida y cuenta ajena: no hay datos antes de iniciar sesión; las cinco cuentas permitidas pueden entrar; una cuenta ajena no puede. Verificar las dos variantes del dominio y el endpoint de la API. Las firmas, issuer, audience y caducidad se verifican también en el Worker para evitar suplantación por cabeceras.

Las escrituras siguen sujetas a los permisos originales de Drive. El acceso a la web no cambia automáticamente sus permisos: revisar la hoja y cada PDF antes de considerar completo el acceso de todas las cuentas. No habilitar enlaces públicos.

## Validación local

`node --test private-service/worker.test.mjs`

`node private-service/preview.mjs <ruta-local-a-inventory.json>`

La vista previa sólo escucha en 127.0.0.1 y muestra una copia local. No prueba el inicio de sesión Google. El contenido del inventario no se guarda en el navegador ni se incluye en el repositorio público.
