## Problema

Na lista de demandas, o **Vencimento** aparece antes da **Data Solicitação** (ex.: solicitação 19/07/2026, vencimento 17/07/2026). Isso ocorre porque:

1. Em `demandas.$id.editar.tsx`, o formulário não expõe os campos "Dias Estimados" nem recalcula `vencimento`. Ao salvar, envia `vencimento: demanda.vencimento` (valor antigo), mesmo quando o usuário altera a Data da Solicitação — mantendo vencimento defasado/incoerente.
2. Em `demandas.novo.tsx`, se o usuário deixa a Data da Solicitação em branco, o código usa `hoje` como solicitação, mas o `vencimento` exibido/enviado é calculado a partir de uma data vazia até o submit — se o usuário digitar dias negativos ou datas antigas, o vencimento pode ficar antes da solicitação.

## Correções

### 1. `src/routes/demandas.$id.editar.tsx`
- Adicionar estado `diasEstimados` (número, default calculado a partir da diferença entre `demanda.vencimento` e `demanda.dataSolicitacao`, senão 5).
- Ligar o input "Dias Estimados" (hoje é `defaultValue`, sem controle) ao estado.
- Criar helper `computeVencimento(base, dias)` (mesma lógica de `novo`).
- No `mutation`, enviar `vencimento: computeVencimento(dataSolicitacao, diasEstimados)` em vez de `demanda.vencimento`.
- Mostrar preview "Vencimento previsto: dd/mm/aaaa" abaixo do campo Data Solicitação.

### 2. `src/routes/demandas.novo.tsx`
- Garantir `diasEstimados >= 0` (clamp no `onChange`).
- Recalcular `vencimentoCalculado` a partir de `dataSolicitacao || hoje` para que o preview e o valor enviado sejam sempre coerentes com a solicitação efetiva.

Nenhuma outra alteração de UI, lógica de negócio ou schema.

## Detalhes técnicos

```ts
const computeVencimento = (base: string, dias: number) => {
  if (!base) return "";
  const d = new Date(base + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.max(0, Number.isFinite(dias) ? dias : 0));
  return d.toISOString().slice(0, 10);
};
```

Inferência de `diasEstimados` inicial na edição:
```ts
const diff = (new Date(v) - new Date(s)) / 86400000;
const initial = Number.isFinite(diff) && diff >= 0 ? Math.round(diff) : 5;
```
