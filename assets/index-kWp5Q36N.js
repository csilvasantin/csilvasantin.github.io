(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function a(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function o(t){if(t.ep)return;t.ep=!0;const e=a(t);fetch(t.href,e)}})();const f=["###############","#.....#...#...#","#.###.#.#.#.#.#","#o#...#.#...#o#","#.#.#####.###.#","#.#... ...#...#","#.### ###.#.###","#...#.....#...#","###.#.###.#.#.#","#...#...#...#.#","#.#.###.#####.#","#o#.....P.....#","###############"],y={up:{row:-1,col:0},down:{row:1,col:0},left:{row:0,col:-1},right:{row:0,col:1}},b=[{label:"Entrar en la web",href:"https://csilvasantin.github.io/"},{label:"Abrir el diario",href:"/diario/"}],v=["La web no se visita: se conquista.","El diario es el premio, no el menú.","La identidad entra jugando, no rellenando formularios."],u={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",s:"down",a:"left",d:"right"};function L(i){new E(i).mount()}class E{root;state=p();handleKeydown=s=>{const a=u[s.key]??u[s.key.toLowerCase()];a&&(s.preventDefault(),this.move(a))};constructor(s){this.root=s}mount(){window.addEventListener("keydown",this.handleKeydown),this.render()}move(s){const a=y[s],o=this.state.playerRow+a.row,t=this.state.playerCol+a.col,e=this.state.grid[o]?.[t];if(!e||e==="#"){this.state.message="Ese camino está cerrado. Busca otro hueco.",this.render();return}this.state.started=!0,this.state.playerRow=o,this.state.playerCol=t,e==="."||e==="o"?(this.state.grid[o][t]=" ",this.state.pelletsLeft-=1,this.state.score+=e==="o"?250:100,this.state.message=e==="o"?"Power-up emocional: la puerta se siente más cerca.":"Bien. Sigue limpiando el laberinto."):this.state.message="Sigue. El acceso está al final del recorrido.",this.state.pelletsLeft===0&&(this.state.unlocked=!0,this.state.message="Acceso desbloqueado. Ya puedes entrar."),this.render()}reset(){this.state=p(),this.render()}render(){const s=c-this.state.pelletsLeft,a=this.state.grid.map((r,m)=>r.map((n,g)=>{const d=m===this.state.playerRow&&g===this.state.playerCol,l=["maze-cell"];n==="#"&&l.push("cell-wall"),n==="."&&l.push("cell-dot"),n==="o"&&l.push("cell-power"),n===" "&&l.push("cell-empty"),d&&l.push("cell-player");const w=d?'<span class="player-core"></span>':n==="."?'<span class="dot"></span>':n==="o"?'<span class="power"></span>':"";return`<div class="${l.join(" ")}">${w}</div>`}).join("")).join(""),o=b.map(r=>`
        <a class="unlock-link ${this.state.unlocked?"is-unlocked":"is-locked"}" href="${this.state.unlocked?r.href:"#"}" ${this.state.unlocked?"":'aria-disabled="true" tabindex="-1"'}>
          ${r.label}
        </a>
      `).join(""),t=v.map(r=>`<li>${r}</li>`).join("");this.root.innerHTML=`
      <div class="arcade-shell">
        <div class="ambient-grid" aria-hidden="true"></div>

        <header class="masthead">
          <div>
            <p class="eyebrow">Carlos Silva . Info</p>
            <h1>Si no te acabas el comecocos, no entras.</h1>
            <p class="lead">
              La landing no pide permiso: te pone a jugar. Termina el laberinto y se abre el acceso al universo, la web y el diario.
            </p>
          </div>

          <div class="hud-strip">
            <article>
              <span>Puntos</span>
              <strong>${this.state.score}</strong>
            </article>
            <article>
              <span>Progreso</span>
              <strong>${s}/${c}</strong>
            </article>
            <article>
              <span>Estado</span>
              <strong>${this.state.unlocked?"Desbloqueado":"Bloqueado"}</strong>
            </article>
          </div>
        </header>

        <main class="game-layout">
          <section class="game-panel">
            <div class="game-topline">
              <p>Usa flechas o WASD</p>
              <button class="reset-button" type="button" id="reset-button">Reiniciar partida</button>
            </div>
            <div class="maze" role="application" aria-label="Laberinto de acceso">
              ${a}
            </div>
            <p class="status-line">${this.state.message}</p>
          </section>

          <aside class="info-panel">
            <div class="info-card">
              <p class="card-label">Reglas de la casa</p>
              <ol class="rules-list">
                <li>Recoge todos los puntos del laberinto.</li>
                <li>Los círculos grandes dan más puntuación y ritmo.</li>
                <li>Cuando limpias todo, se abre el acceso real.</li>
              </ol>
            </div>

            <div class="info-card">
              <p class="card-label">Manifiesto</p>
              <ul class="manifesto-list">
                ${t}
              </ul>
            </div>

            <div class="info-card unlock-card ${this.state.unlocked?"ready":""}">
              <p class="card-label">Puerta de salida</p>
              <div class="unlock-links">
                ${o}
              </div>
            </div>
          </aside>
        </main>
      </div>
    `,this.root.querySelector("#reset-button")?.addEventListener("click",()=>this.reset(),{once:!0})}}const c=A(f);function p(){let i=0,s=0;return{grid:f.map((o,t)=>o.split("").map((e,r)=>e==="P"?(i=t,s=r," "):e==="#"?"#":e==="."?".":e==="o"?"o":" ")),playerRow:i,playerCol:s,pelletsLeft:c,score:0,started:!1,unlocked:!1,message:"Empieza. El diario se abre solo para quien complete el recorrido."}}function A(i){return i.reduce((s,a)=>s+Array.from(a).filter(o=>o==="."||o==="o").length,0)}const h=document.querySelector("#app");if(!h)throw new Error("App root element was not found");L(h);
