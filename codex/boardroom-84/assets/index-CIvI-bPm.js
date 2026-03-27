(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))t(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function s(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function t(i){if(i.ep)return;i.ep=!0;const a=s(i);fetch(i.href,a)}})();const p=[{id:"ADM-DIR-01",shortName:"DIR 01",role:"Direccion",owner:"Consejo",focus:"Cerrar propuesta Q2",status:"online",power:92,load:48,note:"Mantiene la estabilidad general del consejo."},{id:"ADM-DEV-02",shortName:"DEV 02",role:"Desarrollo",owner:"Producto",focus:"Integracion de agentes",status:"busy",power:81,load:88,note:"Produce mucho, pero absorbe capacidad del resto."},{id:"ADM-DES-03",shortName:"DES 03",role:"Diseno",owner:"Marca",focus:"Sistema visual Boardroom",status:"blocked",power:67,load:74,note:"Necesita desbloqueo para liberar entregables."},{id:"ADM-OPS-04",shortName:"OPS 04",role:"Operaciones",owner:"Infra",focus:"Sostener despliegue",status:"busy",power:79,load:83,note:"Controla el impacto de incidentes en cadena."},{id:"ADM-IA-05",shortName:"IA 05",role:"Automatizacion",owner:"IA Lab",focus:"Rutinas de sync",status:"online",power:95,load:56,note:"Genera combos cuando se coordina con DEV y OPS."},{id:"ADM-SUP-06",shortName:"SUP 06",role:"Soporte",owner:"Ayuda interna",focus:"Recuperar nodos",status:"offline",power:24,load:96,note:"Nodo caido. La recuperacion del consejo es mas lenta."},{id:"ADM-AUX-07",shortName:"AUX 07",role:"Backoffice",owner:"Admin",focus:"Ajuste de prioridades",status:"maintenance",power:53,load:44,note:"En revision. Puede volver como apoyo tactico."}],d={online:"Online",busy:"Busy",offline:"Offline",maintenance:"Maintenance",blocked:"Blocked"},o=["Lanzar propuesta de direccion","Alinear equipos para demo publica","Cerrar crisis operativa sin perder impulso","Abrir castillo de automatizacion"],u=["Ruta critica del consejo","Demo publica y alineacion visual","Recuperacion de nodos en riesgo","Bandera final con todos online"],g=["1","2","3","4"],f=5,n=95,r=5,h=["online","busy","blocked","maintenance","offline"];function v(l){return new b(l)}class b{root;machines=structuredClone(p);alerts=[{text:"ADM-SUP-06 no responde al ping interno.",tone:"warn"},{text:"ADM-DES-03 arrastra bloqueo de entregables.",tone:"warn"},{text:"Pulsa 1-4 para jugar desde teclado.",tone:"info"}];selectedIndex=2;objectiveIndex=0;world=1;lives=3;score=0;coins=0;councilHealth=74;alignment=68;pressure=41;progress=0;timeLeft=n;gameOver=!1;tickHandle=null;handleKeydown=e=>{if(e.repeat)return;if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a"){this.shiftSelection(-1);return}if(e.key==="ArrowRight"||e.key.toLowerCase()==="d"){this.shiftSelection(1);return}if(e.key.toLowerCase()==="r"){this.restartGame();return}const s=g.indexOf(e.key);s>=0&&this.runAction(["sync","unblock","reprioritize","diagnose"][s])};constructor(e){this.root=e,window.addEventListener("keydown",this.handleKeydown),this.tickHandle=window.setInterval(()=>this.tick(),950),this.render()}restartGame(){this.machines.splice(0,this.machines.length,...structuredClone(p)),this.alerts.splice(0,this.alerts.length,{text:"Nueva partida. El consejo vuelve al mundo 1-1.",tone:"info"}),this.selectedIndex=2,this.objectiveIndex=0,this.world=1,this.lives=3,this.score=0,this.coins=0,this.councilHealth=74,this.alignment=68,this.pressure=41,this.progress=0,this.timeLeft=n,this.gameOver=!1,this.render()}tick(){this.gameOver||(this.timeLeft=Math.max(0,this.timeLeft-1),this.randomIncident(),this.applyAmbientDrift(),this.timeLeft===0&&this.loseLife("Se agoto el tiempo del nivel."),(this.councilHealth<=0||this.pressure>=100)&&this.loseLife("El consejo se ha roto por exceso de presion."),this.progress>=r&&this.advanceWorld(),this.render())}randomIncident(){const e=this.machines[Math.floor(Math.random()*this.machines.length)],s=Math.random();s<.26?(e.status=this.nextWorseStatus(e.status),e.load=Math.min(99,e.load+8),e.power=Math.max(18,e.power-5),e.note=`Incidente activo en ${e.id}.`,this.pressure=Math.min(100,this.pressure+6),this.councilHealth=Math.max(0,this.councilHealth-4),this.pushAlert(`${e.id} empeora a ${d[e.status]}.`,"warn")):s<.42&&e.status!=="offline"&&(e.load=Math.min(99,e.load+4),this.pressure=Math.min(100,this.pressure+3),this.pushAlert(`${e.id} gana carga y pide atencion.`,"info"))}applyAmbientDrift(){const e=this.machines.filter(t=>t.status==="online").length,s=this.machines.filter(t=>t.status==="offline"||t.status==="blocked").length;this.alignment=this.clamp(this.alignment+(e>=3?1:-2),0,100),this.councilHealth=this.clamp(this.councilHealth-s,0,100),this.pressure=this.clamp(this.pressure+Math.max(0,s-1),0,100)}advanceWorld(){this.world+=1,this.objectiveIndex=(this.objectiveIndex+1)%o.length,this.progress=0,this.timeLeft=n,this.coins+=5,this.score+=1200,this.councilHealth=this.clamp(this.councilHealth+16,0,100),this.alignment=this.clamp(this.alignment+12,0,100),this.pressure=this.clamp(this.pressure-18,0,100),this.pushAlert(`Bandera alcanzada. Entras en World ${this.world}.`,"good"),this.machines.forEach((e,s)=>{s%2===0&&e.status!=="offline"&&(e.status="online"),e.load=this.clamp(e.load-12,18,98),e.power=this.clamp(e.power+6,20,99),e.focus=u[this.objectiveIndex]})}loseLife(e){if(this.lives=Math.max(0,this.lives-1),this.pushAlert(e,"warn"),this.lives===0){this.gameOver=!0;return}this.timeLeft=Math.max(50,n-this.world*4),this.councilHealth=Math.max(42,this.councilHealth+14),this.pressure=Math.max(26,this.pressure-10),this.alignment=Math.max(35,this.alignment-4),this.machines.forEach(s=>{s.status==="offline"&&(s.status="maintenance"),s.load=this.clamp(s.load-8,18,96),s.note="Respawn del nivel aplicado."})}nextWorseStatus(e){return h[Math.min(h.indexOf(e)+1,h.length-1)]}pushAlert(e,s){this.alerts.unshift({text:e,tone:s}),this.alerts.splice(f)}shiftSelection(e){const s=this.machines.length;this.selectedIndex=(this.selectedIndex+e+s)%s,this.render()}render(){const e=this.getSelectedMachine(),s=this.pressure>74?"Boss":this.pressure>48?"Medio":"Bajo";this.root.innerHTML=`
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
            <p class="eyebrow">World ${this.world}-${this.objectiveIndex+1} del consejo de direccion</p>
            <h1>Boardroom 84</h1>
            <p class="hero-text">
              Ya no es solo maqueta: el nivel se rompe solo, el reloj corre y cada accion cuenta.
              Muevete con <strong>A/D</strong> o flechas, juega con <strong>1-4</strong> y pulsa <strong>R</strong> para reiniciar.
            </p>
            <div class="hero-actions">
              <button class="primary-button" data-action="cycle-objective" type="button">Cambiar nivel</button>
              <button class="secondary-button" data-action="stabilize" type="button">Coger super estrella</button>
            </div>
          </div>
          <div class="hero-hud">
            <article class="hud-card">
              <span>Mundo</span>
              <strong>${this.world}</strong>
            </article>
            <article class="hud-card">
              <span>Tiempo</span>
              <strong>${this.formatTime(this.timeLeft)}</strong>
            </article>
            <article class="hud-card">
              <span>Score</span>
              <strong>${this.score}</strong>
            </article>
            <article class="hud-card">
              <span>Monedas</span>
              <strong>${this.coins}</strong>
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
              ${this.alerts.map(t=>`<article class="alert-card tone-${t.tone}">${t.text}</article>`).join("")}
            </div>
          </aside>

          <section class="center-stage">
            <div class="videowall">
              <div class="scanlines"></div>
              <p class="eyebrow">Castillo final</p>
              <h2>${o[this.objectiveIndex]}</h2>
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
                  <span>Riesgo</span>
                  <strong>${s}</strong>
                </article>
              </div>
              <div class="goal-strip">
                <span>Bandera del nivel</span>
                <strong>${this.progress} / ${r}</strong>
              </div>
            </div>

            <div class="table-zone">
              <div class="table-glow"></div>
              <div class="machine-grid">
                ${this.machines.map((t,i)=>this.renderMachineCard(t,i)).join("")}
              </div>
              <div class="table-core">
                <span class="core-title">Nivel del Consejo</span>
                <strong>ADMIRA NEXT</strong>
                <p>Puestos reales, energia de plataforma y decisiones sincronizadas.</p>
                <div class="life-strip">${Array.from({length:3},(t,i)=>`<span class="life ${i<this.lives?"is-on":""}"></span>`).join("")}</div>
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
                <strong>${d[e.status]}</strong>
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
            <div class="control-card">
              <span>Controles</span>
              <p>Izq/Der mueve, 1-4 actua, R reinicia. Sobrevive, sube score y lleva la bandera a 5/5.</p>
            </div>
          </aside>
        </section>

        ${this.gameOver?`
          <section class="game-overlay">
            <div class="overlay-card">
              <p class="eyebrow">Game Over</p>
              <h2>El consejo se quedo sin vidas</h2>
              <p>Has llegado al mundo ${this.world} con ${this.score} puntos y ${this.coins} monedas. Pulsa <strong>R</strong> para volver a empezar.</p>
            </div>
          </section>
        `:""}
      </main>
    `,this.attachEvents()}renderMachineCard(e,s){const t=s===this.selectedIndex;return`
      <button class="machine-card status-${e.status} ${t?"is-selected":""}" data-machine-index="${s}" type="button">
        <div class="machine-screen">
          <span class="machine-status">${d[e.status]}</span>
          <strong>${e.shortName}</strong>
        </div>
        <div class="machine-copy">
          <span>${e.role}</span>
          <p>${e.focus}</p>
        </div>
      </button>
    `}renderRail(e,s,t){return`
      <article class="rail-card">
        <div class="rail-topline">
          <span>${e}</span>
          <strong>${s}%</strong>
        </div>
        <div class="rail-track ${t}">
          <div class="rail-fill" style="width: ${s}%"></div>
        </div>
      </article>
    `}attachEvents(){this.root.querySelectorAll("[data-machine-index]").forEach(e=>{e.addEventListener("click",()=>{const s=Number(e.dataset.machineIndex);Number.isNaN(s)||(this.selectedIndex=s,this.render())})}),this.root.querySelectorAll("[data-action]").forEach(e=>{e.addEventListener("click",()=>{const s=e.dataset.action;s&&this.runAction(s)})})}runAction(e){if(this.gameOver)return;if(e==="cycle-objective"){this.objectiveIndex=(this.objectiveIndex+1)%o.length,this.progress=Math.max(0,this.progress-1),this.alignment=this.clamp(this.alignment+3,0,100),this.pushAlert(`Nuevo subnivel: ${o[this.objectiveIndex]}.`,"info"),this.render();return}if(e==="stabilize"){this.councilHealth=this.clamp(this.councilHealth+10,0,100),this.pressure=this.clamp(this.pressure-12,0,100),this.score+=150,this.coins+=1,this.pushAlert("Super estrella activa. El consejo respira.","good"),this.render();return}const s=this.getSelectedMachine();e==="sync"?(s.status="online",s.load=this.clamp(s.load-18,12,99),s.power=this.clamp(s.power+6,20,99),s.note=`${s.id} entra en combo de sincronizacion.`,this.alignment=this.clamp(this.alignment+8,0,100),this.councilHealth=this.clamp(this.councilHealth+4,0,100),this.progress=Math.min(r,this.progress+1),this.score+=220,this.coins+=1,this.pushAlert(`${s.id} sincronizado. +1 a la bandera.`,"good")):e==="unblock"?(s.status="busy",s.load=this.clamp(s.load-10,12,99),s.power=this.clamp(s.power+4,20,99),s.note=`${s.id} sale del atasco y vuelve a correr.`,this.pressure=this.clamp(this.pressure-10,0,100),this.progress=Math.min(r,this.progress+1),this.score+=180,this.pushAlert(`${s.id} desbloqueado. El nivel avanza.`,"good")):e==="reprioritize"?(s.focus=`Prioridad arcade: ${u[this.objectiveIndex]}`,s.load=this.clamp(s.load-6,12,99),this.alignment=this.clamp(this.alignment+5,0,100),this.pressure=this.clamp(this.pressure+2,0,100),this.score+=120,this.pushAlert(`${s.id} cambia de carril y reprioriza.`,"info")):e==="diagnose"&&(s.note=`Diagnostico limpio en ${s.id}. Ruta de recuperacion visible.`,s.power=this.clamp(s.power+8,20,99),this.councilHealth=this.clamp(this.councilHealth+3,0,100),this.score+=90,this.pushAlert(`Diagnostico completado para ${s.id}.`,"info")),this.render()}getSelectedMachine(){return this.machines[this.selectedIndex]??this.machines[0]}formatTime(e){const s=Math.floor(e/60),t=e%60;return`${s.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`}clamp(e,s,t){return Math.min(t,Math.max(s,e))}}const m=document.querySelector("#app");if(!m)throw new Error("App root element was not found");v(m);
