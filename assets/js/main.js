/* =========================================================
   main — Ponto de entrada. Os outros arquivos só definem
   módulos; a ordem de inicialização mora aqui.

   O i18n vai antes do reveal de propósito: ao aplicar o idioma
   ele reescreve o texto do hero e das seções. Animar primeiro e
   trocar o texto depois faz o conteúdo piscar no meio da entrada.
   Os módulos que reagem à troca (rótulo do tema, ano) já estão
   registrados a essa altura.
   ========================================================= */
(function () {
  'use strict';

  const WA = window.WA;

  WA.theme.init();
  WA.navigation.init();
  WA.clipboard.init();
  WA.year.init();
  WA.i18n.init();
  WA.reveal.init();
})();
