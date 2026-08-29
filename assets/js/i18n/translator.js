/* =========================================================
   i18n / translator — Aplica o dicionário ao documento.

   Só define; quem chama init() é o main.js. Outros módulos
   reagem à troca de idioma via WA.i18n.subscribe(fn).
   ========================================================= */
window.WA = window.WA || {};

window.WA.i18n = (function () {
  'use strict';

  const FALLBACK = 'pt';
  const listeners = [];
  let current = FALLBACK;

  const metaDesc = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  const langButtons = document.querySelectorAll('.lang-switch button');

  function dict(lang) {
    return window.WA.dictionaries[lang || current] || window.WA.dictionaries[FALLBACK];
  }

  function t(key) {
    return dict()[key];
  }

  function apply(lang) {
    current = window.WA.dictionaries[lang] ? lang : FALLBACK;
    const words = dict();

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const value = words[el.getAttribute('data-i18n')];
      if (typeof value === 'string') el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const value = words[el.getAttribute('data-i18n-html')];
      if (typeof value === 'string') el.innerHTML = value;
    });

    // Cada página diz qual chave é o seu título, via data-* no <body>.
    const titleKey = document.body.dataset.docTitle || 'doc.title';
    const descKey = document.body.dataset.docDesc || 'doc.desc';

    document.documentElement.lang = current === 'en' ? 'en' : 'pt-BR';
    document.title = words[titleKey];
    if (metaDesc) metaDesc.setAttribute('content', words[descKey]);
    if (ogTitle) ogTitle.setAttribute('content', words[titleKey]);
    if (ogDesc) ogDesc.setAttribute('content', words[descKey]);

    langButtons.forEach(function (btn) {
      const active = btn.dataset.lang === current;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    listeners.forEach(function (fn) { fn(current, words); });
  }

  // Prioridade: ?lang= na URL, depois a escolha salva (para o idioma
  // sobreviver à navegação entre páginas), depois o navegador.
  function preferred() {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (window.WA.dictionaries[fromUrl]) return fromUrl;

    try {
      const saved = localStorage.getItem('lang');
      if (window.WA.dictionaries[saved]) return saved;
    } catch (e) { /* modo privado */ }

    const navLangs = navigator.languages || [navigator.language || FALLBACK];
    return String(navLangs[0]).toLowerCase().indexOf('pt') === 0 ? 'pt' : 'en';
  }

  function init() {
    langButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        apply(btn.dataset.lang);
        try { localStorage.setItem('lang', current); } catch (e) { /* modo privado */ }
      });
    });
    apply(preferred());
  }

  return {
    init: init,
    apply: apply,
    t: t,
    current: function () { return current; },
    subscribe: function (fn) { listeners.push(fn); }
  };
})();
