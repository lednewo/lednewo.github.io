/* =========================================================
   modules / year — Ano do rodapé, formatado pelo locale ativo.
   ========================================================= */
window.WA = window.WA || {};

window.WA.year = (function () {
  'use strict';

  const el = document.getElementById('year');

  function render() {
    if (!el) return;
    el.textContent = new Intl.NumberFormat(document.documentElement.lang, {
      useGrouping: false
    }).format(new Date().getFullYear());
  }

  function init() {
    window.WA.i18n.subscribe(render);
    render();
  }

  return { init: init };
})();
