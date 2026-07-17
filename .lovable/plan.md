# Plano — Integração Google Sheets + Google Calendar (PRODEM)

Ajustei o prompt original para respeitar a stack do projeto (TanStack Start + React 19 + Vite, sem Lovable Cloud) e o Supabase externo (`tdkgbyaadgcnaemsxqxv.supabase.co`) informado. As decisões de segurança e arquitetura do prompt são mantidas — muda apenas *onde* o backend roda.

## Ajustes principais em relação ao prompt

1. **Backend não vai em Supabase Edge Functions.** O projeto é TanStack Start; o padrão correto é `createServerFn` (RPC tipado) rodando no runtime SSR/Worker. Edge Functions só entrariam se houvesse webhook externo, o que não é o caso.
2. **Sem Lovable Cloud.** O Supabase informado é externo (BYO). Ele NÃO será usado como banco — a fonte de verdade continua sendo a planilha, como no prompt. O Supabase só entra se, mais tarde, você quiser autenticação/roles. Nada de tabelas nem RLS agora.
3. **Segredos.** `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, `GOOGLE_CALENDAR_ID` são gravados via `add_secret` e lidos com `process.env.*` **dentro do `.handler()`** (nunca em escopo de módulo — Workers injetam env por requisição).
4. **JWT de Service Account em runtime Worker.** `jose` (mesma lib do exemplo) funciona; a nota do prompt sobre `googleapis` não rodar no Deno continua válida aqui — Worker também não é Node completo.
5. **UI intacta.** Nada muda no design system, tabelas, badges, KPIs. Só troca a origem dos dados mockados por chamadas às server functions via React Query.

## Arquitetura

```text
Browser (React)
   │  useServerFn + React Query
   ▼
createServerFn (TanStack, roda no Worker SSR)
   │  1. assina JWT (jose) → access_token OAuth2
   │  2. chama Google Sheets API v4 / Calendar API v3
   ▼
Google Sheets (fonte da verdade)  +  Google Calendar (agenda/lembretes)
```

## Estrutura de arquivos

```text
src/lib/
├── google/
│   ├── google-auth.server.ts     # assina JWT, cacheia access_token em memória (~55 min)
│   ├── sheets.server.ts          # get/append/update/batchUpdate helpers
│   └── calendar.server.ts        # create/patch/delete event helpers
├── contatos.functions.ts         # createServerFn: list/create/update/delete
└── demandas.functions.ts         # createServerFn: list/create/update/delete + calendar sync
```

Todos os `*.server.ts` ficam bloqueados do bundle do cliente pelo nome; `*.functions.ts` só expõe stubs RPC.

## Planilhas (idêntico ao prompt)

Abas `Contatos` e `Demandas` com as colunas descritas. Regras críticas mantidas:
- `id` (UUID) é a chave; **nunca** usar número de linha.
- `google_event_id` na aba Demandas, preenchido pelo backend.
- Update/delete: `values.get` da coluna `id` → localizar linha → `values.update` ou `batchUpdate` (deleteDimension).

## Server functions

- `listContatos`, `createContato`, `updateContato`, `deleteContato`
- `listDemandas`, `createDemanda`, `updateDemanda`, `deleteDemanda`
  - Após sucesso na planilha, dispara sync no Calendar:
    - `create` com `prazo` → cria evento, grava `google_event_id` de volta.
    - `update` → `PATCH` se já existe evento; cria se `prazo` foi adicionado; deleta se `prazo` foi removido.
    - `delete` → remove evento.
  - `status = Concluída` → mantém evento, prefixa `✅` no summary.
  - Falha no Calendar **não** reverte a planilha (registra `console.error`, retorna warning no payload).
- `deleteContato` verifica demandas vinculadas antes; retorna erro amigável se houver.

Lembrete padrão: `reminders.overrides = [{ method: "popup", minutes: 1440 }]` (1 dia antes), configurável por demanda no futuro.

## Frontend

- React Query já está no template. Cada tela (Contatos, Demandas) troca o array mockado por `useSuspenseQuery` no loader + `useMutation` para CRUD.
- `staleTime: 30_000`, invalidação da query específica após mutação.
- Estados de loading/erro usando os componentes existentes (nenhum novo visual).
- Formulários existentes (`contatos.novo`, `demandas.novo`) passam a chamar as mutations; o `AlertDialog` de confirmação atual continua.

## Segredos e setup

Vou solicitar via `add_secret` (o usuário cola no formulário seguro):
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (colar com quebras reais `\n`; o código normaliza)
- `GOOGLE_SHEET_ID`
- `GOOGLE_CALENDAR_ID`

Pré-requisitos manuais do usuário (fora do Lovable):
1. Google Cloud: ativar Sheets API + Calendar API.
2. Criar Service Account, baixar JSON.
3. Compartilhar a planilha e o calendário com o e-mail da SA (permissão Editor).
4. Criar as abas `Contatos` e `Demandas` com os cabeçalhos exatos.

## Dependência

- `jose` (assinatura RS256 do JWT, roda em Workers).

## Ordem de implementação

1. `google-auth.server.ts` + teste isolado via uma server fn `pingSheets` que só lê o título da planilha.
2. `sheets.server.ts` + `contatos.functions.ts` + refatorar `src/routes/contatos.index.tsx` e `contatos.novo.tsx`.
3. `demandas.functions.ts` sem Calendar → validar CRUD.
4. `calendar.server.ts` + integração no fluxo de demandas.
5. Ajuste de invalidations e estados de loading.

## Observação sobre o Supabase informado

Não vou conectá-lo agora — não há necessidade para este escopo (a planilha é o "banco"). Se depois você quiser login por e-mail/gabinete ou papéis (admin/assessor), fazemos numa segunda etapa habilitando Cloud ou conectando esse Supabase externo. Confirma que seguimos assim?
