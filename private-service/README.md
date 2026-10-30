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

- GoDaddy confirma los nameservers Cloudflare `matteo.ns.cloudflare.com` y `paris.ns.cloudflare.com`. La zona está Active y el certificado Universal SSL está Active (30/10/2026). Algunos resolutores conservan temporalmente el CNAME anterior de www.
- Se contrastaron los 13 registros de servicio con los 16 de GoDaddy (los otros 3 son NS/SOA). Correo y servicios auxiliares permanecen sin proxy. La web continúa en GitHub Pages, rama main.
- Worker desplegado en diez rutas: las cinco áreas completas, tanto en dominio raíz como en www. Bucket R2 privado, sin r2.dev ni dominios públicos. Inventario de 23 unidades guardado; Empresas se inicializa vacío después de autenticar.
- Proyecto Google `carlos-silva-archivo-privado`, sin facturación. OAuth creado y configurado. Google se mantiene en modo de prueba con las cinco cuentas autorizadas. Prueba real del IdP completada con la cuenta del propietario.
- Proveedor Google: `070bdc8a-c9f4-468c-b51a-d9babc3fabc5`.
- Aplicación Access: `84b08853-3d4c-4d41-9564-a095945b0221`, destino Worker completo (producción y vistas previas), Google como único proveedor, sesión de 6 horas. Cookie HttpOnly.
- Política `0b2119c9-8da4-4691-a7a3-2841b3a4a1c9`: Allow para cinco correos exactos y Require Google. No hay Bypass ni reglas Everyone.
- `ACCESS_AUD` y `ACCESS_TEAM_DOMAIN` configurados en Wrangler; los cinco correos corregidos están en el secreto `ALLOWED_EMAILS`, nunca en Git.
- El inventario es una copia de la hoja, no una sincronización automática.

## Verificación del despliegue

Cloudflare confirma zona y certificado activos, con TLS Full (Strict). GitHub Pages ha publicado las puertas de entrada sin menú ni formularios privados. Se verificaron 22 peticiones HTTPS sin sesión contra el edge Cloudflare (resolución al IP publicado por 1.1.1.1, sin omitir validación TLS): cinco páginas, dos recursos y cuatro API, tanto raíz como www. Todas devuelven 302 al login de Access y Cache-Control no-store. El navegador local conserva temporalmente la resolución antigua; la navegación autenticada completa en el dominio queda pendiente de expirar esa caché. La prueba real del proveedor Google ya fue satisfactoria. Los 26 tests locales verifican firmas, issuer, audience, caducidad, lista de usuarios, origen de escrituras, versiones concurrentes y redirecciones de login.

El destino Worker protege automáticamente todas sus rutas y dominios; se conserva la misma aplicación y audience. La portada pública muestra solo «Entrar en la zona protegida»; `family-navigation.js` únicamente añade el menú familiar tras una respuesta autenticada de `/intranet/api/session`. El menú privado empieza por Inicio → Memorias → Escrituras → Empresas → Documentación.

Las pruebas nuevas cubren la denegación del HTML y recursos para visitas anónimas y cuentas ajenas, el orden del menú autenticado y la ausencia de vistas privadas en el origen estático. La validación HTTP de la protección del dominio ya es satisfactoria en el edge activo. El menú autenticado también se comprobó visualmente en la vista previa local.

Documentación del alcance del destino Worker: https://developers.cloudflare.com/workers/configuration/cloudflare-access/

Las escrituras siguen sujetas a los permisos originales de Drive. El acceso a la web no cambia automáticamente sus permisos: revisar la hoja y cada PDF antes de considerar completo el acceso de todas las cuentas. No habilitar enlaces públicos.

## Validación local

`node --test private-service/worker.test.mjs`

`node private-service/preview.mjs <ruta-local-a-inventory.json>`

La vista previa sólo escucha en 127.0.0.1 y muestra una copia local. No prueba el inicio de sesión Google. El contenido del inventario no se guarda en el navegador ni se incluye en el repositorio público.

## Plan familiar y mascota

El plan de grupo y continuidad se guarda en el objeto privado `family-plan.json`, separado de `companies.json` para evitar que una ficha empresarial pueda sobreescribirlo. `GET/PUT /empresas/api/family-plan` aplica la misma validación de identidad, origen, límites y ETag. La página Empresas permite editar el proyecto de holding, administración, continuidad, nombre y cometido de la mascota. Las cinco fichas iniciales y el plan indicado por el propietario se incorporaron directamente en R2; sus contenidos y el nombre familiar del asistente no se incluyen en Git.

La mascota es un golden retriever ilustrado en SVG local, con chat disponible en las páginas privadas. `POST /intranet/api/assistant` requiere el JWT familiar antes de leer fichas o invocar IA. Usa Workers AI mediante el binding AI, modelo `@cf/meta/llama-3.1-8b-instruct`, máximo 500 tokens de respuesta y 50 preguntas diarias compartidas con contador R2 condicional. No se ha contratado otro plan ni habilitado un endpoint público.

El asistente es de consulta: no tiene herramientas de edición, transacciones ni acceso al contenido de los PDF. Distingue los deseos familiares de lo formalizado. Utiliza resúmenes acotados de las fichas; los IBAN completos se omiten y se redactan también en entrada/salida. Los recuerdos se consultan solo si la pregunta los menciona; las escrituras se buscan por pertinencia. Las respuestas incluyen enlaces internos a las secciones consultadas. La conversación solo vive en la memoria de la pestaña y no se guarda en R2; R2 registra únicamente un contador diario agregado.

Pruebas: 26 tests correctos, incluida autenticación previa a cualquier lectura/IA, separación del plan, minimización de cuentas, recuperación selectiva de memorias, límites de tamaño/origen/cuota, historial sin roles de sistema inyectables y tratamiento de fallos sin respuestas fingidas. Inferencia real Workers AI y dos consultas desde la interfaz local comprobadas; las respuestas identificaron las cinco empresas y el carácter pendiente de formalización del plan de continuidad. La navegación autenticada en el dominio depende aún de expirar la caché DNS del resolutor local.

Vista previa opcional con fichas privadas: `node private-service/preview.mjs RUTA_INVENTARIO DIRECTORIO_PRIVADO [ADAPTADOR_IA_LOCAL]`. El adaptador es un módulo local fuera del repositorio que exporta run(model,input); no contiene claves literales ni se publica. La vista previa sigue limitada a loopback, con control de Host y origen; los cambios solo afectan a memoria local.
