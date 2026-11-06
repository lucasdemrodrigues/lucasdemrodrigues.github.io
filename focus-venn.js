(() => {
  const block=document.querySelector('.focus-connection');
  if(!block)return;
  const buttons=[...block.querySelectorAll('[data-area]')];
  const title=block.querySelector('.focus-venn-detail-title');
  const description=block.querySelector('.focus-venn-detail-text');
  const kicker=block.querySelector('.focus-venn-detail-kicker');
  const heading=block.querySelector('.focus-connection-heading');
  const intro=block.querySelector('.focus-connection-intro');
  const panel=block.querySelector('.focus-venn-detail');
  const copies={
    pt:{heading:'COMO ESSAS ÁREAS SE CONECTAM',intro:'Clientes, dados e negócio: três perspectivas que se fortalecem quando trabalham juntas.',kicker:'NA PRÁTICA',areas:{
      center:['Minha atuação','Conecto clientes, dados e negócio para compreender cenários, identificar oportunidades, melhorar processos e apoiar decisões.'],
      crm:['CRM & Jornadas','Segmentação, comunicação e acompanhamento da jornada para fortalecer o relacionamento com clientes e medir resultados.'],
      bi:['Business Intelligence','Modelagem de dados, dashboards e indicadores para traduzir informações em análises úteis à tomada de decisão.'],
      market:['Marketing & Mercado','Comportamento do consumidor, pesquisa de mercado e performance de campanhas para orientar estratégias.']}},
    en:{heading:'HOW THESE AREAS CONNECT',intro:'Customers, data and business: three perspectives that become stronger together.',kicker:'IN PRACTICE',areas:{
      center:['My approach','I connect customers, data and business to understand scenarios, identify opportunities, improve processes and support decisions.'],
      crm:['CRM & Journeys','Segmentation, communication and customer journey monitoring to strengthen relationships and measure results.'],
      bi:['Business Intelligence','Data modeling, dashboards and metrics to turn information into useful insights for decision-making.'],
      market:['Marketing & Market','Consumer behavior, market research and campaign performance to guide strategies.']}},
    es:{heading:'CÓMO SE CONECTAN ESTAS ÁREAS',intro:'Clientes, datos y negocio: tres perspectivas que se fortalecen al trabajar juntas.',kicker:'EN LA PRÁCTICA',areas:{
      center:['Mi enfoque','Conecto clientes, datos y negocio para comprender escenarios, identificar oportunidades, mejorar procesos y apoyar decisiones.'],
      crm:['CRM y Recorridos','Segmentación, comunicación y seguimiento del recorrido del cliente para fortalecer relaciones y medir resultados.'],
      bi:['Business Intelligence','Modelado de datos, dashboards e indicadores para transformar la información en análisis útiles para tomar decisiones.'],
      market:['Marketing y Mercado','Comportamiento del consumidor, investigación de mercado y rendimiento de campañas para orientar estrategias.']}}
  };
  let current='center';
  let lang=document.documentElement.lang.toLowerCase().startsWith('en')?'en':document.documentElement.lang.toLowerCase().startsWith('es')?'es':'pt';
  const render=(animate=false)=>{
    const copy=copies[lang];
    heading.textContent=copy.heading;intro.textContent=copy.intro;kicker.textContent=copy.kicker;
    buttons.forEach(b=>{
      const area=b.dataset.area;
      b.querySelector('span').textContent=area==='center'?({pt:'Meu foco',en:'My focus',es:'Mi enfoque'})[lang]:copy.areas[area][0];
      b.classList.toggle('is-active',area===current);
      b.setAttribute('aria-pressed',String(area===current));
      b.setAttribute('aria-label',copy.areas[area][0]+': '+copy.areas[area][1]);
    });
    title.textContent=copy.areas[current][0];
    description.textContent=copy.areas[current][1];
    panel.classList.remove('is-changing');
    if(animate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      void panel.offsetWidth;panel.classList.add('is-changing');
    }
  };
  buttons.forEach(button=>{
    const activate=()=>{if(current!==button.dataset.area){current=button.dataset.area;render(true)}};
    button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')activate()});
    button.addEventListener('focus',activate);
    button.addEventListener('click',activate);
  });
  document.addEventListener('portfolio:languagechange',e=>{lang=copies[e.detail?.lang]?e.detail.lang:'pt';render()});
  render();
})();
