# Área privada de carlossilva.info

## Empresas

`/empresas/` contiene fichas de empresa (nombre, NIF/CIF, notas), escrituras enlazadas a Google Drive y cuentas bancarias (banco, titular e IBAN). No hay datos de ejemplo en producción. La cuenta se muestra enmascarada en el listado; el formulario permite verla para editarla y verifica su checksum.

`GET /empresas/api/companies` y `PUT /empresas/api/companies` utilizan el mismo JWT y lista privada de usuarios que Escrituras. El archivo `companies.json` se guarda exclusivamente en R2 privado. Cada modificación requiere origen coincidente y una versión ETag válida, y la escritura condicional evita sobreescribir cambios de otra persona. Se limitan tamaño, estructura y destinos de enlaces. Nunca guardar números de cuenta en Git ni en archivos estáticos.

La aplicación Access protege directamente el Worker `carlossilva-private`, incluidas todas sus rutas. Las páginas estáticas muestran únicamente la interfaz y un botón «Entrar con Google». Los endpoints de inicio de sesión redirigen a su sección tras validar el JWT. No contienen datos privados.

La interfaz estática está en `/escrituras/`. No contiene el inventario, nombres de titulares, direcciones ni enlaces a las escrituras. Los datos se obtienen exclusivamente de `GET /escrituras/api/inventory` tras validar un JWT firmado por Cloudflare Access y la lista privada de cinco cuentas del secreto `ALLOWED_EMAILS`.

## Infraestructura comprobada el 30/10/2026

- GoDaddy confirma los nameservers Cloudflare `matteo.ns.cloudflare.com` y `paris.ns.cloudflare.com`. La activación final de la zona sigue pendiente de propagación del registrador.
- Se contrastaron los 13 registros de servicio con los 16 de GoDaddy (los otros 3 son NS/SOA). Correo y servicios auxiliares permanecen sin proxy. La web continúa en GitHub Pages, rama main.
- Worker desplegado en las cuatro rutas de API, dos secciones por dominio raíz y www. Bucket R2 privado, sin r2.dev ni dominios públicos. Inventario de 23 unidades guardado; Empresas se inicializa vacío después de autenticar.
- Proyecto Google `carlos-silva-archivo-privado`, sin facturación. OAuth creado y configurado. Google se mantiene en modo de prueba con las cinco cuentas autorizadas. Prueba real del IdP completada con la cuenta del propietario.
- Proveedor Google: `070bdc8a-c9f4-468c-b51a-d9babc3fabc5`.
- Aplicación Access: `84b08853-3d4c-4d41-9564-a095945b0221`, destino Worker completo (producción y vistas previas), Google como único proveedor, sesión de 6 horas. Cookie HttpOnly.
- Política `0b2119c9-8da4-4691-a7a3-2841b3a4a1c9`: Allow para cinco correos exactos y Require Google. No hay Bypass ni reglas Everyone.
- `ACCESS_AUD` y `ACCESS_TEAM_DOMAIN` configurados en Wrangler; los cinco correos corregidos están en el secreto `ALLOWED_EMAILS`, nunca en Git.
- El inventario es una copia de la hoja, no una sincronización automática.

## Comprobación tras propagarse el DNS

Comprobar que Cloudflare marque la zona Active; verificar portada, correo MX y TLS Full (Strict). Abrir ambas secciones y usar «Entrar con Google» con una cuenta permitida; con sesión cerrada no debe haber datos. Verificar lectura del inventario y archivo vacío de Empresas. Los 15 tests locales verifican firmas, issuer, audience, caducidad, lista de usuarios, origen de escrituras, versiones concurrentes y redirecciones de login.

El destino Worker protege automáticamente todas sus rutas y dominios; no hace falta crear otra aplicación. Si se añaden destinos públicos para proteger también la interfaz estática, deben pertenecer a esta misma aplicación para conservar el audience.

Documentación del alcance del destino Worker: https://developers.cloudflare.com/workers/configuration/cloudflare-access/

Las escrituras siguen sujetas a los permisos originales de Drive. El acceso a la web no cambia automáticamente sus permisos: revisar la hoja y cada PDF antes de considerar completo el acceso de todas las cuentas. No habilitar enlaces públicos.

## Validación local

`node --test private-service/worker.test.mjs`

`node private-service/preview.mjs <ruta-local-a-inventory.json>`

La vista previa sólo escucha en 127.0.0.1 y muestra una copia local. No prueba el inicio de sesión Google. El contenido del inventario no se guarda en el navegador ni se incluye en el repositorio público.
