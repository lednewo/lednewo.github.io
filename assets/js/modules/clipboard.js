/* =========================================================
   modules / clipboard — Botões "copiar" com confirmação.

   Existe porque mailto: depende de um cliente de e-mail
   configurado: em muitos desktops o clique não faz nada.
   ========================================================= */
window.WA = window.WA || {};

window.WA.clipboard = (function () {
  'use strict';

  const RESET_MS = 2600;
  const buttons = document.querySelectorAll('[data-copy]');
  const status = document.getElementById('copyStatus');
  let timer = null;

  // navigator.clipboard some fora de contexto seguro (file://, http://),
  // então o textarea invisível continua sendo necessário.
  function write(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; },
        function () { return legacyWrite(text); });
    }
    return Promise.resolve(legacyWrite(text));
  }

  function legacyWrite(text) {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '0';
    field.style.opacity = '0';

    document.body.appendChild(field);
    field.select();

    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }

    document.body.removeChild(field);
    return ok;
  }

  function announce(button, ok) {
    const words = window.WA.dictionaries[window.WA.i18n.current()];
    if (status) status.textContent = words[ok ? 'contact.copied' : 'contact.copyerror'];
    button.classList.toggle('is-copied', ok);

    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      if (status) status.textContent = '';
      button.classList.remove('is-copied');
    }, RESET_MS);
  }

  function init() {
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        write(button.dataset.copy).then(function (ok) { announce(button, ok); });
      });
    });

    // O rótulo acessível do botão de ícone acompanha o idioma.
    window.WA.i18n.subscribe(function (_lang, words) {
      buttons.forEach(function (button) {
        button.setAttribute('aria-label', words['contact.copy']);
      });
    });
  }

  return { init: init };
})();
