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
