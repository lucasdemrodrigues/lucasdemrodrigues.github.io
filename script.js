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
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') document.body.classList.add('light-mode');

const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.type = 'button';
document.querySelector('.topbar')?.appendChild(themeToggle);

const syncThemeToggle = () => {
  const isLight = document.body.classList.contains('light-mode');
  themeToggle.textContent = isLight ? '☾' : '☀';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isLight ? '#f4f2ed' : '#000000');
  document.dispatchEvent(new CustomEvent('portfolio:theme-state', { detail: { isLight } }));
};

syncThemeToggle();
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
  syncThemeToggle();
});

// Preferências de interação usadas por cursor, métricas, SQL e fundo do Hero.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Impacto profissional: os números contam uma única vez quando entram na tela.
const metricNumbers = [...document.querySelectorAll('.metric-num')];
if (metricNumbers.length && !prefersReducedMotion) {
  const metricData = metricNumbers.map(el => {
    const original = el.textContent.trim();
    const sign = original.startsWith('+') ? '+' : original.startsWith('−') || original.startsWith('-') ? '−' : '';
    const suffix = original.includes('%') ? '%' : '';
    const numericText = original.replace(/[+−%]/g, '').replace(',', '.');
    const target = Number.parseFloat(numericText);
    const decimals = original.includes(',') ? 1 : 0;
    return { el, original, sign, suffix, target, decimals };
  });

  const formatMetric = ({ sign, suffix, decimals }, value) => {
    const formatted = decimals ? value.toFixed(decimals).replace('.', ',') : Math.round(value).toString();
    return `${sign}${formatted}${suffix}`;
  };

  metricData.forEach(item => { item.el.textContent = formatMetric(item, 0); });

  const animateMetric = item => {
    const duration = 1000;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      item.el.textContent = formatMetric(item, item.target * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else item.el.textContent = item.original;
    };
    requestAnimationFrame(tick);
  };

  const metricObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const number = entry.target.querySelector('.metric-num');
      const item = metricData.find(data => data.el === number);
      if (item) animateMetric(item);
      metricObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.metric').forEach(metric => metricObserver.observe(metric));
}

if (finePointer) {
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

// Menu mobile: este arquivo controla apenas o estado. O texto acessível
// é atualizado pelo sistema de idiomas conforme o idioma ativo.
const topbar = document.querySelector('.topbar');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('main-nav');

// O nome completo aparece no header somente depois que o Hero sai da área da barra.
const hero = document.querySelector('#inicio');
if (topbar && hero) {
  const syncBrandExpansion = () => {
    topbar.classList.toggle('brand-expanded', hero.getBoundingClientRect().bottom <= topbar.offsetHeight);
  };
  syncBrandExpansion();
  window.addEventListener('scroll', syncBrandExpansion, { passive:true });
  window.addEventListener('resize', syncBrandExpansion);
}

if (topbar && menuToggle && mainNav) {
  const setMenuState = open => {
    topbar.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    document.dispatchEvent(new CustomEvent('portfolio:menu-state', { detail: { open } }));
  };

  const closeMenu = () => setMenuState(false);

  menuToggle.addEventListener('click', () => {
    setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (topbar.classList.contains('menu-open') && !topbar.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && topbar.classList.contains('menu-open')) {
      closeMenu();
      menuToggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

// Scroll spy: sublinha discretamente a seção atualmente visível no menu e
// informa semanticamente qual localização está ativa.
if (mainNav) {
  const navLinks = [...mainNav.querySelectorAll('a[href^="#"]')];
  const trackedSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

  const setActiveNav = id => {
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const clearActiveNav = () => navLinks.forEach(link => {
    link.classList.remove('is-active');
    link.removeAttribute('aria-current');
  });

  const updateActiveNav = () => {
    const marker = 120;
    let active = null;
    trackedSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) active = section.id;
    });
    if (active) setActiveNav(active);
    else clearActiveNav();
  };

  updateActiveNav();
  window.addEventListener('scroll', updateActiveNav, { passive:true });
  window.addEventListener('resize', updateActiveNav);
}

// O card inteiro de e-mail copia o endereço. Este arquivo controla o estado
// visual; o texto de feedback é definido pelo sistema de idiomas.
const emailCard = document.querySelector('.email-card');
const copyEmailButton = document.querySelector('.copy-email');
if (emailCard && copyEmailButton) {
  const email = copyEmailButton.dataset.email;
  const icon = copyEmailButton.querySelector('.copy-icon');
  let feedbackTimer;

  const setCopyState = copied => {
    if (icon) icon.textContent = copied ? '✓' : '⧉';
    copyEmailButton.classList.toggle('copied', copied);
    document.dispatchEvent(new CustomEvent('portfolio:copy-state', { detail: { copied } }));
  };

  const showCopied = () => {
    clearTimeout(feedbackTimer);
    setCopyState(true);
    feedbackTimer = setTimeout(() => setCopyState(false), 2000);
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

// SQL do Hero: digita a consulta uma única vez na entrada e mantém o cursor piscando ao final.
// Easter eggs: vermelho fecha, o botão fechado restaura e verde ativa um Matrix temporário.
const heroSqlCode = document.querySelector('.hero-sql-code');
if (heroSqlCode) {
  const heroSql = heroSqlCode.closest('.hero-sql');
  const heroSqlHead = heroSql?.querySelector('.hero-sql-head');
  const originalTitle = heroSqlHead?.querySelector('span');
  const windowControls = heroSqlHead ? [...heroSqlHead.querySelectorAll('i')] : [];
  const tokens = [
    ['SELECT','kw'],[' ',''],['insights',''],[', ',''],['strategy',''],[', ',''],['results',''],['\n',''],
    ['FROM','kw'],[' ',''],['experience','obj'],['\n',''],
    ['WHERE','kw'],[' ',''],['focus',''],[' = ',''],["'business'",'str'],['\n',''],
    ['ORDER BY','kw'],[' ',''],['impact',''],[' ',''],['DESC','kw'],[';','']
  ];

  const renderCompleteQuery = () => {
    heroSqlCode.innerHTML = '';
    tokens.forEach(([text, cls]) => {
      const span = document.createElement('span');
      if (cls) span.className = cls;
      span.textContent = text;
      heroSqlCode.appendChild(span);
    });
    const caret = document.createElement('span');
    caret.className = 'sql-caret';
    caret.setAttribute('aria-hidden', 'true');
    heroSqlCode.appendChild(caret);
  };

  if (prefersReducedMotion) {
    renderCompleteQuery();
  } else {
    heroSqlCode.innerHTML = '';
    const chars = [];
    tokens.forEach(([text, cls]) => [...text].forEach(char => chars.push([char, cls])));
    let i = 0;

    const step = () => {
      if (i >= chars.length) {
        const caret = document.createElement('span');
        caret.className = 'sql-caret';
        caret.setAttribute('aria-hidden', 'true');
        heroSqlCode.appendChild(caret);
        return;
      }

      const [char, cls] = chars[i++];
      let last = heroSqlCode.lastElementChild;
      if (!last || last.className !== cls) {
        last = document.createElement('span');
        if (cls) last.className = cls;
        heroSqlCode.appendChild(last);
      }
      last.textContent += char;
      setTimeout(step, char === '\n' ? 130 : 24 + Math.random() * 34);
    };

    setTimeout(step, 500);
  }

  if (heroSql && heroSqlHead && originalTitle && windowControls.length === 3) {
    heroSql.removeAttribute('aria-hidden');
    heroSqlCode.setAttribute('aria-hidden', 'true');
    heroSql.style.position = 'relative';
    heroSql.style.transition = prefersReducedMotion ? 'none' : 'max-width .35s cubic-bezier(.22,1,.36,1), transform .35s cubic-bezier(.22,1,.36,1), border-radius .25s';

    const titleLink = document.createElement('a');
    titleLink.href = 'https://github.com/lucasdemrodrigues';
    titleLink.target = '_blank';
    titleLink.rel = 'noreferrer';
    titleLink.textContent = 'portfolio.sql';
    titleLink.style.marginLeft = 'auto';
    titleLink.style.marginRight = 'auto';
    titleLink.style.transform = 'translateX(-17px)';
    titleLink.style.color = '#9da8bb';
    titleLink.style.fontSize = '11px';
    titleLink.style.textDecoration = 'none';
    titleLink.style.cursor = 'pointer';
    originalTitle.replaceWith(titleLink);

    const matrixCanvas = document.createElement('canvas');
    matrixCanvas.setAttribute('aria-hidden', 'true');
    matrixCanvas.style.position = 'absolute';
    matrixCanvas.style.left = '0';
    matrixCanvas.style.right = '0';
    matrixCanvas.style.bottom = '0';
    matrixCanvas.style.top = `${heroSqlHead.offsetHeight || 48}px`;
    matrixCanvas.style.width = '100%';
    matrixCanvas.style.height = `calc(100% - ${heroSqlHead.offsetHeight || 48}px)`;
    matrixCanvas.style.display = 'none';
    matrixCanvas.style.zIndex = '3';
    matrixCanvas.style.background = '#000';
    heroSql.appendChild(matrixCanvas);

    let matrixFrame = 0;
    let matrixTimer = 0;
    let matrixRunning = false;

    const labels = {
      pt:{close:'Fechar portfolio.sql',matrix:'Ativar efeito Matrix',restore:'Restaurar portfolio.sql',github:'Abrir perfil de Lucas Rodrigues no GitHub, abre em nova aba'},
      en:{close:'Close portfolio.sql',matrix:'Activate Matrix effect',restore:'Restore portfolio.sql',github:'Open Lucas Rodrigues on GitHub, opens in a new tab'},
      es:{close:'Cerrar portfolio.sql',matrix:'Activar efecto Matrix',restore:'Restaurar portfolio.sql',github:'Abrir perfil de Lucas Rodrigues en GitHub, abre en una nueva pestaña'}
    };

    const currentLang = () => {
      const value = document.documentElement.lang.toLowerCase();
      return value.startsWith('en') ? 'en' : value.startsWith('es') ? 'es' : 'pt';
    };

    const syncLabels = () => {
      const copy = labels[currentLang()];
      windowControls[0].setAttribute('aria-label', copy.close);
      windowControls[0].title = copy.close;
      windowControls[2].setAttribute('aria-label', copy.matrix);
      windowControls[2].title = copy.matrix;
      titleLink.setAttribute('aria-label', copy.github);
      titleLink.title = copy.github;
      if (heroSql.dataset.windowState === 'closed') heroSql.setAttribute('aria-label', copy.restore);
    };

    const makeControl = el => {
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      el.style.cursor = 'pointer';
    };

    makeControl(windowControls[0]);
    makeControl(windowControls[2]);

    // O amarelo permanece apenas visual/decorativo.
    windowControls[1].removeAttribute('role');
    windowControls[1].removeAttribute('tabindex');
    windowControls[1].removeAttribute('aria-label');
    windowControls[1].removeAttribute('title');
    windowControls[1].style.cursor = 'default';

    const stopMatrix = () => {
      if (matrixFrame) cancelAnimationFrame(matrixFrame);
      clearTimeout(matrixTimer);
      matrixFrame = 0;
      matrixTimer = 0;
      matrixRunning = false;
      matrixCanvas.style.display = 'none';
      heroSqlCode.style.visibility = '';
      const ctx = matrixCanvas.getContext('2d');
      ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    };

    const restoreWindow = () => {
      stopMatrix();
      heroSql.dataset.windowState = 'normal';
      heroSqlCode.style.display = '';
      windowControls.forEach(control => { control.style.display = ''; });
      heroSql.style.maxWidth = '';
      heroSql.style.transform = '';
      heroSql.style.borderRadius = '';
      heroSqlHead.style.justifyContent = '';
      titleLink.style.transform = 'translateX(-17px)';
      titleLink.tabIndex = 0;
      heroSql.removeAttribute('role');
      heroSql.removeAttribute('tabindex');
      heroSql.removeAttribute('aria-label');
      heroSql.style.cursor = '';
    };

    const closeWindow = () => {
      stopMatrix();
      heroSql.dataset.windowState = 'closed';
      heroSqlCode.style.display = 'none';
      windowControls.forEach(control => { control.style.display = 'none'; });
      heroSql.style.maxWidth = '165px';
      heroSql.style.transform = window.innerWidth <= 900 ? 'none' : 'translateX(-70px)';
      heroSql.style.borderRadius = '999px';
      heroSqlHead.style.justifyContent = 'center';
      titleLink.style.transform = 'none';
      titleLink.tabIndex = -1;
      heroSql.setAttribute('role', 'button');
      heroSql.tabIndex = 0;
      heroSql.style.cursor = 'pointer';
      syncLabels();
    };

    const drawStaticMatrix = () => {
      const rect = matrixCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      matrixCanvas.width = Math.max(1, Math.round(rect.width * dpr));
      matrixCanvas.height = Math.max(1, Math.round(rect.height * dpr));
      const ctx = matrixCanvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.font = '14px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#39ff14';
      const chars = '01アイウエオカキクケコサシスセソ';
      for (let y = 18; y < rect.height; y += 18) {
        for (let x = 8; x < rect.width; x += 16) {
          ctx.globalAlpha = .25 + Math.random() * .75;
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
        }
      }
      ctx.globalAlpha = 1;
    };

    const startMatrix = () => {
      if (matrixRunning || heroSql.dataset.windowState === 'closed') return;
      matrixRunning = true;
      matrixCanvas.style.display = 'block';
      heroSqlCode.style.visibility = 'hidden';

      if (prefersReducedMotion) {
        drawStaticMatrix();
        matrixTimer = setTimeout(stopMatrix, 900);
        return;
      }

      const rect = matrixCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      matrixCanvas.width = Math.max(1, Math.round(rect.width * dpr));
      matrixCanvas.height = Math.max(1, Math.round(rect.height * dpr));
      const ctx = matrixCanvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fontSize = 14;
      const columns = Math.max(1, Math.floor(rect.width / fontSize));
      const drops = Array.from({length:columns}, () => Math.floor(Math.random() * -20));
      const chars = '01アイウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ';

      const draw = () => {
        ctx.fillStyle = 'rgba(0,0,0,.12)';
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = Math.random() > .94 ? '#d7ffd0' : '#39ff14';
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > rect.height && Math.random() > .97) drops[i] = 0;
          drops[i]++;
        }
        matrixFrame = requestAnimationFrame(draw);
      };

      draw();
      matrixTimer = setTimeout(stopMatrix, 2600);
    };

    const activate = (el, action) => {
      el.addEventListener('click', event => {
        event.stopPropagation();
        action();
      });
      el.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          action();
        }
      });
    };

    activate(windowControls[0], closeWindow);
    activate(windowControls[2], startMatrix);

    heroSql.addEventListener('click', event => {
      if (heroSql.dataset.windowState !== 'closed') return;
      event.preventDefault();
      restoreWindow();
    });
    heroSql.addEventListener('keydown', event => {
      if (heroSql.dataset.windowState === 'closed' && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        restoreWindow();
      }
    });

    titleLink.addEventListener('click', event => {
      if (heroSql.dataset.windowState === 'closed') {
        event.preventDefault();
        event.stopPropagation();
        restoreWindow();
      }
    });

    syncLabels();
    document.addEventListener('portfolio:languagechange', syncLabels);
    window.addEventListener('resize', () => {
      if (heroSql.dataset.windowState === 'closed') closeWindow();
      else if (matrixRunning) {
        stopMatrix();
        startMatrix();
      }
    });
  }
}

// Fundo do Hero inspirado na configuração pública original do portfólio de Pedro Lauro.
const flowHost = document.querySelector('.hero-flow');

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
      if (prefersReducedMotion) return;
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
    if (!prefersReducedMotion) resolveCollisions();
    drawLinks(); particles.forEach(p => p.draw());
    if (!prefersReducedMotion) requestAnimationFrame(animate);
  }

  resizeParticles(); animate(performance.now());
  const resizeObserver = new ResizeObserver(() => { resizeParticles(); if (prefersReducedMotion) animate(performance.now()); });
  resizeObserver.observe(flowHost);
}