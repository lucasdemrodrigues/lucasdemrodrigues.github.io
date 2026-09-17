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

  const formatDate = iso => {
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  };

  const sortCertificates = direction => [...certificates].sort((a, b) => {
    if (a.issued_at === b.issued_at) return direction === 'desc' ? b.sequence - a.sequence : a.sequence - b.sequence;
    return direction === 'desc'
      ? b.issued_at.localeCompare(a.issued_at)
      : a.issued_at.localeCompare(b.issued_at);
  });

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
      const card = document.createElement('article');
      card.className = 'cert-card';
      card.innerHTML = `
        <button class="cert-image-button" type="button" aria-label="Ampliar certificado ${certificate.title}">
          <img src="${certificate.image}" alt="" loading="lazy" referrerpolicy="no-referrer" />
        </button>
        <div class="cert-card-body">
          <div class="cert-meta"><span>${certificate.type}</span><span>${formatDate(certificate.issued_at)}</span></div>
          <h3>${certificate.title}</h3>
          <div class="cert-details"><span>${certificate.hours}h</span><span>${certificate.issuer}</span></div>
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

  fetch(DATA_URL)
    .then(response => {
      if (!response.ok) throw new Error('Falha ao carregar certificações.');
      return response.json();
    })
    .then(data => {
      certificates = data.certificates;
      const hours = certificates.reduce((sum, item) => sum + item.hours, 0);
      document.getElementById('cert-count').textContent = certificates.length;
      document.getElementById('cert-hours').textContent = `${hours}h`;
      document.getElementById('visible-count').textContent = certificates.length;
      document.getElementById('visible-hours').textContent = hours;
      render();
    })
    .catch(() => {
      grid.innerHTML = '<p style="color:#999">Não foi possível carregar os certificados agora.</p>';
    });
})();
