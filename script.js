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

  /* radiogrupo accesible: flechas + clic. Devuelve un setter que no dispara onPick */
  const radio = (group, onPick) => {
    const btns = $$('button', group);
    const mark = (b) => btns.forEach((x) => { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); x.tabIndex = x === b ? 0 : -1; });
    const pick = (b, focus) => { mark(b); if (focus) b.focus(); onPick(b.dataset.v); };
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
    return (v) => { const b = btns.find((x) => x.dataset.v === v); if (b) mark(b); };
  };

  /* ---------- configurador: el sitio se arma delante del visitante ---------- */
  const art = $('#art');
  if (art) {
    const WEB = 2500000;
    const state = { flows: '0', socios: 'off', mode: 'narrow', brand: 'mine' };
    const price = { mine: 0, basic: 1500000, new: 2500000 };
    const total = $('#b-total'), note = $('#b-note');
    const render = (tick) => {
      art.dataset.flows = state.flows; art.dataset.socios = state.socios; art.dataset.mode = state.mode; art.dataset.brand = state.brand;
      const b = price[state.brand];
      total.textContent = (state.brand === 'new' ? 'desde ' : '') + fmt(WEB + b);
      note.textContent = b ? 'Sitio en dos pagos de $1.250.000, más la marca' : 'Sitio en dos pagos de $1.250.000';
      if (tick) { total.classList.remove('is-tick'); void total.offsetWidth; total.classList.add('is-tick'); }
    };
    const setFlows = radio($('[data-ctl="flows"]'), (v) => { state.flows = v; render(true); });
    const setMode = radio($('[data-ctl="mode"]'), (v) => { state.mode = v; render(false); });
    const setBrand = radio($('[data-ctl="brand"]'), (v) => { state.brand = v; render(true); });
    const sw = $('[data-ctl="socios"] button');
    const setSocios = (on) => {
      sw.setAttribute('aria-checked', String(on));
      $('.sw__t', sw).textContent = on ? 'Con interna' : 'Sin interna';
      state.socios = on ? 'on' : 'off';
    };
    sw.addEventListener('click', () => { setSocios(sw.getAttribute('aria-checked') !== 'true'); render(false); });
    render(false);

    /* demostración sola: recorre las opciones hasta que el visitante toca algo */
    const steps = [
      { flows: '1' }, { flows: '2' }, { socios: 'on' }, { mode: 'wide' }, { mode: 'narrow' },
      { brand: 'basic' }, { brand: 'new' }, { flows: '0', socios: 'off', brand: 'mine' },
    ];
    const apply = (p) => {
      Object.assign(state, p);
      setFlows(state.flows); setMode(state.mode); setBrand(state.brand); setSocios(state.socios === 'on');
      render(true);
    };
    const stage = $('.stage');
    let n = 0, timer = null, seen = true, touched = false;
    const stop = () => { touched = true; clearInterval(timer); total.parentElement.setAttribute('aria-live', 'polite'); };
    if (!reduce) {
      timer = setInterval(() => { if (touched || document.hidden || !seen) return; apply(steps[n++ % steps.length]); }, 2800);
      ['pointerdown', 'keydown', 'focusin'].forEach((ev) => $('.cfg').addEventListener(ev, stop, { once: true }));
      if ('IntersectionObserver' in window) new IntersectionObserver((es) => { seen = es[0].isIntersecting; }).observe(stage);
    }
  }

  /* ---------- proceso: un control mueve el texto y la tarjeta ---------- */
  const range = $('#stage');
  if (range) {
    const clause = $('#clause'), note = $('#clause-note'), field = $('.how__clause');
    const cards = $$('.how__frag .card'), names = $$('.names button');
    const copy = [
      ['Me entregas tu información.', 'Aportas el manual de marca, los logos en SVG, la paleta, la información de tu empresa y el dominio. Con el 50 % empiezo.'],
      ['Ves el primer diseño.', 'Semana 1. Primera de dos revisiones.'],
      ['Haces la última revisión.', 'Semana 3. Última de dos revisiones.'],
      ['Sale al aire, en tu dominio.', 'Semana 4. Se paga el 50 % restante y publico.'],
    ];
    let cur = 0, t = null;
    const go = (v) => {
      v = Math.max(0, Math.min(3, +v));
      if (v === cur) return;
      cur = v;
      range.value = v;
      range.style.setProperty('--p', (v / 3 * 100) + '%');
      range.setAttribute('aria-valuetext', names[v].textContent);
      cards.forEach((c) => { const on = +c.dataset.s === v; c.classList.toggle('on', on); c.setAttribute('aria-hidden', String(!on)); });
      names.forEach((b) => b.toggleAttribute('aria-current', +b.dataset.s === v));
      names.forEach((b) => { if (+b.dataset.s === v) b.setAttribute('aria-current', 'true'); });
      clearTimeout(t);
      field.classList.add('is-swap');
      t = setTimeout(() => { clause.textContent = copy[v][0]; note.textContent = copy[v][1]; field.classList.remove('is-swap'); }, reduce ? 0 : 160);
    };
    range.addEventListener('input', () => go(range.value));
    names.forEach((b) => b.addEventListener('click', () => go(b.dataset.s)));
  }

  /* ---------- preguntas: un índice, una respuesta ---------- */
  const faq = $('.q');
  if (faq) {
    const pane = $('#pane');
    const lis = $$('li', faq);
    const wide = window.matchMedia('(min-width: 901px)');
    let swap = null;
    const show = (li) => {
      lis.forEach((x) => { const on = x === li; x.classList.toggle('is-open', on); $('button', x).setAttribute('aria-expanded', String(on)); });
      if (!wide.matches) return;
      clearTimeout(swap);
      pane.classList.add('is-swap');
      swap = setTimeout(() => { pane.innerHTML = $('.q__a', li).innerHTML; pane.classList.remove('is-swap'); }, reduce ? 0 : 150);
    };
    lis.forEach((li) => {
      const b = $('button', li);
      b.addEventListener('click', () => {
        if (!wide.matches && li.classList.contains('is-open')) { li.classList.remove('is-open'); b.setAttribute('aria-expanded', 'false'); return; }
        show(li);
      });
      b.addEventListener('mouseenter', () => { if (wide.matches && !li.classList.contains('is-open')) show(li); });
      b.addEventListener('focus', () => { if (wide.matches && !li.classList.contains('is-open')) show(li); });
    });
    pane.innerHTML = $('.q__a', lis[0]).innerHTML;
  }
})();
