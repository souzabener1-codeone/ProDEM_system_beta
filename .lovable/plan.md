## Diagnóstico

As datas editadas não persistem porque há uma **incompatibilidade de formato** entre o que a planilha devolve e o que o app envia:

1. O app grava datas como `"2026-07-24"` (ISO `yyyy-mm-dd`) via `valueInputOption=USER_ENTERED`. O Google Sheets interpreta como data e passa a exibir como `24/07/2026` (formato pt-BR).
2. Ao reler, `readSheet` traz o valor formatado (`"24/07/2026"`). Esse valor volta para `Demanda.dataSolicitacao` / `vencimento`.
3. No formulário de edição, `<input type="date">` **não aceita** `"24/07/2026"` → o campo aparece vazio. Se o usuário salvar sem redigitar, o app envia `dataSolicitacao: ""` e `computeVencimento("", n) → ""`, apagando/desalinhando as datas.
4. Também explica o caso da imagem (solicitação 19/07 × vencimento 17/07): edições anteriores gravaram vencimento vazio ou recalculado sobre uma data-base inválida.

Não confirmei via query ao vivo qual das duas pontas está no formato "errado"; o primeiro passo do plano é justamente logar/verificar isso antes de aplicar a normalização.

## Correções

### 1. `src/lib/google/sheets.server.ts` (leitura)
- Continuar lendo com `FORMATTED_VALUE` (default), mas adicionar helper `parseSheetDate(v)`:
  - Se casar `^\d{2}/\d{2}/\d{4}$` → converter para `yyyy-mm-dd`.
  - Se já for `yyyy-mm-dd` → devolver como está.
  - Caso contrário → devolver original.
- Não aplicar globalmente; expor o helper.

### 2. `src/lib/demandas.functions.ts`
- Em `toDemanda`, passar `dataSolicitacao` e `vencimento` por `parseSheetDate` → UI sempre recebe ISO `yyyy-mm-dd`, compatível com `<input type="date">`.
- Em `buildRow`, formatar `dataSolicitacao` e `vencimento` para `dd/mm/yyyy` antes de enviar (helper `toSheetDate`), para que a planilha armazene de forma consistente sem depender do parse locale-dependente do Sheets.
- Aplicar o mesmo tratamento também em `contatos.functions.ts` **apenas se** tiver campos de data equivalentes — verificar antes; não alterar se não houver.

### 3. `src/routes/demandas.$id.editar.tsx` (defensivo)
- Antes de popular `useState(demanda.dataSolicitacao)`, passar por `parseSheetDate` (helper local pequeno, mesma regex) — garante que, mesmo se algum registro legado ainda estiver em `dd/mm/yyyy`, o input abre preenchido.
- Reaproveitar o mesmo helper para `inferDias()`.

### 4. `src/routes/demandas.novo.tsx`
- Nenhuma mudança de UX. Só confirmar que o valor enviado passa pelo `toSheetDate` centralizado em `demandas.functions.ts` (o form continua trabalhando em ISO internamente).

### 5. Verificação
- Após aplicar: abrir uma demanda existente na tela de edição e confirmar que os campos "Data Solicitação" e "Vencimento previsto" aparecem preenchidos.
- Alterar a data, salvar, e conferir na Lista de Demandas que a nova data aparece e que vencimento = solicitação + diasEstimados (nunca anterior).
- Criar uma nova demanda e repetir a verificação.

## Fora do escopo
- Nenhuma mudança de layout, colunas da tabela, filtros, cálculo de KPIs, RLS, políticas ou schema. Apenas normalização de datas no ciclo leitura/escrita da planilha e o parse defensivo na tela de edição.