(() => {
  const grid = document.querySelector('.featured-certs-grid');
  if (!grid) return;

  const LANGUAGE_KEY = 'portfolio-language';
  const AREA_LABELS = {
    pt: {
      'Dados & BI':'DADOS & BI',
      'Marketing & CRM':'MARKETING & CRM',
      'IA & Tecnologia':'IA & TECNOLOGIA',
      'Gestão & Negócios':'GESTÃO & NEGÓCIOS',
      'Carreira & Desenvolvimento':'CARREIRA & DESENVOLVIMENTO',
      'Outros interesses':'OUTROS INTERESSES'
    },
    en: {
      'Dados & BI':'DATA & BI',
      'Marketing & CRM':'MARKETING & CRM',
      'IA & Tecnologia':'AI & TECHNOLOGY',
      'Gestão & Negócios':'MANAGEMENT & BUSINESS',
      'Carreira & Desenvolvimento':'CAREER & DEVELOPMENT',
      'Outros interesses':'OTHER INTERESTS'
    },
    es: {
      'Dados & BI':'DATOS & BI',
      'Marketing & CRM':'MARKETING & CRM',
      'IA & Tecnologia':'IA & TECNOLOGÍA',
      'Gestão & Negócios':'GESTIÓN & NEGOCIOS',
      'Carreira & Desenvolvimento':'CARRERA & DESARROLLO',
      'Outros interesses':'OTROS INTERESES'
    }
  };

  let featured = [];

  const currentLanguage = () => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return ['pt','en','es'].includes(saved) ? saved : 'pt';
  };

  const formatDate = iso => {
    if (!iso) return '';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatHours = value => {
    const totalMinutes = Math.round((Number(value) || 0) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}h${String(minutes).padStart(2, '0')}` : `${hours}h`;
  };

  const modal = document.getElementById('home-cert-modal');
  const openCertificate = certificate => {
    if (!modal) return;
    const image = document.getElementById('home-cert-modal-image');
    const title = document.getElementById('home-cert-modal-title');
    const meta = document.getElementById('home-cert-modal-meta');
    const original = document.getElementById('home-cert-modal-original');

    image.src = certificate.image.replace(/sz=w\d+/, 'sz=w1600');
    image.alt = `Certificado: ${certificate.title}`;
    title.textContent = certificate.title;
    meta.textContent = [
      certificate.type,
      formatDate(certificate.issued_at),
      certificate.hours ? formatHours(certificate.hours) : null
    ].filter(Boolean).join(' · ');
    original.href = certificate.url;
    original.setAttribute('aria-label', `Abrir certificado original ${certificate.title}, abre em nova aba`);
    modal.showModal();
  };

  const render = () => {
    if (!featured.length) return;

    const lang = currentLanguage();
    grid.replaceChildren();

    featured.forEach((certificate, index) => {
      const article = document.createElement('article');
      article.className = 'featured-cert-card reveal visible spotlight-card';

      const button = document.createElement('button');
      button.className = 'featured-cert-visual';
      button.type = 'button';
      button.dataset.certTitle = certificate.title;
      button.dataset.certUrl = certificate.url;
      button.setAttribute('aria-label', `Ampliar certificado ${certificate.title}`);
      button.addEventListener('click', () => openCertificate(certificate));

      const image = document.createElement('img');
      image.src = certificate.image;
      image.alt = '';
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      button.appendChild(image);

      const body = document.createElement('div');
      body.className = 'featured-cert-body';

      const meta = document.createElement('div');
      meta.className = 'featured-cert-meta';
      const area = document.createElement('span');
      area.textContent = AREA_LABELS[lang]?.[certificate.area] || String(certificate.area || '').toUpperCase();
      const year = document.createElement('span');
      year.textContent = certificate.issued_at?.slice(0, 4) || '';
      meta.append(area, year);

      const title = document.createElement('h3');
      title.textContent = certificate.title;

      const issuer = document.createElement('p');
      issuer.textContent = certificate.issuer || '';

      body.append(meta, title, issuer);
      article.append(button, body);

      article.addEventListener('pointermove', event => {
        const rect = article.getBoundingClientRect();
        article.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        article.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });

      if (index === 1) article.classList.add('delay-1');
      if (index === 2) article.classList.add('delay-2');
      grid.appendChild(article);
    });
  };

  fetch('certificacoes.json', { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error('Falha ao carregar certificações.');
      return response.json();
    })
    .then(data => {
      featured = (Array.isArray(data.certificates) ? data.certificates : [])
        .filter(item => item.featured === true && Number.isInteger(item.featured_order))
        .sort((a, b) => a.featured_order - b.featured_order)
        .slice(0, 3);

      if (featured.length === 3) render();
    })
    .catch(() => {
      // Mantém os três cards estáticos como fallback se o JSON não puder ser carregado.
    });

  document.addEventListener('portfolio:languagechange', render);
})();
