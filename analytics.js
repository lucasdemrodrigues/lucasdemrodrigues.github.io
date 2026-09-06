// Google Analytics 4 — configuração e instrumentação do portfólio.
const GA_MEASUREMENT_ID = 'G-6TRWK5XYBQ';

window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }

gtag('js', new Date());
gtag('config', GA_MEASUREMENT_ID);

const analyticsScript = document.createElement('script');
analyticsScript.async = true;
analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
document.head.appendChild(analyticsScript);

// Ponto único para os eventos personalizados do portfólio.
// Os outros módulos podem chamar window.trackEvent sem conhecer detalhes do GA4.
window.trackEvent = (eventName, parameters = {}) => {
  if (!eventName || typeof eventName !== 'string') return;
  gtag('event', eventName, parameters);
};

// Visualização de seções: considera a seção realmente vista quando uma parte
// relevante dela permanece visível por 700 ms. Cada seção dispara uma vez
// por carregamento da página.
const trackedSections = [
  ['inicio', 'hero'],
  ['sobre', 'sobre'],
  ['impacto', 'impacto'],
  ['trajetoria', 'trajetoria'],
  ['projetos', 'projetos'],
  ['contato', 'contato']
];

if ('IntersectionObserver' in window) {
  const sectionTimers = new Map();
  const viewedSections = new Set();

  const clearSectionTimer = section => {
    const timer = sectionTimers.get(section);
    if (timer) clearTimeout(timer);
    sectionTimers.delete(section);
  };

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const section = entry.target;
      if (viewedSections.has(section)) return;

      const visibleHeight = entry.intersectionRect.height;
      const requiredHeight = Math.min(
        entry.boundingClientRect.height * 0.4,
        window.innerHeight * 0.5
      );
      const sufficientlyVisible = entry.isIntersecting && visibleHeight >= requiredHeight;

      if (!sufficientlyVisible) {
        clearSectionTimer(section);
        return;
      }

      if (sectionTimers.has(section)) return;

      const sectionName = trackedSections.find(([id]) => id === section.id)?.[1];
      if (!sectionName) return;

      sectionTimers.set(section, setTimeout(() => {
        viewedSections.add(section);
        sectionTimers.delete(section);
        sectionObserver.unobserve(section);
        window.trackEvent('section_view', { section_name: sectionName });
      }, 700));
    });
  }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });

  trackedSections.forEach(([id]) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
}

// Interesse em projetos: usa delegação de evento para funcionar tanto com
// os cards estáticos quanto com os cards recriados dinamicamente pela galeria.
document.addEventListener('click', event => {
  const link = event.target.closest('#projetos .project-feature .text-link');
  if (!link) return;

  const card = link.closest('.project-feature');
  if (!card) return;

  const allCards = [...document.querySelectorAll('#projetos .project-feature')];
  const repoFromUrl = (() => {
    try {
      const url = new URL(link.href);
      return url.hostname === 'github.com' ? url.pathname.split('/').filter(Boolean)[1] || '' : '';
    } catch {
      return '';
    }
  })();

  const projectName = card.dataset.repo || repoFromUrl || card.querySelector('h3')?.textContent.trim() || 'unknown';
  const projectCategory = (card.dataset.categories || '')
    .split('|')
    .filter(Boolean)
    .join(', ') || 'uncategorized';
  const projectPosition = Math.max(1, allCards.indexOf(card) + 1);

  window.trackEvent('project_click', {
    project_name: projectName,
    project_category: projectCategory,
    project_position: projectPosition
  });
});

// Intenção de contato: separa a ação específica do KPI consolidado.
// LinkedIn é medido no clique; e-mail só é contado quando a cópia foi concluída.
document.addEventListener('click', event => {
  const linkedinLink = event.target.closest('#contato a[href*="linkedin.com"]');
  if (!linkedinLink) return;

  window.trackEvent('linkedin_click', { location: 'contact' });
  window.trackEvent('contact_intent', { contact_method: 'linkedin' });
});

document.addEventListener('portfolio:copy-state', event => {
  if (!event.detail?.copied) return;

  window.trackEvent('email_copy', { location: 'contact' });
  window.trackEvent('contact_intent', { contact_method: 'email' });
});

// Preferências de experiência: mede apenas mudanças feitas ativamente pelo visitante.
document.addEventListener('click', event => {
  const themeButton = event.target.closest('.theme-toggle');
  if (themeButton) {
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    window.trackEvent('theme_change', { theme });
    return;
  }

  const languageButton = event.target.closest('.language-switch button[data-lang]');
  if (languageButton) {
    window.trackEvent('language_change', { selected_language: languageButton.dataset.lang });
  }
});

// Easter eggs do terminal SQL.
// portfolio.sql pode ser capturado pelo clique; o Matrix publica um evento interno
// porque seu clique interrompe a propagação para preservar o comportamento atual.
document.addEventListener('click', event => {
  const portfolioSql = event.target.closest('.hero-sql-title-link');
  if (portfolioSql) {
    window.trackEvent('easter_egg_trigger', { easter_egg_name: 'portfolio_sql' });
  }
});

document.addEventListener('portfolio:easter-egg', event => {
  const name = event.detail?.name;
  if (!name) return;
  window.trackEvent('easter_egg_trigger', { easter_egg_name: name });
});
