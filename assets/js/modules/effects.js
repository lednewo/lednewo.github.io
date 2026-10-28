/* Efeitos progressivos, sem dependências. Conteúdo visível se o JS falhar. */
window.WA = window.WA || {};
window.WA.effects = (function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 769px)');
  const title = document.querySelector('.hero-title');
  let introTimer;

  function splitTitle(animate) {
    if (!title) return;
    window.clearTimeout(introTimer);
    title.classList.remove('is-entering');
    // O i18n acabou de reescrever o HTML: nunca guardar referências às palavras.
    title.querySelectorAll('.hero-word').forEach(function (word) {
      word.replaceWith(document.createTextNode(word.textContent));
    });
    title.normalize();
    if (reduced.matches) {
      title.classList.remove('is-split');
      return;
    }
    const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    nodes.forEach(function (node) {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part.trim()) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const span = document.createElement('span');
        span.className = 'hero-word';
        span.textContent = part;
        span.style.setProperty('--word-index', index++);
        fragment.appendChild(span);
      });
      node.replaceWith(fragment);
    });
    title.classList.add('is-split');
    if (animate && title.getBoundingClientRect().bottom > 0) {
      title.classList.add('is-entering');
      introTimer = window.setTimeout(function () {
        title.classList.remove('is-entering');
      }, 800 + index * 55);
    }
  }

  function initPointers() {
    const cards = document.querySelectorAll('.card');
    const buttons = document.querySelectorAll('.hero-actions .btn-solid, .contact-actions .btn-solid');
    function enabled(event) {
      return !reduced.matches && pointer.matches && event.pointerType !== 'touch';
    }
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        if (!enabled(event)) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', event.clientX - rect.left + 'px');
        card.style.setProperty('--my', event.clientY - rect.top + 'px');
      }, { passive: true });
    });
    buttons.forEach(function (button) {
      function reset() { button.style.removeProperty('translate'); }
      button.addEventListener('pointermove', function (event) {
        if (!enabled(event)) return;
        const rect = button.getBoundingClientRect();
        function clamp(value) { return Math.max(-6, Math.min(6, value)); }
        const x = clamp((event.clientX - rect.left - rect.width / 2) * .08);
        const y = clamp((event.clientY - rect.top - rect.height / 2) * .12);
        button.style.translate = x + 'px ' + y + 'px';
      }, { passive: true });
      button.addEventListener('pointerleave', reset);
      button.addEventListener('pointercancel', reset);
      button.addEventListener('blur', reset);
      reduced.addEventListener('change', reset);
      pointer.addEventListener('change', reset);
    });
  }

  function initMarquee() {
    const marquee = document.querySelector('.tech-marquee');
    if (!marquee) return;
    const list = marquee.querySelector('.chips');
    const copy = list.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.removeAttribute('aria-label');
    marquee.querySelector('.marquee-track').appendChild(copy);
    marquee.classList.add('is-ready');
    const button = marquee.querySelector('.marquee-toggle');
    function translate() {
      list.setAttribute('aria-label', window.WA.i18n.t('tech.label'));
      button.textContent = window.WA.i18n.t(marquee.classList.contains('is-paused') ? 'motion.play' : 'motion.pause');
    }
    button.addEventListener('click', function () {
      const paused = marquee.classList.toggle('is-paused');
      button.setAttribute('aria-pressed', String(paused));
      translate();
    });
    window.WA.i18n.subscribe(translate);
    translate();
  }

  function init() {
    splitTitle(!window.performance || performance.now() < 1200);
    window.WA.i18n.subscribe(function () {
      splitTitle(true);
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
    reduced.addEventListener('change', function () { splitTitle(false); });
    initPointers();
    initMarquee();
  }

  return { init: init };
})();
