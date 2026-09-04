const initHeroSql = () => {
  const heroSqlCode = document.querySelector('.hero-sql-code');
  if (!heroSqlCode) return;

  const heroSql = heroSqlCode.closest('.hero-sql');
  const heroSqlHead = heroSql?.querySelector('.hero-sql-head');
  const originalTitle = heroSqlHead?.querySelector('span');
  const windowControls = heroSqlHead ? [...heroSqlHead.querySelectorAll('i')] : [];
  const tokens = [
    ['SELECT','kw'],[' ',''],['insights',''],[', ',''],['strategy',''],[', ',''],['results',''],['\n',''],
    ['FROM','kw'],[' ',''],['experience','obj'],['\n',''],
    ['WHERE','kw'],[' ',''],['focus',''],[' = ',''],["'business'",'str'],['\n',''],
    ['ORDER BY','kw'],[' ',''],['impact',''],[' ',''],['DESC','kw'],[';','']
  ];

  const renderCompleteQuery = () => {
    heroSqlCode.innerHTML = '';
    tokens.forEach(([text, cls]) => {
      const span = document.createElement('span');
      if (cls) span.className = cls;
      span.textContent = text;
      heroSqlCode.appendChild(span);
    });
    const caret = document.createElement('span');
    caret.className = 'sql-caret';
    caret.setAttribute('aria-hidden', 'true');
    heroSqlCode.appendChild(caret);
  };

  if (prefersReducedMotion) {
    renderCompleteQuery();
  } else {
    heroSqlCode.innerHTML = '';
    const chars = [];
    tokens.forEach(([text, cls]) => [...text].forEach(char => chars.push([char, cls])));
    let i = 0;

    const step = () => {
      if (i >= chars.length) {
        const caret = document.createElement('span');
        caret.className = 'sql-caret';
        caret.setAttribute('aria-hidden', 'true');
        heroSqlCode.appendChild(caret);
        return;
      }

      const [char, cls] = chars[i++];
      let last = heroSqlCode.lastElementChild;
      if (!last || last.className !== cls) {
        last = document.createElement('span');
        if (cls) last.className = cls;
        heroSqlCode.appendChild(last);
      }
      last.textContent += char;
      setTimeout(step, char === '\n' ? 130 : 24 + Math.random() * 34);
    };

    setTimeout(step, 500);
  }

  if (!heroSql || !heroSqlHead || !originalTitle || windowControls.length !== 3) return;

  // O terminal inteiro é decorativo para tecnologias assistivas.
  heroSql.setAttribute('aria-hidden', 'true');

  const titleLink = document.createElement('a');
  titleLink.className = 'hero-sql-title-link';
  titleLink.href = 'https://github.com/lucasdemrodrigues';
  titleLink.target = '_blank';
  titleLink.rel = 'noreferrer';
  titleLink.tabIndex = -1;
  titleLink.textContent = 'portfolio.sql';
  originalTitle.replaceWith(titleLink);

  const overlayTop = heroSqlHead.offsetHeight || 48;

  const matrixCanvas = document.createElement('canvas');
  matrixCanvas.className = 'hero-sql-matrix';
  matrixCanvas.setAttribute('aria-hidden', 'true');
  matrixCanvas.style.top = `${overlayTop}px`;
  matrixCanvas.style.height = `calc(100% - ${overlayTop}px)`;
  heroSql.appendChild(matrixCanvas);

  const glitchBands = document.createElement('div');
  glitchBands.className = 'hero-sql-glitch-bands';
  glitchBands.setAttribute('aria-hidden', 'true');
  glitchBands.style.top = `${overlayTop}px`;
  for (let i = 0; i < 3; i++) glitchBands.appendChild(document.createElement('span'));
  heroSql.appendChild(glitchBands);

  let matrixFrame = 0;
  let matrixTimer = 0;
  let glitchTimer = 0;
  let matrixRunning = false;

  [windowControls[1], windowControls[2]].forEach(control => {
    control.classList.add('hero-sql-control-passive');
    control.removeAttribute('role');
    control.removeAttribute('tabindex');
    control.removeAttribute('aria-label');
    control.removeAttribute('title');
  });

  windowControls[0].classList.add('hero-sql-control-active');
  windowControls[0].removeAttribute('role');
  windowControls[0].removeAttribute('tabindex');
  windowControls[0].removeAttribute('aria-label');
  windowControls[0].removeAttribute('title');

  const resetGlitch = () => {
    clearTimeout(glitchTimer);
    glitchTimer = 0;
    glitchBands.style.display = 'none';
    heroSqlCode.style.transform = '';
    heroSqlCode.style.filter = '';
    heroSqlCode.style.textShadow = '';
    heroSqlCode.style.opacity = '';
  };

  const stopMatrix = () => {
    if (matrixFrame) cancelAnimationFrame(matrixFrame);
    clearTimeout(matrixTimer);
    resetGlitch();
    matrixFrame = 0;
    matrixTimer = 0;
    matrixRunning = false;
    matrixCanvas.style.display = 'none';
    heroSqlCode.style.visibility = '';
    const ctx = matrixCanvas.getContext('2d');
    ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  };

  const prepareCanvas = () => {
    const rect = matrixCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    matrixCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    matrixCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = matrixCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { rect, ctx };
  };

  const drawStaticMatrix = () => {
    const { rect, ctx } = prepareCanvas();
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-=/<>[]{}';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.font = '16px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#39ff14';
    for (let y = 20; y < rect.height; y += 24) {
      for (let x = 10; x < rect.width; x += 24) {
        ctx.globalAlpha = .22 + Math.random() * .65;
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
      }
    }
    ctx.globalAlpha = 1;
  };

  const beginMatrixRain = () => {
    resetGlitch();
    matrixCanvas.style.display = 'block';
    heroSqlCode.style.visibility = 'hidden';

    const { rect, ctx } = prepareCanvas();
    const fontSize = 17;
    const columnGap = 21;
    const columns = Math.max(1, Math.floor(rect.width / columnGap));
    const drops = Array.from({length:columns}, () => Math.floor(Math.random() * -14));
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-=/<>[]{}';
    let lastDraw = 0;
    const frameInterval = 78;

    const draw = now => {
      if (!lastDraw || now - lastDraw >= frameInterval) {
        lastDraw = now;
        ctx.fillStyle = 'rgba(0,0,0,.15)';
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = Math.random() > .96 ? '#d7ffd0' : '#39ff14';
          ctx.fillText(char, i * columnGap, drops[i] * fontSize);
          if (drops[i] * fontSize > rect.height && Math.random() > .94) drops[i] = 0;
          else drops[i] += .7;
        }
      }
      matrixFrame = requestAnimationFrame(draw);
    };

    matrixFrame = requestAnimationFrame(draw);
    matrixTimer = setTimeout(stopMatrix, 5000);
  };

  const runGlitch = next => {
    if (prefersReducedMotion) {
      next();
      return;
    }

    const frames = [
      {x:3, skew:-.5, opacity:.92},
      {x:-4, skew:.7, opacity:.72},
      {x:2, skew:-.35, opacity:1},
      {x:-2, skew:.4, opacity:.82},
      {x:0, skew:0, opacity:1}
    ];
    let index = 0;
    glitchBands.style.display = 'block';

    const tick = () => {
      const frame = frames[index];
      heroSqlCode.style.transform = `translateX(${frame.x}px) skewX(${frame.skew}deg)`;
      heroSqlCode.style.filter = index % 2 ? 'contrast(1.35) saturate(1.45)' : 'contrast(1.15)';
      heroSqlCode.style.textShadow = index % 2
        ? '-2px 0 rgba(255,45,90,.72),2px 0 rgba(0,229,255,.72)'
        : '1px 0 rgba(57,255,20,.55)';
      heroSqlCode.style.opacity = String(frame.opacity);
      [...glitchBands.children].forEach(band => {
        band.style.top = `${12 + Math.random() * 72}%`;
        band.style.transform = `translateX(${(Math.random() - .5) * 14}px)`;
        band.style.opacity = String(.35 + Math.random() * .6);
      });

      index++;
      if (index < frames.length) glitchTimer = setTimeout(tick, 70);
      else {
        resetGlitch();
        next();
      }
    };

    tick();
  };

  const startMatrix = () => {
    if (matrixRunning) return;
    matrixRunning = true;

    if (prefersReducedMotion) {
      matrixCanvas.style.display = 'block';
      heroSqlCode.style.visibility = 'hidden';
      drawStaticMatrix();
      matrixTimer = setTimeout(stopMatrix, 1000);
      return;
    }

    runGlitch(beginMatrixRain);
  };

  windowControls[0].addEventListener('click', event => {
    event.stopPropagation();
    startMatrix();
  });

  window.addEventListener('resize', () => {
    if (matrixRunning) {
      stopMatrix();
      startMatrix();
    }
  });
};

// SQL do Hero: digita a consulta uma única vez na entrada; o vermelho revela o Easter egg.
initHeroSql();
