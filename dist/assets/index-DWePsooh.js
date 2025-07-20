(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))l(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const u of n.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&l(u)}).observe(document,{childList:!0,subtree:!0});function d(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function l(t){if(t.ep)return;t.ep=!0;const n=d(t);fetch(t.href,n)}})();let m=[],y=!1,i=null,r=null;const O=e=>e===1?"🏆":e===2?"🥈":e===3?"🥉":e,T={leaderboard:"Shows the current team rankings.",doNotOpen:"This is a secret page. Don't scan!"};function C(){return`<button class="burger" id="burger-btn" aria-label="Open menu">
    <span></span><span></span><span></span>
  </button>`}function S(e){return`
    <nav class="sidebar" id="sidebar">
      <a href="#leaderboard" class="sidebar-link${e==="leaderboard"?" active":""}">Leaderboard</a>
      <a href="#do-not-open" class="sidebar-link${e==="do-not-open"?" active":""}">DO NOT OPEN</a>
    </nav>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
  `}function N(){return'<div class="help-icon" id="help-icon" title="Help">?</div><div class="help-tooltip" id="help-tooltip"></div>'}function B(){return m.length?`
    <h1>mPower Leaderboard</h1>
    <table class="leaderboard">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Team</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        ${m.map((e,o)=>`
          <tr class="rank-${o+1}">
            <td>${O(o+1)}</td>
            <td class="team-cell">
              <img src="/${e.logo}" alt="${e.name} logo" class="team-logo" />
              <span class="team-name">${e.name}</span>
            </td>
            <td class="score">
              <div class="score-stack">
                <div class="score-value">${e.score}</div>
                <div class="score-controls-separator"></div>
                <div class="score-controls-advanced" data-team="${e.name}">
                  <button class="score-btn-adv subtract" data-delta="-500">-500</button>
                  <button class="score-btn-adv subtract" data-delta="-100">-100</button>
                  <button class="score-btn-adv custom" data-team="${e.name}">#</button>
                  <button class="score-btn-adv add" data-delta="100">+100</button>
                  <button class="score-btn-adv add" data-delta="500">+500</button>
                </div>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    <div id="custom-score-modal" class="custom-score-modal" style="display:none;">
      <div class="custom-score-modal-content">
        <h3>Custom Score</h3>
        <input type="number" id="custom-score-input" placeholder="Enter number" />
        <div class="custom-score-modal-actions">
          <button id="custom-score-add" class="custom-score-add">Add</button>
          <button id="custom-score-deduct" class="custom-score-deduct">Deduct</button>
          <button id="custom-score-cancel" class="custom-score-cancel">Cancel</button>
        </div>
      </div>
    </div>
  `:'<div class="loading">Loading leaderboard...</div>'}function A(){return`
    <h1>DO NOT SCAN</h1>
    <img src="/QR_CODE.png" alt="Secret QR Code" style="max-width: 100%; border-radius: 12px; margin-top: 1.5rem; box-shadow: 0 2px 12px #0002;" />
  `}function R(){const e=document.getElementById("app");!e||window.location.hash==="#do-not-open"||(r&&(r.remove(),r=null),e.addEventListener("touchstart",o=>{window.scrollY===0?i=o.touches[0].clientY:i=null},{passive:!0}),e.addEventListener("touchmove",o=>{i!==null&&o.touches[0].clientY-i>60&&!y&&($(),i=null)},{passive:!0}),e.addEventListener("touchend",()=>{i=null}))}function $(){y=!0,P(),p().finally(()=>{y=!1,x()})}function P(){r||(r=document.createElement("div"),r.className="pull-refresh-indicator",r.textContent="Refreshing...",document.body.prepend(r))}function x(){r&&(r.remove(),r=null)}function g(e){document.body.innerHTML="";const o=document.createElement("div");o.innerHTML=C(),document.body.appendChild(o.firstElementChild);const d=document.createElement("div");d.innerHTML=S(e),document.body.appendChild(d.firstElementChild),document.body.appendChild(d.lastElementChild);const l=document.createElement("div");if(l.id="app",e==="do-not-open"&&l.classList.add("do-not-open-page"),l.innerHTML=(e==="leaderboard"?B():A())+N(),document.body.appendChild(l),e==="leaderboard"&&R(),e==="leaderboard"){document.querySelectorAll(".score-btn-adv").forEach(a=>{a.addEventListener("click",async s=>{const h=a.closest(".score-controls-advanced").getAttribute("data-team");if(a.classList.contains("custom")){const f=document.getElementById("custom-score-modal");f.style.display="flex",f.setAttribute("data-team",h),document.getElementById("custom-score-input").value="";return}const I=parseInt(a.getAttribute("data-delta"),10);a.disabled=!0;try{await fetch("http://localhost:3001/api/teams/update-score",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:h,delta:I})}),await p()}catch{alert("Failed to update score.")}finally{a.disabled=!1}})});const c=document.getElementById("custom-score-modal");document.getElementById("custom-score-cancel").onclick=()=>{c.style.display="none"},document.getElementById("custom-score-add").onclick=async()=>{const a=c.getAttribute("data-team"),s=parseInt(document.getElementById("custom-score-input").value,10);if(!s||s<=0)return alert("Enter a positive number");try{await fetch("http://localhost:3001/api/teams/update-score",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:a,delta:s})}),c.style.display="none",await p()}catch{alert("Failed to update score.")}},document.getElementById("custom-score-deduct").onclick=async()=>{const a=c.getAttribute("data-team"),s=parseInt(document.getElementById("custom-score-input").value,10);if(!s||s<=0)return alert("Enter a positive number");try{await fetch("http://localhost:3001/api/teams/update-score",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:a,delta:-s})}),c.style.display="none",await p()}catch{alert("Failed to update score.")}}}const t=document.getElementById("sidebar"),n=document.getElementById("sidebar-overlay"),u=document.getElementById("burger-btn");function w(){t.classList.add("open"),n.classList.add("open")}function v(){t.classList.remove("open"),n.classList.remove("open")}u.onclick=w,n.onclick=v,t.querySelectorAll(".sidebar-link").forEach(c=>{c.onclick=a=>{a.preventDefault();const s=c.getAttribute("href");v(),setTimeout(()=>{s==="#leaderboard"?window.location.hash="#leaderboard":s==="#do-not-open"&&(window.location.hash="#do-not-open")},200)}});const L=document.getElementById("help-icon"),b=document.getElementById("help-tooltip");L.onclick=()=>{b.textContent=T[e==="leaderboard"?"leaderboard":"doNotOpen"],b.classList.add("show"),setTimeout(()=>{b.classList.remove("show")},2500)}}function E(){const e=window.location.hash.replace("#","");g(e==="do-not-open"?"do-not-open":"leaderboard")}async function p(){try{const e=await fetch("http://localhost:3001/api/teams");if(!e.ok)throw new Error("Failed to fetch teams");m=await e.json(),m.sort((o,d)=>d.score-o.score),E()}catch(e){m=[],document.body.innerHTML='<div class="error">Failed to load leaderboard. Please try again later.</div>',console.error(e)}}window.addEventListener("hashchange",E);p();
