(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(s){if(s.ep)return;s.ep=!0;const a=e(s);fetch(s.href,a)}})();const u=["###############","#.....#...#...#","#.###.#.#.#.#.#","#o#...#.#...#o#","#.#.#####.###.#","#.#... ...#...#","#.### ###.#.###","#...#.G.G.#...#","###.#.###.#.#.#","#...#...#...#.#","#.#.###.#####.#","#o#....P....#o#","###############"],p=P(u),T=24,O=280,g={up:{row:-1,col:0},down:{row:1,col:0},left:{row:0,col:-1},right:{row:0,col:1}},k={up:"down",down:"up",left:"right",right:"left"},v={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",s:"down",a:"left",d:"right"},E=[{label:"Entrar en la web",href:"https://csilvasantin.github.io/"},{label:"Abrir el diario",href:"/diario/"}],S="AdmiraNeXT v.26.05.30.r5",G="https://csilvasantin.github.io/",x=["Si la home es tu puerta, el juego es tu contraseña emocional.","El diario se gana esquivando fantasmas, no haciendo click sin mirar.","Queremos más recreativa de barrio y menos splash page sin alma."];function I(l){new q(l).mount()}class q{root;state=y();tickHandle=null;redirectHandle=null;audio=null;handleKeydown=t=>{const e=v[t.key]??v[t.key.toLowerCase()];e&&(t.preventDefault(),this.ensureAudio(),this.audio?.resume(),this.movePlayer(e))};constructor(t){this.root=t}mount(){window.addEventListener("keydown",this.handleKeydown),this.render()}ensureAudio(){this.audio||(this.audio=new M)}startLoop(){this.tickHandle===null&&(this.tickHandle=window.setInterval(()=>{this.advanceGhosts()},O))}stopLoop(){this.tickHandle!==null&&(window.clearInterval(this.tickHandle),this.tickHandle=null)}movePlayer(t){if(this.state.gameOver||this.state.unlocked)return;const e=this.tryMove(this.state.player,t);if(this.state.started=!0,this.state.playerDirection=t,this.startLoop(),this.audio?.setSirenActive(!0),!e){this.state.message="Pared. Gira y busca otra ruta.",this.audio?.playBump(),this.render();return}this.state.player=e;const i=this.state.grid[e.row][e.col];i==="."||i==="o"?(this.state.grid[e.row][e.col]=" ",this.state.pelletsLeft-=1,this.state.score+=i==="o"?250:100,this.audio?.playChomp(i==="o"),i==="o"?(this.state.frightenedTicks=T,this.state.message="Power pellet. Ahora mandas tú."):this.state.message="Bien. Sigue limpiando el laberinto."):this.state.message="No pares. Los fantasmas ya te han visto.",this.resolveCollisions(),this.state.pelletsLeft===0&&(this.state.unlocked=!0,this.state.message="Perfect run. Acceso desbloqueado. Entrando...",this.stopLoop(),this.audio?.playUnlock(),this.audio?.setSirenActive(!1),this.scheduleRedirect()),this.render()}advanceGhosts(){this.state.gameOver||this.state.unlocked||!this.state.started||(this.state.ghosts=this.state.ghosts.map(t=>this.moveGhost(t)),this.state.frightenedTicks>0&&(this.state.frightenedTicks-=1),this.resolveCollisions(),!this.state.gameOver&&!this.state.unlocked&&this.render())}moveGhost(t){const e=this.availableDirections(t),i=e.length>1?e.filter(r=>r!==k[t.direction]):e,s=i.length>0?i:e;let a=t.direction;s.length>0&&(a=this.state.frightenedTicks>0?s[Math.floor(Math.random()*s.length)]:this.pickChaseDirection(t,s));const o=this.tryMove(t,a);return o?{...t,direction:a,row:o.row,col:o.col}:{...t,direction:s[0]??t.direction}}pickChaseDirection(t,e){let i=e[0],s=Number.POSITIVE_INFINITY;return e.forEach(a=>{const o=this.tryMove(t,a);if(!o)return;const r=Math.abs(o.row-this.state.player.row)+Math.abs(o.col-this.state.player.col);r<s&&(s=r,i=a)}),i}availableDirections(t){return Object.keys(g).filter(e=>this.tryMove(t,e))}tryMove(t,e){const i=g[e],s=t.row+i.row,a=t.col+i.col,o=this.state.grid[s]?.[a];return!o||o==="#"?null:{row:s,col:a}}resolveCollisions(){const t=this.state.ghosts.findIndex(e=>e.row===this.state.player.row&&e.col===this.state.player.col);if(t!==-1){if(this.state.frightenedTicks>0){const e=this.state.ghosts[t];this.state.ghosts[t]={...e,row:e.home.row,col:e.home.col,direction:"left"},this.state.score+=400,this.state.message="Fantasma comido. Sigue presionando.",this.audio?.playGhostEaten();return}if(this.state.lives-=1,this.audio?.playDeath(),this.state.lives<=0){this.state.gameOver=!0,this.state.started=!1,this.state.message="Game over. El acceso sigue cerrado.",this.stopLoop(),this.audio?.setSirenActive(!1);return}this.state.player={...w},this.state.playerDirection="left",this.state.ghosts=L(),this.state.frightenedTicks=0,this.state.message=`Te han cazado. Quedan ${this.state.lives} vidas.`}}reset(){this.stopLoop(),this.redirectHandle!==null&&(window.clearTimeout(this.redirectHandle),this.redirectHandle=null),this.audio?.setSirenActive(!1),this.state=y(),this.render()}scheduleRedirect(){this.redirectHandle!==null&&window.clearTimeout(this.redirectHandle),this.redirectHandle=window.setTimeout(()=>{window.location.assign(G)},1800)}toggleAudio(){this.ensureAudio(),this.audio?.resume(),this.audio?.toggleMute(),this.render()}render(){const t=p-this.state.pelletsLeft,e=this.state.grid.map((o,r)=>o.map((n,c)=>{const h=["maze-cell"];n==="#"?h.push("cell-wall"):n==="."?h.push("cell-dot"):n==="o"?h.push("cell-power"):h.push("cell-empty");const f=this.state.ghosts.find(m=>m.row===r&&m.col===c),A=this.state.player.row===r&&this.state.player.col===c;let d="";return A?(d=`<span class="player-core player-${this.state.playerDirection}"></span>`,h.push("cell-player")):f?(h.push("cell-ghost-host"),d=`<span class="ghost ${this.state.frightenedTicks>0?"ghost-frightened":""}" style="--ghost-color:${f.color}"><span class="ghost-eyes"></span></span>`):n==="."?d='<span class="dot"></span>':n==="o"&&(d='<span class="power"></span>'),`<div class="${h.join(" ")}">${d}</div>`}).join("")).join(""),i=E.map(o=>`
        <a class="unlock-link ${this.state.unlocked?"is-unlocked":"is-locked"}" href="${this.state.unlocked?o.href:"#"}" ${this.state.unlocked?"":'aria-disabled="true" tabindex="-1"'}>
          ${o.label}
        </a>
      `).join(""),s=x.map(o=>`<li>${o}</li>`).join(""),a=this.audio?!this.audio.isMuted():!0;this.root.innerHTML=`
      <div class="arcade-shell">
        <div class="ambient-grid" aria-hidden="true"></div>

        <header class="masthead">
          <div>
            <p class="eyebrow">Carlos Silva . Info</p>
            <p class="version-pill">${S}</p>
            <h1>Si no sobrevives al comecocos, no entras.</h1>
            <p class="lead">
              Ahora sí: audio arcade, fantasmas, power pellets y colisión real. Gana la partida y se abre la puerta al sitio y al diario.
            </p>
          </div>

          <div class="hud-strip">
            <article><span>Puntos</span><strong>${this.state.score}</strong></article>
            <article><span>Progreso</span><strong>${t}/${p}</strong></article>
            <article><span>Vidas</span><strong>${this.state.lives}</strong></article>
            <article><span>Estado</span><strong>${this.state.unlocked?"Desbloqueado":this.state.gameOver?"Game over":"En juego"}</strong></article>
          </div>
        </header>

        <main class="game-layout">
          <section class="game-panel">
            <div class="game-topline">
              <p>Usa flechas o WASD. Activa el audio y esquiva a los fantasmas.</p>
              <div class="controls-inline">
                <button class="audio-button" type="button" id="audio-button">${a?"Audio on":"Audio off"}</button>
                <button class="reset-button" type="button" id="reset-button">Reiniciar</button>
              </div>
            </div>
            <div class="maze" role="application" aria-label="Laberinto de acceso">
              ${e}
              <div class="ghost-house" aria-hidden="true">
                <div class="ghost-house-door"></div>
              </div>
            </div>
            <p class="status-line">${this.state.message}</p>
          </section>

          <aside class="info-panel">
            <div class="info-card">
              <p class="card-label">Reglas de la casa</p>
              <ol class="rules-list">
                <li>Limpia todos los puntos del laberinto.</li>
                <li>Evita a los fantasmas o cómetelos con power pellet.</li>
                <li>Solo al completar la partida se desbloquea la salida.</li>
              </ol>
            </div>

            <div class="info-card">
              <p class="card-label">Manifiesto</p>
              <ul class="manifesto-list">${s}</ul>
            </div>

            <div class="info-card unlock-card ${this.state.unlocked?"ready":""}">
              <p class="card-label">Puerta de salida</p>
              <div class="unlock-links">${i}</div>
            </div>
          </aside>
        </main>
      </div>
    `,this.root.querySelector("#reset-button")?.addEventListener("click",()=>this.reset(),{once:!0}),this.root.querySelector("#audio-button")?.addEventListener("click",()=>this.toggleAudio(),{once:!0})}}const w=$("P");function y(){return{grid:u.map(t=>t.split("").map(e=>e==="#"||e==="."||e==="o"?e:" ")),player:{...w},playerDirection:"left",ghosts:L(),pelletsLeft:p,score:0,lives:3,unlocked:!1,frightenedTicks:0,started:!1,gameOver:!1,message:"Empieza la partida. Si quieres entrar, gánatelo."}}function L(){const l=C("G"),t=["#ff4f6d","#63e1ff"];return l.map((e,i)=>({id:`ghost-${i}`,row:e.row,col:e.col,home:e,color:t[i%t.length],direction:i%2===0?"left":"right"}))}function $(l){for(let t=0;t<u.length;t+=1){const e=u[t].indexOf(l);if(e>=0)return{row:t,col:e}}throw new Error(`Marker ${l} not found in maze`)}function C(l){const t=[];return u.forEach((e,i)=>{e.split("").forEach((s,a)=>{s===l&&t.push({row:i,col:a})})}),t}function P(l){return l.reduce((t,e)=>t+Array.from(e).filter(i=>i==="."||i==="o").length,0)}class M{ctx=null;master=null;sirenOsc=null;sirenGain=null;sirenLfo=null;sirenLfoGain=null;muted=!1;async resume(){this.ensureContext(),this.ctx&&this.ctx.state!=="running"&&await this.ctx.resume()}toggleMute(){this.muted=!this.muted,this.master&&(this.master.gain.value=this.muted?0:.18)}isMuted(){return this.muted}setSirenActive(t){this.ensureContext(),!(!this.ctx||!this.master)&&(t&&!this.sirenOsc&&(this.sirenGain=this.ctx.createGain(),this.sirenGain.gain.value=.015,this.sirenGain.connect(this.master),this.sirenOsc=this.ctx.createOscillator(),this.sirenOsc.type="square",this.sirenOsc.frequency.value=190,this.sirenOsc.connect(this.sirenGain),this.sirenLfo=this.ctx.createOscillator(),this.sirenLfo.type="triangle",this.sirenLfo.frequency.value=1.6,this.sirenLfoGain=this.ctx.createGain(),this.sirenLfoGain.gain.value=26,this.sirenLfo.connect(this.sirenLfoGain),this.sirenLfoGain.connect(this.sirenOsc.frequency),this.sirenOsc.start(),this.sirenLfo.start()),!t&&this.sirenOsc&&this.sirenLfo&&(this.sirenOsc.stop(),this.sirenLfo.stop(),this.sirenOsc.disconnect(),this.sirenLfo.disconnect(),this.sirenGain?.disconnect(),this.sirenLfoGain?.disconnect(),this.sirenOsc=null,this.sirenLfo=null,this.sirenGain=null,this.sirenLfoGain=null))}playChomp(t){const e=t?[420,250]:[320,220];this.playSequence(e,.05,"square",.06)}playBump(){this.playSequence([120],.04,"sawtooth",.04)}playDeath(){this.playSlide(420,110,.45,"sawtooth",.08)}playGhostEaten(){this.playSequence([520,680,860],.06,"triangle",.06)}playUnlock(){this.playSequence([330,495,660,880],.09,"square",.08)}ensureContext(){if(this.ctx)return;const t=window.AudioContext||window.webkitAudioContext;t&&(this.ctx=new t,this.master=this.ctx.createGain(),this.master.gain.value=this.muted?0:.18,this.master.connect(this.ctx.destination))}playSequence(t,e,i,s){if(this.ensureContext(),!this.ctx||!this.master)return;const a=this.ctx.currentTime;t.forEach((o,r)=>{const n=this.ctx.createOscillator(),c=this.ctx.createGain();n.type=i,n.frequency.value=o,c.gain.setValueAtTime(s,a+r*e),c.gain.exponentialRampToValueAtTime(1e-4,a+r*e+e),n.connect(c),c.connect(this.master),n.start(a+r*e),n.stop(a+r*e+e)})}playSlide(t,e,i,s,a){if(this.ensureContext(),!this.ctx||!this.master)return;const o=this.ctx.createOscillator(),r=this.ctx.createGain(),n=this.ctx.currentTime;o.type=s,o.frequency.setValueAtTime(t,n),o.frequency.exponentialRampToValueAtTime(e,n+i),r.gain.setValueAtTime(a,n),r.gain.exponentialRampToValueAtTime(1e-4,n+i),o.connect(r),r.connect(this.master),o.start(n),o.stop(n+i)}}const b=document.querySelector("#app");if(!b)throw new Error("App root element was not found");I(b);
