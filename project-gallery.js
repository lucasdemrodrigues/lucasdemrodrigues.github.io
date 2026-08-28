(() => {
  const section = document.querySelector('#projetos');
  if (!section) return;

  const GITHUB_USER = 'lucasdemrodrigues';
  const PORTFOLIO_FILE = 'portfolio.json';
  const CACHE_KEY = 'portfolio-projects-cache-v1';
  const categories = ['Todos', 'Power BI', 'SQL', 'Excel', 'IA'];
  const escapeHTML = value => String(value || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  const validateMetadata = metadata => {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return ['conteúdo deve ser um objeto JSON'];
    const errors = [];
    if (metadata.portfolio !== true) errors.push('portfolio deve ser true');
    if (!Number.isFinite(Number(metadata.order)) || Number(metadata.order) < 1) errors.push('order deve ser um número maior ou igual a 1');
    if (typeof metadata.title !== 'string' || !metadata.title.trim()) errors.push('title deve ser um texto');
    if (!Array.isArray(metadata.categories) || !metadata.categories.length || metadata.categories.some(c => typeof c !== 'string' || !categories.slice(1).includes(c))) errors.push(`categories deve usar: ${categories.slice(1).join(', ')}`);
    if (typeof metadata.description !== 'string' || !metadata.description.trim()) errors.push('description deve ser um texto');
    if (typeof metadata.image !== 'string') errors.push('image deve ser um texto/URL');
    if (!Array.isArray(metadata.tags) || metadata.tags.some(tag => typeof tag !== 'string')) errors.push('tags deve ser uma lista de textos');
    if (typeof metadata.eyebrow !== 'string' || !metadata.eyebrow.trim()) errors.push('eyebrow deve ser um texto');
    return errors;
  };

  const normalizeMetadata = metadata => ({
    portfolio: true,
    order: Number(metadata.order),
    title: metadata.title.trim(),
    categories: [...metadata.categories],
    description: metadata.description.trim(),
    image: metadata.image.trim(),
    tags: metadata.tags.slice(0, 6),
    eyebrow: metadata.eyebrow.trim()
  });

  const makeFallbackVisual = title => {
    const visual = document.createElement('div');
    visual.className = 'project-visual project-visual-fallback';
    visual.innerHTML = `<span>${escapeHTML(title)}</span>`;
    return visual;
  };

  const createCard = ({repo, metadata}) => {
    const data = normalizeMetadata(metadata);
    const article = document.createElement('article');
    article.className = 'project-feature reveal visible spotlight-card';
    article.dataset.categories = data.categories.join('|');
    article.dataset.repo = repo.name;
    if (data.image) {
      const visual = document.createElement('div'); visual.className = 'project-visual';
      const img = document.createElement('img'); img.src = data.image; img.alt = `Prévia do projeto ${data.title}`; img.loading = 'lazy';
      visual.appendChild(img); article.appendChild(visual);
    } else article.appendChild(makeFallbackVisual(data.title));
    const info = document.createElement('div'); info.className = 'project-info';
    info.innerHTML = `<div class="project-meta"><span>${escapeHTML(data.eyebrow)}</span><span>GITHUB</span></div><h3>${escapeHTML(data.title)}</h3><p>${escapeHTML(data.description)}</p><div class="project-tags">${data.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div><a class="text-link" href="${escapeHTML(repo.html_url)}" target="_blank" rel="noreferrer" aria-label="Ver ${escapeHTML(data.title)} no GitHub, abre em nova aba">Ver projeto no GitHub <b>↗</b></a>`;
    article.appendChild(info); return article;
  };

  const sectionHead = section.querySelector('.section-head');
  const heading = sectionHead?.querySelector('h2'); if (heading) heading.remove();
  const status = section.querySelector('.projects-status');
  const statusLead = status?.querySelector('strong'); if (statusLead) statusLead.remove();
  if (status) status.classList.add('projects-status-compact');
  const syncText = status?.querySelector('.projects-sync');
  const setStatus = (state, text, title = '') => {
    if (!status) return;
    status.dataset.sync = state;
    if (syncText) { syncText.textContent = text; syncText.title = title; }
  };
  setStatus('loading', 'Sincronizando projetos com o GitHub...');

  const existingProjects = [...section.querySelectorAll('.project-feature')];
  const filter = document.createElement('div'); filter.className = 'project-filters reveal visible'; filter.setAttribute('role','group'); filter.setAttribute('aria-label','Filtrar projetos por categoria');
  categories.forEach((category,index) => { const button=document.createElement('button'); button.type='button'; button.className=`project-filter${index===0?' is-active':''}`; button.dataset.filter=category; button.textContent=category; button.setAttribute('aria-pressed',index===0?'true':'false'); filter.appendChild(button); });
  if (status) status.insertAdjacentElement('afterend',filter); else sectionHead?.insertAdjacentElement('afterend',filter);
  const grid=document.createElement('div'); grid.className='projects-grid'; grid.setAttribute('aria-live','polite'); filter.insertAdjacentElement('afterend',grid);
  existingProjects.forEach(project => { const text=project.textContent.toLowerCase(); const cats=[]; if(text.includes('power bi'))cats.push('Power BI'); if(text.includes('sql'))cats.push('SQL'); if(text.includes('excel'))cats.push('Excel'); if(text.includes('notebooklm')||text.includes('prompt engineering')||text.includes('ia &')||text.includes('inteligência artificial'))cats.push('IA'); project.dataset.categories=cats.join('|'); project.classList.remove('reverse'); grid.appendChild(project); });

  const style=document.createElement('style'); style.textContent=`
    #projetos .section-head{margin-bottom:0}.projects-status.projects-status-compact{justify-content:flex-start;margin:25px 0 25px}.projects-status[data-sync="loading"] .status-dot{background:#f2c94c!important;box-shadow:0 0 10px rgba(242,201,76,.45)!important}.projects-status[data-sync="ok"] .status-dot{background:#39ff14!important;box-shadow:0 0 10px rgba(57,255,20,.4)!important}.projects-status[data-sync="cache"] .status-dot,.projects-status[data-sync="fallback"] .status-dot{background:#eb5757!important;box-shadow:0 0 10px rgba(235,87,87,.38)!important}
    .project-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 30px;padding:6px;border:1px solid rgba(255,255,255,.08);border-radius:14px;width:max-content;max-width:100%;background:rgba(255,255,255,.018)}.project-filter{appearance:none;border:0;background:transparent;color:#858585;padding:10px 15px;border-radius:9px;font:600 13px "DM Sans",sans-serif;cursor:pointer;transition:color .22s,background .22s,transform .22s}.project-filter:hover{color:#e8e8e8}.project-filter:active{transform:scale(.97)}.project-filter.is-active{color:#fff;background:rgba(255,255,255,.09)}.project-filter:focus-visible{outline:2px solid rgba(255,255,255,.7);outline-offset:2px}
    .projects-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;align-items:stretch}.projects-grid .project-feature{display:flex!important;flex-direction:column!important;margin:0!important;min-width:0;border:1px solid rgba(255,255,255,.09);border-radius:18px;overflow:hidden;background:rgba(255,255,255,.018);transition:opacity .28s ease,transform .35s ease,border-color .25s ease,background .25s ease}.projects-grid .project-feature:hover{transform:translateY(-4px);border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.028)}.projects-grid .project-visual{width:100%!important;min-height:0!important;height:auto!important;aspect-ratio:16/9;border:0!important;border-radius:0!important;overflow:hidden;background:#0a0a0a}.projects-grid .project-visual img{width:100%;height:100%;object-fit:cover;display:block}.project-visual-fallback{display:grid!important;place-items:center;padding:28px;background:#0b0b0b!important}.project-visual-fallback span{max-width:80%;text-align:center;font:600 24px "Space Grotesk",sans-serif;color:#d8d8d8}.projects-grid .project-info{width:100%!important;padding:25px 26px 27px!important;display:flex;flex-direction:column;flex:1}.projects-grid .project-info h3{font-size:24px!important;line-height:1.12;margin:11px 0 12px!important}.projects-grid .project-info p{font-size:14px!important;line-height:1.65;margin:0 0 18px!important;color:#929292}.projects-grid .project-tags{margin-top:auto;padding-top:4px;margin-bottom:20px!important}.projects-grid .text-link{margin-top:0}.projects-grid .project-feature.is-filtering-out{opacity:0;transform:scale(.965) translateY(8px);pointer-events:none}.projects-grid .project-feature.is-hidden{display:none!important}.projects-grid .project-feature.is-filtering-in{animation:projectIn .38s ease both}@keyframes projectIn{from{opacity:0;transform:scale(.97) translateY(10px)}to{opacity:1;transform:none}}body.light-mode .project-filters{border-color:rgba(0,0,0,.09);background:rgba(0,0,0,.018)}body.light-mode .project-filter{color:#6d6d6d}body.light-mode .project-filter:hover{color:#111}body.light-mode .project-filter.is-active{color:#111;background:rgba(0,0,0,.075)}body.light-mode .projects-grid .project-feature{border-color:rgba(0,0,0,.09);background:rgba(255,255,255,.28)}@media(max-width:760px){.projects-grid{grid-template-columns:1fr}.project-filters{width:100%;overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none}.project-filter{white-space:nowrap}}@media(prefers-reduced-motion:reduce){.project-filter,.projects-grid .project-feature{transition:none!important}.projects-grid .project-feature.is-filtering-in{animation:none!important}}`;
  document.head.appendChild(style);

  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches; const buttons=[...filter.querySelectorAll('.project-filter')]; let projects=[...grid.querySelectorAll('.project-feature')];
  const applyFilter=category=>{buttons.forEach(button=>{const active=button.dataset.filter===category;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',active?'true':'false')});projects.forEach(project=>{const matches=category==='Todos'||project.dataset.categories.split('|').includes(category);if(matches){project.classList.remove('is-hidden','is-filtering-out');if(!reduceMotion){project.classList.remove('is-filtering-in');void project.offsetWidth;project.classList.add('is-filtering-in')}}else if(reduceMotion)project.classList.add('is-hidden');else{project.classList.add('is-filtering-out');window.setTimeout(()=>project.classList.add('is-hidden'),260)}})};
  buttons.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.filter)));
  const sortItems=items=>items.sort((a,b)=>Number(a.metadata.order)-Number(b.metadata.order)||a.repo.name.localeCompare(b.repo.name,'pt-BR'));
  const renderItems=items=>{if(!items.length)return false;const fragment=document.createDocumentFragment();sortItems(items).forEach(item=>fragment.appendChild(createCard(item)));grid.replaceChildren(fragment);projects=[...grid.querySelectorAll('.project-feature')];applyFilter('Todos');return true};

  const readCache=()=>{try{const cached=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');if(!cached||!Array.isArray(cached.projects)||!cached.projects.length)return null;const valid=cached.projects.filter(item=>item?.repo?.name&&item?.repo?.html_url&&item?.metadata&&!validateMetadata(item.metadata).length);return valid.length?{savedAt:cached.savedAt,projects:valid}:null}catch(error){console.warn('[Portfólio] Cache inválido; ignorando.',error);return null}};
  const writeCache=items=>{try{const compact=items.map(({repo,metadata})=>({repo:{name:repo.name,html_url:repo.html_url},metadata:normalizeMetadata(metadata)}));localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:new Date().toISOString(),projects:compact}));console.info(`[Portfólio] Cache atualizado: ${compact.length} projeto(s).`)}catch(error){console.warn('[Portfólio] Não foi possível salvar o cache.',error)}};
  const cached=readCache(); if(cached){renderItems(cached.projects);console.info(`[Portfólio] Cache exibido enquanto o GitHub é consultado. Salvo em ${cached.savedAt}.`)}

  const fetchPortfolioMetadata=async repo=>{const url=`https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/${repo.default_branch}/${PORTFOLIO_FILE}`;try{const response=await fetch(url,{cache:'no-cache'});if(response.status===404)return null;if(!response.ok){console.warn(`[Portfólio] ${repo.name}: portfolio.json indisponível (HTTP ${response.status}).`);return null}const metadata=await response.json();if(metadata?.portfolio!==true)return null;const errors=validateMetadata(metadata);if(errors.length){console.warn(`[Portfólio] ${repo.name} ignorado: ${errors.join('; ')}.`);return null}console.info(`[Portfólio] ${repo.name}: válido.`);return metadata}catch(error){console.warn(`[Portfólio] ${repo.name} ignorado: JSON inválido ou indisponível.`,error);return null}};

  const syncFromGitHub=async()=>{setStatus('loading','Sincronizando projetos com o GitHub...');try{const response=await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=created&direction=asc`,{headers:{Accept:'application/vnd.github+json'},cache:'no-cache'});if(!response.ok)throw new Error(`GitHub API ${response.status}`);const repos=(await response.json()).filter(repo=>!repo.fork&&!repo.archived&&repo.name!==`${GITHUB_USER}.github.io`);const candidates=await Promise.all(repos.map(async repo=>({repo,metadata:await fetchPortfolioMetadata(repo)})));const valid=candidates.filter(item=>item.metadata);if(!valid.length)throw new Error('Nenhum portfolio.json válido encontrado.');renderItems(valid);writeCache(valid);setStatus('ok','Projetos sincronizados com o GitHub via API',`${valid.length} projeto${valid.length===1?'':'s'} válido${valid.length===1?'':'s'} sincronizado${valid.length===1?'':'s'}.`);console.info(`[Portfólio] Sincronização concluída: ${valid.length} projeto(s).`)}catch(error){const fallback=cached?'cache':'fallback';setStatus(fallback,'Projetos exibidos em modo de segurança',cached?'GitHub indisponível nesta consulta; exibindo a última versão válida salva neste navegador.':'GitHub indisponível nesta consulta; exibindo os projetos básicos incluídos no site.');console.warn(`[Portfólio] Sincronização geral falhou; ${cached?'mantendo cache':'mantendo HTML básico'}.`,error)}};
  syncFromGitHub();
})();