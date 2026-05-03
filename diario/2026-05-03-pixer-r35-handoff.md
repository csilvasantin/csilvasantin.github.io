# 2026-05-03 · Pixer.ai × Admira.xp — Handoff (r23 → r35)

Sesión maratón: cerramos hoy con **v.2026.05.02-r35**, todos los motores conectados a APIs reales (lo que se podía sin captcha), pipeline música+letra, comparador de imágenes, bridge Pixer ⇄ AdmiraXP signage cerrado con ack real, y preview/import desde URLs.

## Versión final pública

https://csilvasantin.github.io/pixer-ai-content/v.2026.05.02-r35/

## Lo que hay funcionando hoy

### Música — pipeline letra + voz cantada (r24-r26)
- **Pixer Loop** (free, Web Audio).
- **Lyria 2** (`lyria-002`, $0.06/sample) — instrumental 60s estéreo 48kHz, sin letra.
- **Lyria 3 Clip preview** (`lyria-3-clip-preview`) — 30s MP3 con voz cantando la letra.
- **Lyria 3 Pro preview** (`lyria-3-pro-preview`) — ~2min MP3 con voz cantando la letra.
- **Botón ✏️ GENERAR CON GEMINI** en el campo Letra: usa **Gemini 2.5 Flash** (Vertex AI vía API key), construye prompt con cliente + emoción + tonalidad + bpm + capas + idioma.
- Suno sigue bloqueado por **Turnstile** (requiere 2Captcha ~$3 setup). Documentado en código.

### Imágenes (r27-r28)
- **FLUX schnell** (free, Pollinations).
- **Imagen 4** ($0.04, 1024px) y **Imagen 4 Ultra** ($0.06, 2K) — vía Gemini API.
- **Grok Imagine** ($0.02) y **Grok Imagine Pro** ($0.07) — vía worker.
- **⚡ TODAS (comparar)** ($0.19 total): lanza los 5 motores en paralelo, grid responsive con tiempo de generación por celda.

### Video (r27)
- **Pixer Storyboard** (free, 3 escenas Pollinations + crossfade).
- **Veo 3 Fast** (~$0.10/s, 4-8s 720p **con audio nativo**).
- **Veo 3** (~$0.40/s, hasta 1080p, audio + diálogos sincronizados).
- **Grok Imagine Video** (sin audio).
- Polling async + descarga proxied a través del worker (URI requiere API key server-side).

### Bridge Pixer → Admira XP (r29-r33)
- **`POST /signage/push`** — Pixer publica con `{kind, src o base64, mime, title}`.
- **`GET /signage/feed`** — lista items (max 50 en KV, TTL 7 días).
- **`POST /signage/ack/{id}`** — pantalla confirma "lo estoy mostrando", almacena `acked_at` y `screen`.
- **`POST /signage/heartbeat`** — cada signage/game pinga cada 5s con `{screen, role, version}`.
- **`GET /signage/screens`** — devuelve estado de pantallas conocidas (online/stale/offline).
- **Pixer**: panel debajo del campo Cliente con thumbnail + 6 etapas (Detectando 5% → Subiendo 50% → Guardado 80% → Esperando ack 90% → REPRODUCIENDO 100%) + mensajes honestos cuando no hay ack.
- **Badge 🟢/🟡/🔴 XTORE** en topnav: muestra `XTORE v26.03.05.4 · LIVE` cuando detecta el game, hover detalla todas las pantallas.

### Pantalla standalone signage.html
- URL estable (no versioned): https://csilvasantin.github.io/pixer-ai-content/signage.html
- Polea feed cada 5s, render fullscreen Matrix-style, HUD con clock + LIVE + items + screen-id.
- Manda ack cuando muestra item.
- Para abrir en una TV/monitor independiente.

### AdmiraXP game (repo `01.-AdmiraXperience-Game`)
- Inyectado snippet de ~80 líneas al final de `game.html` que:
  - Anuncia heartbeat cada 5s con `role:'xtore-game'` + version (`window.XTANCO_APP`).
  - Polea `/signage/feed` y muestra el item nuevo en overlay flotante (`#pixerFeedOverlay`) en la esquina superior derecha del game.
  - Manda ack cuando muestra el item.
  - Botón × para ocultar overlay.

### Importar desde URL (r34-r35)
- **Botón 📥 IMPORTAR** en topnav junto a ⚙ KEYS.
- Modal con URL + radio audio/video.
- Llama a `http://127.0.0.1:3777/yt/import` (suno-local extendido con yt-dlp).
- Soporta YouTube, Vimeo, Twitter, TikTok, Instagram, etc.
- El resultado aparece en el player → puedes pulsar 📺 ENVIAR A ADMIRA XP normal.
- **Issue conocido**: Chrome Private Network Access (PNA) bloquea fetches de HTTPS público → IP privada. Worker arreglado con `Access-Control-Allow-Private-Network: true`. **Pendiente verificar con hard refresh por parte del usuario** — si sigue fallando, activar `chrome://flags/#block-insecure-private-network-requests` en disabled o probar otro browser.

## Infraestructura nueva (vivirá entre sesiones)

### Cloudflare Worker `pixer-eleven`
- URL: https://pixer-eleven.csilvasantin.workers.dev
- Carpeta local: `~/Documents/New project/csilvasantin-repos/pixer-worker/`
- Secrets: `ELEVENLABS_KEY`, `XAI_KEY`, `GCP_SA_KEY`, `GEMINI_API_KEY`
- KV namespace: `SIGNAGE_KV` (id `013098f4df534234994ae04b8c1929a5`)
- Endpoints:
  - `/healthz`, `/tts`
  - `/xai/image`, `/xai/video`, `/xai/video/{id}`
  - `/lyria/generate` (Vertex Lyria 2)
  - `/llm/lyrics` (Gemini 2.5 Flash)
  - `/lyria3/generate` (Gemini Lyria 3 Clip/Pro)
  - `/imagen/generate`
  - `/veo/generate`, `/veo/status/{op}`, `/veo/download?uri=`
  - `/signage/push`, `/signage/feed`, `/signage/asset/{id}`, `/signage/ack/{id}`, `/signage/heartbeat`, `/signage/screens`, `/signage/clear`
- CORS: `csilvasantin.github.io` + localhost.

### `suno-local` (server Node nativo)
- Carpeta: `~/Documents/New project/csilvasantin-repos/suno-local/`
- `node server.js` en localhost:3777
- Endpoints: `/healthz` (Suno billing), `/generate`, `/status?ids=`, **`/yt/import`** (yt-dlp via child_process).
- CORS con header `Access-Control-Allow-Private-Network: true` (necesario para Chrome PNA).
- Cookie de Suno caducada (no afecta a yt-dlp). Para reactivar Suno: re-extraer cookie del browser.

### `signage.html`
- Pantalla standalone Matrix-style en URL estable (no versioned).
- Para abrir en TV/monitor de la Xtore.

### AdmiraXP `game.html`
- Snippet de ~80 líneas al final del body conecta el game con el feed de Pixer.
- Tanto heartbeat como render+ack del feed.
- Push: https://github.com/csilvasantin/01.-AdmiraXperience-Game/commits/main

## Pendientes para próxima sesión

1. **Verificar IMPORTAR end-to-end con hard refresh** — el fix de Chrome PNA está en server, hay que comprobar que el browser responde bien tras `Cmd+Shift+R`. Si sigue fallando, activar flags Chrome o cambiar de browser.
2. **Re-extraer cookie de Suno** + integrar 2Captcha si quiere desbloquear Suno (~$3 setup).
3. **ElevenLabs**: cuenta del usuario sigue en Free Tier bloqueada por "detected_unusual_activity". Decidir entre upgrade Starter $5/mes o contactar soporte.
4. **Mute total en AdmiraXP** (el game) — petición que se quedó a medias cuando pivotamos al fix de la badge XTORE. Pendiente: añadir botón mute en topbar del game cerca del ANA badge que pause todo audio (Web Audio + `<audio>` + `<video>`).
5. **Posible mejora**: integrar el feed de Pixer en alguna de las pantallas del propio estanco (VAPES, VINOS, etc.) en vez de overlay flotante. Requiere meter Image en canvas del game o mapear coordenadas. Otra sesión.

## Versiones publicadas hoy

| | Cambio |
|---|---|
| r24 | Lyria 2 (Vertex AI) integrado vía worker (firma JWT RS256, OAuth2) |
| r25 | Generador de letras con Gemini 2.5 Flash (botón ✏️ en Música) |
| r26 | Lyria 3 Clip + Pro (canta letras del brief) — Gemini API con tier de pago |
| r27 | Imagen 4 + Veo 3 Fast/Pro (Gemini API) |
| r28 | Comparador "TODAS" — 5 motores de imagen en paralelo side-by-side |
| r29 | Botón "📺 ENVIAR A ADMIRA XP" + KV signage feed en worker |
| r30 | Panel envío con preview thumb + barra de progreso + log de etapas |
| r31 | signage.html + ack endpoint + estado real "REPRODUCIENDO" |
| r32 | Heartbeat + badge XTORE 🟢/🟡/🔴 en topnav |
| r33 | Badge muestra versión del game (`vYY.MM.DD.N`) |
| r34 | Botón 📥 IMPORTAR (yt-dlp via suno-local) + game con overlay del feed |
| **r35** | **Fix Failed-to-fetch en IMPORTAR (HSTS upgrade evitado con 127.0.0.1)** |

## Cambios fuera de Pixer

- **`pixer-worker`** — añadidos endpoints lyria, llm, lyria3, imagen, veo, signage*, heartbeat, screens. Secrets nuevos GCP_SA_KEY y GEMINI_API_KEY. KV namespace SIGNAGE_KV.
- **`suno-local`** — añadido /yt/import con yt-dlp + CORS header PNA.
- **`01.-AdmiraXperience-Game`** — snippet 80 líneas al final de game.html para heartbeat + feed render + ack.
- **`csilvasantin.github.io/pixer-ai-content/signage.html`** — pantalla standalone.

## Hooks de sonido (sin cambios desde ayer)

- `~/.claude/sounds/` con `mario.wav`, `ghosts.wav`, scripts `aprobar.sh`, `finalizar.sh`, `notificame.sh`.
- Modo actual: `full`. Hooks `Notification` + `Stop` apuntando a los scripts.
- Pendiente: el watcher solo recarga `settings.json` al inicio, así que cambios de hoy requieren `/hooks` o reinicio para activarse.

## Telegram

Chat `Pixer.ia` (id `-1003800381744`) vía AdmiraNext2ControlBot. Formato actualizado: **URL clicable en la segunda línea, justo bajo la versión** — ya está fijo en `feedback_pixer_deploy.md`.
