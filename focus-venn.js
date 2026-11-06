(() => {
  const block=document.querySelector('.focus-connection');
  if(!block)return;
  const buttons=[...block.querySelectorAll('[data-area]')];
  const title=block.querySelector('.focus-venn-tooltip-title');
  const description=block.querySelector('.focus-venn-tooltip-text');
  const tooltip=block.querySelector('.focus-venn-tooltip');
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
  let current=null;
  let lang=document.documentElement.lang.toLowerCase().startsWith('en')?'en':document.documentElement.lang.toLowerCase().startsWith('es')?'es':'pt';
  const render=()=>{
    const copy=copies[lang];
    buttons.forEach(button=>{
      const area=button.dataset.area;
      button.querySelector('span').textContent=area==='center'?({pt:'Meu foco',en:'My focus',es:'Mi enfoque'})[lang]:copy.areas[area][0];
      button.classList.toggle('is-active',area===current);
      button.setAttribute('aria-pressed',String(area===current));
      button.setAttribute('aria-label',copy.areas[area][0]+': '+copy.areas[area][1]);
    });
    if(current){
      title.textContent=copy.areas[current][0];
      description.textContent=copy.areas[current][1];
      tooltip.classList.add('is-visible');
    }else{
      tooltip.classList.remove('is-visible');
    }
  };
  const activate=area=>{current=area;render()};
  buttons.forEach(button=>{
    button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')activate(button.dataset.area)});
    button.addEventListener('focus',()=>activate(button.dataset.area));
    button.addEventListener('click',()=>activate(button.dataset.area));
  });
  block.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen'){current=null;render()}});
  block.addEventListener('focusout',e=>{if(!block.contains(e.relatedTarget)){current=null;render()}});
  document.addEventListener('pointerdown',e=>{if(!block.contains(e.target)){current=null;render()}});
  document.addEventListener('portfolio:languagechange',e=>{lang=copies[e.detail?.lang]?e.detail.lang:'pt';render()});
  render();
})();
