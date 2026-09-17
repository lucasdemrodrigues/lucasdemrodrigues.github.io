(() => {
  const DATA_URL = 'certificacoes.json';
  const catalog = document.getElementById('cert-catalog');
  const order = document.getElementById('cert-order');
  const collectionFilter = document.getElementById('collection-filter');
  const areaFilters = [...document.querySelectorAll('[data-area]')];
  const modal = document.getElementById('cert-modal');
  const modalImage = document.getElementById('cert-modal-image');
  const modalTitle = document.getElementById('cert-modal-title');
  const modalMeta = document.getElementById('cert-modal-meta');
  const closeModal = document.querySelector('.cert-modal-close');
  const themeButton = document.querySelector('.cert-theme');
  const areasToggle = document.getElementById('areas-toggle');
  const areasPopover = document.getElementById('areas-popover');
  const areasBreakdown = document.getElementById('areas-breakdown');
  const areasWrap = document.querySelector('.cert-summary-area-wrap');

  document.getElementById('year').textContent = new Date().getFullYear();

  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') document.body.classList.add('light-mode');

  const syncTheme = () => {
    const light = document.body.classList.contains('light-mode');
    themeButton.textContent = light ? '☾' : '☀';
    themeButton.setAttribute('aria-label', light ? 'Ativar modo escuro' : 'Ativar modo claro');
    themeButton.title = light ? 'Modo escuro' : 'Modo claro';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f4f2ed' : '#000000');
  };

  syncTheme();
  themeButton.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('portfolio-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    syncTheme();
  });

  let certificates = [];
  let collections = [];
  let activeArea = 'all';
  let areasPinned = false;

  const formatDate = iso => {
    if (!iso) return '';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  };

  const sumHours = items => items
    .filter(item => item.count_hours !== false)
    .reduce((sum, item) => sum + (Number(item.hours) || 0), 0);

  const percentage = (value, total) => total > 0 ? Math.round((value / total) * 100) : 0;

  const sortCertificates = items => [...items].sort((a, b) => {
    const direction = order.value === 'desc' ? -1 : 1;
    const dateCompare = (a.issued_at || '').localeCompare(b.issued_at || '');
    if (dateCompare !== 0) return dateCompare * direction;
    return ((a.sequence || 0) - (b.sequence || 0)) * direction;
  });

  const getCollection = id => collections.find(item => item.id === id);

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

    return activeArea === 'all' || certificate.area === activeArea;
  });

  const setAreasPopover = open => {
    if (!areasToggle || !areasPopover) return;
    areasPopover.hidden = !open;
    areasToggle.setAttribute('aria-expanded', String(open));
  };

  const renderSummary = () => {
    const counted = certificates.filter(item => item.count_hours !== false);
    const totalHours = sumHours(certificates);
    const areaHours = new Map();
    const modalityHours = new Map();

    counted.forEach(certificate => {
      if (certificate.area) {
        areaHours.set(certificate.area, (areaHours.get(certificate.area) || 0) + (Number(certificate.hours) || 0));
      }
      if (certificate.modality) {
        const key = certificate.modality.toLowerCase();
        modalityHours.set(key, (modalityHours.get(key) || 0) + (Number(certificate.hours) || 0));
      }
    });

    const areas = [...areaHours.entries()]
      .map(([name, hours]) => ({name, hours}))
      .sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name));

    document.getElementById('cert-count').textContent = certificates.length;
    document.getElementById('cert-hours').textContent = `${totalHours}h`;
    document.getElementById('cert-area-count').textContent = areas.length;

    if (areasBreakdown) {
      areasBreakdown.innerHTML = areas.map(area => {
        const value = percentage(area.hours, totalHours);
        return `
          <div class="cert-area-row">
            <div><span>${area.name}</span><strong>${value}%</strong></div>
            <span class="cert-area-track" aria-hidden="true"><i style="width:${value}%"></i></span>
          </div>`;
      }).join('');
    }

    const modalityTotal = [...modalityHours.values()].reduce((sum, value) => sum + value, 0);
    document.getElementById('modality-online').textContent = `${percentage(modalityHours.get('online') || 0, modalityTotal)}%`;
    document.getElementById('modality-presencial').textContent = `${percentage(modalityHours.get('presencial') || 0, modalityTotal)}%`;
    document.getElementById('modality-hibrido').textContent = `${percentage(modalityHours.get('híbrido') || modalityHours.get('hibrido') || 0, modalityTotal)}%`;
  };

  const openCertificate = certificate => {
    modalImage.src = certificate.image;
    modalImage.alt = `Certificado: ${certificate.title}`;
    modalTitle.textContent = certificate.title;
    const meta = [certificate.type, formatDate(certificate.issued_at), certificate.hours ? `${certificate.hours}h` : null]
      .filter(Boolean)
      .join(' · ');
    modalMeta.textContent = meta;
    modal.showModal();
  };

  const createCard = certificate => {
    const collection = getCollection(certificate.collection_id);
    const showIssuer = collection?.show_issuer !== false;
    const card = document.createElement('article');
    card.className = 'cert-card';

    const hoursTag = certificate.hours ? `<span>${certificate.hours}h</span>` : '';
    const issuerTag = showIssuer && certificate.issuer ? `<span>${certificate.issuer}</span>` : '';
    const areaTag = showIssuer && certificate.area ? `<span>${certificate.area}</span>` : '';

    card.innerHTML = `
      <button class="cert-image-button" type="button" aria-label="Ampliar certificado ${certificate.title}">
        <img src="${certificate.image}" alt="" loading="lazy" referrerpolicy="no-referrer" />
      </button>
      <div class="cert-card-body">
        <div class="cert-meta"><span>${certificate.type || 'Certificado'}</span><span>${formatDate(certificate.issued_at)}</span></div>
        <h3>${certificate.title}</h3>
        <div class="cert-details">${hoursTag}${issuerTag}${areaTag}</div>
        <a class="cert-view" href="${certificate.url}" target="_blank" rel="noreferrer" aria-label="Abrir certificado ${certificate.title} no Google Drive, abre em nova aba">Ver certificado <b>↗</b></a>
      </div>`;

    card.querySelector('.cert-image-button').addEventListener('click', () => openCertificate(certificate));
    return card;
  };

  const createGroup = (title, kicker, items) => {
    const group = document.createElement('section');
    group.className = 'cert-catalog-group';

    const header = document.createElement('div');
    header.className = 'cert-section-head';
    header.innerHTML = `
      <div>
        <p class="cert-kicker">${kicker}</p>
        <h2>${title}</h2>
      </div>`;

    const grid = document.createElement('div');
    grid.className = 'cert-grid';
    sortCertificates(items).forEach(certificate => grid.appendChild(createCard(certificate)));

    group.append(header, grid);
    return group;
  };

  const renderCatalog = () => {
    const filtered = getFilteredCertificates();
    catalog.innerHTML = '';

    document.getElementById('visible-count').textContent = filtered.length;
    document.getElementById('visible-hours').textContent = sumHours(filtered);

    if (!filtered.length) {
      catalog.innerHTML = '<p class="cert-empty">Nenhuma certificação encontrada neste filtro.</p>';
      return;
    }

    collections.forEach(collection => {
      const items = filtered.filter(certificate => certificate.collection_id === collection.id);
      if (items.length) catalog.appendChild(createGroup(collection.title, 'Coleção', items));
    });

    const standalone = filtered.filter(certificate => !certificate.collection_id);
    if (standalone.length) catalog.appendChild(createGroup('Outras certificações', 'Certificações', standalone));
  };

  const populateCollectionFilter = () => {
    collections.forEach(collection => {
      const option = document.createElement('option');
      option.value = collection.id;
      option.textContent = collection.title;
      collectionFilter.appendChild(option);
    });

    if (certificates.some(certificate => !certificate.collection_id)) {
      const option = document.createElement('option');
      option.value = 'standalone';
      option.textContent = 'Sem coleção';
      collectionFilter.appendChild(option);
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
    if (collectionFilter.value !== 'all') setActiveArea('all');
    renderCatalog();
  });

  areaFilters.forEach(button => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      setActiveArea(button.dataset.area);
      if (button.dataset.area !== 'all') collectionFilter.value = 'all';
      renderCatalog();
    });
  });

  closeModal.addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.close();
  });

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

  fetch(DATA_URL)
    .then(response => {
      if (!response.ok) throw new Error('Falha ao carregar certificações.');
      return response.json();
    })
    .then(data => {
      collections = Array.isArray(data.collections) ? data.collections : [];
      certificates = Array.isArray(data.certificates) ? data.certificates : [];
      populateCollectionFilter();
      syncAreaFilters();
      renderSummary();
      renderCatalog();
    })
    .catch(() => {
      catalog.innerHTML = '<p class="cert-empty">Não foi possível carregar os certificados agora.</p>';
    });
})();
