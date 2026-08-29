/* =========================================================
   modules / theme — Tema claro e escuro.

   A escolha do visitante é aplicada em <head> por um script
   inline (antes da pintura, para não piscar). Aqui ficam só o
   botão, a sincronia com o sistema e a cor da barra do navegador.
   ========================================================= */
window.WA = window.WA || {};

window.WA.theme = (function () {
  'use strict';

  const toggle = document.getElementById('themeToggle');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const metas = Array.prototype.slice.call(
    document.querySelectorAll('meta[name="theme-color"]')
  );

  // As cores vêm das próprias metas — uma fonte só, sem duplicar hex no JS.
  const colors = metas.reduce(function (acc, meta) {
    const media = meta.getAttribute('media') || '';
    acc[media.indexOf('dark') > -1 ? 'dark' : 'light'] = meta.getAttribute('content');
    return acc;
  }, {});

  function current() {
    return document.documentElement.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
  }

  function paint() {
    const theme = current();
    if (toggle) toggle.setAttribute('aria-pressed', String(theme === 'dark'));

    // Com tema forçado as metas por media-query não se aplicam:
    // iguala as duas para o navegador pintar a cor certa.
    if (document.documentElement.dataset.theme && colors[theme]) {
      metas.forEach(function (meta) { meta.setAttribute('content', colors[theme]); });
    }
  }

  function set(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (e) { /* modo privado */ }
    paint();
  }

  function init() {
    if (toggle) {
      toggle.addEventListener('click', function () {
        set(current() === 'dark' ? 'light' : 'dark');
      });
    }

    if (typeof darkQuery.addEventListener === 'function') {
      darkQuery.addEventListener('change', paint);
    }

    // O rótulo acessível do botão acompanha o idioma.
    window.WA.i18n.subscribe(function (_lang, words) {
      if (toggle) toggle.setAttribute('aria-label', words['theme.toggle']);
    });

    paint();
  }

  return { init: init, current: current, set: set };
})();
