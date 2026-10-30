# Área privada de carlossilva.info

## Memorias

`/memorias/` permite escribir, leer, buscar y editar recuerdos con título, fecha opcional, autor y texto. Usa las mismas cinco cuentas familiares, proveedor Google, audience y política que las demás secciones, sin permisos públicos adicionales.

`GET /memorias/api/memories`, `PUT /memorias/api/memories` y `/memorias/api/login` se sirven desde el Worker protegido. Los textos se guardan exclusivamente en `memories.json` del bucket R2 privado; nunca en Git, HTML estático ni almacenamiento local del navegador. La primera visita autenticada muestra un archivo vacío. Escrituras con control de origen y ETag para evitar perder cambios concurrentes. Límite inicial: 100 entradas de 12.000 caracteres; petición de hasta 4 MiB. Sin datos de prueba en producción.

## Empresas

`/empresas/` contiene fichas de empresa (nombre, NIF/CIF, notas), escrituras enlazadas a Google Drive y cuentas bancarias (banco, titular e IBAN). No hay datos de ejemplo en producción. La cuenta se muestra enmascarada en el listado; el formulario permite verla para editarla y verifica su checksum.

`GET /empresas/api/companies` y `PUT /empresas/api/companies` utilizan el mismo JWT y lista privada de usuarios que Escrituras. El archivo `companies.json` se guarda exclusivamente en R2 privado. Cada modificación requiere origen coincidente y una versión ETag válida, y la escritura condicional evita sobreescribir cambios de otra persona. Se limitan tamaño, estructura y destinos de enlaces. Nunca guardar números de cuenta en Git ni en archivos estáticos.

La aplicación Access protege directamente el Worker `carlossilva-private`, incluidas todas sus rutas. Páginas completas, JavaScript, CSS y API de `/intranet*`, `/memorias*`, `/escrituras*`, `/empresas*` y `/docs*` se sirven después de verificar el JWT firmado y la lista familiar. No hay interfaz privada renderizada antes de autenticar. Las copias HTML de GitHub Pages solo muestran una puerta de entrada sin menú, formularios ni contenido privado. Las plantillas están en `pages.mjs`; `build-assets.mjs` empaqueta los recursos en el Worker durante el despliegue. El código fuente no contiene datos privados.

La interfaz protegida se sirve en `/escrituras/`. No contiene el inventario, nombres de titulares, direcciones ni enlaces a las escrituras. Los datos se obtienen exclusivamente de `GET /escrituras/api/inventory` tras validar un JWT firmado por Cloudflare Access y la lista privada de cinco cuentas del secreto `ALLOWED_EMAILS`.

## Infraestructura comprobada el 30/10/2026

- GoDaddy confirma los nameservers Cloudflare `matteo.ns.cloudflare.com` y `paris.ns.cloudflare.com`. La activación final de la zona sigue pendiente de propagación del registrador.
- Se contrastaron los 13 registros de servicio con los 16 de GoDaddy (los otros 3 son NS/SOA). Correo y servicios auxiliares permanecen sin proxy. La web continúa en GitHub Pages, rama main.
- Worker desplegado en diez rutas: las cinco áreas completas, tanto en dominio raíz como en www. Bucket R2 privado, sin r2.dev ni dominios públicos. Inventario de 23 unidades guardado; Empresas se inicializa vacío después de autenticar.
- Proyecto Google `carlos-silva-archivo-privado`, sin facturación. OAuth creado y configurado. Google se mantiene en modo de prueba con las cinco cuentas autorizadas. Prueba real del IdP completada con la cuenta del propietario.
- Proveedor Google: `070bdc8a-c9f4-468c-b51a-d9babc3fabc5`.
- Aplicación Access: `84b08853-3d4c-4d41-9564-a095945b0221`, destino Worker completo (producción y vistas previas), Google como único proveedor, sesión de 6 horas. Cookie HttpOnly.
- Política `0b2119c9-8da4-4691-a7a3-2841b3a4a1c9`: Allow para cinco correos exactos y Require Google. No hay Bypass ni reglas Everyone.
- `ACCESS_AUD` y `ACCESS_TEAM_DOMAIN` configurados en Wrangler; los cinco correos corregidos están en el secreto `ALLOWED_EMAILS`, nunca en Git.
- El inventario es una copia de la hoja, no una sincronización automática.

## Comprobación tras propagarse el DNS

Comprobar que Cloudflare marque la zona Active; verificar portada, correo MX y TLS Full (Strict). Abrir ambas secciones y usar «Entrar con Google» con una cuenta permitida; con sesión cerrada no debe haber datos. Verificar lectura del inventario y archivo vacío de Empresas. Los 21 tests locales verifican firmas, issuer, audience, caducidad, lista de usuarios, origen de escrituras, versiones concurrentes y redirecciones de login.

El destino Worker protege automáticamente todas sus rutas y dominios; se conserva la misma aplicación y audience. La portada pública muestra solo «Entrar en la zona protegida»; `family-navigation.js` únicamente añade el menú familiar tras una respuesta autenticada de `/intranet/api/session`. El menú privado empieza por Inicio → Memorias → Escrituras → Empresas → Documentación.

Las pruebas nuevas cubren la denegación del HTML y recursos para visitas anónimas y cuentas ajenas, el orden del menú autenticado y la ausencia de vistas privadas en el origen estático. La validación real del flujo de login del dominio queda pendiente mientras Cloudflare indique zona Pending; los DNS de 1.1.1.1 ya devuelven los nameservers correctos.

Documentación del alcance del destino Worker: https://developers.cloudflare.com/workers/configuration/cloudflare-access/

Las escrituras siguen sujetas a los permisos originales de Drive. El acceso a la web no cambia automáticamente sus permisos: revisar la hoja y cada PDF antes de considerar completo el acceso de todas las cuentas. No habilitar enlaces públicos.

## Validación local

`node --test private-service/worker.test.mjs`

`node private-service/preview.mjs <ruta-local-a-inventory.json>`

La vista previa sólo escucha en 127.0.0.1 y muestra una copia local. No prueba el inicio de sesión Google. El contenido del inventario no se guarda en el navegador ni se incluye en el repositorio público.
