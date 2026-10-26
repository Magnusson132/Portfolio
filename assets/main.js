(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Lantern hero: the pointer carries the light, like the lantern in Hollow Maze. */
  const hero = document.querySelector('.hero');
  if (hero) {
    let tx = null, ty = null, cx = null, cy = null, raf = null;
    const set = (x, y) => {
      hero.style.setProperty('--x', x + 'px');
      hero.style.setProperty('--y', y + 'px');
    };
    const tick = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      set(cx, cy);
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(tick) : null;
    };
    const move = (e) => {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (cx === null || reduceMotion) { cx = tx; cy = ty; set(cx, cy); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerdown', move);
  }

  /* Gameplay loops play only while on screen (and never on their own with reduced motion). */
  const loops = document.querySelectorAll('video[data-loop]');
  if (reduceMotion) {
    loops.forEach((v) => { v.removeAttribute('autoplay'); v.controls = true; });
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          if (target.preload === 'none') target.preload = 'auto';
          target.play().catch(() => {});
        } else {
          target.pause();
        }
      });
    }, { threshold: 0.35 });
    loops.forEach((v) => io.observe(v));
  }

  /* Copy email address */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const status = document.getElementById(btn.getAttribute('aria-describedby') || '');
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        if (status) status.textContent = 'Email address copied.';
      } catch {
        if (status) status.textContent = btn.dataset.copy;
      }
    });
  });

  /* Lightbox for screenshots */
  const zooms = document.querySelectorAll('button.zoom');
  if (zooms.length && 'HTMLDialogElement' in window) {
    const dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.innerHTML = '<button class="close" type="button" aria-label="Close image">×</button><img alt=""><p></p>';
    document.body.appendChild(dlg);
    const img = dlg.querySelector('img');
    const cap = dlg.querySelector('p');
    dlg.querySelector('.close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    zooms.forEach((b) => b.addEventListener('click', () => {
      const src = b.querySelector('img');
      img.src = src.currentSrc || src.src;
      img.alt = src.alt;
      cap.textContent = src.alt;
      dlg.showModal();
    }));
  }

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
