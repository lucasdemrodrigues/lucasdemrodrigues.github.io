(() => {
  const section = document.querySelector('#projetos');
  if (!section) return;

  const projects = [...section.querySelectorAll('.project-feature')];
  if (!projects.length) return;

  const categories = ['Todos', 'Power BI', 'SQL', 'Excel', 'IA'];
  const categoryFor = project => {
    const text = project.textContent.toLowerCase();
    const cats = [];
    if (text.includes('power bi')) cats.push('Power BI');
    if (text.includes('sql')) cats.push('SQL');
    if (text.includes('excel')) cats.push('Excel');
    if (text.includes('notebooklm') || text.includes('prompt engineering') || text.includes('ia &') || text.includes('inteligência artificial')) cats.push('IA');
    return cats;
  };

  projects.forEach(project => {
    project.dataset.categories = categoryFor(project).join('|');
    project.classList.remove('reverse');
  });

  const status = section.querySelector('.projects-status');
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
  else section.querySelector('.section-head')?.insertAdjacentElement('afterend', filter);

  const grid = document.createElement('div');
  grid.className = 'projects-grid';
  filter.insertAdjacentElement('afterend', grid);
  projects.forEach(project => grid.appendChild(project));

  const style = document.createElement('style');
  style.textContent = `
    .project-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 30px;padding:6px;border:1px solid rgba(255,255,255,.08);border-radius:14px;width:max-content;max-width:100%;background:rgba(255,255,255,.018)}
    .project-filter{appearance:none;border:0;background:transparent;color:#858585;padding:10px 15px;border-radius:9px;font:600 13px "DM Sans",sans-serif;cursor:pointer;transition:color .22s,background .22s,transform .22s}
    .project-filter:hover{color:#e8e8e8}.project-filter:active{transform:scale(.97)}
    .project-filter.is-active{color:#fff;background:rgba(255,255,255,.09)}
    .project-filter:focus-visible{outline:2px solid rgba(255,255,255,.7);outline-offset:2px}
    .projects-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;align-items:stretch}
    .projects-grid .project-feature{display:flex!important;flex-direction:column!important;margin:0!important;min-width:0;border:1px solid rgba(255,255,255,.09);border-radius:18px;overflow:hidden;background:rgba(255,255,255,.018);transition:opacity .28s ease,transform .35s ease,border-color .25s ease,background .25s ease}
    .projects-grid .project-feature:hover{transform:translateY(-4px);border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.028)}
    .projects-grid .project-visual{width:100%!important;min-height:0!important;height:auto!important;aspect-ratio:16/9;border:0!important;border-radius:0!important;overflow:hidden;background:#0a0a0a}
    .projects-grid .project-visual img{width:100%;height:100%;object-fit:cover;display:block}
    .projects-grid .project-info{width:100%!important;padding:25px 26px 27px!important;display:flex;flex-direction:column;flex:1}
    .projects-grid .project-info h3{font-size:24px!important;line-height:1.12;margin:11px 0 12px!important}
    .projects-grid .project-info p{font-size:14px!important;line-height:1.65;margin:0 0 18px!important;color:#929292}
    .projects-grid .project-tags{margin-top:auto;padding-top:4px;margin-bottom:20px!important}
    .projects-grid .project-number{font-size:12px!important}
    .projects-grid .text-link{margin-top:0}
    .projects-grid .project-feature.is-filtering-out{opacity:0;transform:scale(.965) translateY(8px);pointer-events:none}
    .projects-grid .project-feature.is-hidden{display:none!important}
    .projects-grid .project-feature.is-filtering-in{animation:projectIn .38s ease both}
    @keyframes projectIn{from{opacity:0;transform:scale(.97) translateY(10px)}to{opacity:1;transform:none}}
    body.light-mode .project-filters{border-color:rgba(0,0,0,.09);background:rgba(0,0,0,.018)}
    body.light-mode .project-filter{color:#6d6d6d}body.light-mode .project-filter:hover{color:#111}body.light-mode .project-filter.is-active{color:#111;background:rgba(0,0,0,.075)}
    body.light-mode .project-filter:focus-visible{outline-color:rgba(0,0,0,.65)}
    body.light-mode .projects-grid .project-feature{border-color:rgba(0,0,0,.09);background:rgba(255,255,255,.28)}
    body.light-mode .projects-grid .project-feature:hover{border-color:rgba(0,0,0,.18);background:rgba(255,255,255,.5)}
    @media(max-width:760px){.projects-grid{grid-template-columns:1fr}.project-filters{width:100%;overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none}.project-filters::-webkit-scrollbar{display:none}.project-filter{white-space:nowrap}.projects-grid .project-info h3{font-size:22px!important}}
    @media(prefers-reduced-motion:reduce){.project-filter,.projects-grid .project-feature{transition:none!important}.projects-grid .project-feature.is-filtering-in{animation:none!important}}
  `;
  document.head.appendChild(style);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buttons = [...filter.querySelectorAll('.project-filter')];

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
        if (!reduceMotion) {
          project.classList.remove('is-filtering-in');
          void project.offsetWidth;
          project.classList.add('is-filtering-in');
        }
      } else if (reduceMotion) {
        project.classList.add('is-hidden');
      } else {
        project.classList.add('is-filtering-out');
        window.setTimeout(() => project.classList.add('is-hidden'), 260);
      }
    });
  };

  buttons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
})();