# Portfólio — Wendel Alves

Site pessoal estático (HTML + CSS + JavaScript, sem build). GSAP e fontes vêm de CDN; o conteúdo continua acessível quando elas não carregam.

## Estrutura

O CSS segue **ITCSS**: cada pasta é uma camada, do mais genérico ao mais
específico, e a ordem dos `<link>` no `index.html` é a ordem da cascata.
O JS é dividido em módulos com namespace `window.WA` — sem bundler e sem
`type="module"`, para o site continuar abrindo com duplo clique no arquivo.

```
index.html
paracauari.html
tools/verify-redesign.mjs      validação no Chrome, sem pacotes npm
.nojekyll
assets/
  css/
    1-settings/tokens.css      variáveis de cor, tipografia e temas
    2-generic/reset.css        reset e alvos de toque
    3-elements/base.css        tipografia dos elementos sem classe
    4-layout/layout.css        wrap, cabeçalho, hero, seções, rodapé
    5-components/controls.css  botões, nav, idioma, tema, menu
    5-components/content.css   cards, ficha do app, lojas, chips, redes
    6-utilities/motion.css     animações e prefers-reduced-motion
  js/
    i18n/dictionary.js         todos os textos (pt e en)
    i18n/translator.js         aplica o dicionário ao documento
    modules/theme.js           tema claro/escuro
    modules/navigation.js      menu, cabeçalho fixo, scroll spy
    modules/reveal.js          revelação ao rolar, contadores e fallback
    modules/effects.js         título por palavras, holofote, magnético e marquee
    modules/clipboard.js       copiar e-mail com confirmação
    modules/year.js            ano do rodapé
    main.js                    ponto de entrada (ordem de inicialização)
  img/paracauari-512.png
  img/apple-touch-icon.png
  img/favicon.png
```

### Onde mexer

| O que mudar | Arquivo |
|---|---|
| Cores, fontes, espaçamento | `assets/css/1-settings/tokens.css` |
| Qualquer texto do site | `assets/js/i18n/dictionary.js` |
| Estrutura das páginas | `index.html` e `paracauari.html` |
| Tema padrão e preferência salva | script inline do `<head>` nas duas páginas e `assets/js/modules/theme.js` |
| Fontes carregadas | links Google Fonts nas duas páginas; famílias em `tokens.css` |
| Aurora, grade de pontos, cabeçalho e painel de contato | `assets/css/4-layout/layout.css` |
| Cards, ícones, app, números e faixa de tecnologias | `assets/css/5-components/content.css` |
| Botões, borda em degradê e menu móvel | `assets/css/5-components/controls.css` |
| Título por palavras, holofote e botões magnéticos | `assets/js/modules/effects.js` |
| Revelação ao rolar e contagem dos números | `assets/js/modules/reveal.js` |
| Keyframes e movimento reduzido | `assets/css/6-utilities/motion.css` |

> Texto marcado com `data-i18n` no HTML é **substituído** pelo dicionário no
> carregamento. Editar só o HTML não muda nada — altere `dictionary.js`
> (nos dois blocos, `pt` e `en`).

## Aparência e movimento

O tema **escuro é o padrão**, independentemente do sistema. O botão do cabeçalho
alterna para claro e salva a escolha entre páginas. Os títulos usam Inter Tight
600; os destaques em itálico, Instrument Serif; o corpo, Inter.

Os tons de texto secundário, azul e violeta claros foram ajustados em relação ao plano
para manter contraste AA (pelo menos 4,5:1) nas superfícies e estados de hover.
O brilho usa gradientes suaves com animação de `transform`, sem filtros grandes.

`prefers-reduced-motion` desliga as animações e deixa as tecnologias estáticas.
A faixa também pausa no hover, no foco e pelo botão **Pausar animação**.
Os efeitos de mouse funcionam apenas com ponteiro preciso e hover em desktop.
O título é redividido após cada troca de idioma, preservando o itálico.
Sem GSAP, a revelação usa IntersectionObserver e um failsafe de visibilidade.
Sem JavaScript, o conteúdo e os links principais continuam visíveis.

## Validar localmente

Em terminais separados, inicie o servidor e o Chrome headless:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

```bash
google-chrome --headless=new --blink-settings=primaryPointerType=4,availablePointerTypes=4,primaryHoverType=2,availableHoverTypes=2 --remote-debugging-port=9222 --user-data-dir=/tmp/redesign-chrome about:blank
```

Com Node.js 22 ou superior, execute:

```bash
node tools/verify-redesign.mjs
```

O teste usa o protocolo do Chrome sem instalar dependências. Gera capturas das
duas páginas em 1366px e 390px nos dois temas, além de `report.json`, em
`/tmp/redesign-captures`. Verifica overflow, erros JS, fontes, tema persistido,
PT/EN, menu móvel, contadores, efeitos de mouse, pausa do marquee, movimento
reduzido, fallback com CDN bloqueada e contraste dos tokens sobre superfícies
sólidas, vidro e hover. Também confere larguras de 320, 768, 820 e 900px.
URL e pasta de saída podem ser passadas como argumentos.

## Publicar no GitHub Pages

1. Crie um repositório novo chamado **`lednewo.github.io`** (público).
2. Envie os arquivos deste projeto para a raiz do repositório:

```bash
cd caminho/para/a/pasta
git init
git add .
git commit -m "Portfólio Wendel Alves"
git branch -M main
git remote add origin https://github.com/lednewo/lednewo.github.io.git
git push -u origin main
```

3. No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, pasta `/ (root)` → **Save**.
4. Em 1–2 minutos o site fica no ar em **https://lednewo.github.io**.

> Se preferir um repositório com outro nome (ex.: `portfolio`), a URL vira
> `https://lednewo.github.io/portfolio/`. Como todos os caminhos do site são
> relativos, funciona igual — não precisa mudar nada no código.

## Atualizar o site

Edite os arquivos, depois:

```bash
git add .
git commit -m "Atualiza conteúdo"
git push
```

O GitHub Pages republica sozinho.

## Como adicionar um novo aplicativo

Cada aplicativo tem duas partes: o card na home e a sua própria página.

1. **Página do app** — copie `paracauari.html` para `nome-do-app.html` e troque
   a imagem, o `data-doc-title`/`data-doc-desc` do `<body>`, o `.app-tag`, o
   `.app-name`, a `.app-desc`, a lista `.app-features` e os links das lojas.
2. **Card na home** — no `index.html`, duplique o `<a class="app-card">` dentro
   de `.app-list`, apontando o `href` para o novo arquivo.
3. **Textos** — adicione as chaves em `assets/js/i18n/dictionary.js`, nos dois
   blocos (`pt` e `en`), e referencie com `data-i18n="chave"` no HTML.

O cabeçalho e o rodapé são repetidos nas duas páginas: sem etapa de build não
há includes, então uma mudança no menu precisa ser feita em cada arquivo `.html`.

## Idiomas

O site detecta o idioma do navegador (PT-BR ou EN) e pode ser trocado no botão
`PT / EN` do cabeçalho. Também é possível forçar pela URL: `?lang=en` ou `?lang=pt`.

## Domínio próprio (opcional)

Se um dia quiser usar um domínio como `wendelalves.com.br`:

1. Crie um arquivo `CNAME` na raiz contendo apenas o domínio.
2. No painel do domínio, aponte os registros `A` para os IPs do GitHub Pages
   (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`).
3. Em Settings → Pages, informe o domínio e marque **Enforce HTTPS**.
