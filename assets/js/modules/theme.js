/* O script inline aplica a escolha antes da pintura; escuro é o padrão. */
window.WA = window.WA || {};
window.WA.theme = (function () {
  'use strict';

  const toggle = document.getElementById('themeToggle');
  const meta = document.querySelector('meta[name="theme-color"]');

  function current() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function paint() {
    if (toggle) toggle.setAttribute('aria-pressed', String(current() === 'dark'));
    if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  }

  function set(theme) {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
    try { localStorage.setItem('theme', current()); } catch (e) { /* modo privado */ }
    paint();
  }

  function init() {
    if (toggle) toggle.addEventListener('click', function () {
      set(current() === 'dark' ? 'light' : 'dark');
    });
    window.WA.i18n.subscribe(function (_lang, words) {
      if (toggle) toggle.setAttribute('aria-label', words['theme.toggle']);
    });
    paint();
  }

  return { init: init, current: current, set: set };
})();
