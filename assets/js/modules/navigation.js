/* =========================================================
   modules / navigation — Menu móvel, cabeçalho fixo e
   marcação da seção em vista (scroll spy).
   ========================================================= */
window.WA = window.WA || {};

window.WA.navigation = (function () {
  'use strict';

  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('menuToggle');

  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function initMenu() {
    if (!nav || !toggle) return;

    toggle.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !nav.classList.contains('is-open')) return;
      closeMenu();
      toggle.focus();
    });
  }

  function initStickyHeader() {
    if (!header) return;
    function onScroll() {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initScrollSpy() {
    if (!nav || !('IntersectionObserver' in window)) return;

    const links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    const sections = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if (!sections.length) return;

    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { spy.observe(section); });
  }

  function init() {
    initMenu();
    initStickyHeader();
    initScrollSpy();
  }

  return { init: init, closeMenu: closeMenu };
})();
