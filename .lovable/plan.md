# Exportação PDF/Excel — Demandas e Contatos

Implementar exportação real nos botões PDF/Excel que já existem no cabeçalho de "Todas as Demandas" e "Lista de Contatos", sem alterar UI/UX. Ajustar o prompt original ao contexto atual do projeto (colunas reais, tokens do design system, stack TanStack Start).

## Ajustes ao prompt original

- **Botões:** já implementados e estilizados no `SectionHeader` (fundo `bg-navy-800`, ícones `FileDown` / `FileSpreadsheet` do wrapper Iconoir). Não recriar; apenas ligar `onClick`.
- **Cor do cabeçalho da tabela:** usar `#0F2A47` (token `navy-800` do PRODEM) em vez do roxo `#7C3AED` do prompt, para respeitar o design system.
- **Fonte:** Onest (já é a fonte global do projeto).
- **Colunas de Demandas:** usar exatamente os campos que existem em `Demanda` (`titulo`, `categoria`, `contato`, `cidade`, `descricao`, `dataSolicitacao`, `vencimento`, `observacoes`). Sem apelido de contato (não existe no modelo).
- **Colunas de Contatos:** `Código`, `Contato`, `Tipo`, `Telefone`, `Localização` (mesmo cabeçalho da planilha).
- **Geração:** client-side (volume esperado é baixo/médio; consistente com o restante do app).
- **Filtros:** exportar o array já filtrado exibido em tela.

## Bibliotecas

- `jspdf` + `jspdf-autotable` — PDF paginado com header/footer.
- `exceljs` — Excel com estilos de célula, cabeçalho colorido, freeze panes e destaque condicional.

## Arquivos a criar

- `src/lib/export/exportPdf.ts`
  - `exportListToPdf({ title, filtersLine, columns, rows, filename })`
  - A4 paisagem, cabeçalho: título à esquerda, `Página X de Y` à direita, linha "Gerado em: DD/MM/AAAA HH:mm", linha "Ordenado por / filtros" (omite segmentos vazios).
  - Tabela via autoTable: header `navy-800` + texto branco, zebra striping (`#F3F4F6`), sem bordas verticais, word wrap.
  - Callback `didParseCell` para pintar em verde (`#16A34A`) células da coluna "Observações" cujo texto contenha `ok`, `atendido`, `concluíd`, `resolvid` (case-insensitive).
  - Linha vazia → renderiza "Nenhum registro encontrado" no lugar da tabela.
  - Datas em `DD/MM/AAAA`; campos vazios como `-`.

- `src/lib/export/exportExcel.ts`
  - `exportListToExcel({ title, filtersLine, columns, rows, filename, sheetName })`
  - Aba única. Linha 1: título mesclado + negrito. Linha 2: metadados. Linha 4: cabeçalho colorido (`navy-800`, texto branco) com freeze panes. Datas `DD/MM/AAAA`. Largura por coluna com min/max (Descrição/Observações mais largas). Destaque verde na coluna Observações pelas mesmas regras do PDF.

- `src/lib/export/filename.ts`
  - `buildFilename(base, extension, opts?)` — slugifica, remove acentos/espaços, anexa data `AAAA-MM-DD`. Ex.: `demandas_castanhal_2026-07-18.pdf`.

## Arquivos a editar

- `src/routes/demandas.index.tsx`
  - Fatorar a lista já filtrada em `filteredDemands` (hoje a página mostra `demands` direto — deixar preparado para filtros futuros usando o mesmo array). Ligar `onClick` dos botões PDF/Excel chamando os helpers com as 8 colunas do modelo `Demanda`.
  - Linha de filtros do relatório: montar dinamicamente a partir do estado (ex.: `Ordenado por: Vencimento`, `Cidade: X`, `Bairro: Y`), omitindo segmentos vazios.

- `src/routes/contatos.index.tsx`
  - Ligar `onClick` dos botões PDF/Excel usando `filteredContacts` (já existe) com as 5 colunas de contato.

## Dependências

- Instalar `jspdf`, `jspdf-autotable`, `exceljs` via `bun add`.

## Fora de escopo

- Nenhuma mudança visual na tela (botões, cabeçalhos, filtros, tabelas permanecem idênticos).
- Sem alterações no backend / Google Sheets.
- Sem geração via Edge Function (client-side é suficiente).

## Critérios de aceite

- Clique em PDF/Excel em Demandas gera arquivo com as 8 colunas, cabeçalho `navy-800`, zebra striping, "Observações" em verde quando indicar conclusão, paginação `X de Y` no PDF e freeze panes no Excel.
- Clique em PDF/Excel em Contatos gera arquivo com as 5 colunas nos mesmos padrões.
- Ambos respeitam o conjunto filtrado atualmente exibido.
- Lista vazia gera arquivo com mensagem "Nenhum registro encontrado".
- Nome do arquivo segue `demandas_{filtro}_{data}.ext` / `contatos_{filtro}_{data}.ext`.
