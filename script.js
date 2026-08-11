/* ============================================
   ESPIA FÁCIL v4 — CORRECTED LOGIC
   All Modals, Credits & Redirects Working
   ============================================ */

'use strict';

/* ============================================
   1. MATRIX RAIN ANIMATION
   ============================================ */
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>{}[]';
  const FONT_SIZE = 14;
  let cols, drops;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / FONT_SIZE);
    drops = new Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(13, 12, 34, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = FONT_SIZE + 'px "Share Tech Mono", monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * FONT_SIZE;
      const y = drops[i] * FONT_SIZE;

      const brightness = Math.random();
      if (brightness > 0.92) ctx.fillStyle = '#ffffff';
      else if (brightness > 0.75) ctx.fillStyle = '#00d1d5';
      else ctx.fillStyle = 'rgba(0, 209, 213, 0.35)';

      ctx.fillText(char, x, y);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 50);
})();


/* ============================================
   2. STATE MANAGEMENT (LocalStorage)
   ============================================ */

const State = {
  get: () => {
    const defaultState = {
      user: { name: 'Agente', email: '' },
      credits: 200,
      target: '@usuario',
      welcomeShown: false,
      cloningIntroShown: false,
      currentStep: 1,
      stepProgress: [0, 0, 0, 0, 0],
    };
    try {
      const saved = localStorage.getItem('espia_facil_state');
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch (e) { return defaultState; }
  },
  save: (data) => {
    try {
      const current = State.get();
      localStorage.setItem('espia_facil_state', JSON.stringify({ ...current, ...data }));
    } catch (e) {}
  },
  updateUI: () => {
    const s = State.get();
    const creditsEl = document.getElementById('credits-val');
    const creditsNavEl = document.getElementById('credits-val-nav');
    const nameEl = document.getElementById('user-name');
    const targetEl = document.getElementById('target-display');

    if (creditsEl) creditsEl.textContent = s.credits;
    if (creditsNavEl) creditsNavEl.textContent = s.credits;
    if (nameEl && s.user.name) nameEl.textContent = s.user.name;
    if (targetEl) targetEl.textContent = s.target;
  }
};

/* ============================================
   3. UTILITIES
   ============================================ */

function $(id) { return document.getElementById(id); }

function showModal(id, show = true) {
  const modal = $(id);
  if (!modal) return;
  if (show) {
    modal.classList.add('show');
  } else {
    modal.classList.remove('show');
  }
}

function hideAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
}


/* ============================================
   4. PAGE: LOGIN (index.html)
   ============================================ */

(function initLogin() {
  const form = $('register-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('name').value.trim();
    const email = $('email').value.trim();
    const emailC = $('email-confirm').value.trim();
    const pass = $('password').value;

    let valid = true;
    if (!name) { $('name').classList.add('error'); valid = false; }
    if (!email) { $('email').classList.add('error'); valid = false; }
    if (email !== emailC) { $('email-confirm').classList.add('error'); valid = false; }
    if (pass.length < 6) { $('password').classList.add('error'); valid = false; }

    if (!valid) return;

    const firstName = name.split(' ')[0];
    State.save({ 
      user: { name: firstName, email }, 
      welcomeShown: false,
      credits: 200,
      currentStep: 1,
      stepProgress: [0, 0, 0, 0, 0]
    });

    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  });

  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('error'));
  });
})();


/* ============================================
   5. PAGE: DASHBOARD (dashboard.html)
   ============================================ */

(function initDashboard() {
  if (!window.location.pathname.includes('dashboard.html')) return;
  
  State.updateUI();
  const s = State.get();
  
  // Show welcome modal on first visit
  if (!s.welcomeShown) {
    setTimeout(() => {
      showModal('welcome-modal', true);
    }, 600);
  }

  const closeBtn = $('modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      showModal('welcome-modal', false);
      State.save({ welcomeShown: true });
    });
  }
})();


/* ============================================
   6. PAGE: SEARCH (search.html)
   ============================================ */

(function initSearch() {
  const form = $('search-form');
  if (!form) return;

  // Service tabs
  const tabs = document.querySelectorAll('.mode-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.mode;
      
      const label = $('input-label');
      const input = $('target-input');
      const icon = $('input-icon');
      
      if (mode === 'instagram') {
        if (label) label.textContent = 'Username do Instagram';
        if (input) input.placeholder = 'Digite o username (ex: joaosilva)';
        if (icon) icon.textContent = '@';
      } else {
        if (label) label.textContent = 'Número de WhatsApp';
        if (input) input.placeholder = 'Ex: 11999887766 (com DDD)';
        if (icon) icon.textContent = '📞';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = $('target-input').value.trim();
    
    if (!target) {
      const alert = $('search-alert');
      if (alert) alert.classList.add('show');
      return;
    }

    State.save({ 
      target, 
      currentStep: 1, 
      stepProgress: [0, 0, 0, 0, 0],
      cloningIntroShown: false 
    });

    setTimeout(() => { window.location.href = 'cloning.html'; }, 800);
  });

  const input = $('target-input');
  if (input) {
    input.addEventListener('input', () => {
      const alert = $('search-alert');
      if (alert) alert.classList.remove('show');
    });
  }
})();


/* ============================================
   7. PAGE: CLONING (cloning.html) — CORE LOGIC
   ============================================ */

(function initCloning() {
  if (!window.location.pathname.includes('cloning.html')) return;
  
  State.updateUI();
  const s = State.get();

  // Show intro modal
  if (!s.cloningIntroShown) {
    setTimeout(() => {
      showModal('cloning-intro-modal', true);
    }, 500);
  }

  const introCloseBtn = $('cloning-intro-close');
  if (introCloseBtn) {
    introCloseBtn.addEventListener('click', () => {
      showModal('cloning-intro-modal', false);
      State.save({ cloningIntroShown: true });
      initializeCloning();
    });
  }

  const upsellCloseBtn = $('upsell-close');
  if (upsellCloseBtn) {
    upsellCloseBtn.addEventListener('click', () => {
      showModal('upsell-modal', false);
    });
  }

  const stepLogs = {
    1: ["Conectando aos servidores...", "Localizando perfil...", "Acessando banco de dados...", "Iniciando coleta..."],
    2: ["Bypass de segurança...", "Verificando conexões...", "Mapeando rede...", "Estabelecendo túnel..."],
    3: ["Extraindo conversas...", "Capturando metadados...", "Sincronizando chats...", "Processando interações..."],
    4: ["Indexando mídias...", "Extraindo fotos...", "Convertendo vídeos...", "Salvando anexos..."],
    5: ["Finalizando pacote...", "Encriptando dados...", "Gerando relatório...", "Aguardando confirmação..."]
  };

  function addLog(stepIdx, text) {
    const logContainer = $(`logs-${stepIdx + 1}`);
    if (!logContainer) return;
    const entry = document.createElement('span');
    entry.className = 'log-entry';
    entry.textContent = `> ${text}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  function updateProgressUI() {
    const s = State.get();
    let totalProgress = 0;

    s.stepProgress.forEach((prog, i) => {
      const idx = i + 1;
      const el = $(`step-${idx}`);
      const fill = $(`progress-${idx}`);
      const status = $(`status-${idx}`);

      if (!el) return;

      if (i + 1 < s.currentStep) {
        el.classList.add('done');
        el.classList.remove('active');
        if (fill) fill.style.width = '100%';
        if (status) status.textContent = 'Concluído ✓';
        totalProgress += 20;
      } else if (i + 1 === s.currentStep) {
        el.classList.add('active');
        el.classList.remove('done');
        if (fill) fill.style.width = `${prog}%`;
        if (status) status.textContent = `${prog}%`;
        totalProgress += (prog / 5);
      } else {
        el.classList.remove('active', 'done');
        if (fill) fill.style.width = '0%';
        if (status) status.textContent = 'Aguardando...';
      }
    });

    const totalPercent = $('total-percent');
    if (totalPercent) totalPercent.textContent = Math.floor(totalProgress);
  }

  function initializeCloning() {
    const s = State.get();
    s.stepProgress[0] = 5;
    State.save(s);
    updateProgressUI();
    addLog(0, "Sistema de extração iniciado...");
  }

  // Acceleration button logic
  document.querySelectorAll('.accel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = State.get();
      const stepIdx = parseInt(btn.dataset.step) - 1;

      // Check if this is the current step
      if (stepIdx + 1 !== s.currentStep) return;

      // Check credits
      if (s.credits < 45) {
        showModal('upsell-modal', true);
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Acelerando...';

      // Simulate acceleration
      let localProg = s.stepProgress[stepIdx];
      const logs = stepLogs[stepIdx + 1];
      let logIdx = 0;

      const accelInterval = setInterval(() => {
        localProg += Math.floor(Math.random() * 15) + 5;
        
        if (logIdx < logs.length && Math.random() > 0.5) {
          addLog(stepIdx, logs[logIdx]);
          logIdx++;
        }

        if (localProg >= 100) {
          localProg = 100;
          clearInterval(accelInterval);
          
          setTimeout(() => {
            const state = State.get();
            state.credits -= 45;
            state.stepProgress[stepIdx] = 100;
            
            if (state.currentStep === stepIdx + 1 && state.currentStep < 5) {
              state.currentStep++;
              state.stepProgress[state.currentStep - 1] = 5;
            }
            
            State.save(state);
            State.updateUI();
            updateProgressUI();
            btn.disabled = false;
            btn.textContent = '⚡ Acelerar (45 créditos)';
            addLog(stepIdx, "✓ ETAPA CONCLUÍDA!");
          }, 500);
        } else {
          const fill = $(`progress-${stepIdx + 1}`);
          const status = $(`status-${stepIdx + 1}`);
          if (fill) fill.style.width = `${localProg}%`;
          if (status) status.textContent = `${localProg}%`;
        }
      }, 200);
    });
  });

  if (s.cloningIntroShown) {
    initializeCloning();
  }

  updateProgressUI();
})();


/* ============================================
   8. GLOBAL PAGE TRANSITIONS
   ============================================ */

(function initPageTransitions() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link || link.target === '_blank') return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) return;

    e.preventDefault();
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    setTimeout(() => { window.location.href = href; }, 300);
  });
})();
