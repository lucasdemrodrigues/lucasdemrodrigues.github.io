(() => {
  const DATA_URL = 'certificacoes.json';
  const INITIAL_VISIBLE_COUNT = 9;

  const LANGUAGE_KEY = 'portfolio-language';
  const SUPPORTED_LANGUAGES = ['pt','en','es'];
  let language = SUPPORTED_LANGUAGES.includes(localStorage.getItem(LANGUAGE_KEY))
    ? localStorage.getItem(LANGUAGE_KEY)
    : 'pt';

  const UI = {
    pt:{
      html:'pt-BR',
      pageTitle:'Certificações — Lucas Rodrigues',
      description:'Certificações de Lucas Rodrigues em dados, BI, IA, CRM e marketing.',
      back:'← Portfólio', title:'Certificações', status:'Em evolução',
      summaryCertifications:'Certificações', summaryHours:'Carga horária', summaryAreas:'Áreas profissionais',
      areasTitle:'Áreas profissionais', areasByHours:'Por carga horária', modality:'Modalidade',
      online:'Online', onsite:'Presencial', hybrid:'Híbrido',
      modalityNote1:'Por número de certificações.', modalityNote2:'Inclui todos os certificados.',
      filterArea:'Filtrar por área', filterCollection:'Filtrar por coleção', allCollections:'Todas as coleções',
      standalone:'Certificações avulsas', sort:'Ordenar', newest:'Mais recentes primeiro', oldest:'Mais antigos primeiro',
      resultSingular:'certificado', resultPlural:'certificados', hoursLabel:'de carga horária',
      showAll:'Mostrar todas as certificações ↓', showLess:'Mostrar menos ↑',
      empty:'Nenhuma certificação encontrada neste filtro.', loadError:'Não foi possível carregar os certificados agora.',
      openOriginal:'Abrir original', close:'Fechar certificado', footer:'São Paulo, Brasil',
      themeDark:'Ativar modo escuro', themeLight:'Ativar modo claro', darkTitle:'Modo escuro', lightTitle:'Modo claro',
      enlarge:'Ampliar certificado', originalAria:'Abrir certificado original', newTab:'se abre en una pestaña nueva',
      summaryAria:'Resumen de certificaciones', filterAria:'Filtros de certificaciones', modalityAria:'Distribución de modalidad por número de certificaciones', newTab:'abre em nova aba',
      summaryAria:'Resumo das certificações', filterAria:'Filtros de certificações', modalityAria:'Distribuição da modalidade por número de certificações',
      areas:{
        all:'Todos',
        'Dados & BI':'Dados & BI',
        'Marketing & CRM':'Marketing & CRM',
        'IA & Tecnologia':'IA & Tecnologia',
        'Gestão & Negócios':'Gestão & Negócios',
        'Carreira & Desenvolvimento':'Carreira & Desenvolvimento',
        'Outros interesses':'Outros interesses'
      },
      types:{Curso:'Curso',Projeto:'Projeto','Módulo':'Módulo','Imersão':'Imersão',LIVE:'LIVE',Mentoria:'Mentoria',Certificado:'Certificado'}
    },
    en:{
      html:'en',
      pageTitle:'Certifications — Lucas Rodrigues',
      description:'Lucas Rodrigues certifications in data, BI, AI, CRM and marketing.',
      back:'← Portfolio', title:'Certifications', status:'In progress',
      summaryCertifications:'Certifications', summaryHours:'Training hours', summaryAreas:'Professional areas',
      areasTitle:'Professional areas', areasByHours:'By training hours', modality:'Format',
      online:'Online', onsite:'In person', hybrid:'Hybrid',
      modalityNote1:'By number of certifications.', modalityNote2:'Includes all certificates.',
      filterArea:'Filter by area', filterCollection:'Filter by collection', allCollections:'All collections',
      standalone:'Standalone certifications', sort:'Sort', newest:'Newest first', oldest:'Oldest first',
      resultSingular:'certificate', resultPlural:'certificates', hoursLabel:'of training',
      showAll:'Show all certifications ↓', showLess:'Show less ↑',
      empty:'No certifications found for this filter.', loadError:'Certifications could not be loaded right now.',
      openOriginal:'Open original', close:'Close certificate', footer:'São Paulo, Brazil',
      themeDark:'Switch to dark mode', themeLight:'Switch to light mode', darkTitle:'Dark mode', lightTitle:'Light mode',
      enlarge:'Enlarge certificate', originalAria:'Open original certificate', newTab:'opens in a new tab',
      summaryAria:'Certifications summary', filterAria:'Certification filters', modalityAria:'Certification format distribution by number of certificates',
      areas:{
        all:'All',
        'Dados & BI':'Data & BI',
        'Marketing & CRM':'Marketing & CRM',
        'IA & Tecnologia':'AI & Technology',
        'Gestão & Negócios':'Management & Business',
        'Carreira & Desenvolvimento':'Career & Development',
        'Outros interesses':'Other interests'
      },
      types:{Curso:'Course',Projeto:'Project','Módulo':'Module','Imersão':'Immersion',LIVE:'LIVE',Mentoria:'Mentoring',Certificado:'Certificate'}
    },
    es:{
      html:'es',
      pageTitle:'Certificaciones — Lucas Rodrigues',
      description:'Certificaciones de Lucas Rodrigues en datos, BI, IA, CRM y marketing.',
      back:'← Portafolio', title:'Certificaciones', status:'En evolución',
      summaryCertifications:'Certificaciones', summaryHours:'Carga horaria', summaryAreas:'Áreas profesionales',
      areasTitle:'Áreas profesionales', areasByHours:'Por carga horaria', modality:'Modalidad',
      online:'Online', onsite:'Presencial', hybrid:'Híbrido',
      modalityNote1:'Por número de certificaciones.', modalityNote2:'Incluye todos los certificados.',
      filterArea:'Filtrar por área', filterCollection:'Filtrar por colección', allCollections:'Todas las colecciones',
      standalone:'Certificaciones independientes', sort:'Ordenar', newest:'Más recientes primero', oldest:'Más antiguas primero',
      resultSingular:'certificado', resultPlural:'certificados', hoursLabel:'de carga horaria',
      showAll:'Mostrar todas las certificaciones ↓', showLess:'Mostrar menos ↑',
      empty:'No se encontraron certificaciones con este filtro.', loadError:'No fue posible cargar las certificaciones ahora.',
      openOriginal:'Abrir original', close:'Cerrar certificado', footer:'São Paulo, Brasil',
      themeDark:'Activar modo oscuro', themeLight:'Activar modo claro', darkTitle:'Modo oscuro', lightTitle:'Modo claro',
      enlarge:'Ampliar certificado', originalAria:'Abrir certificado original',
      areas:{
        all:'Todos',
        'Dados & BI':'Datos & BI',
        'Marketing & CRM':'Marketing & CRM',
        'IA & Tecnologia':'IA & Tecnología',
        'Gestão & Negócios':'Gestión & Negocios',
        'Carreira & Desenvolvimento':'Carrera & Desarrollo',
        'Outros interesses':'Otros intereses'
      },
      types:{Curso:'Curso',Projeto:'Proyecto','Módulo':'Módulo','Imersão':'Inmersión',LIVE:'LIVE',Mentoria:'Mentoría',Certificado:'Certificado'}
    }
  };

  const PROFESSIONAL_AREAS = new Set([
    'Dados & BI',
    'Marketing & CRM',
    'IA & Tecnologia',
    'Gestão & Negócios',
    'Carreira & Desenvolvimento'
  ]);

  const catalog = document.getElementById('cert-catalog');
  const order = document.getElementById('cert-order');
  const collectionFilter = document.getElementById('collection-filter');
  const areaFilters = [...document.querySelectorAll('[data-area]')];
  const modal = document.getElementById('cert-modal');
  const modalImage = document.getElementById('cert-modal-image');
  const modalTitle = document.getElementById('cert-modal-title');
  const modalMeta = document.getElementById('cert-modal-meta');
  const modalOriginal = document.getElementById('cert-modal-original');
  const closeModal = document.querySelector('.cert-modal-close');
  const themeButton = document.querySelector('.cert-theme');
  const areasToggle = document.getElementById('areas-toggle');
  const areasPopover = document.getElementById('areas-popover');
  const areasBreakdown = document.getElementById('areas-breakdown');
  const areasWrap = document.querySelector('.cert-summary-area-wrap');
  const languageButtons = [...document.querySelectorAll('.cert-language-switch [data-lang]')];

  document.getElementById('year').textContent = new Date().getFullYear();

  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') document.body.classList.add('light-mode');

  const syncTheme = () => {
    const light = document.body.classList.contains('light-mode');
    const c = UI[language];
    themeButton.textContent = light ? '☾' : '☀';
    themeButton.setAttribute('aria-label', light ? c.themeDark : c.themeLight);
    themeButton.title = light ? c.darkTitle : c.lightTitle;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f4f2ed' : '#000000');
  };

  syncTheme();
  themeButton.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('portfolio-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    syncTheme();
  });


  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
  };

  const translateStaticInterface = () => {
    const c = UI[language];
    document.documentElement.lang = c.html;
    document.title = c.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', c.description);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (c[key] != null) el.textContent = c[key];
    });

    document.querySelectorAll('[data-i18n-area]').forEach(el => {
      el.textContent = c.areas[el.dataset.i18nArea] || el.dataset.i18nArea;
    });

    const allCollectionsOption = document.querySelector('[data-i18n="allCollections"]');
    if (allCollectionsOption) allCollectionsOption.textContent = c.allCollections;
    setText('[data-i18n="openOriginal"]', c.openOriginal);
    closeModal?.setAttribute('aria-label', c.close);
    document.querySelector('.cert-brand')?.setAttribute('aria-label', c.back.replace('← ', '') + ' — Lucas Rodrigues');
    document.querySelector('.cert-summary')?.setAttribute('aria-label', c.summaryAria);
    document.querySelector('.cert-filter-panel')?.setAttribute('aria-label', c.filterAria);
    document.querySelector('.cert-summary-area')?.setAttribute('aria-label', c.summaryAreas);
    document.querySelector('.cert-area-popover')?.setAttribute('aria-label', c.areasTitle);
    document.querySelector('.cert-modality-breakdown')?.setAttribute('aria-label', c.modalityAria);

    languageButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === language));
    });

    syncTheme();
  };

  const applyLanguage = nextLanguage => {
    language = SUPPORTED_LANGUAGES.includes(nextLanguage) ? nextLanguage : 'pt';
    localStorage.setItem(LANGUAGE_KEY, language);
    translateStaticInterface();

    // Se os dados já carregaram, atualiza também os textos gerados dinamicamente.
    if (certificates.length || collections.length) {
      populateCollectionFilter(true);
      renderSummary();
      renderCatalog();
    }

    document.dispatchEvent(new CustomEvent('portfolio:languagechange',{detail:{lang:language}}));
  };



  // Mantém a página de certificações com o mesmo cursor personalizado da home.
  const certFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const certReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (certFinePointer) {
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

    const setCursorVisible = visible => {
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
      setCursorVisible(true);
    });

    document.addEventListener('pointerover', event => {
      const interactive = event.target.closest('a,button,[role="button"],select,input,textarea');
      customCursorRing.classList.toggle('is-interactive', Boolean(interactive));
    });

    document.addEventListener('pointerout', event => {
      if (!event.relatedTarget) setCursorVisible(false);
    });

    document.addEventListener('pointerdown', () => customCursorRing.classList.add('is-clicking'));
    document.addEventListener('pointerup', () => customCursorRing.classList.remove('is-clicking'));

    const animateCursor = () => {
      const follow = certReducedMotion ? 1 : 0.16;
      ringX += (mouseX - ringX) * follow;
      ringY += (mouseY - ringY) * follow;
      customCursorRing.style.left = `${ringX}px`;
      customCursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(animateCursor);
    };

    animateCursor();
  }

  let certificates = [];
  let collections = [];
  let activeArea = 'all';
  let areasPinned = false;
  let showAllDefault = false;
  let lastCertificateTrigger = null;

  const formatDate = iso => {
    if (!iso) return '';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  };

  const sumHours = items => items
    .filter(item => item.count_hours !== false)
    .reduce((sum, item) => sum + (Number(item.hours) || 0), 0);

  const formatHours = value => {
    const totalMinutes = Math.round((Number(value) || 0) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}h${String(minutes).padStart(2, '0')}` : `${hours}h`;
  };

  const percentage = (value, total) => total > 0 ? Math.round((value / total) * 100) : 0;

  const sortCertificates = items => [...items].sort((a, b) => {
    const direction = order.value === 'desc' ? -1 : 1;
    const dateCompare = (a.issued_at || '').localeCompare(b.issued_at || '');
    if (dateCompare !== 0) return dateCompare * direction;
    return (a.sequence || 0) - (b.sequence || 0);
  });

  const setActiveArea = area => {
    activeArea = area;
    areaFilters.forEach(button => {
      const active = button.dataset.area === area;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  const getFilteredCertificates = () => certificates.filter(certificate => {
    const selectedCollection = collectionFilter.value;

    if (selectedCollection !== 'all') {
      return selectedCollection === 'standalone'
        ? !certificate.collection_id
        : certificate.collection_id === selectedCollection;
    }

    return !activeArea || activeArea === 'all' || certificate.area === activeArea;
  });

  const isDefaultView = () => collectionFilter.value === 'all' && activeArea === 'all';

  const setAreasPopover = open => {
    if (!areasToggle || !areasPopover) return;
    areasPopover.hidden = !open;
    areasToggle.setAttribute('aria-expanded', String(open));
  };

  const renderSummary = () => {
    const counted = certificates.filter(item => item.count_hours !== false);
    const totalHours = sumHours(certificates);
    const areaHours = new Map();
    const modalityCounts = new Map();

    counted.forEach(certificate => {
      if (certificate.area && PROFESSIONAL_AREAS.has(certificate.area)) {
        areaHours.set(certificate.area, (areaHours.get(certificate.area) || 0) + (Number(certificate.hours) || 0));
      }
    });

    certificates.forEach(certificate => {
      if (!certificate.modality) return;
      const key = certificate.modality.toLowerCase();
      modalityCounts.set(key, (modalityCounts.get(key) || 0) + 1);
    });

    const areas = [...areaHours.entries()]
      .map(([name, hours]) => ({name, hours}))
      .sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name));
    const professionalHours = areas.reduce((sum, area) => sum + area.hours, 0);

    document.getElementById('cert-count').textContent = certificates.length;
    document.getElementById('cert-hours').textContent = formatHours(totalHours);
    document.getElementById('cert-area-count').textContent = areas.length;

    if (areasBreakdown) {
      areasBreakdown.innerHTML = areas.map(area => {
        const value = percentage(area.hours, professionalHours);
        return `
          <div class="cert-area-row">
            <div><span>${UI[language].areas[area.name] || area.name}</span><strong>${value}%</strong></div>
            <span class="cert-area-track" aria-hidden="true"><i style="width:${value}%"></i></span>
          </div>`;
      }).join('');
    }

    const modalityTotal = [...modalityCounts.values()].reduce((sum, value) => sum + value, 0);
    document.getElementById('modality-online').textContent = `${percentage(modalityCounts.get('online') || 0, modalityTotal)}%`;
    document.getElementById('modality-presencial').textContent = `${percentage(modalityCounts.get('presencial') || 0, modalityTotal)}%`;
    document.getElementById('modality-hibrido').textContent = `${percentage(modalityCounts.get('híbrido') || modalityCounts.get('hibrido') || 0, modalityTotal)}%`;
  };

  const openCertificate = (certificate, trigger) => {
    lastCertificateTrigger = trigger || document.activeElement;
    modalImage.src = certificate.image;
    modalImage.alt = `Certificado: ${certificate.title}`;
    modalTitle.textContent = certificate.title;
    modalOriginal.href = certificate.url;
    modalOriginal.setAttribute('aria-label', `${UI[language].originalAria}: ${certificate.title}, ${UI[language].newTab}`);
    const meta = [UI[language].types[certificate.type] || certificate.type, formatDate(certificate.issued_at), certificate.hours ? formatHours(certificate.hours) : null]
      .filter(Boolean)
      .join(' · ');
    modalMeta.textContent = meta;
    const cursorRing = document.querySelector('.custom-cursor-ring');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    if (cursorRing && cursorDot) modal.append(cursorRing, cursorDot);
    modal.showModal();
  };

  const createCard = certificate => {
    const card = document.createElement('article');
    card.className = 'cert-card';

    const hoursTag = certificate.hours ? `<span>${formatHours(certificate.hours)}</span>` : '';
    const issuerTag = certificate.issuer ? `<span>${certificate.issuer}</span>` : '';
    const areaTag = certificate.area ? `<span>${UI[language].areas[certificate.area] || certificate.area}</span>` : '';

    card.innerHTML = `
      <button class="cert-image-button" type="button" aria-label="${UI[language].enlarge}: ${certificate.title}">
        <img src="${certificate.image}" alt="" loading="lazy" referrerpolicy="no-referrer" />
      </button>
      <div class="cert-card-body">
        <div class="cert-meta"><span>${UI[language].types[certificate.type || 'Certificado'] || certificate.type || UI[language].types.Certificado}</span><span>${formatDate(certificate.issued_at)}</span></div>
        <h3>${certificate.title}</h3>
        <div class="cert-details">${hoursTag}${issuerTag}${areaTag}</div>
      </div>`;

    const imageButton = card.querySelector('.cert-image-button');
    imageButton.addEventListener('click', () => openCertificate(certificate, imageButton));
    return card;
  };

  const renderCatalog = () => {
    const filtered = getFilteredCertificates();
    const sorted = sortCertificates(filtered);
    const defaultView = isDefaultView();
    const visible = defaultView && !showAllDefault
      ? sorted.slice(0, INITIAL_VISIBLE_COUNT)
      : sorted;

    catalog.innerHTML = '';

    document.getElementById('visible-count').textContent = filtered.length;
    document.getElementById('visible-hours').textContent = formatHours(sumHours(filtered));
    const toolbarText = document.querySelector('.cert-toolbar p');
    if (toolbarText) {
      const noun = filtered.length === 1 ? UI[language].resultSingular : UI[language].resultPlural;
      toolbarText.innerHTML = `<span id="visible-count">${filtered.length}</span> ${noun} · <span id="visible-hours">${formatHours(sumHours(filtered))}</span> ${UI[language].hoursLabel}`;
    }

    if (!filtered.length) {
      catalog.innerHTML = `<p class="cert-empty">${UI[language].empty}</p>`;
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'cert-grid';
    visible.forEach(certificate => grid.appendChild(createCard(certificate)));
    catalog.appendChild(grid);

    if (defaultView && filtered.length > INITIAL_VISIBLE_COUNT) {
      const revealWrap = document.createElement('div');
      revealWrap.className = 'cert-reveal-wrap';

      const revealButton = document.createElement('button');
      revealButton.className = 'cert-reveal';
      revealButton.type = 'button';
      revealButton.textContent = showAllDefault ? UI[language].showLess : UI[language].showAll;
      revealButton.setAttribute('aria-expanded', String(showAllDefault));
      revealButton.addEventListener('click', () => {
        showAllDefault = !showAllDefault;
        renderCatalog();
        if (!showAllDefault) catalog.scrollIntoView({behavior:'smooth', block:'start'});
      });

      revealWrap.appendChild(revealButton);
      catalog.appendChild(revealWrap);
    }
  };

  const populateCollectionFilter = (preserveSelection = false) => {
    const selected = preserveSelection ? collectionFilter.value : 'all';
    collectionFilter.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = UI[language].allCollections;
    collectionFilter.appendChild(allOption);

    [...collections]
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
      .forEach(collection => {
        const option = document.createElement('option');
        option.value = collection.id;
        option.textContent = collection.title;
        collectionFilter.appendChild(option);
      });

    if (certificates.some(certificate => !certificate.collection_id)) {
      const option = document.createElement('option');
      option.value = 'standalone';
      option.textContent = UI[language].standalone;
      collectionFilter.appendChild(option);
    }

    if (preserveSelection && [...collectionFilter.options].some(option => option.value === selected)) {
      collectionFilter.value = selected;
    }
  };

  const syncAreaFilters = () => {
    const availableAreas = new Set(certificates.map(certificate => certificate.area).filter(Boolean));
    areaFilters.forEach(button => {
      if (button.dataset.area === 'all') return;
      button.disabled = !availableAreas.has(button.dataset.area);
    });
  };

  order.addEventListener('change', renderCatalog);

  collectionFilter.addEventListener('change', () => {
    setActiveArea(collectionFilter.value === 'all' ? 'all' : null);
    showAllDefault = false;
    renderCatalog();
  });

  areaFilters.forEach(button => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      collectionFilter.value = 'all';
      setActiveArea(button.dataset.area);
      showAllDefault = false;
      renderCatalog();
    });
  });

  const restoreCertCursor = () => {
    const cursorRing = modal.querySelector('.custom-cursor-ring');
    const cursorDot = modal.querySelector('.custom-cursor-dot');
    if (cursorRing && cursorDot) document.body.append(cursorRing, cursorDot);
    if (lastCertificateTrigger instanceof HTMLElement && document.contains(lastCertificateTrigger)) {
      lastCertificateTrigger.focus();
    }
    lastCertificateTrigger = null;
  };

  closeModal.addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.close();
  });
  modal.addEventListener('close', restoreCertCursor);

  if (areasToggle && areasPopover && areasWrap) {
    areasToggle.addEventListener('click', () => {
      areasPinned = !areasPinned;
      setAreasPopover(areasPinned);
    });

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      areasWrap.addEventListener('mouseenter', () => setAreasPopover(true));
      areasWrap.addEventListener('mouseleave', () => {
        if (!areasPinned) setAreasPopover(false);
      });
    }

    document.addEventListener('click', event => {
      if (!areasPinned || areasWrap.contains(event.target)) return;
      areasPinned = false;
      setAreasPopover(false);
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || areasPopover.hidden) return;
      areasPinned = false;
      setAreasPopover(false);
      areasToggle.focus();
    });
  }

  const languageSwitch = document.querySelector('.cert-language-switch');
  languageSwitch?.addEventListener('click', event => {
    const button = event.target.closest('button[data-lang]');
    if (!button) return;
    event.preventDefault();
    applyLanguage(button.dataset.lang);
  });

  translateStaticInterface();

  fetch(DATA_URL)
    .then(response => {
      if (!response.ok) throw new Error('Falha ao carregar certificações.');
      return response.json();
    })
    .then(data => {
      collections = Array.isArray(data.collections) ? data.collections : [];
      certificates = Array.isArray(data.certificates) ? data.certificates : [];
      translateStaticInterface();
      populateCollectionFilter();
      syncAreaFilters();
      renderSummary();
      renderCatalog();
    })
    .catch(() => {
      catalog.innerHTML = `<p class="cert-empty">${UI[language].loadError}</p>`;
    });
})();
