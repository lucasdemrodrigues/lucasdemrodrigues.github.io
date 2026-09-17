(() => {
  const DATA_URL = 'certificacoes.json';
  const grid = document.getElementById('cert-grid');
  const order = document.getElementById('cert-order');
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
  let collection = {};
  let summary = {};
  let areasPinned = false;

  const formatDate = iso => {
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  };

  const percentage = (hours, total) => total > 0 ? Math.round((hours / total) * 100) : 0;

  const sortCertificates = direction => [...certificates].sort((a, b) => {
    if (a.issued_at === b.issued_at) return direction === 'desc' ? b.sequence - a.sequence : a.sequence - b.sequence;
    return direction === 'desc'
      ? b.issued_at.localeCompare(a.issued_at)
      : a.issued_at.localeCompare(b.issued_at);
  });

  const setAreasPopover = open => {
    if (!areasToggle || !areasPopover) return;
    areasPopover.hidden = !open;
    areasToggle.setAttribute('aria-expanded', String(open));
  };

  const renderSummary = () => {
    const totalHours = Number(summary.hours) || 0;
    const areas = Array.isArray(summary.areas) ? summary.areas : [];
    const modalities = Array.isArray(summary.modalities) ? summary.modalities : [];

    document.getElementById('cert-count').textContent = certificates.length;
    document.getElementById('cert-hours').textContent = `${totalHours}h`;
    document.getElementById('cert-area-count').textContent = areas.length;
    document.getElementById('visible-count').textContent = certificates.length;
    document.getElementById('visible-hours').textContent = totalHours;

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

    const modalityMap = new Map(modalities.map(item => [item.name.toLowerCase(), item.hours]));
    document.getElementById('modality-online').textContent = `${percentage(modalityMap.get('online') || 0, totalHours)}%`;
    document.getElementById('modality-presencial').textContent = `${percentage(modalityMap.get('presencial') || 0, totalHours)}%`;
    document.getElementById('modality-hibrido').textContent = `${percentage(modalityMap.get('híbrido') || modalityMap.get('hibrido') || 0, totalHours)}%`;
  };

  const openCertificate = certificate => {
    modalImage.src = certificate.image;
    modalImage.alt = `Certificado: ${certificate.title}`;
    modalTitle.textContent = certificate.title;
    modalMeta.textContent = `${certificate.type} · ${formatDate(certificate.issued_at)} · ${certificate.hours}h`;
    modal.showModal();
  };

  const render = () => {
    grid.innerHTML = '';
    sortCertificates(order.value).forEach(certificate => {
      const issuerTag = collection.show_issuer === false ? '' : `<span>${certificate.issuer}</span>`;
      const card = document.createElement('article');
      card.className = 'cert-card';
      card.innerHTML = `
        <button class="cert-image-button" type="button" aria-label="Ampliar certificado ${certificate.title}">
          <img src="${certificate.image}" alt="" loading="lazy" referrerpolicy="no-referrer" />
        </button>
        <div class="cert-card-body">
          <div class="cert-meta"><span>${certificate.type}</span><span>${formatDate(certificate.issued_at)}</span></div>
          <h3>${certificate.title}</h3>
          <div class="cert-details"><span>${certificate.hours}h</span>${issuerTag}</div>
          <a class="cert-view" href="${certificate.url}" target="_blank" rel="noreferrer" aria-label="Abrir certificado ${certificate.title} no Google Drive, abre em nova aba">Ver certificado <b>↗</b></a>
        </div>`;
      card.querySelector('.cert-image-button').addEventListener('click', () => openCertificate(certificate));
      grid.appendChild(card);
    });
  };

  order.addEventListener('change', render);
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
      summary = data.summary || {};
      collection = data.collection || {};
      certificates = data.certificates || [];
      renderSummary();
      render();
    })
    .catch(() => {
      grid.innerHTML = '<p style="color:#999">Não foi possível carregar os certificados agora.</p>';
    });
})();
