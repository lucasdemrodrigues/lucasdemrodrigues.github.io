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

// Preferências de interação compartilhadas entre os módulos do site.
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
    const interactive = event.target.closest('a,button,[role="button"],.contact-card,.text-link,.project-feature,.hero-sql-control-active');
    if (interactive?.classList.contains('hero-sql-control-active')) interactive.style.cursor = 'none';
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
