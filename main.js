
/* ── CATEGORY LABELS: viajan desde arriba con el scroll ── */
(function() {
  const cards = Array.from(document.querySelectorAll('.category-card'));
  if (!cards.length) return;

  function loop() {
    const vh = window.innerHeight;
    cards.forEach(card => {
      const label = card.querySelector('.category-card__label');
      if (!label) return;
      const rect   = card.getBoundingClientRect();
      const cardH  = rect.height;
      const labelH = label.offsetHeight;
      const travel = Math.max(0, cardH - labelH - 64);
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));
      label.style.transform = `translateY(${(1 - progress) * -travel}px)`;
    });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ── MOBILE NAV ── */
const menuBtn = document.getElementById('menu-btn');
const mobileNav = document.getElementById('mobile-nav');
const mobileClose = document.getElementById('mobile-nav-close');

if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => mobileNav.classList.add('open'));
  mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') mobileNav.classList.remove('open');
  });
}

/* ── FAQ ── */
document.querySelectorAll('.faq__question').forEach(q => {
  const toggle = () => {
    const item = q.closest('.faq__item');
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq__item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
    });
    if (!open) {
      item.classList.add('open');
      q.setAttribute('aria-expanded', 'true');
    }
  };
  q.addEventListener('click', toggle);
  q.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});
