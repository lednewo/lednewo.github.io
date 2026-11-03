/* =========================================================
   main — Ponto de entrada. Os outros arquivos só definem
   módulos; a ordem de inicialização mora aqui.

   Os módulos que reagem à troca de idioma (rótulo do tema, ano)
   se registram antes do i18n aplicar o idioma.
   ========================================================= */
(function () {
  'use strict';

  const WA = window.WA;

  WA.theme.init();
  WA.navigation.init();
  WA.clipboard.init();
  WA.year.init();
  WA.i18n.init();
})();
