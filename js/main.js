/* MM Metal Matriex — site behaviour. No dependencies. */

/* ---- Contact details: fill these in and they appear in the Contact section. ---- */
const SITE = {
  email: '',     // e.g. 'sales@example.com' — enquiry form sends here
  phone: '',     // e.g. '+91 00000 00000'
  address: ''    // e.g. 'Street, City, PIN'
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= NAV ================= */
(() => {
  const nav = $('#nav'), tg = $('#navToggle'), links = $('#navLinks');
  const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const close = () => { links.classList.remove('open'); tg.setAttribute('aria-expanded', 'false'); };
  tg.addEventListener('click', () => {
    const o = links.classList.toggle('open'); tg.setAttribute('aria-expanded', o);
  });
  links.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  $('#yr').textContent = new Date().getFullYear();
})();

/* ================= HERO: raised floor ================= */
(() => {
  const svg = $('#floor');
  const N = 7, TW = 112, TH = 56, H = 30, T = 8;
  const P = (i, j, z = 0) => [((i - j) * TW / 2).toFixed(1), ((i + j) * TH / 2 - z).toFixed(1)];
  const pts = a => a.map(p => p.join(',')).join(' ');
  const OPEN = new Set(['2,4', '3,4', '5,1']);
  const PERF = new Set(['1,2', '4,5', '5,5', '2,0', '6,3']);
  svg.setAttribute('viewBox', `${-N * TW / 2 - 8} -46 ${N * TW + 16} ${N * TH + H + 60}`);

  let s = '';
  // structural slab
  s += `<polygon points="${pts([P(0, 0, -H), P(N, 0, -H), P(N, N, -H), P(0, N, -H)])}" fill="#0a1230" stroke="rgba(127,214,247,.35)"/>`;
  for (let k = 1; k < N; k++) {
    s += `<path d="M${P(k, 0, -H)}L${P(k, N, -H)}M${P(0, k, -H)}L${P(N, k, -H)}" stroke="rgba(127,214,247,.08)"/>`;
  }
  // cables in the plenum
  const cables = [
    ['#00aeef', [[.5, 0], [.5, 4.5], [3.5, 4.5], [3.5, 7]]],
    ['#4cb848', [[0, 2.5], [5.5, 2.5], [5.5, 7]]],
    ['#7fd6f7', [[2.5, 0], [2.5, 1.5], [7, 1.5]]],
    ['#00aeef', [[7, 5.5], [1.5, 5.5], [1.5, 7]]]
  ];
  cables.forEach(([c, path]) => {
    const d = 'M' + path.map(([i, j]) => P(i, j, -H).join(',')).join('L');
    s += `<path class="cable-b" d="${d}" stroke="${c}"/><path class="cable" d="${d}" stroke="${c}"/>`;
  });
  // pedestals + stringers
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
    const [bx, by] = P(i, j, -H), [tx, ty] = P(i, j, -T);
    s += `<ellipse cx="${bx}" cy="${by}" rx="6" ry="3" fill="#3a4670"/><path d="M${bx},${by}L${tx},${ty}" stroke="#6f7da3" stroke-width="2.4"/>`;
  }
  for (let k = 0; k <= N; k++) {
    s += `<path d="M${P(k, 0, -T)}L${P(k, N, -T)}M${P(0, k, -T)}L${P(N, k, -T)}" stroke="#4a5682" stroke-width="1.6"/>`;
  }
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
    const [tx, ty] = P(i, j, -T);
    s += `<ellipse cx="${tx}" cy="${ty}" rx="6.5" ry="3.2" fill="#97a3c4"/>`;
  }
  // panels, back to front
  const cells = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (!OPEN.has(`${i},${j}`)) cells.push([i, j]);
  cells.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
  const tops = ['#eef2f6', '#e6ebf1', '#dde4ec'];
  const e = .025;
  let hits = '';
  cells.forEach(([i, j]) => {
    const a = P(i + e, j + e), b = P(i + 1 - e, j + e), c = P(i + 1 - e, j + 1 - e), d = P(i + e, j + 1 - e);
    const dn = p => [p[0], (+p[1] + T).toFixed(1)];
    s += `<g class="p" data-c="${i},${j}">`
      + `<polygon points="${pts([d, c, dn(c), dn(d)])}" fill="#a9b4c4"/>`
      + `<polygon points="${pts([b, c, dn(c), dn(b)])}" fill="#8490a4"/>`
      + `<polygon points="${pts([a, b, c, d])}" fill="${tops[(i * 3 + j * 5) % 3]}"/>`;
    if (PERF.has(`${i},${j}`)) {
      for (let u = 1; u <= 5; u++) for (let v = 1; v <= 5; v++) {
        const [x, y] = P(i + u / 6, j + v / 6);
        s += `<ellipse cx="${x}" cy="${y}" rx="4" ry="2" fill="#35415f"/>`;
      }
    }
    s += '</g>';
    hits += `<polygon class="hit" data-c="${i},${j}" points="${pts([P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)])}"/>`;
  });
  svg.innerHTML = s + hits;

  const byCell = Object.fromEntries($$('.p', svg).map(g => [g.dataset.c, g]));
  const timers = {};
  const lift = (c, ms) => {
    const g = byCell[c]; if (!g) return;
    g.classList.add('up'); clearTimeout(timers[c]);
    if (ms) timers[c] = setTimeout(() => g.classList.remove('up'), ms);
  };
  svg.addEventListener('pointerover', ev => { const c = ev.target.dataset && ev.target.dataset.c; if (c) lift(c); });
  svg.addEventListener('pointerout', ev => { const c = ev.target.dataset && ev.target.dataset.c; if (c) lift(c, 420); });

  if (!reduced) {
    // opening ripple, then an occasional idle lift
    setTimeout(() => cells.forEach(([i, j]) => setTimeout(() => lift(`${i},${j}`, 380), (i + j) * 75)), 500);
    let visible = true;
    new IntersectionObserver(([en]) => visible = en.isIntersecting).observe(svg);
    setInterval(() => {
      if (!visible || document.hidden) return;
      const [i, j] = cells[Math.floor(Math.random() * cells.length)];
      lift(`${i},${j}`, 1500);
    }, 2400);
  }
})();

/* ================= SYSTEMS ================= */
const SYSTEMS = [
  {
    id: 'cs', page: 'calcium-sulphate.html', code: 'CS', name: 'Calcium Sulphate', short: 'Dense, precise, fire-proof',
    title: 'Calcium Sulphate Panel Series',
    body: 'High-density calcium sulphate encased in hot-dip galvanised formed steel sheet. Top and bottom sheets are locked together through profiled edges, so the mineral core takes impact and the steel takes the bending. Dimensionally precise, shock-proof and quick to assemble.',
    img: 'cs-panel', cap: 'CS panel on corner pedestals',
    props: ['Fire-proof', 'Anti-static', 'High dimensional precision', 'Shock-proof', 'Pollution-free', 'Adjustable pedestal height'],
    vars: [
      { n: 'Bare', sw: 'bare', d: 'Epoxy-coated surface with high electrical insulation. For office buildings and hotels where the floor must be dust-proof and waterproof under a loose-lay finish.', s: [['Size', '600 × 600 × 30 mm'], ['Grades', 'CS 800 · CS 1000'], ['Flatness', '≤ 0.6 mm'], ['Fire', 'Fire rated']] },
      { n: 'HPL', sw: 'hpl', d: 'High-pressure laminate top with heavy rolling-load capacity. For computer rooms, data centres, electrical engineering sites and aerospace workplaces.', s: [['Grades', 'CS 800 · CS 1000'], ['Flatness', '≤ 0.1 mm'], ['Resistance', '10⁶–10¹⁰ Ω'], ['Class', 'Static dissipative']] },
      { n: 'PVC', sw: 'pvc', d: 'Durable PVC-resin surface: waterproof, dust-free, fire-proof, corrosion-free and wear resistant. For multimedia classrooms, conference halls, supermarkets and gyms.', s: [['Surface', 'Anti-static PVC'], ['Edge', 'Black conductive PVC trim']] }
    ]
  },
  {
    id: 'fs', page: 'steel-cementitious.html', code: 'FS', name: 'Steel Cementitious', short: 'The data-centre workhorse',
    title: 'Steel Cementitious Panel',
    body: 'A welded steel shell infilled with lightweight cement and finished in epoxy paint. The screw-down design makes a stable, quiet structure that installs fast — and the cement fill keeps it non-combustible. Six grades cover everything from open offices to heavy equipment halls.',
    img: 'steel-hpl', cap: 'FS panels with HPL finish',
    props: ['Non-combustible', 'Non-toxic', 'Silent underfoot', 'Stable across temperature', 'Screw-down fixing', '6 load grades'],
    vars: [
      { n: 'Bare', sw: 'bare', d: 'Heavy load-bearing bare panel for carpet-tile or site-applied finishes. Unaffected by temperature variation; no noise when walked on.', s: [['Size', '600 × 600 × 33 / 35 mm'], ['Grades', 'FS 800 – FS 2500'], ['Flatness', '0.6 mm']] },
      { n: 'HPL anti-static', sw: 'hpl', d: 'Style and strength with good fire resistance and high wear resistance. The standard choice where static control and stability both matter.', s: [['Grades', 'FS 800 – FS 2000'], ['Conductive', '10⁴–10⁶ Ω'], ['Dissipative', '10⁶–10¹⁰ Ω'], ['Flatness', '≤ 0.6 mm']] },
      { n: 'HPL, no edge beading', sw: 'hpl', d: 'HPL finished flush to the panel edge, customised to the client’s requirement. No chipping or cracking at the joint and less maintenance over the life of the floor.', s: [['Grades', 'FS 800 – FS 2000'], ['Resistance', '10⁴–10¹⁰ Ω']] },
      { n: 'Homogeneous PVC', sw: 'pvc', d: 'Smooth, dust-free PVC in a range of tones and textures. Easy to maintain and forgiving on impact. For manufacturing plants, workshops and hospitals.', s: [['Surface', 'Homogeneous PVC'], ['Use', 'Plants · workshops · hospitals']] }
    ]
  },
  {
    id: 'wc', page: 'woodcore.html', code: 'WC', name: 'Woodcore', short: 'Quiet, warm, economical',
    title: 'Woodcore Anti-Static Panel',
    body: 'High-density composite wood core encapsulated in steel sheet. The timber core gives the best acoustic performance in the range and a solid feel underfoot — a durable, reliable and environmentally friendly floor for offices and control rooms.',
    img: 'woodcore-pvc', cap: 'Woodcore PVC panel on pedestal',
    props: ['Good acoustic performance', 'Abrasion-proof', 'Corrosion-free', 'Environmentally friendly', 'Absorbs indoor noise'],
    vars: [
      { n: 'Bare', sw: 'bare', d: 'High-density composite wood encapsulated in steel sheets. Highly durable and reliable, with good acoustic performance.', s: [['Core', 'High-density composite wood'], ['Skin', 'Steel sheet']] },
      { n: 'HPL anti-static', sw: 'hpl', d: 'Chipboard core on a steel or aluminium-foil base with an anti-static HPL top surface. Abrasion-proof and corrosion-free.', s: [['Grades', 'WC Light · WC Medium'], ['Resistance', '10⁶–10¹⁰ Ω'], ['Flatness', '≤ 0.1 mm']] },
      { n: 'PVC', sw: 'pvc', d: 'PVC surface with conductive PVC edging on all four sides, on a galvanised steel or aluminium-foil base. Easy to clean and effective at absorbing room noise.', s: [['Edge', 'Conductive PVC, 4 sides'], ['Base', 'Galvanised steel / Al foil']] }
    ]
  },
  {
    id: 'al', page: 'aluminium.html', code: 'AL', name: 'Aluminium', short: 'Light, clean, recyclable',
    title: 'Aluminium Access Floor',
    body: 'Panels die-cast from aluminium ingot: lightweight, non-corrosive and sturdy, with good electrical and thermal conductivity. Economical over its life and fully recyclable at the end of it — the floor of choice for clean and mission-critical rooms.',
    img: 'aluminium', cap: 'Solid and perforated aluminium panels',
    props: ['Lightweight', 'Non-corrosive', 'Electrically conductive', 'Thermally conductive', 'Fully recyclable'],
    vars: [
      { n: 'Solid panel', sw: 'alu', d: 'Cast solid panel for data centres, aerospace facilities, military command headquarters and clean rooms.', s: [['Material', 'Cast aluminium'], ['Use', 'Data centres · clean rooms']] },
      { n: 'Perforated panel', sw: 'alu', d: 'Cast panel with a perforated field to deliver conditioned air from the plenum to the room above.', s: [['Material', 'Cast aluminium'], ['Function', 'Under-floor air delivery']] }
    ]
  }
];

(() => {
  const tabs = $('#sysTabs'), panel = $('#sysPanel');
  tabs.innerHTML = SYSTEMS.map((s, i) =>
    `<button role="tab" id="tab-${s.id}" aria-selected="${!i}" tabindex="${i ? -1 : 0}" data-i="${i}"><small>${s.code} SERIES</small><b>${s.name}</b><span>${s.short}</span></button>`).join('');
  const show = i => {
    const s = SYSTEMS[i];
    $$('button', tabs).forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'tab-' + s.id);
    panel.innerHTML = `
      <div class="sp__top">
        <div><h3>${s.title}</h3><p>${s.body}</p>
          <ul class="props">${s.props.map(p => `<li>${p}</li>`).join('')}</ul>
          <a class="more" href="${s.page}">Full specification <span aria-hidden="true">→</span></a></div>
        <div class="sp__img" data-cap="${s.cap}"><img src="assets/img/${s.img}.jpg" alt="${s.cap}"></div>
      </div>
      <div class="vars">${s.vars.map(v => `
        <div class="var"><h4><i class="sw--${v.sw}"></i>${v.n}</h4><p>${v.d}</p>
          <dl>${v.s.map(([k, x]) => `<dt>${k}</dt><dd>${x}</dd>`).join('')}</dl></div>`).join('')}
      </div>`;
    panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = '';
  };
  tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(+b.dataset.i); });
  tabs.addEventListener('keydown', e => {
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!k) return;
    e.preventDefault();
    const bs = $$('button', tabs), i = (bs.indexOf(document.activeElement) + k + bs.length) % bs.length;
    bs[i].focus(); show(i);
  });
  show(0);
})();

/* ================= ANATOMY ================= */
(() => {
  const stack = $('#stack'), list = $('#anatList'), range = $('#explode');
  const set = (l, dim) => {
    $$('[data-l]', list).forEach(x => x.classList.toggle('on', x.dataset.l === l));
    $$('.ly', stack).forEach(x => x.classList.toggle('on', dim && x.dataset.l === l));
    stack.classList.toggle('dim', !!dim);
  };
  [list, stack].forEach(root => {
    root.addEventListener('pointerover', e => { const t = e.target.closest('[data-l]'); if (t) set(t.dataset.l, true); });
    root.addEventListener('pointerleave', () => { const on = $('.on', list); set(on ? on.dataset.l : '5', false); });
    root.addEventListener('click', e => { const t = e.target.closest('[data-l]'); if (t) set(t.dataset.l, true); });
  });
  set('5', false);
  const g = v => stack.style.setProperty('--g', v / 100);
  range.addEventListener('input', () => g(range.value));
  // assemble → explode when scrolled into view
  if (!reduced) {
    g(0); range.value = 0;
    new IntersectionObserver(([en], ob) => {
      if (!en.isIntersecting) return;
      ob.disconnect(); setTimeout(() => { g(100); range.value = 100; }, 250);
    }, { threshold: .3 }).observe(stack.parentElement);
  }
})();

/* ================= LOAD RATINGS ================= */
const LOADS = {
  FS: { name: 'Steel cementitious', rows: [['FS 800', '33 mm', 360, 1091, 1733], ['FS 1000', '33 mm', 450, 1361, 2345], ['FS 1250', '33 mm', 560, 1700, 3365], ['FS 1500', '35 mm', 680, 2039, 4383], ['FS 2000', '35 mm', 900, 2723, 5080], ['FS 2500', '35 mm', 1130, 3397, 5947]] },
  CS: { name: 'Calcium sulphate', rows: [['CS 800', '30 mm', 360, 1091, 1733], ['CS 1000', '30 mm', 450, 1361, 2345]] },
  WC: { name: 'Woodcore', rows: [['WC Light', 'HPL', 305, 900, 1275], ['WC Medium', 'HPL', 360, 1100, 2020]] },
  HT: { name: 'Hollow steel', rows: [['MM HT 503A', '25 mm', 200, 552, 992], ['MM HT 503B', '25 mm', 300, 903, 1275], ['MM HT 503C', '25 mm', 360, 1091, 1733], ['MM HT 503D', '25 mm', 450, 1362, 2345]] }
};
const METRICS = [
  { k: 2, label: 'Concentrated load', unit: 'kg / sq. inch' },
  { k: 3, label: 'Ultimate load', unit: 'kg' },
  { k: 4, label: 'Distributed load', unit: 'kg / m²' }
];
(() => {
  const mEl = $('#loadMetric'), sEl = $('#loadSeries'), chart = $('#loadChart');
  let m = 2; const on = new Set(Object.keys(LOADS));
  const colors = { FS: 'var(--navy)', CS: 'var(--cyan)', WC: '#b0793f', HT: '#7c8799' };
  mEl.innerHTML = METRICS.map((x, i) => `<button aria-pressed="${i === m}" data-m="${i}">${x.label}</button>`).join('');
  sEl.innerHTML = Object.entries(LOADS).map(([k, v]) => `<button aria-pressed="true" data-s="${k}">${v.name}</button>`).join('');
  const fmt = n => n.toLocaleString('en-IN');
  const draw = () => {
    const M = METRICS[m];
    const max = Math.max(...Object.values(LOADS).flatMap(s => s.rows.map(r => r[M.k])));
    chart.innerHTML = Object.entries(LOADS).filter(([k]) => on.has(k)).map(([k, s]) =>
      `<div class="lr__h"><i style="background:${colors[k]}"></i>${s.name}</div>` + s.rows.map(r =>
        `<div class="lr" data-s="${k}"><div class="lr__g">${r[0]}<small>${r[1]}</small></div>
         <div class="lr__bar"><i style="--w:0%" data-w="${(r[M.k] / max * 100).toFixed(1)}%"></i></div>
         <div class="lr__v">${fmt(r[M.k])}<small>${M.unit}</small></div></div>`).join('')).join('')
      || '<p class="note">Select at least one series.</p>';
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.lr__bar i', chart).forEach(b => b.style.setProperty('--w', b.dataset.w))));
  };
  mEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; m = +b.dataset.m;
    $$('button', mEl).forEach((x, i) => x.setAttribute('aria-pressed', i === m)); draw();
  });
  sEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const k = b.dataset.s;
    on.has(k) ? on.delete(k) : on.add(k); b.setAttribute('aria-pressed', on.has(k)); draw();
  });
  draw();
})();

/* ================= CLIENTS MARQUEE ================= */
(() => { const ul = $('#clients'); ul.innerHTML += ul.innerHTML.replace(/<li>/g, '<li aria-hidden="true">'); })();

/* ================= CONTACT ================= */
(() => {
  const info = $('#contactInfo'), rows = [];
  if (SITE.email) rows.push(`<li><small>Email</small><a href="mailto:${SITE.email}">${SITE.email}</a></li>`);
  if (SITE.phone) rows.push(`<li><small>Phone</small><a href="tel:${SITE.phone.replace(/[^+\d]/g, '')}">${SITE.phone}</a></li>`);
  if (SITE.address) rows.push(`<li><small>Office</small><span>${SITE.address}</span></li>`);
  info.innerHTML = rows.join('');

  const form = $('#quote'), note = $('#formNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email)) {
      note.textContent = 'Please add your name and a valid email address.'; note.classList.add('err');
      (d.name.trim() ? form.email : form.name).focus(); return;
    }
    note.classList.remove('err');
    const body = [
      `Name: ${d.name}`, `Company: ${d.company || '-'}`, `Email: ${d.email}`, `Phone: ${d.phone || '-'}`, '',
      `Requirement: ${d.system}`, `Area: ${d.area ? d.area + ' m²' : '-'}`, `Finished floor height: ${d.height ? d.height + ' mm' : '-'}`, '',
      d.msg || ''
    ].join('\n');
    location.href = `mailto:${SITE.email}?subject=${encodeURIComponent('Enquiry — ' + d.system)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Your email app should now be open with the enquiry ready to send.';
  });
})();

/* ================= SCROLL REVEAL ================= */
(() => {
  const els = $$('.sec__head, .sys, .load, .c, .a, .sectors li, .co__txt, .tl li, .mfg, .form, .manifesto blockquote, .band__in');
  if (reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(ens => ens.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el, i) => { el.classList.add('rv'); el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
})();
