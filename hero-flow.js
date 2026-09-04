// Fundo do Hero inspirado na configuração pública original do portfólio de Pedro Lauro.
const flowHost = document.querySelector('.hero-flow');

if (flowHost) {
  flowHost.innerHTML = '';
  flowHost.style.opacity = '1';

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  flowHost.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particleCount = 40;
  const linkDistance = 150;
  const linkOpacity = 0.5;
  const speed = 3;
  const particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = performance.now();

  const palette = () => document.body.classList.contains('light-mode')
    ? { bg:'#f4f2ed', particle:'rgba(30,30,30,0.32)', link:[30,30,30] }
    : { bg:'#000000', particle:'rgba(255,255,255,0.5)', link:[255,255,255] };

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.35 + Math.random() * 0.35);
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity;
      this.radius = 1 + Math.random() * 4;
    }
    update(dt) {
      if (prefersReducedMotion) return;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.x <= this.radius || this.x >= width - this.radius) {
        this.vx *= -1;
        this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
      }
      if (this.y <= this.radius || this.y >= height - this.radius) {
        this.vy *= -1;
        this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = palette().particle;
      ctx.fill();
    }
  }

  function resizeParticles() {
    const rect = flowHost.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!particles.length) {
      for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    } else {
      particles.forEach(p => { p.x = Math.min(p.x, width); p.y = Math.min(p.y, height); });
    }
  }

  function resolveCollisions() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const minDist = a.radius + b.radius;
        const distSq = dx * dx + dy * dy;
        if (distSq > 0 && distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq), nx = dx / dist, ny = dy / dist;
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) {
            a.vx += rel * nx; a.vy += rel * ny;
            b.vx -= rel * nx; b.vy -= rel * ny;
          }
        }
      }
    }
  }

  function drawLinks() {
    const colors = palette().link;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist <= linkDistance) {
          const opacity = (1 - dist / linkDistance) * linkOpacity;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${colors[0]},${colors[1]},${colors[2]},${opacity})`; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
  }

  function animate(now) {
    const dt = Math.min((now - lastTime) / 16.6667, 2);
    lastTime = now;
    const colors = palette();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, width, height);
    particles.forEach(p => p.update(dt));
    if (!prefersReducedMotion) resolveCollisions();
    drawLinks(); particles.forEach(p => p.draw());
    if (!prefersReducedMotion) requestAnimationFrame(animate);
  }

  resizeParticles(); animate(performance.now());
  const resizeObserver = new ResizeObserver(() => { resizeParticles(); if (prefersReducedMotion) animate(performance.now()); });
  resizeObserver.observe(flowHost);
}
