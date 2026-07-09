## Objetivo
Instalar o bloco `@efferd/app-shell-8` do registry privado Efferd e aplicá-lo como shell da tela principal (`/`), preservando o conteúdo atual do Dashboard (KPIs + Demandas Recentes).

## Pré-requisitos (bloqueante)
O registry `@efferd` é pago e exige o secret `EFFERD_REGISTRY_TOKEN`. Sem ele, o `shadcn add` falha com 401.

Passos que dependem do usuário:
1. Comprar Efferd Pro em `efferd.com`.
2. Copiar o token em `efferd.com/account?tab=registry-token`.
3. Salvar como secret do projeto com o nome `EFFERD_REGISTRY_TOKEN` (fluxo `add_secret`).

Se o token não estiver disponível na hora do build, eu paro antes de rodar o CLI e aviso.

## Etapas de implementação

1. **components.json** — já tem `registries["@efferd"]` apontando para `https://efferd.com/r/{style}/{name}.json`. Vou adicionar o header de Authorization:
   ```json
   "@efferd": {
     "url": "https://efferd.com/r/{style}/{name}.json",
     "headers": { "Authorization": "Bearer ${EFFERD_REGISTRY_TOKEN}" }
   }
   ```

2. **Instalar o bloco** via `bunx shadcn@latest add @efferd/app-shell-8` (com o env exportado). Isso deve criar arquivos sob `src/components/` (provavelmente `app-shell`, `app-sidebar`, `app-header`, `nav-user`, etc.), possivelmente re-adicionar componentes shadcn base que já existem (sidebar, sheet, tooltip) — vou revisar diffs e evitar sobrescrever tokens do design system atual (`bg-navy-800`, `brand-blue`).

3. **Adaptar à identidade PRODEM**:
   - Substituir logo padrão pelo `prodem-logo.png.asset.json` já em uso no `Sidebar` atual.
   - Reaproveitar os itens de navegação do `Sidebar.tsx` atual (Dashboard, Contatos, Demandas, Categorias, Status, Relatórios).
   - Manter usuário "Maria Andrade" no rodapé.
   - Aplicar cores via tokens semânticos existentes em `src/styles.css`; não hardcodar cores.

4. **Integrar no Root** — trocar o `AppLayout` (usado hoje em `/` e demais rotas) pelo novo `AppShell`. Duas opções:
   - (Preferida) Mover o `AppShell` para dentro de `RootComponent` em `src/routes/__root.tsx`, envolvendo o `<Outlet />`, para todas as rotas herdarem o shell. Remover o `AppLayout` das páginas.
   - Alternativa: manter `AppLayout` como wrapper por página e apenas substituir seu conteúdo interno pelo `AppShell`. (Menos limpo — descartar.)

5. **Limpeza** — remover `src/components/layout/Sidebar.tsx` e `AppLayout.tsx` após migração, e as importações órfãs em cada rota (`index.tsx`, `demandas.tsx`, `contatos.*`, `categorias.tsx`, `status.tsx`, `relatorios.tsx`).

6. **Validação**:
   - `bun run build` limpo.
   - Playwright screenshot de `/` e `/demandas` confirmando shell novo com sidebar PRODEM, header, e conteúdo (KPIs + tabela) intactos.
   - Verificar responsividade (mobile: sidebar colapsa em Sheet).

## Arquivos afetados (previsão)
- `components.json` (headers do registry)
- **Novos** em `src/components/` gerados pelo CLI (app-shell + subcomponentes)
- `src/routes/__root.tsx` (envolver `<Outlet />` no `AppShell`)
- Cada `src/routes/*.tsx` (remover `<AppLayout>` wrapper)
- **Removidos**: `src/components/layout/Sidebar.tsx`, `src/components/layout/AppLayout.tsx`

## Riscos
- **Token ausente** → instalação falha; preciso do secret antes de rodar o CLI.
- **Conflito de tokens Tailwind** — o bloco pode assumir variáveis que não temos. Mitigar mapeando para os tokens PRODEM existentes.
- **Sobrescrita de componentes shadcn base** — revisar cada arquivo proposto pelo CLI antes de aceitar.
- **Regressão visual** nas rotas — validar todas as 6 páginas após migração.

## Próximo passo para você
Confirme e adicione o `EFFERD_REGISTRY_TOKEN` como secret do projeto. Assim que estiver disponível, executo a instalação.