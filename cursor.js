(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!finePointer || document.querySelector(".custom-cursor-dot")) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("custom-cursor");

  const dot = document.createElement("div");
  dot.className = "custom-cursor-dot";

  const ring = document.createElement("div");
  ring.className = "custom-cursor-ring";

  document.body.append(ring, dot);

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let hasMoved = false;

  const setVisible = visible => {
    const opacity = visible ? "1" : "0";
    dot.style.opacity = opacity;
    ring.style.opacity = opacity;
  };

  window.addEventListener("pointermove", event => {
    if (event.pointerType && event.pointerType !== "mouse") return;

    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;

    if (!hasMoved) {
      ringX = mouseX;
      ringY = mouseY;
      hasMoved = true;
    }

    setVisible(true);
  });

  document.addEventListener("pointerover", event => {
    const interactive = event.target.closest(
      'a,button,[role="button"],input,textarea,select,.contact-card,.text-link,.project-feature,.hero-sql-control-active'
    );

    if (interactive?.classList.contains("hero-sql-control-active")) {
      interactive.style.cursor = "none";
    }

    ring.classList.toggle("is-interactive", Boolean(interactive));
  });

  document.addEventListener("pointerout", event => {
    if (!event.relatedTarget) setVisible(false);
  });

  document.addEventListener("pointerdown", () => ring.classList.add("is-clicking"));
  document.addEventListener("pointerup", () => ring.classList.remove("is-clicking"));

  const animate = () => {
    const follow = prefersReducedMotion ? 1 : 0.16;
    ringX += (mouseX - ringX) * follow;
    ringY += (mouseY - ringY) * follow;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animate);
  };

  animate();
})();
