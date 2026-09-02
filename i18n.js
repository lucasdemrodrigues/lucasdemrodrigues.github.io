(() => {
  const STORAGE_KEY = 'portfolio-language';
  const supported = ['pt', 'en', 'es'];
  let currentLang = supported.includes(localStorage.getItem(STORAGE_KEY)) ? localStorage.getItem(STORAGE_KEY) : 'pt';

  const copy = {
    pt: {
      htmlLang: 'pt-BR',
      title: 'Lucas Rodrigues — Marketing, CRM & Dados',
      description: 'Portfólio de Lucas Rodrigues — Marketing, CRM, Inteligência Comercial e Dados.',
      nav: { about:'Sobre', career:'Trajetória', projects:'Projetos', contact:'Contato' },
      eyebrow: 'Inteligência Comercial · CRM · Marketing · Dados',
      tagline: 'Conectando clientes, dados e negócio.',
      viewProjects: 'Ver projetos', contactCta: 'Entrar em contato',
      aboutKicker: 'SOBRE',
      aboutLead: 'Minha experiência profissional foi construída próxima ao cliente e ao negócio, evoluindo de funções comerciais e de relacionamento para uma atuação cada vez mais ligada a indicadores, segmentação e análise.',
      aboutBody: 'Hoje, uso dados para compreender cenários e resultados, identificar oportunidades, melhorar processos e apoiar decisões de negócio, com atuação em campanhas, segmentação, jornadas, indicadores e experiência do cliente.',
      focusKicker: 'FOCO',
      focusTitles: ['CRM & Jornadas','Business Intelligence','Marketing & Mercado'],
      focusBodies: [
        'Segmentação, comunicação e acompanhamento de resultados.',
        'Modelagem de dados, dashboards, indicadores e suporte à tomada de decisão.',
        'Comportamento do consumidor, pesquisa de mercado e performance de campanhas.'
      ],
      tools: 'COMPETÊNCIAS & FERRAMENTAS',
      skills: { 'Análise de Dados':'Análise de Dados', 'Segmentação':'Segmentação' },
      languages: 'IDIOMAS', languageItems: ['Português · Fluente','Inglês · Intermediário','Espanhol · Intermediário'],
      impact: 'IMPACTO PROFISSIONAL',
      metrics: ['Conversão de ofertas com NBO','Tempo de atualização de relatórios','Adesão à solução CoPiloto em um ano','Pontos no NPS PME'],
      metricContext: '54,5 → 63,7 em 6 meses',
      career: 'TRAJETÓRIA', experience: 'EXPERIÊNCIA PROFISSIONAL', education: 'FORMAÇÃO',
      roles: [
        'Estágio Comercial / Marketing B2B / CRM',
        'Analista de Relacionamento com o Cliente',
        'Vendas / Pós-venda',
        'Bacharelado em Marketing',
        'Técnico em Administração'
      ],
      projects: 'PROJETOS',
      filters: { 'Todos':'Todos','Power BI':'Power BI','SQL':'SQL','Excel':'Excel','IA':'IA' },
      filterAria: 'Filtrar projetos por categoria',
      statuses: {
        loading:'Sincronizando projetos com o GitHub...',
        ok:'Projetos sincronizados com o GitHub via API',
        cache:'Projetos exibidos em modo de segurança',
        fallback:'Projetos exibidos em modo de segurança'
      },
      projectLink: 'Ver projeto no GitHub',
      projectNewTab: 'abre em nova aba',
      contact: 'CONTATO', linkedin: 'LINKEDIN', email: 'E-MAIL', copy:'Copiar', copied:'Copiado!',
      copyEmail: 'Copiar e-mail', openLinkedin: 'Abrir perfil de Lucas Rodrigues no LinkedIn',
      footerLocation: 'São Paulo, Brasil',
      themeDark: 'Ativar modo escuro', themeLight: 'Ativar modo claro', themeDarkTitle:'Modo escuro', themeLightTitle:'Modo claro',
      menuOpen:'Abrir menu', menuClose:'Fechar menu'
    },
    en: {
      htmlLang: 'en',
      title: 'Lucas Rodrigues — Marketing, CRM & Data',
      description: 'Lucas Rodrigues portfolio — Marketing, CRM, Commercial Intelligence and Data.',
      nav: { about:'About', career:'Career', projects:'Projects', contact:'Contact' },
      eyebrow: 'Commercial Intelligence · CRM · Marketing · Data',
      tagline: 'Connecting customers, data and business.',
      viewProjects: 'View projects', contactCta: 'Get in touch',
      aboutKicker: 'ABOUT',
      aboutLead: 'My professional experience was built close to customers and the business, evolving from commercial and relationship roles toward work increasingly connected to indicators, segmentation and analysis.',
      aboutBody: 'Today, I use data to understand scenarios and results, identify opportunities, improve processes and support business decisions, working with campaigns, segmentation, journeys, indicators and customer experience.',
      focusKicker: 'FOCUS',
      focusTitles: ['CRM & Journeys','Business Intelligence','Marketing & Market'],
      focusBodies: [
        'Segmentation, communication and performance tracking.',
        'Data modeling, dashboards, indicators and decision-making support.',
        'Consumer behavior, market research and campaign performance.'
      ],
      tools: 'SKILLS & TOOLS',
      skills: { 'Análise de Dados':'Data Analysis', 'Segmentação':'Segmentation' },
      languages: 'LANGUAGES', languageItems: ['Portuguese · Fluent','English · Intermediate','Spanish · Intermediate'],
      impact: 'PROFESSIONAL IMPACT',
      metrics: ['Offer conversion with NBO','Report update time','CoPiloto solution adoption in one year','Points in SME NPS'],
      metricContext: '54.5 → 63.7 in 6 months',
      career: 'CAREER', experience: 'PROFESSIONAL EXPERIENCE', education: 'EDUCATION',
      roles: [
        'Commercial / B2B Marketing / CRM Internship',
        'Customer Relationship Analyst',
        'Sales / After-sales',
        "Bachelor's Degree in Marketing",
        'Technical Degree in Business Administration'
      ],
      projects: 'PROJECTS',
      filters: { 'Todos':'All','Power BI':'Power BI','SQL':'SQL','Excel':'Excel','IA':'AI' },
      filterAria: 'Filter projects by category',
      statuses: {
        loading:'Syncing projects with GitHub...',
        ok:'Projects synced with GitHub via API',
        cache:'Projects displayed in safe mode',
        fallback:'Projects displayed in safe mode'
      },
      projectLink: 'View project on GitHub',
      projectNewTab: 'opens in a new tab',
      contact: 'CONTACT', linkedin: 'LINKEDIN', email: 'EMAIL', copy:'Copy', copied:'Copied!',
      copyEmail: 'Copy email', openLinkedin: 'Open Lucas Rodrigues profile on LinkedIn',
      footerLocation: 'São Paulo, Brazil',
      themeDark: 'Switch to dark mode', themeLight: 'Switch to light mode', themeDarkTitle:'Dark mode', themeLightTitle:'Light mode',
      menuOpen:'Open menu', menuClose:'Close menu'
    },
    es: {
      htmlLang: 'es',
      title: 'Lucas Rodrigues — Marketing, CRM y Datos',
      description: 'Portafolio de Lucas Rodrigues — Marketing, CRM, Inteligencia Comercial y Datos.',
      nav: { about:'Sobre mí', career:'Trayectoria', projects:'Proyectos', contact:'Contacto' },
      eyebrow: 'Inteligencia Comercial · CRM · Marketing · Datos',
      tagline: 'Conectando clientes, datos y negocio.',
      viewProjects: 'Ver proyectos', contactCta: 'Contactar',
      aboutKicker: 'SOBRE MÍ',
      aboutLead: 'Mi experiencia profesional se construyó cerca del cliente y del negocio, evolucionando desde funciones comerciales y de relación hacia una actuación cada vez más vinculada a indicadores, segmentación y análisis.',
      aboutBody: 'Hoy uso datos para comprender escenarios y resultados, identificar oportunidades, mejorar procesos y apoyar decisiones de negocio, con actuación en campañas, segmentación, recorridos, indicadores y experiencia del cliente.',
      focusKicker: 'ENFOQUE',
      focusTitles: ['CRM & Recorridos','Business Intelligence','Marketing & Mercado'],
      focusBodies: [
        'Segmentación, comunicación y seguimiento de resultados.',
        'Modelado de datos, dashboards, indicadores y apoyo a la toma de decisiones.',
        'Comportamiento del consumidor, investigación de mercado y rendimiento de campañas.'
      ],
      tools: 'COMPETENCIAS & HERRAMIENTAS',
      skills: { 'Análise de Dados':'Análisis de Datos', 'Segmentação':'Segmentación' },
      languages: 'IDIOMAS', languageItems: ['Portugués · Fluido','Inglés · Intermedio','Español · Intermedio'],
      impact: 'IMPACTO PROFESIONAL',
      metrics: ['Conversión de ofertas con NBO','Tiempo de actualización de informes','Adopción de la solución CoPiloto en un año','Puntos en el NPS PyME'],
      metricContext: '54,5 → 63,7 en 6 meses',
      career: 'TRAYECTORIA', experience: 'EXPERIENCIA PROFESIONAL', education: 'FORMACIÓN',
      roles: [
        'Prácticas en Comercial / Marketing B2B / CRM',
        'Analista de Relación con el Cliente',
        'Ventas / Posventa',
        'Licenciatura en Marketing',
        'Técnico en Administración'
      ],
      projects: 'PROYECTOS',
      filters: { 'Todos':'Todos','Power BI':'Power BI','SQL':'SQL','Excel':'Excel','IA':'IA' },
      filterAria: 'Filtrar proyectos por categoría',
      statuses: {
        loading:'Sincronizando proyectos con GitHub...',
        ok:'Proyectos sincronizados con GitHub mediante API',
        cache:'Proyectos mostrados en modo seguro',
        fallback:'Proyectos mostrados en modo seguro'
      },
      projectLink: 'Ver proyecto en GitHub',
      projectNewTab: 'se abre en una pestaña nueva',
      contact: 'CONTACTO', linkedin: 'LINKEDIN', email: 'E-MAIL', copy:'Copiar', copied:'¡Copiado!',
      copyEmail: 'Copiar correo electrónico', openLinkedin: 'Abrir el perfil de Lucas Rodrigues en LinkedIn',
      footerLocation: 'São Paulo, Brasil',
      themeDark: 'Activar modo oscuro', themeLight: 'Activar modo claro', themeDarkTitle:'Modo oscuro', themeLightTitle:'Modo claro',
      menuOpen:'Abrir menú', menuClose:'Cerrar menú'
    }
  };

  const projects = {
    'relatorio-de-vendas-power-bi': {
      en: { title:'Sales Report in Power BI', description:'Sales and profitability analysis to identify the best-performing products, segments, countries and periods and support commercial decisions with greater clarity.' },
      es: { title:'Informe de Ventas en Power BI', description:'Análisis de ventas y rentabilidad para identificar los productos, segmentos, países y períodos con mejor desempeño y apoyar decisiones comerciales con mayor claridad.' }
    },
    'open-finance-com-notebooklm': {
      en: { title:'Open Finance in Gemini Notebook', description:'Organization and synthesis of information about Brazilian Open Finance through source curation and prompt engineering, focused on making its main players, opportunities and market impacts easier to understand.' },
      es: { title:'Open Finance en Gemini Notebook', description:'Organización y síntesis de información sobre el Open Finance brasileño mediante curaduría de fuentes e ingeniería de prompts, con foco en facilitar la comprensión de sus principales actores, oportunidades e impactos en el mercado.' }
    }
  };

  const style = document.createElement('style');
  style.textContent = `
    .topbar-controls{display:flex;align-items:center;gap:14px}
    .language-switch{display:inline-flex;align-items:center;gap:6px;color:#747474;font:600 11px "DM Sans",sans-serif;letter-spacing:.04em;white-space:nowrap}
    .language-switch button{appearance:none;border:0;background:transparent;color:inherit;padding:5px 2px;font:inherit;cursor:pointer;position:relative;transition:color .2s ease}
    .language-switch button:hover,.language-switch button:focus-visible{color:#dedede;outline:none}
    .language-switch button[aria-pressed="true"]{color:#f2f2f2}
    .language-switch button[aria-pressed="true"]::after{content:"";position:absolute;left:2px;right:2px;bottom:1px;height:1px;background:currentColor}
    .language-switch i{font-style:normal;color:#444;font-weight:400}
    body.light-mode .language-switch{color:#777}
    body.light-mode .language-switch button:hover,body.light-mode .language-switch button:focus-visible,body.light-mode .language-switch button[aria-pressed="true"]{color:#171717}
    body.light-mode .language-switch i{color:#bbb}
    @media(max-width:620px){.topbar-controls{gap:8px}.language-switch{gap:4px;font-size:10px}.language-switch button{padding-inline:1px}}
  `;
  document.head.appendChild(style);

  const topbar = document.querySelector('.topbar');
  const themeToggle = document.querySelector('.theme-toggle');
  const controls = document.createElement('div');
  controls.className = 'topbar-controls';
  if (topbar) {
    if (themeToggle) topbar.insertBefore(controls, themeToggle);
    else topbar.appendChild(controls);
  }

  const switcher = document.createElement('div');
  switcher.className = 'language-switch';
  switcher.setAttribute('role', 'group');
  switcher.setAttribute('aria-label', 'Language / Idioma');
  ['pt','en','es'].forEach((lang, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.lang = lang;
    button.textContent = lang.toUpperCase();
    button.title = lang === 'pt' ? 'Português' : lang === 'en' ? 'English' : 'Español';
    button.setAttribute('aria-pressed', 'false');
    switcher.appendChild(button);
    if (index < 2) {
      const sep = document.createElement('i');
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '·';
      switcher.appendChild(sep);
    }
  });
  controls.appendChild(switcher);
  if (themeToggle) controls.appendChild(themeToggle);

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
  };
  const setLeadingText = (selector, value) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    const node = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
    if (node) node.nodeValue = `${value} `;
  };

  const translateSkills = lang => {
    document.querySelectorAll('.skills-group span').forEach(el => {
      if (!el.dataset.i18nSkill) el.dataset.i18nSkill = el.textContent.trim();
      const key = el.dataset.i18nSkill;
      el.textContent = copy[lang].skills[key] || key;
    });
  };

  const translateProjects = lang => {
    const c = copy[lang];
    const filters = document.querySelector('.project-filters');
    if (filters) filters.setAttribute('aria-label', c.filterAria);
    document.querySelectorAll('.project-filter').forEach(button => {
      button.textContent = c.filters[button.dataset.filter] || button.dataset.filter;
    });

    const status = document.querySelector('.projects-status');
    const sync = status?.querySelector('.projects-sync');
    if (status && sync) {
      const state = status.dataset.sync || 'ok';
      const dot = sync.querySelector('.projects-sync-dot');
      [...sync.childNodes].filter(n => n !== dot).forEach(n => n.remove());
      sync.append(document.createTextNode(` ${c.statuses[state] || c.statuses.ok}`));
    }

    document.querySelectorAll('#projetos .project-feature').forEach(card => {
      let repo = card.dataset.repo;
      if (!repo) {
        const href = card.querySelector('.text-link')?.getAttribute('href') || '';
        repo = Object.keys(projects).find(name => href.includes(name));
      }
      const project = repo && projects[repo]?.[lang];
      if (project) {
        setTextIn(card, 'h3', project.title);
        setTextIn(card, '.project-info > p', project.description);
        const img = card.querySelector('.project-visual img');
        if (img) img.alt = lang === 'en' ? `Preview of the ${project.title} project` : lang === 'es' ? `Vista previa del proyecto ${project.title}` : img.alt;
      }
      const link = card.querySelector('.text-link');
      if (link) {
        setLeadingText(link, c.projectLink);
        const title = card.querySelector('h3')?.textContent.trim() || '';
        link.setAttribute('aria-label', `${c.projectLink}: ${title}, ${c.projectNewTab}`);
      }
      card.querySelectorAll('.project-tags span').forEach(tag => {
        const raw = tag.dataset.i18nTag || tag.textContent.trim();
        tag.dataset.i18nTag = raw;
        if (raw === 'Pesquisa') tag.textContent = lang === 'en' ? 'Research' : lang === 'es' ? 'Investigación' : 'Pesquisa';
      });
    });
  };

  const setTextIn = (root, selector, value) => {
    const el = root?.querySelector(selector);
    if (el && value != null) el.textContent = value;
  };

  const syncThemeLabels = lang => {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    const isLight = document.body.classList.contains('light-mode');
    button.setAttribute('aria-label', isLight ? copy[lang].themeDark : copy[lang].themeLight);
    button.setAttribute('title', isLight ? copy[lang].themeDarkTitle : copy[lang].themeLightTitle);
  };

  const applyLanguage = lang => {
    if (!supported.includes(lang)) lang = 'pt';
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    const c = copy[lang];
    document.documentElement.lang = c.htmlLang;
    document.title = c.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', c.description);

    setText('#main-nav a[href="#sobre"]', c.nav.about);
    setText('#main-nav a[href="#trajetoria"]', c.nav.career);
    setText('#main-nav a[href="#projetos"]', c.nav.projects);
    setText('#main-nav a[href="#contato"]', c.nav.contact);
    setText('.eyebrow', c.eyebrow);
    const dot = document.createElement('span'); dot.className = 'status-dot';
    const eyebrow = document.querySelector('.eyebrow'); if (eyebrow) eyebrow.prepend(dot);
    setText('.hero-tagline', c.tagline);
    setLeadingText('.hero-actions .button.primary', c.viewProjects);
    setLeadingText('.hero-actions .button.ghost', c.contactCta);

    setText('#sobre .section-kicker', c.aboutKicker);
    setText('#sobre .about-copy .lead', c.aboutLead);
    setText('#sobre .about-copy p:not(.lead)', c.aboutBody);

    setText('.focus-strip-label', c.focusKicker);
    document.querySelectorAll('.focus-grid .signal-card').forEach((card, i) => {
      const strong = card.querySelector('strong');
      if (strong) strong.textContent = c.focusTitles[i];
      setTextIn(card, 'p', c.focusBodies[i]);
    });
    setText('.tool-label', c.tools);
    translateSkills(lang);
    setText('.languages-inline strong', c.languages);
    document.querySelectorAll('.languages-inline span').forEach((el, i) => { if (c.languageItems[i]) el.textContent = c.languageItems[i]; });

    const impactKicker = [...document.querySelectorAll('#impacto > .section-kicker')][0];
    if (impactKicker) impactKicker.textContent = c.impact;
    document.querySelectorAll('.metrics-grid .metric').forEach((metric, i) => {
      const p = metric.querySelector('.metric-copy p') || metric.querySelector('p');
      if (p && c.metrics[i]) p.textContent = c.metrics[i];
    });
    setText('.metric-context', c.metricContext);

    setText('#trajetoria .section-kicker', c.career);
    const colTitles = document.querySelectorAll('.career-column-title');
    if (colTitles[0]) colTitles[0].textContent = c.experience;
    if (colTitles[1]) colTitles[1].textContent = c.education;
    const roles = document.querySelectorAll('.career-role');
    c.roles.forEach((value, i) => { if (roles[i]) roles[i].textContent = value; });

    setText('#projetos .section-kicker', c.projects);
    translateProjects(lang);

    setText('#contato .section-kicker', c.contact);
    const labels = document.querySelectorAll('.contact-card-label');
    if (labels[0]) labels[0].textContent = c.linkedin;
    if (labels[1]) labels[1].textContent = c.email;
    const linkedin = document.querySelector('#contato a.contact-card');
    if (linkedin) linkedin.setAttribute('aria-label', `${c.openLinkedin}, ${c.projectNewTab}`);
    const emailCard = document.querySelector('.email-card');
    if (emailCard) emailCard.setAttribute('aria-label', `${c.copyEmail} lucasdemrodrigues@gmail.com`);
    const copyLabel = document.querySelector('.copy-label');
    if (copyLabel && !document.querySelector('.copy-email')?.classList.contains('copied')) copyLabel.textContent = c.copy;

    const footerSpans = document.querySelectorAll('footer > span');
    if (footerSpans[1]) footerSpans[1].textContent = c.footerLocation;
    syncThemeLabels(lang);

    const menuButton = document.querySelector('.menu-toggle');
    if (menuButton) menuButton.setAttribute('aria-label', menuButton.getAttribute('aria-expanded') === 'true' ? c.menuClose : c.menuOpen);

    switcher.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
    document.dispatchEvent(new CustomEvent('portfolio:languagechange', { detail:{ lang } }));
  };

  switcher.addEventListener('click', event => {
    const button = event.target.closest('button[data-lang]');
    if (button) applyLanguage(button.dataset.lang);
  });

  // Mantém textos dinâmicos da galeria sincronizados após respostas da API/cache.
  const projectSection = document.querySelector('#projetos');
  if (projectSection) {
    let scheduled = false;
    new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        translateProjects(currentLang);
      });
    }).observe(projectSection, { childList:true, subtree:true });
  }

  // Corrige labels criados pelo script principal depois de troca de idioma.
  document.addEventListener('click', event => {
    if (event.target.closest('.theme-toggle')) setTimeout(() => syncThemeLabels(currentLang), 0);
    if (event.target.closest('.email-card')) {
      const label = document.querySelector('.copy-label');
      if (label) {
        setTimeout(() => {
          if (document.querySelector('.copy-email')?.classList.contains('copied')) label.textContent = copy[currentLang].copied;
        }, 0);
        setTimeout(() => { if (label) label.textContent = copy[currentLang].copy; }, 2100);
      }
    }
  });

  applyLanguage(currentLang);
})();