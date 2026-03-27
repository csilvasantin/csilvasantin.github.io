(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function s(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerPolicy&&(a.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?a.credentials="include":t.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(t){if(t.ep)return;t.ep=!0;const a=s(t);fetch(t.href,a)}})();const i=[{id:"ADM-DIR-01",shortName:"DIR 01",role:"Direccion",owner:"Consejo",focus:"Cerrar propuesta Q2",status:"online",power:92,load:48,note:"Mantiene la estabilidad general del consejo."},{id:"ADM-DEV-02",shortName:"DEV 02",role:"Desarrollo",owner:"Producto",focus:"Integracion de agentes",status:"busy",power:81,load:88,note:"Produce mucho, pero absorbe capacidad del resto."},{id:"ADM-DES-03",shortName:"DES 03",role:"Diseno",owner:"Marca",focus:"Sistema visual Boardroom",status:"blocked",power:67,load:74,note:"Necesita desbloqueo para liberar entregables."},{id:"ADM-OPS-04",shortName:"OPS 04",role:"Operaciones",owner:"Infra",focus:"Sostener despliegue",status:"busy",power:79,load:83,note:"Controla el impacto de incidentes en cadena."},{id:"ADM-IA-05",shortName:"IA 05",role:"Automatizacion",owner:"IA Lab",focus:"Rutinas de sync",status:"online",power:95,load:56,note:"Genera combos cuando se coordina con DEV y OPS."},{id:"ADM-SUP-06",shortName:"SUP 06",role:"Soporte",owner:"Ayuda interna",focus:"Recuperar nodos",status:"offline",power:24,load:96,note:"Nodo caido. La recuperacion del consejo es mas lenta."},{id:"ADM-AUX-07",shortName:"AUX 07",role:"Backoffice",owner:"Admin",focus:"Ajuste de prioridades",status:"maintenance",power:53,load:44,note:"En revision. Puede volver como apoyo tactico."}],c={online:"Online",busy:"Busy",offline:"Offline",maintenance:"Maintenance",blocked:"Blocked"},l=["Lanzar propuesta de direccion","Alinear equipos para demo publica","Cerrar crisis operativa sin perder impulso"],u=["ADM-SUP-06 no responde al ping interno.","ADM-DES-03 arrastra bloqueo de entregables.","ADM-DEV-02 consume mas capacidad de la prevista.","ADM-OPS-04 absorbe presion de despliegue."];function p(n){return new h(n)}class h{root;selectedMachine=i[2].id;objectiveIndex=0;councilHealth=74;alignment=68;pressure=41;constructor(e){this.root=e,this.render()}render(){const e=this.getSelectedMachine();this.root.innerHTML=`
      <main class="boardroom-shell">
        <div class="sky-decor" aria-hidden="true">
          <span class="cloud cloud-left"></span>
          <span class="cloud cloud-right"></span>
          <span class="coin coin-left"></span>
          <span class="coin coin-right"></span>
          <span class="block block-left">?</span>
          <span class="block block-right">?</span>
        </div>
        <section class="boardroom-hero">
          <div class="hero-copy">
            <p class="eyebrow">World 1-1 del consejo de direccion</p>
            <h1>Boardroom 84</h1>
            <p class="hero-text">
              Una aventura de consejo con energia de cartucho: cielo azul, bloques, paneles arcade y
              maquinas reales de Admira Next convertidas en personajes del nivel.
              Tu trabajo es saltar entre crisis, desbloquear nodos y llevar la partida hasta la bandera final.
            </p>
            <div class="hero-actions">
              <button class="primary-button" data-action="cycle-objective" type="button">Cambiar nivel</button>
              <button class="secondary-button" data-action="stabilize" type="button">Coger super estrella</button>
            </div>
          </div>
          <div class="hero-hud">
            <article class="hud-card">
              <span>Mundo</span>
              <strong>02</strong>
            </article>
            <article class="hud-card">
              <span>Tiempo</span>
              <strong>01:42</strong>
            </article>
            <article class="hud-card">
              <span>Iniciativas</span>
              <strong>3 / 5</strong>
            </article>
            <article class="hud-card">
              <span>Riesgo</span>
              <strong>Medio</strong>
            </article>
          </div>
        </section>

        <section class="war-room">
          <aside class="signal-panel">
            <div class="panel-head">
              <p class="eyebrow">Eventos del nivel</p>
              <h2>Tuberias y enemigos</h2>
            </div>
            <div class="alert-stack">
              ${u.map(s=>`<article class="alert-card">${s}</article>`).join("")}
            </div>
          </aside>

          <section class="center-stage">
            <div class="videowall">
              <div class="scanlines"></div>
              <p class="eyebrow">Castillo final</p>
              <h2>${l[this.objectiveIndex]}</h2>
              <div class="metrics-grid">
                <article>
                  <span>Alineacion</span>
                  <strong>${this.alignment}%</strong>
                </article>
                <article>
                  <span>Salud</span>
                  <strong>${this.councilHealth}%</strong>
                </article>
                <article>
                  <span>Presion</span>
                  <strong>${this.pressure}%</strong>
                </article>
              </div>
            </div>

            <div class="table-zone">
              <div class="table-glow"></div>
              <div class="machine-grid">
                ${i.map(s=>this.renderMachineCard(s)).join("")}
              </div>
              <div class="table-core">
                <span class="core-title">Nivel del Consejo</span>
                <strong>ADMIRA NEXT</strong>
                <p>Puestos reales, energia de plataforma y decisiones sincronizadas.</p>
              </div>
            </div>

            <div class="status-rails">
              ${this.renderRail("Salud del consejo",this.councilHealth,"health")}
              ${this.renderRail("Alineacion",this.alignment,"alignment")}
              ${this.renderRail("Presion",this.pressure,"pressure")}
            </div>
          </section>

          <aside class="action-panel">
            <div class="panel-head">
              <p class="eyebrow">Jugador activo</p>
              <h2>${e.id}</h2>
            </div>
            <article class="focus-card status-${e.status}">
              <div class="focus-topline">
                <span>${e.role}</span>
                <strong>${c[e.status]}</strong>
              </div>
              <h3>${e.owner}</h3>
              <p>${e.focus}</p>
              <p class="focus-note">${e.note}</p>
            </article>
            <div class="action-list">
              <button class="action-button" data-action="sync" type="button">[1] Sync</button>
              <button class="action-button" data-action="unblock" type="button">[2] Unblock</button>
              <button class="action-button" data-action="reprioritize" type="button">[3] Reprio</button>
              <button class="action-button" data-action="diagnose" type="button">[4] Diagnose</button>
            </div>
            <div class="detail-grid">
              <article>
                <span>Potencia</span>
                <strong>${e.power}%</strong>
              </article>
              <article>
                <span>Carga</span>
                <strong>${e.load}%</strong>
              </article>
            </div>
          </aside>
        </section>
      </main>
    `,this.attachEvents()}renderMachineCard(e){const s=e.id===this.selectedMachine;return`
      <button class="machine-card status-${e.status} ${s?"is-selected":""}" data-machine-id="${e.id}" type="button">
        <div class="machine-screen">
          <span class="machine-status">${c[e.status]}</span>
          <strong>${e.shortName}</strong>
        </div>
        <div class="machine-copy">
          <span>${e.role}</span>
          <p>${e.focus}</p>
        </div>
      </button>
    `}renderRail(e,s,o){return`
      <article class="rail-card">
        <div class="rail-topline">
          <span>${e}</span>
          <strong>${s}%</strong>
        </div>
        <div class="rail-track ${o}">
          <div class="rail-fill" style="width: ${s}%"></div>
        </div>
      </article>
    `}attachEvents(){this.root.querySelectorAll("[data-machine-id]").forEach(e=>{e.addEventListener("click",()=>{const s=e.dataset.machineId;s&&(this.selectedMachine=s,this.render())})}),this.root.querySelectorAll("[data-action]").forEach(e=>{e.addEventListener("click",()=>{const s=e.dataset.action;s&&this.runAction(s)})})}runAction(e){if(e==="cycle-objective"){this.objectiveIndex=(this.objectiveIndex+1)%l.length,this.alignment=Math.min(94,this.alignment+4),this.pressure=Math.max(22,this.pressure-3),this.render();return}if(e==="stabilize"){this.councilHealth=Math.min(98,this.councilHealth+6),this.pressure=Math.max(18,this.pressure-5),this.render();return}const s=this.getSelectedMachine();e==="sync"?(s.status="online",s.load=Math.max(35,s.load-10),this.alignment=Math.min(99,this.alignment+8),this.councilHealth=Math.min(99,this.councilHealth+3)):e==="unblock"?(s.status="busy",s.load=Math.min(95,s.load+6),this.pressure=Math.max(14,this.pressure-8)):e==="reprioritize"?(s.focus=`Prioridad reajustada para ${s.role.toLowerCase()}`,this.alignment=Math.min(99,this.alignment+5),this.pressure=Math.min(99,this.pressure+2)):e==="diagnose"&&(s.note=`Diagnostico completo en ${s.id}. Riesgo contenido y ruta de recuperacion visible.`,this.councilHealth=Math.min(99,this.councilHealth+2)),this.render()}getSelectedMachine(){return i.find(e=>e.id===this.selectedMachine)??i[0]}}const d=document.querySelector("#app");if(!d)throw new Error("App root element was not found");p(d);
