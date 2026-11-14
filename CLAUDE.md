# Alerta CassAAndra — Frontend

App web do time Ana, Aline e Mirian para o NASA Space Apps Challenge 2026
(desafio "Dancing with the SARs"). Mostra áreas alagadas e queimadas detectadas
por radar (NISAR banda L, Sentinel-1 banda C), com validação óptica (Sentinel-2)
e fontes de referência (JRC, DETER, FIRMS). Mascote e agente conversacional: Cass.
Slogan: "Não é previsão. É precisão." / "Not a forecast. Precision."

**Prazo:** entrega domingo, 15 nov 2026, 23:59. Prefira o simples que funciona
ao elegante que não fica pronto.

## Decisões (detalhes em /docs/adr)

- ADR-001: Vite + React + TypeScript (SPA). Não usar Next.js.
- ADR-002: Firebase Hosting para o app e /dados; Cloud Run para /api/agente e /api/clima.
- ADR-003: MapLibre GL para o mapa; camadas raster como fonte `image` com bbox.
- ADR-004: o front só lê arquivos estáticos gerados pelo pipeline Python.
- ADR-007: i18n PT/EN e temas claro/escuro por variáveis CSS.
- Gráficos: Recharts.

Se uma tarefa pedir algo que contradiz um ADR, pare e pergunte antes de seguir.

## Comandos

```bash
npm run dev        # servidor local, com proxy de /api
npm run build      # build de produção em dist/
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

Antes de dizer que terminou uma tarefa, rode `lint`, `typecheck` e `build`.

## Estrutura

```
src/
  app/                 # rotas, providers, layout
  features/
    mapa/              # mapa, hotspots, lentes, camadas
    painel/            # sensores, polarização, linha do tempo, Medido × Hipótese
    cass/              # chat do agente
    alerta/            # card e envio pelo WhatsApp
    tecnico/           # modal do modo técnico
  shared/
    ui/                # componentes genéricos (Button, Badge, Dialog)
    i18n/              # pt.json, en.json
    theme/             # tokens.css
    lib/               # fetch, formatação, validação (zod)
public/dados/          # JSON e PNG do pipeline (nunca editar à mão)
api/                   # funções do Cloud Run (agente, clima)
docs/adr/              # decisões de arquitetura
```

## Regras que não podem ser quebradas

1. **Nenhuma chave no frontend.** Tudo que começa com `VITE_` vai para o JavaScript
   público. Chaves (LLM, Meteomatics) ficam no Secret Manager e só o Cloud Run lê.
2. **Caminhos relativos.** O app chama `/api/...` e `/dados/...`, nunca uma URL completa.
3. **Nenhum texto fixo na interface.** Todo texto visível vem de `shared/i18n` (PT e EN).
4. **Nenhuma cor ou fonte fixa.** Use as variáveis de `shared/theme/tokens.css`.
5. **Medido separado de Hipótese.** Dado medido mostra fonte e data. Hipótese mostra
   a força (fraca, moderada, forte) e nunca aparece com o mesmo estilo do medido.
6. **Imagens do Cass e outras geradas por IA levam o selo "AI-generated".**
7. **Sem logo ou marca da NASA** em conteúdo gerado por IA.
8. **Previsão com mais de 3 dias não dispara alerta.** Toda previsão mostra a fonte
   (Meteomatics, Open-Meteo ou snapshot salvo) e a data da atualização.
9. **Link público sem login.**

## Marca

| Token | Cor | Uso |
| --- | --- | --- |
| `--azul-profundo` | #0B3C5D | cabeçalho, texto forte |
| `--azul-medio` | #328CC1 | ações, links, água |
| `--laranja-alerta` | #FF6B35 | atenção, hipótese |
| `--vermelho-critico` | #D7263D | crítico, erro |
| `--verde-geo` | #2E8B57 | vegetação, sucesso |
| `--cinza-neutro` | #F5F7FA | fundo do tema claro |

Fontes: Red Hat Display (títulos) e Red Hat Text (texto).
Tema por `data-theme="claro|escuro"` no `<html>`, respeitando `prefers-color-scheme`
na primeira visita e lembrando a escolha depois.

## Dados

- `public/dados/hotspots.geojson`: os 6 hotspots (Norte Fire/EUA, Costa do Peru,
  Norte da Amazônia, Guaíba/RS, Kariba, Bornéu).
- Estatísticas por hotspot, data e limiar (2/3/4 dB): área, classes, histograma,
  série HH/HV.
- Camadas PNG com `bbox`, data, sensor e polarização.
- Datas da linha do tempo: 19 out, 31 out e 12 nov 2026.
- Valide todo JSON com zod ao carregar. Se falhar, mostre o estado de erro, não quebre a tela.

## Código

- TypeScript em modo `strict`; sem `any` sem comentário explicando.
- Componentes em função, um por arquivo, nome em PascalCase.
- Estado que precisa ir no link (hotspot, data, lente, polarização, idioma) fica na URL.
- Código, nomes de variáveis, commits e comentários em inglês.
- Commits pequenos, no formato `feat: ...`, `fix: ...`, `docs: ...`.

## Acessibilidade e desempenho

- Foco visível, painel e modal operáveis por teclado, contraste AA nos dois temas.
- Cada hotspot tem alternativa em texto fora do mapa.
- Respeitar `prefers-reduced-motion` (animação do radar).
- Modo técnico e chat carregados sob demanda (`React.lazy`).
- Pensar em celular simples e 4G lento.

## Como trabalhar comigo

- Antes de mudanças grandes, mostre o plano e as dúvidas.
- Mude só o que a tarefa pede; não reorganize o que já funciona.
- No fim, explique o que mudou e por quê, de forma didática, com exemplos.
- Se não souber algo do projeto, pergunte em vez de inventar.
