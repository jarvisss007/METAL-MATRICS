/* MM Metal Matriex — behaviour for inner pages (nav, print, reveal). */
(() => {
  const $ = s => document.querySelector(s);
  const tg = $('#navToggle'), links = $('#navLinks');
  const close = () => { links.classList.remove('open'); tg.setAttribute('aria-expanded', 'false'); };
  tg.addEventListener('click', () => tg.setAttribute('aria-expanded', links.classList.toggle('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  $('#yr').textContent = new Date().getFullYear();
  const pb = $('#printBtn'); if (pb) pb.addEventListener('click', () => print());

  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(ens => ens.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.vr, .pg-2, .cta-band__in').forEach(el => { el.classList.add('rv'); io.observe(el); });
})();
