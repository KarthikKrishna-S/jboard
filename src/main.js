import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

let teams = [];
let isRefreshing = false;
let startY = null;
let pullRefreshElem = null;

const rankSymbol = (rank) => {
  if (rank === 1) return '🏆';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return rank;
};

const helpTexts = {
  leaderboard: 'Shows the current team rankings.',
  doNotOpen: 'This is a secret page. Don\'t scan!'
};

function renderBurger() {
  return `<button class="cross-btn" id="burger-btn" aria-label="Open menu">
    <span class="cross-icon"></span>
  </button>`;
}

function renderSidebar(activePage) {
  return `
    <nav class="sidebar" id="sidebar">
      <a href="#leaderboard" class="sidebar-link${activePage === 'leaderboard' ? ' active' : ''}">Leaderboard</a>
      <a href="#do-not-open" class="sidebar-link${activePage === 'do-not-open' ? ' active' : ''}">DO NOT OPEN</a>
    </nav>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
  `;
}

function renderHelpIcon() {
  return `<div class="help-icon" id="help-icon" title="Help">?</div><div class="help-tooltip" id="help-tooltip"></div>`;
}

function renderLeaderboard() {
  if (!teams.length) {
    return `<div class="loading">Loading leaderboard...</div>`;
  }
  return `
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
        ${teams.map((team, i) => `
          <tr class="rank-${i+1}">
            <td>${rankSymbol(i+1)}</td>
            <td class="team-cell">
              <img src="/${team.logo}" alt="${team.name} logo" class="team-logo" />
              <span class="team-name">${team.name}</span>
            </td>
            <td class="score">
              <div class="score-stack">
                <div class="score-value">${team.score}</div>
                <div class="score-controls-separator"></div>
                <div class="score-controls-advanced" data-team="${team.name}">
                  <button class="score-btn-adv subtract" data-delta="-500">-500</button>
                  <button class="score-btn-adv subtract" data-delta="-100">-100</button>
                  <button class="score-btn-adv custom" data-team="${team.name}">#</button>
                  <button class="score-btn-adv add" data-delta="100">+100</button>
                  <button class="score-btn-adv add" data-delta="500">+500</button>
                </div>
              </div>
            </td>
          </tr>
        `).join('')}
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
  `;
}

function renderDoNotOpen() {
  return `
    <h1>DO NOT SCAN</h1>
    <img src="/QR_CODE.png" alt="Secret QR Code" style="max-width: 100%; border-radius: 12px; margin-top: 1.5rem; box-shadow: 0 2px 12px #0002;" />
  `;
}

function setupPullToRefresh() {
  const app = document.getElementById('app');
  if (!app || window.location.hash === '#do-not-open') return;

  // Remove previous indicator if any
  if (pullRefreshElem) {
    pullRefreshElem.remove();
    pullRefreshElem = null;
  }

  // Touch events for pull-to-refresh
  app.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
    } else {
      startY = null;
    }
  }, { passive: true });

  app.addEventListener('touchmove', (e) => {
    if (startY !== null) {
      const currentY = e.touches[0].clientY;
      if (currentY - startY > 60 && !isRefreshing) {
        triggerRefresh();
        startY = null;
      }
    }
  }, { passive: true });

  app.addEventListener('touchend', () => {
    startY = null;
  });
}

function triggerRefresh() {
  isRefreshing = true;
  showRefreshIndicator();
  fetchTeamsAndRender().finally(() => {
    isRefreshing = false;
    hideRefreshIndicator();
  });
}

function showRefreshIndicator() {
  if (!pullRefreshElem) {
    pullRefreshElem = document.createElement('div');
    pullRefreshElem.className = 'pull-refresh-indicator';
    pullRefreshElem.textContent = 'Refreshing...';
    document.body.prepend(pullRefreshElem);
  }
}

function hideRefreshIndicator() {
  if (pullRefreshElem) {
    pullRefreshElem.remove();
    pullRefreshElem = null;
  }
}

function render(page) {
  document.body.innerHTML = '';
  // Burger button
  const burger = document.createElement('div');
  burger.innerHTML = renderBurger();
  document.body.appendChild(burger.firstElementChild);

  // Sidebar (hidden by default)
  const sidebarWrap = document.createElement('div');
  sidebarWrap.innerHTML = renderSidebar(page);
  document.body.appendChild(sidebarWrap.firstElementChild);
  document.body.appendChild(sidebarWrap.lastElementChild);

  // Main content
  const app = document.createElement('div');
  app.id = 'app';
  if (page === 'do-not-open') app.classList.add('do-not-open-page');
  app.innerHTML =
    (page === 'leaderboard' ? renderLeaderboard() : renderDoNotOpen()) +
    renderHelpIcon();
  document.body.appendChild(app);

  // Setup pull-to-refresh only for leaderboard
  if (page === 'leaderboard') {
    setupPullToRefresh();
  }

  // After rendering leaderboard, add event listeners for advanced score buttons
  if (page === 'leaderboard') {
    document.querySelectorAll('.score-btn-adv').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const teamName = btn.closest('.score-controls-advanced').getAttribute('data-team');
        if (btn.classList.contains('custom')) {
          // Open modal
          const modal = document.getElementById('custom-score-modal');
          modal.style.display = 'flex';
          modal.setAttribute('data-team', teamName);
          document.getElementById('custom-score-input').value = '';
          return;
        }
        const delta = parseInt(btn.getAttribute('data-delta'), 10);
        btn.disabled = true;
        try {
          const resp = await fetch('https://mpower-leaderboard.onrender.com/api/teams/update-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: teamName, delta })
          });
          const data = await resp.json();
          console.log('Update response:', data);
          await fetchTeamsAndRender();
        } catch (err) {
          alert('Failed to update score.');
        } finally {
          btn.disabled = false;
        }
      });
    });
    // Modal logic
    const modal = document.getElementById('custom-score-modal');
    document.getElementById('custom-score-cancel').onclick = () => {
      modal.style.display = 'none';
    };
    document.getElementById('custom-score-add').onclick = async () => {
      const teamName = modal.getAttribute('data-team');
      const value = parseInt(document.getElementById('custom-score-input').value, 10);
      if (!value || value <= 0) return alert('Enter a positive number');
      try {
        await fetch('https://mpower-leaderboard.onrender.com/api/teams/update-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: teamName, delta: value })
        });
        modal.style.display = 'none';
        await fetchTeamsAndRender();
      } catch (err) {
        alert('Failed to update score.');
      }
    };
    document.getElementById('custom-score-deduct').onclick = async () => {
      const teamName = modal.getAttribute('data-team');
      const value = parseInt(document.getElementById('custom-score-input').value, 10);
      if (!value || value <= 0) return alert('Enter a positive number');
      try {
        await fetch('https://mpower-leaderboard.onrender.com/api/teams/update-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: teamName, delta: -value })
        });
        modal.style.display = 'none';
        await fetchTeamsAndRender();
      } catch (err) {
        alert('Failed to update score.');
      }
    };
  }

  // Sidebar logic
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const burgerBtn = document.getElementById('burger-btn');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  }
  burgerBtn.onclick = openSidebar;
  overlay.onclick = closeSidebar;

  // Sidebar navigation
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      closeSidebar();
      setTimeout(() => {
        if (href === '#leaderboard') {
          window.location.hash = '#leaderboard';
        } else if (href === '#do-not-open') {
          window.location.hash = '#do-not-open';
        }
      }, 200);
    };
  });

  // Help icon logic
  const helpIcon = document.getElementById('help-icon');
  const helpTooltip = document.getElementById('help-tooltip');
  helpIcon.onclick = () => {
    helpTooltip.textContent = helpTexts[page === 'leaderboard' ? 'leaderboard' : 'doNotOpen'];
    helpTooltip.classList.add('show');
    setTimeout(() => {
      helpTooltip.classList.remove('show');
    }, 2500);
  };
}

function handleHashChange() {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'do-not-open') {
    render('do-not-open');
  } else {
    render('leaderboard');
  }
}

async function fetchTeamsAndRender() {
  try {
    const res = await fetch('https://mpower-leaderboard.onrender.com/api/teams');
    if (!res.ok) throw new Error('Failed to fetch teams');
    teams = await res.json();
    // Sort teams by score descending
    teams.sort((a, b) => b.score - a.score);
    handleHashChange();
  } catch (err) {
    teams = [];
    document.body.innerHTML = '<div class="error">Failed to load leaderboard. Please try again later.</div>';
    console.error(err);
  }
}

window.addEventListener('hashchange', handleHashChange);

fetchTeamsAndRender();
