const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.spotlight-card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (e) => {
  if (!glow) return;
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});

document.getElementById('year').textContent = new Date().getFullYear();

// Hero: superfície 3D orgânica animada em preto/grafite.
const flowHost = document.querySelector('.hero-flow');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (flowHost) {
  flowHost.innerHTML = '';
  flowHost.style.opacity = '1';

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.filter = 'contrast(1.06)';
  flowHost.appendChild(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  let raf = 0;
  let start = performance.now();

  function resizeSurface() {
    const rect = flowHost.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function heightAt(u, v, t) {
    const wave1 = Math.sin(u * 4.0 + t * 0.55) * 0.42;
    const wave2 = Math.cos(v * 4.8 - t * 0.44) * 0.34;
    const wave3 = Math.sin((u + v) * 3.2 + t * 0.30) * 0.24;
    const swell1 = Math.exp(-((u - 0.64) ** 2 * 7.5 + (v - 0.42) ** 2 * 5.5)) * 1.55;
    const swell2 = Math.exp(-((u - 0.88) ** 2 * 10 + (v - 0.72) ** 2 * 7)) * 0.95;
    const dip = Math.exp(-((u - 0.48) ** 2 * 13 + (v - 0.56) ** 2 * 11)) * -0.75;
    return wave1 + wave2 + wave3 + swell1 + swell2 + dip;
  }

  function point(u, v, t) {
    const z = heightAt(u, v, t);
    const perspective = 1 / (1.18 - z * 0.11);
    const baseX = (u - 0.5) * width * 1.18;
    const baseY = (v - 0.5) * height * 0.92;
    const twist = Math.sin(v * 3.1 + t * 0.25) * width * 0.028;
    return {
      x: width * 0.58 + (baseX + twist) * perspective,
      y: height * 0.51 + (baseY - z * height * 0.19) * perspective,
      z
    };
  }

  function drawSurface(now) {
    const t = reduceMotion ? 1.8 : (now - start) / 1000;
    ctx.clearRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(0.48, 'rgba(8,8,8,0.03)');
    bg.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const cols = width < 700 ? 28 : 42;
    const rows = width < 700 ? 18 : 26;
    const pts = Array.from({ length: rows + 1 }, (_, r) =>
      Array.from({ length: cols + 1 }, (_, c) => point(c / cols, r / rows, t))
    );

    // Superfície preenchida por pequenos quadriláteros com iluminação calculada.
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p1 = pts[r][c];
        const p2 = pts[r][c + 1];
        const p3 = pts[r + 1][c + 1];
        const p4 = pts[r + 1][c];

        const dzx = p2.z - p1.z;
        const dzy = p4.z - p1.z;
        const normalLight = Math.max(-1, Math.min(1, 0.45 - dzx * 1.15 - dzy * 0.85));
        const depth = (p1.z + p2.z + p3.z + p4.z) / 4;
        const edgeFade = Math.sin((c / cols) * Math.PI) * Math.sin((r / rows) * Math.PI);
        const silver = Math.max(0, normalLight) * 58 + Math.max(0, depth) * 18;
        const base = Math.max(7, 17 + silver);
        const alpha = 0.10 + edgeFade * 0.43;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = `rgba(${base},${base},${base + 2},${alpha})`;
        ctx.fill();
      }
    }

    // Linhas de contorno discretas ajudam a leitura de profundidade sem parecer wireframe.
    ctx.lineWidth = 0.7;
    for (let r = 0; r <= rows; r += 2) {
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const p = pts[r][c];
        if (c === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(210,210,214,0.075)';
      ctx.stroke();
    }

    // Reflexo especular suave que desliza pela superfície.
    const shineX = width * (0.63 + Math.sin(t * 0.17) * 0.08);
    const shineY = height * (0.42 + Math.cos(t * 0.15) * 0.07);
    const shine = ctx.createRadialGradient(shineX, shineY, 0, shineX, shineY, Math.max(width, height) * 0.34);
    shine.addColorStop(0, 'rgba(255,255,255,0.13)');
    shine.addColorStop(0.22, 'rgba(180,180,185,0.07)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, width, height);

    if (!reduceMotion) raf = requestAnimationFrame(drawSurface);
  }

  resizeSurface();
  drawSurface(performance.now());

  const resizeObserver = new ResizeObserver(() => resizeSurface());
  resizeObserver.observe(flowHost);

  if (reduceMotion) {
    window.addEventListener('resize', () => drawSurface(performance.now()), { passive: true });
  }
}
