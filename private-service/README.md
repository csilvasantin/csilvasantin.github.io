# Área privada de carlossilva.info

La interfaz estática está en `/escrituras/`. No contiene el inventario, nombres de titulares, direcciones ni enlaces a las escrituras. Los datos se obtienen exclusivamente de `GET /escrituras/api/inventory` tras validar un JWT firmado por Cloudflare Access y la lista privada de cinco cuentas del secreto `ALLOWED_EMAILS`.

## Infraestructura comprobada el 30/10/2026

- carlossilva.info: DNS en GoDaddy (`ns71/ns72.domaincontrol.com`), web en GitHub Pages (`csilvasantin/csilvasantin.github.io`, rama main).
- admira.shop: DNS/proxy en Cloudflare (`matteo/paris.ns.cloudflare.com`).
- El acceso local de Wrangler ha caducado; falta una sesión válida de Cloudflare para desplegar y configurar Access.
- El inventario es una copia de la hoja, no una sincronización automática. No modificar la hoja fuente para publicar la web.

## Activación

1. En la misma cuenta Cloudflare que admira.shop, añadir la zona carlossilva.info. Copiar **todos** los registros existentes, incluidos MX, TXT, SPF, DKIM y DMARC. Mantener los destinos de GitHub Pages. Cambiar los nameservers en GoDaddy sólo a los asignados por Cloudflare y comprobar web/correo.
2. Activar proxy para los registros web del dominio raíz y www. Configurar TLS Full (strict), conservando el certificado válido de GitHub Pages.
3. En Zero Trust, configurar Google como proveedor de identidad (cuentas Google normales y de Workspace). Documentación: https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/google/
4. Crear una aplicación Access con ambos hostnames `carlossilva.info/escrituras` y `www.carlossilva.info/escrituras`, incluyendo sus subrutas. Login únicamente con Google; política Allow únicamente para:
   Las cinco direcciones autorizadas se mantienen en el secreto `ALLOWED_EMAILS` del Worker y en la política Access. No publicarlas en este repositorio.
   No añadir políticas Bypass, Everyone ni acceso general por dominio. Sesión de 8 horas.
5. Crear un bucket R2 **privado** `carlossilva-private`, sin r2.dev ni dominio público. Subir la copia local como objeto `inventory.json` con Wrangler (`r2 object put carlossilva-private/inventory.json --file <ruta-local> --remote`). Nunca incluir esa copia en Git, Pages, logs ni assets.
6. En `wrangler.toml`, añadir `[vars]` con `ACCESS_TEAM_DOMAIN` (hostname de Zero Trust) y `ACCESS_AUD` (Application Audience de la aplicación Access). Son identificadores, no contraseñas. Desplegar el Worker con las dos rutas indicadas. Workers.dev y preview URLs permanecen desactivados.
7. Publicar la interfaz en Pages. Añadir un enlace «Escrituras» en la portada cuando esté operativo.
8. Verificar con sesión cerrada, cuenta permitida y cuenta ajena: no hay datos antes de iniciar sesión; las cinco cuentas permitidas pueden entrar; una cuenta ajena no puede. Verificar las dos variantes del dominio y el endpoint de la API. Las firmas, issuer, audience y caducidad se verifican también en el Worker para evitar suplantación por cabeceras.

Las escrituras siguen sujetas a los permisos originales de Drive. El acceso a la web no cambia automáticamente sus permisos: revisar la hoja y cada PDF antes de considerar completo el acceso de todas las cuentas. No habilitar enlaces públicos.

## Validación local

`node --test private-service/worker.test.mjs`

`node private-service/preview.mjs <ruta-local-a-inventory.json>`

La vista previa sólo escucha en 127.0.0.1 y muestra una copia local. No prueba el inicio de sesión Google. El contenido del inventario no se guarda en el navegador ni se incluye en el repositorio público.
