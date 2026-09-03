(() => {
  const section = document.querySelector('#projetos');
  if (!section) return;

  const GITHUB_USER='lucasdemrodrigues', PORTFOLIO_FILE='portfolio.json', CACHE_KEY='portfolio-projects-cache-v2';
  const categories=['Todos','Power BI','SQL','Excel','IA'];
  const escapeHTML=v=>String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const cleanText=(m,key)=>typeof m?.[key]==='string'?m[key].trim():'';

  const validateMetadata=m=>{
    if(!m||typeof m!=='object'||Array.isArray(m)) return ['conteúdo deve ser um objeto JSON'];
    const e=[];
    if(m.portfolio!==true)e.push('portfolio deve ser true');
    if(!Number.isFinite(Number(m.order))||Number(m.order)<1)e.push('order deve ser um número maior ou igual a 1');
    if(typeof m.title!=='string'||!m.title.trim())e.push('title deve ser um texto');
    if(!Array.isArray(m.categories)||!m.categories.length||m.categories.some(c=>typeof c!=='string'||!categories.slice(1).includes(c)))e.push(`categories deve usar: ${categories.slice(1).join(', ')}`);
    if(typeof m.description!=='string'||!m.description.trim())e.push('description deve ser um texto');
    if(typeof m.image!=='string')e.push('image deve ser um texto/URL');
    if(!Array.isArray(m.tags)||m.tags.some(t=>typeof t!=='string'))e.push('tags deve ser uma lista de textos');
    if(typeof m.eyebrow!=='string'||!m.eyebrow.trim())e.push('eyebrow deve ser um texto');
    ['title_en','title_es','description_en','description_es','eyebrow_en','eyebrow_es'].forEach(key=>{
      if(m[key]!=null&&typeof m[key]!=='string')e.push(`${key} deve ser um texto`);
    });
    return e;
  };

  const normalizeMetadata=m=>({
    portfolio:true,
    order:Number(m.order),
    title:m.title.trim(),
    title_en:cleanText(m,'title_en'),
    title_es:cleanText(m,'title_es'),
    categories:[...m.categories],
    description:m.description.trim(),
    description_en:cleanText(m,'description_en'),
    description_es:cleanText(m,'description_es'),
    image:m.image.trim(),
    tags:m.tags.slice(0,6),
    eyebrow:m.eyebrow.trim(),
    eyebrow_en:cleanText(m,'eyebrow_en'),
    eyebrow_es:cleanText(m,'eyebrow_es')
  });

  const publishProjectData=(items,source)=>{
    const projects=items.map(({repo,metadata})=>({
      repo:{name:repo.name,html_url:repo.html_url},
      metadata:normalizeMetadata(metadata)
    }));
    window.portfolioProjects={source,projects};
    document.dispatchEvent(new CustomEvent('portfolio:projects-data',{detail:window.portfolioProjects}));
  };

  const makeFallbackVisual=title=>{
    const v=document.createElement('div');
    v.className='project-visual project-visual-fallback';
    v.innerHTML=`<span>${escapeHTML(title)}</span>`;
    return v;
  };

  const createCard=({repo,metadata})=>{
    const d=normalizeMetadata(metadata),a=document.createElement('article');
    a.className='project-feature reveal visible spotlight-card';
    a.dataset.categories=d.categories.join('|');
    a.dataset.repo=repo.name;
    if(d.image){
      const v=document.createElement('div');
      v.className='project-visual';
      if(d.categories.includes('IA')){
        v.classList.add('project-visual-contain');
        v.style.setProperty('--project-image',`url("${d.image.replace(/"/g,'%22')}")`);
      }
      const img=document.createElement('img');
      img.src=d.image;
      img.alt=`Prévia do projeto ${d.title}`;
      img.loading='lazy';
      v.appendChild(img);
      a.appendChild(v);
    } else a.appendChild(makeFallbackVisual(d.title));
    const info=document.createElement('div');
    info.className='project-info';
    info.innerHTML=`<div class="project-meta"><span>${escapeHTML(d.eyebrow)}</span><span>GITHUB</span></div><h3>${escapeHTML(d.title)}</h3><p>${escapeHTML(d.description)}</p><div class="project-tags">${d.tags.map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div><a class="text-link" href="${escapeHTML(repo.html_url)}" target="_blank" rel="noreferrer" aria-label="Ver ${escapeHTML(d.title)} no GitHub, abre em nova aba">Ver projeto no GitHub <b>↗</b></a>`;
    a.appendChild(info);
    return a;
  };

  const head=section.querySelector('.section-head'),heading=head?.querySelector('h2');
  if(heading)heading.remove();
  const status=section.querySelector('.projects-status'),lead=status?.querySelector('strong');
  if(lead)lead.remove();
  if(status)status.classList.add('projects-status-compact');
  const sync=status?.querySelector('.projects-sync');

  const setStatus=(state,text,title='')=>{
    if(!status)return;
    status.dataset.sync=state;
    if(sync){
      let dot=sync.querySelector('.projects-sync-dot');
      if(!dot){dot=document.createElement('i');dot.className='projects-sync-dot';dot.setAttribute('aria-hidden','true');sync.prepend(dot)}
      [...sync.childNodes].filter(n=>n!==dot).forEach(n=>n.remove());
      sync.append(document.createTextNode(` ${text}`));
      sync.title=title;
    }
    document.dispatchEvent(new CustomEvent('portfolio:projects-status',{detail:{state,title}}));
  };
  setStatus('loading','Sincronizando projetos com o GitHub...');

  const existing=[...section.querySelectorAll('.project-feature')],filter=document.createElement('div');
  filter.className='project-filters reveal visible';
  filter.setAttribute('role','group');
  filter.setAttribute('aria-label','Filtrar projetos por categoria');
  categories.forEach((c,i)=>{
    const b=document.createElement('button');
    b.type='button';b.className=`project-filter${i===0?' is-active':''}`;b.dataset.filter=c;b.textContent=c;b.setAttribute('aria-pressed',i===0?'true':'false');filter.appendChild(b);
  });
  if(status)status.insertAdjacentElement('afterend',filter);else head?.insertAdjacentElement('afterend',filter);
  const grid=document.createElement('div');
  grid.className='projects-grid';grid.setAttribute('aria-live','polite');filter.insertAdjacentElement('afterend',grid);
  existing.forEach(p=>{
    const t=p.textContent.toLowerCase(),cs=[];
    if(t.includes('power bi'))cs.push('Power BI');if(t.includes('sql'))cs.push('SQL');if(t.includes('excel'))cs.push('Excel');if(t.includes('notebooklm')||t.includes('prompt engineering')||t.includes('ia &')||t.includes('inteligência artificial'))cs.push('IA');
    p.dataset.categories=cs.join('|');p.classList.remove('reverse');grid.appendChild(p);
  });

  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,buttons=[...filter.querySelectorAll('.project-filter')];
  let projects=[...grid.querySelectorAll('.project-feature')],galleryEntered=reduce,filterToken=0;

  const animateCardsIn=cards=>{
    if(reduce||!galleryEntered)return;
    cards.filter(p=>!p.classList.contains('is-hidden')).forEach((p,i)=>{
      if(typeof p.animate!=='function')return;
      p.animate([{opacity:0,transform:'translateY(42px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay:Math.min(i*90,360),easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    });
  };

  const applyFilter=async c=>{
    const token=++filterToken;
    buttons.forEach(b=>{const a=b.dataset.filter===c;b.classList.toggle('is-active',a);b.setAttribute('aria-pressed',a?'true':'false')});
    const matches=p=>c==='Todos'||p.dataset.categories.split('|').includes(c);
    if(reduce||typeof Element==='undefined'||typeof Element.prototype.animate!=='function'){
      projects.forEach(p=>p.classList.toggle('is-hidden',!matches(p)));return;
    }
    const first=new Map(projects.filter(p=>!p.classList.contains('is-hidden')).map(p=>[p,p.getBoundingClientRect()]));
    const leaving=projects.filter(p=>!p.classList.contains('is-hidden')&&!matches(p));
    await Promise.all(leaving.map(p=>p.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-14px)'}],{duration:190,easing:'ease-in',fill:'both'}).finished.catch(()=>{})));
    if(token!==filterToken)return;
    leaving.forEach(p=>p.classList.add('is-hidden'));
    const entering=projects.filter(p=>p.classList.contains('is-hidden')&&matches(p));
    entering.forEach(p=>p.classList.remove('is-hidden'));
    const visible=projects.filter(p=>!p.classList.contains('is-hidden'));
    const last=new Map(visible.map(p=>[p,p.getBoundingClientRect()]));
    visible.forEach((p,i)=>{
      const a=first.get(p),b=last.get(p);
      if(a&&b){
        const dx=a.left-b.left,dy=a.top-b.top;
        if(Math.abs(dx)>.5||Math.abs(dy)>.5)p.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:720,easing:'cubic-bezier(.22,1,.36,1)'});
      } else if(entering.includes(p)){
        p.animate([{opacity:0,transform:'translateY(30px)'},{opacity:1,transform:'translateY(0)'}],{duration:720,delay:Math.min(i*70,280),easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
      }
    });
  };
  buttons.forEach(b=>b.addEventListener('click',()=>applyFilter(b.dataset.filter)));

  if(!reduce&&'IntersectionObserver'in window){
    grid.classList.add('is-awaiting-entry');
    const enterObserver=new IntersectionObserver(entries=>{
      if(!entries.some(e=>e.isIntersecting))return;
      galleryEntered=true;grid.classList.remove('is-awaiting-entry');animateCardsIn(projects);enterObserver.disconnect();
    },{threshold:.16});
    enterObserver.observe(grid);
  } else {galleryEntered=true;projects.forEach(p=>p.classList.remove('is-hidden'))}

  const sortItems=i=>i.sort((a,b)=>Number(a.metadata.order)-Number(b.metadata.order)||a.repo.name.localeCompare(b.repo.name,'pt-BR'));
  const renderItems=(items,source)=>{
    if(!items.length)return false;
    const sorted=sortItems([...items]),f=document.createDocumentFragment();
    sorted.forEach(x=>f.appendChild(createCard(x)));
    grid.replaceChildren(f);
    projects=[...grid.querySelectorAll('.project-feature')];
    projects.forEach(p=>p.classList.remove('is-hidden'));
    publishProjectData(sorted,source);
    if(galleryEntered)animateCardsIn(projects);
    return true;
  };

  const readCache=()=>{
    try{
      const c=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');
      if(!c||!Array.isArray(c.projects)||!c.projects.length)return null;
      const v=c.projects.filter(i=>i?.repo?.name&&i?.repo?.html_url&&i?.metadata&&!validateMetadata(i.metadata).length);
      return v.length?{savedAt:c.savedAt,projects:v}:null;
    }catch(e){console.warn('[Portfólio] Cache inválido; ignorando.',e);return null}
  };

  const writeCache=i=>{
    try{
      const c=i.map(({repo,metadata})=>({repo:{name:repo.name,html_url:repo.html_url},metadata:normalizeMetadata(metadata)}));
      localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:new Date().toISOString(),projects:c}));
      console.info(`[Portfólio] Cache atualizado: ${c.length} projeto(s).`);
    }catch(e){console.warn('[Portfólio] Não foi possível salvar o cache.',e)}
  };

  const cached=readCache();
  if(cached){renderItems(cached.projects,'cache');console.info(`[Portfólio] Cache exibido enquanto o GitHub é consultado. Salvo em ${cached.savedAt}.`)}

  const fetchPortfolioMetadata=async repo=>{
    try{
      const r=await fetch(`https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/${repo.default_branch}/${PORTFOLIO_FILE}`,{cache:'no-cache'});
      if(r.status===404)return null;
      if(!r.ok){console.warn(`[Portfólio] ${repo.name}: portfolio.json indisponível (HTTP ${r.status}).`);return null}
      const m=await r.json();
      if(m?.portfolio!==true)return null;
      const e=validateMetadata(m);
      if(e.length){console.warn(`[Portfólio] ${repo.name} ignorado: ${e.join('; ')}.`);return null}
      console.info(`[Portfólio] ${repo.name}: válido.`);
      return m;
    }catch(e){console.warn(`[Portfólio] ${repo.name} ignorado: JSON inválido ou indisponível.`,e);return null}
  };

  const syncFromGitHub=async()=>{
    setStatus('loading','Sincronizando projetos com o GitHub...');
    try{
      const r=await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=created&direction=asc`,{headers:{Accept:'application/vnd.github+json'},cache:'no-cache'});
      if(!r.ok)throw new Error(`GitHub API ${r.status}`);
      const repos=(await r.json()).filter(x=>!x.fork&&!x.archived&&x.name!==`${GITHUB_USER}.github.io`);
      const collected=await Promise.all(repos.map(async repo=>({repo,metadata:await fetchPortfolioMetadata(repo)})));
      const valid=collected.filter(x=>x.metadata);
      if(!valid.length)throw new Error('Nenhum portfolio.json válido encontrado.');
      renderItems(valid,'github');
      writeCache(valid);
      setStatus('ok','Projetos sincronizados com o GitHub via API',`${valid.length} projeto(s) válido(s) sincronizado(s).`);
      console.info(`[Portfólio] Sincronização concluída: ${valid.length} projeto(s).`);
    }catch(e){
      setStatus(cached?'cache':'fallback','Projetos exibidos em modo de segurança',cached?'GitHub indisponível nesta consulta; exibindo a última versão válida salva neste navegador.':'GitHub indisponível nesta consulta; exibindo os projetos básicos incluídos no site.');
      console.warn(`[Portfólio] Sincronização geral falhou; ${cached?'mantendo cache':'mantendo HTML básico'}.`,e);
    }
  };

  syncFromGitHub();
})();