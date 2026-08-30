/* =========================================================
   modules / reveal — Entrada suave dos blocos ao rolar.

   Dois caminhos, na ordem de preferência:
   1. GSAP + ScrollTrigger, quando os scripts carregam;
   2. IntersectionObserver + classe .reveal (motion.css), quando
      a CDN falha — internet instável é regra aqui, não exceção.

   Em qualquer um dos dois, o estado escondido só é aplicado
   pelo JS. Se nada rodar, a página aparece inteira.
   ========================================================= */
window.WA = window.WA || {};

window.WA.reveal = (function () {
  'use strict';

  /* O hero fica de fora: tem entrada própria, em timeline. */
  const BLOCKS = '.card, .section-head, .app-card, .app, .about-text, .stat, .contact-head, .social';

  /* ---------- Caminho 2: sem GSAP ---------- */

  function fallbackInit() {
    if (!('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll('.hero-inner, ' + BLOCKS);

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

  /* ---------- Caminho 1: com GSAP ---------- */

  /* O hero entra em sequência, de cima para baixo. Animo os filhos
     diretos, não o texto interno: o i18n troca o innerHTML do h1 na
     hora de mudar de idioma, e qualquer referência lá dentro morre. */
  function heroIntro() {
    const hero = document.querySelector('.hero-inner');
    if (!hero) return;

    gsap.timeline({ defaults: { ease: 'power2.out' } })
      .from(hero.children, {
        autoAlpha: 0,
        y: 20,
        duration: .8,
        stagger: .09,
        clearProps: 'all'
      });
  }

  /* A textura do hero desce um pouco mais devagar que o scroll.
     Translado o elemento em vez do background-position: transform fica
     no compositor, background-position repinta a div inteira (com máscara)
     a cada quadro de scroll — caro justamente no Android mais fraco.
     A folga para não abrir faixa vazia vem do inset negativo no CSS. */
  function heroParallax() {
    const pattern = document.querySelector('.hero-pattern');
    if (!pattern) return;

    gsap.to(pattern, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: .4
      }
    });
  }

  /* Os blocos entram em lote: quem cruza a dobra junto anima junto,
     com stagger. Evita a cascata desencontrada de um observer por item. */
  function blockReveals(targets) {
    gsap.set(targets, { autoAlpha: 0, y: 18 });

    ScrollTrigger.batch(targets, {
      start: 'top 88%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: .7,
          ease: 'power2.out',
          stagger: .09,
          overwrite: true,
          clearProps: 'all'
        });
      }
    });
  }

  /* Os três números sobem de zero ao entrar em vista. Só mexo no
     <strong>, que não passa pelo dicionário — o rótulo ao lado sim.

     Mesmo cuidado dos blocos: o tween já pinta o zero na criação, então
     um número que ficou acima da dobra travaria em "0" esperando um
     gatilho que não vem. Esse fica como está. */
  function statCounters() {
    document.querySelectorAll('.stat strong').forEach(function (el) {
      if (el.getBoundingClientRect().top < 0) return;

      const raw = el.textContent.trim();
      const target = parseFloat(raw);
      if (!isFinite(target)) return;

      const suffix = raw.replace(/^[\d.,\s]+/, '');
      const counter = { value: 0 };

      gsap.to(counter, {
        value: target,
        duration: 1.1,
        ease: 'power1.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: function () {
          el.textContent = Math.round(counter.value) + suffix;
        },
        onComplete: function () {
          el.textContent = raw;
        }
      });
    });
  }

  /* Rede final: se por qualquer motivo um bloco continuar invisível
     depois da página carregar, ele volta. Vale para o caso que o try/catch
     não pega — o lote criado, mas que nunca dispara. */
  function failsafe(targets) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        targets.forEach(function (el) {
          if (gsap.getProperty(el, 'opacity') === 0) {
            gsap.set(el, { clearProps: 'all' });
          }
        });
      }, 2000);
    });
  }

  function gsapInit() {
    gsap.registerPlugin(ScrollTrigger);

    /* O GSAP vem da CDN, depois da primeira pintura. Se demorou, o
       visitante já está lendo a página: esconder agora para animar seria
       pior do que não animar. Numa conexão ruim, simplesmente não anima. */
    if (window.performance && performance.now() > 1200) return;

    const mm = gsap.matchMedia();

    /* Sem transition CSS envolvida, a regra de prefers-reduced-motion
       do motion.css não alcança tween nenhum: o corte tem que ser aqui.
       Quando a preferência muda, o matchMedia reverte tudo sozinho. */
    mm.add('(prefers-reduced-motion: no-preference)', function () {
      /* Só escondo o que ainda está por vir. Ao abrir a página direto num
         âncora (index.html#contato), o que ficou acima da dobra já passou
         do gatilho e nunca receberia o onEnter — ficaria invisível. */
      const targets = gsap.utils.toArray(BLOCKS).filter(function (el) {
        return el.getBoundingClientRect().top >= 0;
      });

      try {
        heroIntro();
        if (targets.length) {
          blockReveals(targets);
          failsafe(targets);
        }
        heroParallax();
        statCounters();
      } catch (e) {
        /* Rede de segurança: se algo quebrar no meio, os blocos já
           marcados como invisíveis voltam. Conteúdo escondido por bug
           é pior do que página sem animação. */
        if (targets.length) gsap.set(targets, { clearProps: 'all' });
      }
    });

    /* As fontes chegam depois e mudam a altura dos blocos; sem isso os
       gatilhos ficam calculados sobre um layout que não existe mais. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  function init() {
    if (window.gsap && window.ScrollTrigger) {
      gsapInit();
    } else {
      fallbackInit();
    }
  }

  return { init: init };
})();
