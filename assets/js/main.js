/* =========================================================
   main — Ponto de entrada. Os outros arquivos só definem
   módulos; a ordem de inicialização mora aqui.

   O i18n vai por último de propósito: ao aplicar o idioma ele
   avisa os módulos já registrados (rótulo do tema, ano).
   ========================================================= */
(function () {
  'use strict';

  const WA = window.WA;

  WA.theme.init();
  WA.navigation.init();
  WA.clipboard.init();
  WA.reveal.init();
  WA.year.init();
  WA.i18n.init();
})();
