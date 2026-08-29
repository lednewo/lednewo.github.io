/* =========================================================
   modules / reveal — Entrada suave dos blocos ao rolar.
   Respeita prefers-reduced-motion e nunca esconde conteúdo
   quando não há suporte a IntersectionObserver.
   ========================================================= */
window.WA = window.WA || {};

window.WA.reveal = (function () {
  'use strict';

  const SELECTOR = '.hero-inner, .card, .section-head, .app, .app-card, .about-text, .stat, .contact-head, .social';

  function init() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll(SELECTOR);

    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
    });

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  return { init: init };
})();
