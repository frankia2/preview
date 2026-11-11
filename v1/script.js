(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* entradas: una vez, escalonadas por --i */
  const items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  /* deriva suave de las fotografías con el scroll (solo transform) */
  const drifts = [...document.querySelectorAll('[data-drift]')];
  if (!reduce && drifts.length) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      drifts.forEach((fig) => {
        const r = fig.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = ((r.top + r.height / 2) - vh / 2) / vh;
        fig.style.setProperty('--p', Math.max(-1, Math.min(1, p)).toFixed(3));
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* cotizador: sitio + marca, con los precios de la propuesta */
  const fmt = (n) => '$' + new Intl.NumberFormat('es-CO').format(n);
  const WEB = 2500000;
  const form = document.getElementById('cotizador');
  if (form) {
    const $ = (id) => document.getElementById(id);
    const notes = { 0: 'Ya la tienes', 1500000: 'Acondicionamiento básico', 2500000: 'Creación completa, precio desde' };
    const render = () => {
      const sel = form.querySelector('input[name="marca"]:checked');
      const brand = Number(sel.value);
      const from = sel.dataset.from ? 'desde ' : '';
      $('q-web').textContent = fmt(WEB);
      $('q-marca').textContent = brand ? from + fmt(brand) : '$0';
      $('q-marca-n').textContent = notes[brand];
      $('q-total').textContent = from + fmt(WEB + brand);
      ['q-marca', 'q-total'].forEach((id) => {
        const el = $(id); el.classList.remove('is-tick'); void el.offsetWidth; el.classList.add('is-tick');
      });
    };
    form.addEventListener('change', render);
    render();
  }
})();
