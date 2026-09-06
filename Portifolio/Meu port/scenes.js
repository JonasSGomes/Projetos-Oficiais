'use strict';
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 821px)');
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const dots = [...document.querySelectorAll('.scene-nav a')];
  let frame = null;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function draw() {
    frame = null;
    const animated = !reduce.matches && desktop.matches;
    const viewport = innerHeight;
    for (const scene of scenes) {
      if (scene.hidden) continue;
      const rect = scene.getBoundingClientRect();
      if (animated && (rect.bottom < -viewport || rect.top > viewport * 2)) continue;
      const progress = animated ? clamp((viewport - rect.top) / (viewport + rect.height), 0, 1) - 0.5 : 0;
      scene.style.setProperty('--scene-drift', `${progress * 160}px`);
      scene.style.setProperty('--hero-drift', `${progress * -90}px`);
      scene.style.setProperty('--word-drift', `${progress * -160}px`);
      scene.style.setProperty('--project-word-drift', `${progress * 220}px`);
      scene.style.setProperty('--art-drift', `${progress * -100}px`);
    }
    let active = sections[0]?.id;
    for (const section of sections) if (section.getBoundingClientRect().top < viewport * 0.45) active = section.id;
    dots.forEach(dot => {
      const selected = dot.hash === `#${active}`;
      dot.classList.toggle('active', selected);
      if (selected) dot.setAttribute('aria-current', 'location'); else dot.removeAttribute('aria-current');
    });
  }
  function schedule() { if (frame === null) frame = requestAnimationFrame(draw); }
  addEventListener('scroll', schedule, { passive:true });
  addEventListener('resize', schedule);
  reduce.addEventListener('change', schedule);
  desktop.addEventListener('change', schedule);
  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', schedule));
  dots.forEach(dot => dot.addEventListener('click', () => {
    const section = document.querySelector(dot.hash);
    section.tabIndex = -1;
    section.focus({ preventScroll:true });
  }));
  draw();
})();
