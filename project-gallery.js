(() => {
  const section = document.querySelector('#projetos');
  if (!section) return;

  const GITHUB_USER = 'lucasdemrodrigues';
  const PORTFOLIO_FILE = 'portfolio.json';
  const CACHE_KEY = 'portfolio-projects-cache-v3';
  const categories = ['Todos', 'Power BI', 'SQL', 'Excel', 'IA'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const escapeHTML = value => String(value || '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));

  const cleanText = (metadata, key) => (
    typeof metadata?.[key] === 'string' ? metadata[key].trim() : ''
  );

  const validateMetadata = metadata => {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return ['conteúdo deve ser um objeto JSON'];
    }

    const errors = [];
    const allowedCategories = categories.slice(1);

    if (metadata.portfolio !== true) errors.push('portfolio deve ser true');
    if (!Number.isFinite(Number(metadata.order)) || Number(metadata.order) < 1) {
      errors.push('order deve ser um número maior ou igual a 1');
    }
    if (typeof metadata.title !== 'string' || !metadata.title.trim()) {
      errors.push('title deve ser um texto');
    }
    if (
      !Array.isArray(metadata.categories) ||
      !metadata.categories.length ||
      metadata.categories.some(category => (
        typeof category !== 'string' || !allowedCategories.includes(category)
      ))
    ) {
      errors.push(`categories deve usar: ${allowedCategories.join(', ')}`);
    }
    if (typeof metadata.description !== 'string' || !metadata.description.trim()) {
      errors.push('description deve ser um texto');
    }
    if (typeof metadata.image !== 'string') errors.push('image deve ser um texto/URL');
    if (
      metadata.image_reduced_motion != null &&
      typeof metadata.image_reduced_motion !== 'string'
    ) {
      errors.push('image_reduced_motion deve ser um texto/URL');
    }
    if (!Array.isArray(metadata.tags) || metadata.tags.some(tag => typeof tag !== 'string')) {
      errors.push('tags deve ser uma lista de textos');
    }
    if (typeof metadata.eyebrow !== 'string' || !metadata.eyebrow.trim()) {
      errors.push('eyebrow deve ser um texto');
    }

    ['title_en', 'title_es', 'description_en', 'description_es', 'eyebrow_en', 'eyebrow_es']
      .forEach(key => {
        if (metadata[key] != null && typeof metadata[key] !== 'string') {
          errors.push(`${key} deve ser um texto`);
        }
      });

    return errors;
  };

  const normalizeMetadata = metadata => ({
    portfolio: true,
    order: Number(metadata.order),
    title: metadata.title.trim(),
    title_en: cleanText(metadata, 'title_en'),
    title_es: cleanText(metadata, 'title_es'),
    categories: [...metadata.categories],
    description: metadata.description.trim(),
    description_en: cleanText(metadata, 'description_en'),
    description_es: cleanText(metadata, 'description_es'),
    image: metadata.image.trim(),
    image_reduced_motion: cleanText(metadata, 'image_reduced_motion'),
    tags: metadata.tags.slice(0, 6),
    eyebrow: metadata.eyebrow.trim(),
    eyebrow_en: cleanText(metadata, 'eyebrow_en'),
    eyebrow_es: cleanText(metadata, 'eyebrow_es')
  });

  const publishProjectData = (items, source) => {
    const projects = items.map(({ repo, metadata }) => ({
      repo: {
        name: repo.name,
        html_url: repo.html_url
      },
      metadata: normalizeMetadata(metadata)
    }));

    window.portfolioProjects = { source, projects };
    document.dispatchEvent(new CustomEvent('portfolio:projects-data', {
      detail: window.portfolioProjects
    }));
  };

  const makeFallbackVisual = title => {
    const visual = document.createElement('div');
    visual.className = 'project-visual project-visual-fallback';
    visual.setAttribute('aria-hidden', 'true');
    visual.innerHTML = `<span>${escapeHTML(title)}</span>`;
    return visual;
  };

  const createCard = ({ repo, metadata }) => {
    const project = normalizeMetadata(metadata);
    const article = document.createElement('article');

    article.className = 'project-feature reveal visible spotlight-card';
    article.dataset.categories = project.categories.join('|');
    article.dataset.repo = repo.name;

    if (project.image) {
      const visual = document.createElement('div');
      const imageSource = reducedMotion && project.image_reduced_motion
        ? project.image_reduced_motion
        : project.image;

      visual.className = 'project-visual';

      if (project.categories.includes('IA')) {
        visual.classList.add('project-visual-contain');
        visual.style.setProperty(
          '--project-image',
          `url("${imageSource.replace(/"/g, '%22')}")`
        );
      }

      const image = document.createElement('img');
      image.src = imageSource;
      image.alt = '';
      image.loading = 'lazy';
      visual.appendChild(image);
      article.appendChild(visual);
    } else {
      article.appendChild(makeFallbackVisual(project.title));
    }

    const info = document.createElement('div');
    info.className = 'project-info';
    info.innerHTML = `
      <div class="project-meta">
        <span>${escapeHTML(project.eyebrow)}</span>
        <span>GITHUB</span>
      </div>
      <h3>${escapeHTML(project.title)}</h3>
      <p>${escapeHTML(project.description)}</p>
      <div class="project-tags">
        ${project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}
      </div>
      <a class="text-link" href="${escapeHTML(repo.html_url)}" target="_blank" rel="noreferrer" aria-label="Ver ${escapeHTML(project.title)} no GitHub, abre em nova aba">
        Ver projeto no GitHub <b>↗</b>
      </a>
    `;
    article.appendChild(info);

    return article;
  };

  const sectionHead = section.querySelector('.section-head');
  const status = section.querySelector('.projects-status');
  const statusLead = status?.querySelector('strong');
  if (statusLead) statusLead.remove();

  if (status) {
    status.classList.add('projects-status-compact');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
  }

  const syncLabel = status?.querySelector('.projects-sync');

  const setStatus = (state, text, title = '') => {
    if (!status) return;

    status.dataset.sync = state;

    if (syncLabel) {
      let dot = syncLabel.querySelector('.projects-sync-dot');
      if (!dot) {
        dot = document.createElement('i');
        dot.className = 'projects-sync-dot';
        dot.setAttribute('aria-hidden', 'true');
        syncLabel.prepend(dot);
      }

      [...syncLabel.childNodes]
        .filter(node => node !== dot)
        .forEach(node => node.remove());

      syncLabel.append(document.createTextNode(` ${text}`));
      syncLabel.title = title;
    }

    document.dispatchEvent(new CustomEvent('portfolio:projects-status', {
      detail: { state, title }
    }));
  };

  setStatus('loading', 'Sincronizando projetos com o GitHub...');

  const existingCards = [...section.querySelectorAll('.project-feature')];
  const filterContainer = document.createElement('div');
  filterContainer.className = 'project-filters reveal visible';
  filterContainer.setAttribute('role', 'group');
  filterContainer.setAttribute('aria-label', 'Filtrar projetos por categoria');

  categories.forEach((category, index) => {
    const button = document.createElement('button');
    const isActive = index === 0;

    button.type = 'button';
    button.className = `project-filter${isActive ? ' is-active' : ''}`;
    button.dataset.filter = category;
    button.textContent = category;
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    filterContainer.appendChild(button);
  });

  if (status) status.insertAdjacentElement('afterend', filterContainer);
  else sectionHead?.insertAdjacentElement('afterend', filterContainer);

  const grid = document.createElement('div');
  grid.className = 'projects-grid';
  filterContainer.insertAdjacentElement('afterend', grid);

  existingCards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const cardCategories = [];

    if (text.includes('power bi')) cardCategories.push('Power BI');
    if (text.includes('sql')) cardCategories.push('SQL');
    if (text.includes('excel')) cardCategories.push('Excel');
    if (
      text.includes('gemini notebook') ||
      text.includes('notebooklm') ||
      text.includes('prompt engineering') ||
      text.includes('ia &') ||
      text.includes('inteligência artificial')
    ) {
      cardCategories.push('IA');
    }

    card.dataset.categories = cardCategories.join('|');
    card.classList.remove('reverse');
    grid.appendChild(card);
  });

  const filterButtons = [...filterContainer.querySelectorAll('.project-filter')];
  let projects = [...grid.querySelectorAll('.project-feature')];
  let galleryEntered = reducedMotion;
  let filterToken = 0;

  const animateCardsIn = cards => {
    if (reducedMotion || !galleryEntered) return;

    cards
      .filter(card => !card.classList.contains('is-hidden'))
      .forEach((card, index) => {
        if (typeof card.animate !== 'function') return;

        card.animate(
          [
            { opacity: 0, transform: 'translateY(42px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          {
            duration: 850,
            delay: Math.min(index * 90, 360),
            easing: 'cubic-bezier(.22,1,.36,1)',
            fill: 'both'
          }
        );
      });
  };

  const applyFilter = async category => {
    const token = ++filterToken;

    filterButtons.forEach(button => {
      const isActive = button.dataset.filter === category;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    const matches = card => (
      category === 'Todos' || card.dataset.categories.split('|').includes(category)
    );

    if (
      reducedMotion ||
      typeof Element === 'undefined' ||
      typeof Element.prototype.animate !== 'function'
    ) {
      projects.forEach(card => card.classList.toggle('is-hidden', !matches(card)));
      return;
    }

    const firstPositions = new Map(
      projects
        .filter(card => !card.classList.contains('is-hidden'))
        .map(card => [card, card.getBoundingClientRect()])
    );

    const leaving = projects.filter(card => (
      !card.classList.contains('is-hidden') && !matches(card)
    ));

    await Promise.all(leaving.map(card => (
      card.animate(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(-14px)' }
        ],
        { duration: 190, easing: 'ease-in', fill: 'both' }
      ).finished.catch(() => {})
    )));

    if (token !== filterToken) return;

    leaving.forEach(card => card.classList.add('is-hidden'));

    const entering = projects.filter(card => (
      card.classList.contains('is-hidden') && matches(card)
    ));
    entering.forEach(card => card.classList.remove('is-hidden'));

    const visible = projects.filter(card => !card.classList.contains('is-hidden'));
    const lastPositions = new Map(
      visible.map(card => [card, card.getBoundingClientRect()])
    );

    visible.forEach((card, index) => {
      const first = firstPositions.get(card);
      const last = lastPositions.get(card);

      if (first && last) {
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;

        if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
          card.animate(
            [
              { transform: `translate(${deltaX}px,${deltaY}px)` },
              { transform: 'translate(0,0)' }
            ],
            { duration: 720, easing: 'cubic-bezier(.22,1,.36,1)' }
          );
        }
      } else if (entering.includes(card)) {
        card.animate(
          [
            { opacity: 0, transform: 'translateY(30px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          {
            duration: 720,
            delay: Math.min(index * 70, 280),
            easing: 'cubic-bezier(.22,1,.36,1)',
            fill: 'both'
          }
        );
      }
    });
  };

  filterButtons.forEach(button => {
    button.addEventListener('click', () => applyFilter(button.dataset.filter));
  });

  if (!reducedMotion && 'IntersectionObserver' in window) {
    grid.classList.add('is-awaiting-entry');

    const enterObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;

      galleryEntered = true;
      grid.classList.remove('is-awaiting-entry');
      animateCardsIn(projects);
      enterObserver.disconnect();
    }, { threshold: 0.16 });

    enterObserver.observe(grid);
  } else {
    galleryEntered = true;
    projects.forEach(card => card.classList.remove('is-hidden'));
  }

  const sortItems = items => items.sort((first, second) => (
    Number(first.metadata.order) - Number(second.metadata.order) ||
    first.repo.name.localeCompare(second.repo.name, 'pt-BR')
  ));

  const renderItems = (items, source) => {
    if (!items.length) return false;

    const sortedItems = sortItems([...items]);
    const fragment = document.createDocumentFragment();
    sortedItems.forEach(item => fragment.appendChild(createCard(item)));

    grid.replaceChildren(fragment);
    projects = [...grid.querySelectorAll('.project-feature')];
    projects.forEach(card => card.classList.remove('is-hidden'));
    publishProjectData(sortedItems, source);

    if (galleryEntered) animateCardsIn(projects);
    return true;
  };

  const readCache = () => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (!cache || !Array.isArray(cache.projects) || !cache.projects.length) return null;

      const validProjects = cache.projects.filter(item => (
        item?.repo?.name &&
        item?.repo?.html_url &&
        item?.metadata &&
        !validateMetadata(item.metadata).length
      ));

      return validProjects.length
        ? { savedAt: cache.savedAt, projects: validProjects }
        : null;
    } catch (error) {
      console.warn('[Portfólio] Cache inválido; ignorando.', error);
      return null;
    }
  };

  const writeCache = items => {
    try {
      const cachedProjects = items.map(({ repo, metadata }) => ({
        repo: {
          name: repo.name,
          html_url: repo.html_url
        },
        metadata: normalizeMetadata(metadata)
      }));

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        savedAt: new Date().toISOString(),
        projects: cachedProjects
      }));

      console.info(`[Portfólio] Cache atualizado: ${cachedProjects.length} projeto(s).`);
    } catch (error) {
      console.warn('[Portfólio] Não foi possível salvar o cache.', error);
    }
  };

  const cached = readCache();
  if (cached) {
    renderItems(cached.projects, 'cache');
    console.info(
      `[Portfólio] Cache exibido enquanto o GitHub é consultado. Salvo em ${cached.savedAt}.`
    );
  }

  const fetchPortfolioMetadata = async repo => {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/${repo.default_branch}/${PORTFOLIO_FILE}`,
        { cache: 'no-cache' }
      );

      if (response.status === 404) return null;
      if (!response.ok) {
        console.warn(
          `[Portfólio] ${repo.name}: portfolio.json indisponível (HTTP ${response.status}).`
        );
        return null;
      }

      const metadata = await response.json();
      if (metadata?.portfolio !== true) return null;

      const errors = validateMetadata(metadata);
      if (errors.length) {
        console.warn(`[Portfólio] ${repo.name} ignorado: ${errors.join('; ')}.`);
        return null;
      }

      console.info(`[Portfólio] ${repo.name}: válido.`);
      return metadata;
    } catch (error) {
      console.warn(
        `[Portfólio] ${repo.name} ignorado: JSON inválido ou indisponível.`,
        error
      );
      return null;
    }
  };

  const syncFromGitHub = async () => {
    setStatus('loading', 'Sincronizando projetos com o GitHub...');

    try {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=created&direction=asc`,
        {
          headers: { Accept: 'application/vnd.github+json' },
          cache: 'no-cache'
        }
      );

      if (!response.ok) throw new Error(`GitHub API ${response.status}`);

      const repos = (await response.json()).filter(repo => !repo.fork && !repo.archived);
      const collected = await Promise.all(repos.map(async repo => ({
        repo,
        metadata: await fetchPortfolioMetadata(repo)
      })));
      const validProjects = collected.filter(item => item.metadata);

      if (!validProjects.length) {
        throw new Error('Nenhum portfolio.json válido encontrado.');
      }

      renderItems(validProjects, 'github');
      writeCache(validProjects);
      setStatus(
        'ok',
        'Projetos sincronizados com o GitHub via API',
        `${validProjects.length} projeto(s) válido(s) sincronizado(s).`
      );
      console.info(`[Portfólio] Sincronização concluída: ${validProjects.length} projeto(s).`);
    } catch (error) {
      setStatus(
        cached ? 'cache' : 'fallback',
        'Projetos exibidos em modo de segurança',
        cached
          ? 'GitHub indisponível nesta consulta; exibindo a última versão válida salva neste navegador.'
          : 'GitHub indisponível nesta consulta; exibindo os projetos básicos incluídos no site.'
      );
      console.warn(
        `[Portfólio] Sincronização geral falhou; ${cached ? 'mantendo cache' : 'mantendo HTML básico'}.`,
        error
      );
    }
  };

  syncFromGitHub();
})();