(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const e of i)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function o(i){const e={};return i.integrity&&(e.integrity=i.integrity),i.referrerPolicy&&(e.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?e.credentials="include":i.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function n(i){if(i.ep)return;i.ep=!0;const e=o(i);fetch(i.href,e)}})();const l=[{label:"Entrar al diario",href:"https://csilvasantin.github.io/diario/",tone:"primary"},{label:"Ver vision del libro",href:"#libro",tone:"secondary"}],c=[{label:"Diario",href:"#diario"},{label:"Libro",href:"#libro"},{label:"Universo",href:"#universo"},{label:"Conectar dominio",href:"#dominio"}],d=[{day:"30 mayo 2026",title:"Produccion, puente Telegram y consejo operativo",summary:"Un dia de sistema vivo: nuevas rutas de produccion, integracion con Telegram y registro operativo ya conectado al diario.",tag:"Hoy"},{day:"29 mayo 2026",title:"Cierre limpio del diario",summary:"Entrada breve y factual, pensada para que el diario siga siendo una herramienta de claridad y no solo un archivo.",tag:"Ritmo"},{day:"28 mayo 2026",title:"Base de continuidad",summary:"El diario se consolida como memoria publica de avances, decisiones y siguientes pasos.",tag:"Memoria"}],p=[{chapter:"Capitulo 01",status:"Origen",summary:"Quien es Carlos Silva, que obsesiones mueven el proyecto y por que el diario importa."},{chapter:"Capitulo 02",status:"En construccion",summary:"La transicion de creador a sistema: ideas, agentes, producto, rituales y decisiones dificiles."},{chapter:"Capitulo 03",status:"Puente",summary:"Como el libro puede beber del diario para convertirse en una obra viva y siempre actualizable."}],u=["Diario como memoria publica","Libro como narrativa central","www.carlossilva.info como portal canonico","Identidad, proceso y obra en una sola experiencia"];function m(s){s.innerHTML=`
    <div class="site-shell">
      <div class="ambient ambient-top" aria-hidden="true"></div>
      <div class="ambient ambient-bottom" aria-hidden="true"></div>

      <header class="topbar">
        <a class="brand" href="#inicio" aria-label="Ir al inicio de Carlos Silva">
          <span class="brand-mark">CS</span>
          <span class="brand-copy">
            <strong>Carlos Silva</strong>
            <small>Diario, libro y universo personal</small>
          </span>
        </a>

        <nav class="topnav" aria-label="Secciones principales">
          ${c.map(a=>`<a href="${a.href}">${a.label}</a>`).join("")}
        </nav>
      </header>

      <main class="page" id="inicio">
        <section class="hero-panel">
          <div class="hero-copy">
            <p class="eyebrow">www.carlossilva.info</p>
            <h1>Una pagina personal que parece una obra en marcha.</h1>
            <p class="hero-text">
              Este sitio puede convertirse en la puerta principal de tu universo: una mezcla de diario en tiempo real,
              libro en construccion y archivo vivo de decisiones, avances y vision.
            </p>

            <div class="hero-actions">
              ${l.map(a=>`<a class="button ${a.tone==="secondary"?"button-secondary":"button-primary"}" href="${a.href}">${a.label}</a>`).join("")}
            </div>

            <dl class="hero-metrics" aria-label="Elementos clave del sitio">
              <div>
                <dt>Nucleo</dt>
                <dd>Diario + libro</dd>
              </div>
              <div>
                <dt>Dominio</dt>
                <dd>carlossilva.info</dd>
              </div>
              <div>
                <dt>Tono</dt>
                <dd>Editorial, vivo, memorable</dd>
              </div>
            </dl>
          </div>

          <aside class="hero-rail">
            <div class="signal-card">
              <p class="signal-label">Estado del portal</p>
              <strong>Arquitectura lista para unir obra, proceso y presencia publica.</strong>
              <p>
                La pagina principal ya puede actuar como centro narrativo: desde aqui se entra al diario y se anticipa el libro.
              </p>
            </div>

            <div class="domain-card" id="dominio">
              <p class="signal-label">Conexion de dominio</p>
              <ul>
                <li><span>01</span> Home principal en <strong>www.carlossilva.info</strong>.</li>
                <li><span>02</span> Diario enlazado como archivo vivo.</li>
                <li><span>03</span> Libro presentado como obra en expansion.</li>
              </ul>
            </div>
          </aside>
        </section>

        <section class="feature-grid" id="diario" aria-labelledby="diario-title">
          <div class="section-heading">
            <p class="eyebrow">Diario</p>
            <h2 id="diario-title">El diario no como blog, sino como pulso.</h2>
            <p>
              Una entrada no solo cuenta lo que pasó: deja rastro de criterio, bloqueos, decisiones y momentum. Eso le da valor literario y operativo.
            </p>
          </div>

          <div class="journal-stack">
            ${d.map(a=>`
                  <article class="journal-card">
                    <div class="journal-meta">
                      <span>${a.day}</span>
                      <strong>${a.tag}</strong>
                    </div>
                    <h3>${a.title}</h3>
                    <p>${a.summary}</p>
                  </article>
                `).join("")}
          </div>
        </section>

        <section class="split-panel" id="libro" aria-labelledby="libro-title">
          <div class="book-panel">
            <p class="eyebrow">Libro</p>
            <h2 id="libro-title">El libro puede vivir antes de estar terminado.</h2>
            <p>
              En vez de esconder el proceso, la pagina puede mostrar la tension creativa: capitulos, temas, notas y fragmentos que salen del mismo sistema que alimenta el diario.
            </p>
            <a class="text-link" href="#universo">Ver como se conecta todo</a>
          </div>

          <div class="chapter-grid">
            ${p.map(a=>`
                  <article class="chapter-card">
                    <p>${a.chapter}</p>
                    <strong>${a.status}</strong>
                    <span>${a.summary}</span>
                  </article>
                `).join("")}
          </div>
        </section>

        <section class="orbital-panel" id="universo" aria-labelledby="universo-title">
          <div class="section-heading">
            <p class="eyebrow">Universo</p>
            <h2 id="universo-title">Una presencia personal que conecta piezas distintas sin parecer un menu suelto.</h2>
          </div>

          <div class="orbit-layout">
            <div class="orbit-core">
              <span class="orbit-ring orbit-ring-one" aria-hidden="true"></span>
              <span class="orbit-ring orbit-ring-two" aria-hidden="true"></span>
              <div class="orbit-center">
                <strong>Carlos Silva</strong>
                <p>Autor, constructor, sistema vivo.</p>
              </div>
            </div>

            <div class="orbit-signals">
              ${u.map((a,o)=>`
                    <article class="signal-row">
                      <span>${String(o+1).padStart(2,"0")}</span>
                      <p>${a}</p>
                    </article>
                  `).join("")}
            </div>
          </div>
        </section>

        <section class="closing-panel">
          <div>
            <p class="eyebrow">Siguiente movimiento</p>
            <h2>La home ya puede contar una historia clara. El siguiente paso es conectarla a contenido real.</h2>
          </div>
          <div class="closing-actions">
            <a class="button button-primary" href="https://csilvasantin.github.io/diario/">Abrir diario publico</a>
            <a class="button button-secondary" href="#inicio">Volver arriba</a>
          </div>
        </section>
      </main>
    </div>
  `}const t=document.querySelector("#app");if(!t)throw new Error("App root element was not found");m(t);
