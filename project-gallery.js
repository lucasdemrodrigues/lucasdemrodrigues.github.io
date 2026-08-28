(() => {
  const section = document.querySelector('#projetos');
  if (!section) return;

  const GITHUB_USER = 'lucasdemrodrigues';
  const EXCLUDED_REPOS = new Set(['lucasdemrodrigues.github.io']);
  const categories = ['Todos', 'Power BI', 'SQL', 'Excel', 'IA'];

  // Curadoria visual/editorial. A API continua sendo a fonte da lista de projetos;
  // estes overrides preservam capas, textos e tags mais fortes quando disponíveis.
  const overrides = {
    'relatorio-de-vendas-power-bi': {
      title: 'Relatório de Vendas no Power BI',
      description: 'Análise de vendas e lucratividade por produtos, segmentos, países e períodos, com foco em clareza visual e interpretação do negócio.',
      image: 'https://github.com/user-attachments/assets/2db65a47-a020-40d6-a5fa-25290231e913',
      categories: ['Power BI'],
      tags: ['Power BI', 'Power Query', 'DAX', 'Data Visualization'],
      eyebrow: 'POWER BI'
    },
    'open-finance-com-notebooklm': {
      title: 'Open Finance com NotebookLM',
      description: 'Miniguia de estudos criado a partir de curadoria de fontes, engenharia de prompts e síntese estruturada sobre o ecossistema brasileiro de Open Finance.',
      image: 'https://github.com/user-attachments/assets/e5dbfc0b-9fd2-4091-ac52-5777ca0c3cc1',
      categories: ['IA'],
      tags: ['NotebookLM', 'Pesquisa', 'Prompt Engineering', 'Open Finance'],
      eyebrow: 'IA & PESQUISA'
    }
  };

  const humanize = name => name
    .split('-')
    .map(word => word.length <= 3 && ['sql', 'bi', 'ia'].includes(word.toLowerCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const inferCategories = repo => {
    const source = `${repo.name || ''} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
    const result = [];
    if (source.includes('power bi') || source.includes('power-bi') || source.includes('powerbi')) result.push('Power BI');
    if (/\bsql\b|sql-server|mysql|postgres|sqlite/.test(source)) result.push('SQL');
    if (/\bexcel\b|xlsx|spreadsheet/.test(source)) result.push('Excel');
    if (/\bia\b|artificial intelligence|inteligência artificial|notebooklm|machine learning|generative ai|genai|llm|prompt/.test(source)) result.push('IA');
    return result;
  };

  const inferTags = repo => {
    const tags = [...(repo.topics || [])].slice(0, 4).map(tag => humanize(tag));
    if (repo.language && !tags.some(tag => tag.toLowerCase() === repo.language.toLowerCase())) tags.unshift(repo.language);
    return tags.slice(0, 4);
  };

  const escapeHTML = value => String(value || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  const makeFallbackVisual = title => {
    const visual = document.createElement('div');
    visual.className = 'project-visual project-visual-fallback';
    visual.innerHTML = `<span>${escapeHTML(title)}</span>`;
    return visual;
  };

  const createCard = repo => {
    const custom = overrides[repo.name] || {};
    const title = custom.title || humanize(repo.name);
    const description = custom.description || repo.description || 'Projeto publicado no GitHub. Acesse o repositório para ver detalhes, documentação e arquivos.';
    const cats = custom.categories || inferCategories(repo);
    const tags = custom.tags || inferTags(repo);
    const eyebrow = custom.eyebrow || cats[0]?.toUpperCase() || 'PROJETO';

    const article = document.createElement('article');
    article.className = 'project-feature reveal visible spotlight-card';
    article.dataset.categories = cats.join('|');
    article.dataset.repo = repo.name;

    if (custom.image) {
      const visual = document.createElement('div');
      visual.className = 'project-visual';
      const img = document.createElement('img');
      img.src = custom.image;
      img.alt = `Prévia do projeto ${title}`;
      img.loading = 'lazy';
      visual.appendChild(img);
      article.appendChild(visual);
    } else {
      article.appendChild(makeFallbackVisual(title));
    }

    const info = document.createElement('div');
    info.className = 'project-info';
    info.innerHTML = `
      <div class="project-meta"><span>${escapeHTML(eyebrow)}</span><span>GITHUB</span></div>
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(description)}</p>
      <div class="project-tags">${tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>
      <a class="text-link" href="${escapeHTML(repo.html_url)}" target="_blank" rel="noreferrer" aria-label="Ver ${escapeHTML(title)} no GitHub, abre em nova aba">Ver projeto no GitHub <b>↗</b></a>`;
    article.appendChild(info);
    return article;
  };

  // Simplifica o cabeçalho da seção: sem slogan/subtítulo.
  const sectionHead = section.querySelector('.section-head');
  const heading = sectionHead?.querySelector('h2');
  if (heading) heading.remove();
  const status = section.querySelector('.projects-status');
  const statusLead = status?.querySelector('strong');
  if (statusLead) statusLead.remove();
  if (status) status.classList.add('projects-status-compact');

  const existingProjects = [...section.querySelectorAll('.project-feature')];
  const filter = document.createElement('div');
  filter.className = 'project-filters reveal visible';
  filter.setAttribute('role', 'group');
  filter.setAttribute('aria-label', 'Filtrar projetos por categoria');

  categories.forEach((category, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `project-filter${index === 0 ? ' is-active' : ''}`;
    button.dataset.filter = category;
    button.textContent = category;
    button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    filter.appendChild(button);
  });

  if (status) status.insertAdjacentElement('afterend', filter);
  else sectionHead?.insertAdjacentElement('afterend', filter);

  const grid = document.createElement('div');
  grid.className = 'projects-grid';
  grid.setAttribute('aria-live', 'polite');
  filter.insertAdjacentElement('afterend', grid);

  existingProjects.forEach(project => {
    const text = project.textContent.toLowerCase();
    const cats = [];
    if (text.includes('power bi')) cats.push('Power BI');
    if (text.includes('sql')) cats.push('SQL');
    if (text.includes('excel')) cats.push('Excel');
    if (text.includes('notebooklm') || text.includes('prompt engineering') || text.includes('ia &') || text.includes('inteligência artificial')) cats.push('IA');
    project.dataset.categories = cats.join('|');
    project.classList.remove('reverse');
    grid.appendChild(project);
  });

  const style = document.createElement('style');
  style.textContent = `
    #projetos .section-head{margin-bottom:0}
    .projects-status.projects-status-compact{justify-content:flex-start;margin:25px 0 25px}
    .project-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 30px;padding:6px;border:1px solid rgba(255,255,255,.08);border-radius:14px;width:max-content;max-width:100%;background:rgba(255,255,255,.018)}
    .project-filter{appearance:none;border:0;background:transparent;color:#858585;padding:10px 15px;border-radius:9px;font:600 13px "DM Sans",sans-serif;cursor:pointer;transition:color .22s,background .22s,transform .22s}
    .project-filter:hover{color:#e8e8e8}.project-filter:active{transform:scale(.97)}.project-filter.is-active{color:#fff;background:rgba(255,255,255,.09)}.project-filter:focus-visible{outline:2px solid rgba(255,255,255,.7);outline-offset:2px}
    .projects-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;align-items:stretch}
    .projects-grid .project-feature{display:flex!important;flex-direction:column!important;margin:0!important;min-width:0;border:1px solid rgba(255,255,255,.09);border-radius:18px;overflow:hidden;background:rgba(255,255,255,.018);transition:opacity .28s ease,transform .35s ease,border-color .25s ease,background .25s ease}
    .projects-grid .project-feature:hover{transform:translateY(-4px);border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.028)}
    .projects-grid .project-visual{width:100%!important;min-height:0!important;height:auto!important;aspect-ratio:16/9;border:0!important;border-radius:0!important;overflow:hidden;background:#0a0a0a}
    .projects-grid .project-visual img{width:100%;height:100%;object-fit:cover;display:block}.project-visual-fallback{display:grid!important;place-items:center;padding:28px;background:radial-gradient(circle at 20% 20%,rgba(57,255,20,.09),transparent 38%),#0b0b0b!important}.project-visual-fallback span{max-width:80%;text-align:center;font:600 24px "Space Grotesk",sans-serif;color:#d8d8d8}
    .projects-grid .project-info{width:100%!important;padding:25px 26px 27px!important;display:flex;flex-direction:column;flex:1}.projects-grid .project-info h3{font-size:24px!important;line-height:1.12;margin:11px 0 12px!important}.projects-grid .project-info p{font-size:14px!important;line-height:1.65;margin:0 0 18px!important;color:#929292}.projects-grid .project-tags{margin-top:auto;padding-top:4px;margin-bottom:20px!important}.projects-grid .text-link{margin-top:0}
    .projects-grid .project-feature.is-filtering-out{opacity:0;transform:scale(.965) translateY(8px);pointer-events:none}.projects-grid .project-feature.is-hidden{display:none!important}.projects-grid .project-feature.is-filtering-in{animation:projectIn .38s ease both}@keyframes projectIn{from{opacity:0;transform:scale(.97) translateY(10px)}to{opacity:1;transform:none}}
    body.light-mode .project-filters{border-color:rgba(0,0,0,.09);background:rgba(0,0,0,.018)}body.light-mode .project-filter{color:#6d6d6d}body.light-mode .project-filter:hover{color:#111}body.light-mode .project-filter.is-active{color:#111;background:rgba(0,0,0,.075)}body.light-mode .project-filter:focus-visible{outline-color:rgba(0,0,0,.65)}body.light-mode .projects-grid .project-feature{border-color:rgba(0,0,0,.09);background:rgba(255,255,255,.28)}body.light-mode .projects-grid .project-feature:hover{border-color:rgba(0,0,0,.18);background:rgba(255,255,255,.5)}body.light-mode .project-visual-fallback{background:#ededed!important}body.light-mode .project-visual-fallback span{color:#222}
    @media(max-width:760px){.projects-grid{grid-template-columns:1fr}.project-filters{width:100%;overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none}.project-filters::-webkit-scrollbar{display:none}.project-filter{white-space:nowrap}.projects-grid .project-info h3{font-size:22px!important}}
    @media(prefers-reduced-motion:reduce){.project-filter,.projects-grid .project-feature{transition:none!important}.projects-grid .project-feature.is-filtering-in{animation:none!important}}
  `;
  document.head.appendChild(style);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buttons = [...filter.querySelectorAll('.project-filter')];
  let projects = [...grid.querySelectorAll('.project-feature')];

  const applyFilter = category => {
    buttons.forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    projects.forEach(project => {
      const matches = category === 'Todos' || project.dataset.categories.split('|').includes(category);
      if (matches) {
        project.classList.remove('is-hidden', 'is-filtering-out');
        if (!reduceMotion) { project.classList.remove('is-filtering-in'); void project.offsetWidth; project.classList.add('is-filtering-in'); }
      } else if (reduceMotion) project.classList.add('is-hidden');
      else { project.classList.add('is-filtering-out'); window.setTimeout(() => project.classList.add('is-hidden'), 260); }
    });
  };
  buttons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));

  const syncFromGitHub = async () => {
    try {
      const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=created&direction=asc`, {headers:{Accept:'application/vnd.github+json'}});
      if (!response.ok) throw new Error(`GitHub API ${response.status}`);
      const repos = (await response.json()).filter(repo => !repo.fork && !repo.archived && !EXCLUDED_REPOS.has(repo.name));
      if (!repos.length) return;

      const fragment = document.createDocumentFragment();
      repos.forEach(repo => fragment.appendChild(createCard(repo)));
      grid.replaceChildren(fragment);
      projects = [...grid.querySelectorAll('.project-feature')];
      applyFilter('Todos');

      if (status) {
        status.dataset.sync = 'ok';
        const syncText = status.querySelector('.projects-sync');
        if (syncText) syncText.title = `Sincronizado com ${repos.length} projeto${repos.length === 1 ? '' : 's'} público${repos.length === 1 ? '' : 's'} do GitHub`;
      }
    } catch (error) {
      // Os cards estáticos do HTML permanecem como fallback caso a API esteja indisponível.
      console.warn('Não foi possível sincronizar projetos com o GitHub; usando projetos locais.', error);
      if (status) status.dataset.sync = 'fallback';
    }
  };

  syncFromGitHub();
})();