// ── FADE-IN ON SCROLL ──
(function () {
  const selectors = [
    'main h1', 'main h2', 'main h3',
    '.sn-intro__title', '.sn-intro p',
    '.sn-grid__card',
    '.sn-duo__text', '.sn-duo__img',
    '.sn-fullimg',
    '.sn-manifesto__title', '.sn-manifesto__text',
    '.sn-cierre__left', '.sn-cierre__right',
    '.por-que__item',
    '.acc-row',
    '.el-objeto__text', '.el-objeto__img',
    '.faq-item',
    '.combina-card',
    '.pdp-duo__text', '.pdp-duo__img',
    '.pdp-render',
  ].join(', ');

  const els = document.querySelectorAll(selectors);
  if (!els.length) return;

  // Stagger siblings inside the same parent
  const groups = new Map();
  els.forEach(el => {
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(el);
  });

  els.forEach(el => {
    el.classList.add('fade-in');
    const group = groups.get(el.parentElement);
    if (group && group.length > 1) {
      el.style.transitionDelay = `${groups.get(el.parentElement).indexOf(el) * 0.12}s`;
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  els.forEach(el => observer.observe(el));
})();

// ── CATEGORY CARD LABELS ──
(function () {
  const labels = document.querySelectorAll('.category-card__label');
  if (!labels.length) return;

  labels.forEach(el => el.classList.add('label-reveal'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 200px 0px' });

  labels.forEach(el => observer.observe(el));
})();

// ── PARALLAX HERO ──
(function () {
  const hero = document.querySelector('.sn-hero');
  if (!hero) return;
  const img = hero.querySelector(':scope > img');
  if (!img) return;

  const FACTOR = 0.2;
  const extra  = Math.round(window.innerHeight * FACTOR);

  img.style.height     = `calc(100% + ${extra}px)`;
  img.style.top        = `-${Math.round(extra / 2)}px`;
  img.style.position   = 'absolute';
  img.style.width      = '100%';
  img.style.objectFit  = 'cover';
  img.style.willChange = 'transform';

  const tick = () => {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    img.style.transform = `translateY(${Math.round(window.scrollY * FACTOR)}px)`;
  };

  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

// ── PARALLAX ON STRATEGIC PHOTOS ──
(function () {
  if (window.innerWidth <= 768) return;
  const FACTOR = 0.14;

  const imgs = [
    ...document.querySelectorAll('.sn-duo__img img'),
    ...document.querySelectorAll('.sn-fullimg img'),
  ];

  if (!imgs.length) return;

  imgs.forEach(img => {
    const extra = Math.round(window.innerHeight * FACTOR);
    img.style.height     = `calc(100% + ${extra}px)`;
    img.style.marginTop  = `-${Math.round(extra / 2)}px`;
    img.style.objectFit  = 'cover';
    img.style.width      = '100%';
    img.style.willChange = 'transform';
  });

  const tick = () => {
    imgs.forEach(img => {
      const parent = img.parentElement;
      const rect   = parent.getBoundingClientRect();
      if (rect.bottom < -60 || rect.top > window.innerHeight + 60) return;
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      img.style.transform = `translateY(${Math.round(center * FACTOR)}px)`;
    });
  };

  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

// ── CATEGORY CARD PARALLAX ──
(function () {
  const FACTOR = 0.07;

  const pairs = [];
  document.querySelectorAll('.category-card').forEach(card => {
    const img = card.querySelector('.category-card__img');
    if (img) pairs.push({ card, img });
  });

  if (!pairs.length) return;

  const tick = () => {
    pairs.forEach(({ card, img }) => {
      const rect = card.getBoundingClientRect();
      if (rect.bottom < -60 || rect.top > window.innerHeight + 60) return;
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      img.style.translate = `0px ${Math.round(center * FACTOR)}px`;
    });
  };

  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();
