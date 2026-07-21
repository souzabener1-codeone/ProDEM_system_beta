## Diagnóstico

Confirmado em `src/routes/demandas.index.tsx` linhas 34 e 72:

```ts
const d = new Date(iso);         // iso = "2026-07-22"
return d.toLocaleDateString("pt-BR");
```

`new Date("2026-07-22")` (sem hora) é interpretado como **UTC 00:00**. No fuso pt-BR (UTC-3), ao formatar como local, cai para **21/07/2026 21:00** → exibe "21/07/2026". Mesmo bug afeta o vencimento (27 → 26).

Os outros pontos do arquivo (`demandas.$id.editar.tsx`, `demandas.novo.tsx`) já usam o sufixo `"T00:00:00"`, que força interpretação local e evita o shift. Só a lista está errada.

## Correção

### `src/routes/demandas.index.tsx`
- Nas duas funções que formatam data (linhas ~33-36 e ~71-74), trocar `new Date(iso)` por `new Date(iso + "T00:00:00")` **apenas quando `iso` estiver no formato `yyyy-mm-dd`**. Se já vier em outro formato, manter fallback atual.
- Também revisar linhas 184-185 e 213 (filtros por intervalo e ordenação), aplicar o mesmo sufixo para evitar off-by-one nos filtros de "Data Inicial/Final".

### Verificação
- Abrir uma demanda com Data Solicitação 22/07/2026 e Vencimento 27/07/2026 → lista deve exibir exatamente 22/07/2026 e 27/07/2026.
- Filtrar por "Data Inicial = 22/07/2026" deve incluir demandas desse dia.

## Fora do escopo
Nenhuma mudança em Server Functions, planilha, cálculo de vencimento, layout ou outros arquivos. Apenas o parse de datas ISO na lista de demandas.