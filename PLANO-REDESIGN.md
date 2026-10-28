# Plano — Redesign "escuro premium" do wendelalves.com

## Diagnóstico

- **Contraste fraco:** verde-acinzentado sobre verde-acinzentado. Fundo, cards e
  seções têm quase o mesmo tom (`#f2f4ef`, `#e8ece3`, `#fbfcf9`).
- **Sem cor de destaque:** o `--river` é escuro e apagado; botões e destaques não
  chamam atenção.
- **Personalidade difusa:** a serifa Fraunces com o padrão marajoara passa um ar
  editorial/regional, não de estúdio de tecnologia.

## 1. Paleta e tokens — `assets/css/1-settings/tokens.css`

O **escuro vira o padrão**; o claro continua disponível no botão.

| Token | Escuro (padrão) | Claro |
|---|---|---|
| `--bg` | `#0B0D12` | `#FAFAFB` |
| `--bg-tint` | `#0F1218` | `#F3F4F7` |
| `--surface` | `rgba(255,255,255,.03)` (vidro) | `#FFFFFF` |
| `--ink` / `--ink-2` / `--muted` | `#F2F4F8` / `#B4BCCB` / `#7D8699` | `#0B0D12` / `#3A4150` / `#6B7280` |
| `--line` / `--line-soft` | `rgba(255,255,255,.08)` / `.05` | `#E5E7EB` / `#EEF0F3` |
| `--accent` | `#6E8BFF` (azul) | `#3B5BFF` |
| `--accent-2` | `#A78BFA` (violeta, para degradê) | `#7C5CFF` |
| `--gradient` | `linear-gradient(120deg, accent, accent-2)` | idem |

- Renomear `--river` / `--moss` / `--olive` → `--accent` / `--accent-2` /
  `--accent-wash` (busca e troca em todos os CSS).
- Inverter a lógica do tema: escuro em `:root`, claro em `[data-theme="light"]`.
  Ajustar o script inline do `<head>`, `assets/js/modules/theme.js` e as metas
  `theme-color` em `index.html` e `paracauari.html`.
- Todas as combinações de texto com contraste WCAG AA (≥ 4.5:1).

## 2. Tipografia — `assets/css/3-elements/base.css` + link do Google Fonts

- **Títulos:** Fraunces → **Inter Tight 600**, com tracking negativo (`-0.03em`).
- **Destaques em itálico** ("lugares reais", "vale a pena usar"):
  **Instrument Serif itálico** com texto em degradê.
- **Corpo:** continua Inter.

## 3. Elementos novos e redesenhados

| Área | Mudança |
|---|---|
| **Hero** (`layout.css`) | Brilho "aurora" (2–3 manchas desfocadas azul/violeta em movimento lento); grade de pontos sutil com máscara no lugar do padrão marajoara; selo "● Disponível para projetos" com ponto verde pulsando. |
| **Cabeçalho** | Vidro mais forte (blur) que encolhe ao rolar; botão "Vamos conversar" com borda em degradê. |
| **Cards de diferenciais** | Fundo de vidro, ícone em cada card, holofote que segue o mouse e borda em degradê no hover. |
| **Card do app** | Maior, com brilho atrás do ícone do Paracauari e seta animada. |
| **Números** | Números em degradê, mantendo a contagem animada. |
| **Chips de tecnologia** | Faixa em marquee contínuo (Flutter, Dart, Firebase…), pausa no hover. |
| **Contato** | Painel grande com borda em degradê e brilho de fundo (CTA final). |
| **Rodapé** | Mais limpo, mantendo o CNPJ, com linha divisória em degradê. |

## 4. Transições e efeitos — `assets/js/modules/reveal.js` + novo `assets/js/modules/effects.js`

- **Título do hero:** entrada palavra por palavra (sobe com desfoque). Refazer o
  split após cada troca de idioma, porque o i18n reescreve o `innerHTML` do h1.
- **Holofote dos cards:** JS só atualiza `--mx` / `--my` no `pointermove`; o
  resto é CSS.
- **Botões magnéticos:** o botão principal acompanha o cursor (máx. 6px), só
  em desktop.
- **Revelação ao rolar:** adicionar desfoque e leve escala ao fade atual.
- **Aurora:** só `@keyframes` com `transform`, sem JS.
- **Cuidados mantidos:**
  - tudo desligado com `prefers-reduced-motion`;
  - efeitos de mouse só com `(hover: hover)`;
  - fallback sem GSAP e failsafe atuais preservados;
  - nenhuma biblioteca nova, pensando em celulares Android mais fracos.

## 5. Ordem de execução

1. Tokens, tema escuro como padrão e fontes (resolve sozinho "as cores ruins").
2. Hero: aurora, grade, selo, título em degradê.
3. Cards, card do app, números, contato e rodapé.
4. Efeitos em JS: holofote, magnético, título palavra por palavra, marquee.
5. Conferir `paracauari.html`, que usa os mesmos CSS.
6. Atualizar o `README.md` (tabela "Onde mexer").

## 6. Verificação

- Capturas no Chrome headless: desktop (1366px) e celular (390px), nos dois
  temas, nas duas páginas.
- Contraste conferido nos tokens finais.
- Testes extras:
  - modo de movimento reduzido;
  - site sem GSAP (CDN bloqueada);
  - troca PT/EN com o título animado.

## Decisões em aberto

1. **Tema claro:** manter o botão claro/escuro (proposta) ou deixar só escuro?
2. **Padrão marajoara do hero:** trocar pela grade de pontos (proposta) ou
   manter o grafismo, discreto, como assinatura regional?
3. **Marquee de tecnologias:** usar ou manter os chips estáticos?
