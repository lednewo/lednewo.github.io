# Portfólio — Wendel Alves

Site pessoal estático (HTML + CSS + JavaScript, sem build e sem dependências).

## Estrutura

O CSS segue **ITCSS**: cada pasta é uma camada, do mais genérico ao mais
específico, e a ordem dos `<link>` no `index.html` é a ordem da cascata.
O JS é dividido em módulos com namespace `window.WA` — sem bundler e sem
`type="module"`, para o site continuar abrindo com duplo clique no arquivo.

```
index.html
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
    modules/reveal.js          entrada suave ao rolar
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
| Estrutura da página | `index.html` |

> Texto marcado com `data-i18n` no HTML é **substituído** pelo dicionário no
> carregamento. Editar só o HTML não muda nada — altere `dictionary.js`
> (nos dois blocos, `pt` e `en`).

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
