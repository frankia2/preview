(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* entradas escalonadas, una vez */
  const items = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add('is-in'));

  const fmt = (n) => '$' + new Intl.NumberFormat('es-CO').format(n);

  /* radiogrupo accesible: flechas + clic */
  const radio = (group, onPick) => {
    const btns = $$('button', group);
    const pick = (b, focus) => {
      btns.forEach((x) => { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); x.tabIndex = x === b ? 0 : -1; });
      if (focus) b.focus();
      onPick(b.dataset.v);
    };
    btns.forEach((b, i) => {
      b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
      b.addEventListener('click', () => pick(b, false));
      b.addEventListener('keydown', (e) => {
        const k = e.key; let j = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % btns.length;
        if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + btns.length) % btns.length;
        if (j !== null) { e.preventDefault(); pick(btns[j], true); }
      });
    });
  };

  /* configurador: arma tu sitio */
  const art = $('#art');
  if (art) {
    const WEB = 2500000;
    const state = { flows: '0', socios: 'off', mode: 'narrow', brand: 'mine' };
    const price = { mine: 0, basic: 1500000, new: 2500000 };
    const total = $('#b-total'), note = $('#b-note');
    const render = (tick) => {
      art.dataset.flows = state.flows; art.dataset.socios = state.socios; art.dataset.mode = state.mode; art.dataset.brand = state.brand;
      const b = price[state.brand];
      const from = state.brand === 'new' ? 'desde ' : '';
      total.textContent = from + fmt(WEB + b);
      note.textContent = b ? 'Sitio en dos pagos de $1.250.000, más la marca' : 'Sitio en dos pagos de $1.250.000';
      if (tick) { total.classList.remove('is-tick'); void total.offsetWidth; total.classList.add('is-tick'); }
    };
    radio($('[data-ctl="flows"]'), (v) => { state.flows = v; render(true); });
    radio($('[data-ctl="mode"]'), (v) => { state.mode = v; render(false); });
    radio($('[data-ctl="brand"]'), (v) => { state.brand = v; render(true); });
    const sw = $('[data-ctl="socios"] button');
    sw.addEventListener('click', () => {
      const on = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(on));
      $('.sw__t', sw).textContent = on ? 'Con interna' : 'Sin interna';
      state.socios = on ? 'on' : 'off'; render(false);
    });
    render(false);
  }

  /* precios: marca básica o completa */
  const plan = $('[data-ctl="plan"]');
  if (plan) {
    const txt = {
      basic: ['Estilizo tus logos en SVG, armo un manual de marca básico y te entrego un listado de deudas técnicas: las mejoras que el presupuesto no alcanza a cubrir.', '$1.500.000', 'COP, aparte del sitio'],
      full: ['Talleres de conceptualización, investigación y referentes, plataforma de marca (propósito, visión, misión, valores y propuesta de valor), identidad visual y logo en SVG, línea gráfica, voz y tono, y manual de marca completo.', '$2.500.000', 'COP, el precio parte desde aquí'],
    };
    radio(plan, (v) => {
      $('#plan-inc').textContent = txt[v][0]; $('#plan-price').textContent = txt[v][1]; $('#plan-note').textContent = txt[v][2];
    });
  }

  /* hora de Bogotá */
  const hora = $('#hora');
  if (hora) {
    const f = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true });
    const tick = () => { hora.textContent = f.format(new Date()); };
    tick(); setInterval(tick, 30000);
  }
})();
