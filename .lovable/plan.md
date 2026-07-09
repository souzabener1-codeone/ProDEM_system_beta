## Objetivo

Recriar o shell da aplicação (sidebar + topbar) seguindo o layout da imagem de referência — sidebar clara em coluna com busca, navegação vertical minimalista e header superior com seletor de organização, notificações e avatar. Sem dependência do registry pago `@efferd`: vou construir com shadcn `Sidebar` + componentes locais.

## Referência visual (do print)

- Fundo geral escuro (quase preto, `#0B0B0F` aprox.), cartões `#141418`, bordas sutis.
- Sidebar à esquerda (~256px), com:
  - Logo pequeno no topo esquerdo.
  - Seletor "Efferd LLC" com bolinha verde (workspace switcher).
  - Campo de busca com atalho ⌘K.
  - Lista de itens: ícone + label, item ativo com fundo levemente mais claro e texto branco.
- Topbar à direita da sidebar: sino com badge de notificações + avatar.
- Conteúdo abre em grid de cards com placeholders.

## Escopo (apenas UI/shell)

Não mexer em regras de negócio, dados, rotas, nem em `AppLayout`/`Sidebar` de outras páginas neste momento — vou criar o novo shell e aplicá-lo somente na tela principal (`/`, `src/routes/index.tsx`), preservando o conteúdo atual (KPIs + Demandas Recentes). As demais rotas continuam com o `AppLayout` antigo até validarmos o novo visual.

Observação: o app hoje é claro (PRODEM navy + branco). O mockup é dark. Vou implementar em **dark mode** apenas no novo shell, usando tokens semânticos novos (`--shell-bg`, `--shell-surface`, `--shell-border`, `--shell-muted`) definidos em `src/styles.css`, sem quebrar o tema atual das outras telas. Se depois quiserem propagar, é passo separado.

## Arquivos

**Novos**
- `src/components/shell/AppShell.tsx` — wrapper com `SidebarProvider` + `<AppSidebar />` + `<AppTopbar />` + `<main>{children}</main>`.
- `src/components/shell/AppSidebar.tsx` — usa `Sidebar` do shadcn (`collapsible="icon"`), header com logo + workspace switcher, busca, `SidebarMenu` com os itens do gabinete (Dashboard, Contatos, Demandas, Categorias, Status, Relatórios), footer com usuário.
- `src/components/shell/AppTopbar.tsx` — barra superior fina: `SidebarTrigger` (mobile), espaço flexível, botão de notificações com badge, avatar.
- `src/components/shell/WorkspaceSwitcher.tsx` — botão com bolinha de status + nome + chevron (visual apenas por enquanto, sem lógica de troca).
- `src/components/shell/SidebarSearch.tsx` — input com ícone e chip `⌘K` (visual; sem command palette funcional nesta etapa).

**shadcn**
- Adicionar `sidebar` via `bunx shadcn@latest add sidebar` (registry oficial, gratuito) se ainda não presente.

**Editados**
- `src/styles.css` — adicionar tokens do shell dark (`--shell-bg`, `--shell-surface`, `--shell-border`, `--shell-muted`, `--shell-accent`) e mapeamento das variáveis do `sidebar` shadcn para estes tokens quando dentro de `.shell-dark`.
- `src/routes/index.tsx` — trocar `<AppLayout>` por `<AppShell>` mantendo `<PageHeader>`, grid de KPIs e tabela de demandas intactos. Ajustar cores locais que assumiam fundo claro (bg-slate-50 do table head, borders) para variantes dark via tokens.

**Não mexer nesta etapa**
- `src/components/layout/Sidebar.tsx` e `AppLayout.tsx` — permanecem para as outras rotas.
- Demais `src/routes/*.tsx`.

## Passo a passo

1. Rodar `bunx shadcn@latest add sidebar` (só se `src/components/ui/sidebar.tsx` não existir).
2. Adicionar tokens dark em `src/styles.css` sob `.shell-dark { ... }` e mapear as variáveis `--sidebar-*` para esses tokens.
3. Criar `AppSidebar`, `AppTopbar`, `WorkspaceSwitcher`, `SidebarSearch`, `AppShell`.
4. Trocar wrapper de `src/routes/index.tsx` para `<AppShell>`, envolvendo o conteúdo em `.shell-dark`.
5. Ajustar `KPICard` e a tabela na home para respeitar tokens (ex: `bg-card` em vez de `bg-slate-50` hardcoded no `<thead>`), sem quebrar visual em outras páginas — validar que `KPICard` e `StatusBadge` não são compartilhados com telas que dependem de fundo claro (se forem, criar variante local em vez de editar o componente).
6. `bun run build` limpo.
7. Screenshot Playwright em desktop e mobile de `/`:
   - Desktop: sidebar visível, item ativo destacado, topbar com sino+avatar, cards escuros.
   - Mobile: sidebar vira offcanvas via `SidebarTrigger`.

## Riscos

- Conflito de shadcn `sidebar` com componentes existentes — se o CLI perguntar, aceitar sobrescrever apenas `ui/sidebar.tsx` (novo arquivo).
- `KPICard`/`StatusBadge`/`SectionHeader` usados em outras rotas com fundo claro — se editar tokens neles quebra as outras telas. Mitigação: encapsular ajustes de cor dentro do escopo `.shell-dark` no CSS.
- Divergência visual PRODEM (paleta atual é clara/navy) — este plano introduz um segundo tema só na home. Confirmar se é aceitável antes de propagar para as demais rotas.

## O que fica para depois (não incluso)

- Command palette real no ⌘K.
- Workspace switcher com dropdown funcional.
- Popover de notificações e menu do avatar.
- Migrar as demais rotas (`/contatos`, `/demandas`, etc.) para o novo shell.
