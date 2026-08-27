const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.spotlight-card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (e) => {
  if (!glow) return;
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});

document.getElementById('year').textContent = new Date().getFullYear();

// Tema: dark é sempre o padrão na primeira visita. Se o visitante escolher
// manualmente outro tema, a preferência fica salva para as próximas visitas.
const themeStyles = document.createElement('link');
themeStyles.rel = 'stylesheet';
themeStyles.href = 'theme.css';
document.head.appendChild(themeStyles);

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') document.body.classList.add('light-mode');

const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.type = 'button';
document.querySelector('.topbar')?.appendChild(themeToggle);

const syncThemeToggle = () => {
  const isLight = document.body.classList.contains('light-mode');
  themeToggle.textContent = isLight ? '☾' : '☀';
  themeToggle.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
  themeToggle.setAttribute('title', isLight ? 'Modo escuro' : 'Modo claro');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isLight ? '#f4f2ed' : '#000000');
};

syncThemeToggle();
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
  syncThemeToggle();
});

// Cursor customizado: ponto acompanha o mouse, anel segue com inércia.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (finePointer) {
  const cursorStyle = document.createElement('style');
  cursorStyle.textContent = `
    html.custom-cursor, html.custom-cursor body, html.custom-cursor a,
    html.custom-cursor button, html.custom-cursor [role="button"],
    html.custom-cursor input, html.custom-cursor textarea, html.custom-cursor select {
      cursor: none !important;
    }
    .custom-cursor-dot,.custom-cursor-ring{
      position:fixed;left:0;top:0;pointer-events:none;z-index:9999;
      transform:translate(-50%,-50%);opacity:0;
    }
    .custom-cursor-dot{
      width:6px;height:6px;border-radius:50%;background:#f4f4f4;
      transition:width .16s,height .16s,opacity .16s,background .25s;
    }
    .custom-cursor-ring{
      width:30px;height:30px;border:1px solid rgba(244,244,244,.72);border-radius:50%;
      transition:width .2s,height .2s,border-color .2s,background .2s,opacity .16s;
    }
    .custom-cursor-ring.is-interactive{width:46px;height:46px;border-color:rgba(244,244,244,.95);background:rgba(255,255,255,.035)}
    .custom-cursor-ring.is-clicking{width:54px;height:54px;background:rgba(255,255,255,.055)}
    body.light-mode .custom-cursor-dot{background:#202020}
    body.light-mode .custom-cursor-ring{border-color:rgba(32,32,32,.7)}
    body.light-mode .custom-cursor-ring.is-interactive{border-color:rgba(32,32,32,.92);background:rgba(0,0,0,.035)}
    body.light-mode .custom-cursor-ring.is-clicking{background:rgba(0,0,0,.055)}
  `;
  document.head.appendChild(cursorStyle);
  document.documentElement.classList.add('custom-cursor');

  const customCursorDot = document.createElement('div');
  customCursorDot.className = 'custom-cursor-dot';
  const customCursorRing = document.createElement('div');
  customCursorRing.className = 'custom-cursor-ring';
  document.body.append(customCursorRing, customCursorDot);

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let hasMoved = false;

  const setVisible = visible => {
    const opacity = visible ? '1' : '0';
    customCursorDot.style.opacity = opacity;
    customCursorRing.style.opacity = opacity;
  };

  window.addEventListener('pointermove', event => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    mouseX = event.clientX;
    mouseY = event.clientY;
    customCursorDot.style.left = `${mouseX}px`;
    customCursorDot.style.top = `${mouseY}px`;
    if (!hasMoved) {
      ringX = mouseX;
      ringY = mouseY;
      hasMoved = true;
    }
    setVisible(true);
  });

  document.addEventListener('pointerover', event => {
    const interactive = event.target.closest('a,button,[role="button"],.contact-card,.text-link,.project-feature');
    customCursorRing.classList.toggle('is-interactive', Boolean(interactive));
  });
  document.addEventListener('pointerout', event => {
    if (!event.relatedTarget) setVisible(false);
  });
  document.addEventListener('pointerdown', () => customCursorRing.classList.add('is-clicking'));
  document.addEventListener('pointerup', () => customCursorRing.classList.remove('is-clicking'));

  const animateCursor = () => {
    const follow = prefersReducedMotion ? 1 : 0.16;
    ringX += (mouseX - ringX) * follow;
    ringY += (mouseY - ringY) * follow;
    customCursorRing.style.left = `${ringX}px`;
    customCursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();
}

// Menu mobile.
const topbar = document.querySelector('.topbar');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('main-nav');
if (topbar && menuToggle && mainNav) {
  const closeMenu = () => {
    topbar.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
  };
  menuToggle.addEventListener('click', () => {
    const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
    topbar.classList.toggle('menu-open', opening);
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (topbar.classList.contains('menu-open') && !topbar.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

// O card inteiro de e-mail copia o endereço. O elemento visual "Copiar"
// funciona como indicador da ação e exibe o feedback de sucesso.
const emailCard = document.querySelector('.email-card');
const copyEmailButton = document.querySelector('.copy-email');
if (emailCard && copyEmailButton) {
  const email = copyEmailButton.dataset.email;
  const label = copyEmailButton.querySelector('.copy-label');
  const icon = copyEmailButton.querySelector('.copy-icon');
  let feedbackTimer;

  emailCard.style.cursor = 'pointer';
  emailCard.setAttribute('role', 'button');
  emailCard.setAttribute('tabindex', '0');
  emailCard.setAttribute('aria-label', `Copiar e-mail ${email}`);

  const showCopied = () => {
    clearTimeout(feedbackTimer);
    if (label) label.textContent = 'Copiado!';
    if (icon) icon.textContent = '✓';
    copyEmailButton.classList.add('copied');
    feedbackTimer = setTimeout(() => {
      if (label) label.textContent = 'Copiar';
      if (icon) icon.textContent = '⧉';
      copyEmailButton.classList.remove('copied');
    }, 2000);
  };

  const copyEmail = async (event) => {
    if (event) event.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      showCopied();
    } catch {
      const temp = document.createElement('textarea');
      temp.value = email;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
      showCopied();
    }
  };

  emailCard.addEventListener('click', copyEmail);
  emailCard.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      copyEmail(event);
    }
  });
}

// SQL showcase: sintaxe real, digitação uma única vez e cursor piscando ao final.
const impactSection = document.getElementById('impacto');
if (impactSection) {
  const sqlCard = document.createElement('div');
  sqlCard.className = 'sql-showcase';
  sqlCard.innerHTML = `<div class="sql-windowbar"><span class="sql-dots"><i></i><i></i><i></i></span><span>portfolio.sql</span></div><pre class="sql-code" aria-label="Consulta SQL"><code></code><span class="sql-caret" aria-hidden="true"></span></pre>`;
  impactSection.prepend(sqlCard);

  const css = document.createElement('style');
  css.textContent = `
    .impact::before{display:none!important}.sql-showcase{width:min(100%,610px);margin:0 auto 70px;border:1px solid rgba(255,255,255,.13);border-radius:12px;overflow:hidden;background:#0d1424;box-shadow:0 24px 70px rgba(0,0,0,.2);font-family:"IBM Plex Mono",monospace}.sql-windowbar{height:46px;display:flex;align-items:center;justify-content:center;position:relative;border-bottom:1px solid rgba(38,198,218,.35);background:#202c40;color:#929bad;font-size:12px}.sql-dots{position:absolute;left:16px;display:flex;gap:6px}.sql-dots i{width:10px;height:10px;border-radius:50%;display:block}.sql-dots i:nth-child(1){background:#ff5f57}.sql-dots i:nth-child(2){background:#febc2e}.sql-dots i:nth-child(3){background:#28c840}.sql-code{margin:0;padding:25px 24px 28px;color:#d9dfeb;font:500 14px/1.7 "IBM Plex Mono",monospace;white-space:pre-wrap;min-height:170px}.sql-keyword{color:#00e5ff;font-weight:600}.sql-field{color:#f2f4f8}.sql-table{color:#168cff}.sql-string{color:#b8a7d9}.sql-caret{display:inline-block;width:2px;height:1.15em;margin-left:3px;vertical-align:-.18em;background:#00e5ff;animation:sqlBlink .8s steps(1) infinite}@keyframes sqlBlink{50%{opacity:0}}.light-mode .sql-showcase{border-color:rgba(0,0,0,.14);background:#f7f8fb;box-shadow:0 24px 70px rgba(0,0,0,.08)}.light-mode .sql-windowbar{background:#e8eaf0;color:#737887;border-bottom-color:rgba(0,120,150,.22)}.light-mode .sql-code{color:#303544}.light-mode .sql-keyword{color:#007d91}.light-mode .sql-field{color:#252a35}.light-mode .sql-table{color:#006bd6}.light-mode .sql-string{color:#7556a3}.light-mode .sql-caret{background:#007d91}@media(max-width:620px){.sql-showcase{margin-bottom:54px}.sql-code{font-size:12px;padding:22px 18px;min-height:155px}}@media(prefers-reduced-motion:reduce){.sql-caret{animation:none}}
  `;
  document.head.appendChild(css);

  const code = sqlCard.querySelector('code');
  const tokens = [
    ['SELECT','sql-keyword'],[' ',''],['insights','sql-field'],[', ',''],['strategy','sql-field'],[', ',''],['results','sql-field'],['\n',''],
    ['FROM','sql-keyword'],[' ',''],['marketing_data','sql-table'],['\n',''],
    ['WHERE','sql-keyword'],[' ',''],['focus','sql-field'],[' = ',''],["'business'",'sql-string'],['\n',''],
    ['ORDER BY','sql-keyword'],[' ',''],['impact','sql-field'],[' ',''],['DESC','sql-keyword'],[';','']
  ];
  const chars = [];
  tokens.forEach(([text, cls]) => [...text].forEach(char => chars.push([char, cls])));
  let typed = false;
  const typeQuery = () => {
    if (typed) return;
    typed = true;
    if (prefersReducedMotion) {
      tokens.forEach(([text, cls]) => { const s=document.createElement('span'); s.className=cls; s.textContent=text; code.appendChild(s); });
      return;
    }
    let i = 0;
    const step = () => {
      if (i >= chars.length) return;
      const [char, cls] = chars[i++];
      let last = code.lastElementChild;
      if (!last || last.className !== cls) { last=document.createElement('span'); last.className=cls; code.appendChild(last); }
      last.textContent += char;
      setTimeout(step, char === '\n' ? 150 : 28 + Math.random()*35);
    };
    step();
  };
  const sqlObserver = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { typeQuery(); sqlObserver.disconnect(); }
  }, {threshold:.45});
  sqlObserver.observe(sqlCard);
}

// Fundo do Hero inspirado na configuração pública original do portfólio de Pedro Lauro.
// Valores preservados: 40 partículas, links a 150 px, opacidade .5, largura 1,
// velocidade 3, colisões, fundo preto e nenhuma interação com mouse/clique.
const flowHost = document.querySelector('.hero-flow');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (flowHost) {
  flowHost.innerHTML = '';
  flowHost.style.opacity = '1';

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  flowHost.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particleCount = 40;
  const linkDistance = 150;
  const linkOpacity = 0.5;
  const speed = 3;
  const particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = performance.now();

  const palette = () => document.body.classList.contains('light-mode')
    ? { bg:'#f4f2ed', particle:'rgba(30,30,30,0.32)', link:[30,30,30] }
    : { bg:'#000000', particle:'rgba(255,255,255,0.5)', link:[255,255,255] };

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.35 + Math.random() * 0.35);
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity;
      this.radius = 1 + Math.random() * 4;
    }
    update(dt) {
      if (reduceMotion) return;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.x <= this.radius || this.x >= width - this.radius) {
        this.vx *= -1;
        this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
      }
      if (this.y <= this.radius || this.y >= height - this.radius) {
        this.vy *= -1;
        this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = palette().particle;
      ctx.fill();
    }
  }

  function resizeParticles() {
    const rect = flowHost.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!particles.length) {
      for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    } else {
      particles.forEach(p => { p.x = Math.min(p.x, width); p.y = Math.min(p.y, height); });
    }
  }

  function resolveCollisions() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const minDist = a.radius + b.radius;
        const distSq = dx * dx + dy * dy;
        if (distSq > 0 && distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq), nx = dx / dist, ny = dy / dist;
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) {
            a.vx += rel * nx; a.vy += rel * ny;
            b.vx -= rel * nx; b.vy -= rel * ny;
          }
        }
      }
    }
  }

  function drawLinks() {
    const colors = palette().link;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist <= linkDistance) {
          const opacity = (1 - dist / linkDistance) * linkOpacity;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${colors[0]},${colors[1]},${colors[2]},${opacity})`; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
  }

  function animate(now) {
    const dt = Math.min((now - lastTime) / 16.6667, 2);
    lastTime = now;
    const colors = palette();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, width, height);
    particles.forEach(p => p.update(dt));
    if (!reduceMotion) resolveCollisions();
    drawLinks(); particles.forEach(p => p.draw());
    if (!reduceMotion) requestAnimationFrame(animate);
  }

  resizeParticles(); animate(performance.now());
  const resizeObserver = new ResizeObserver(() => { resizeParticles(); if (reduceMotion) animate(performance.now()); });
  resizeObserver.observe(flowHost);
}
