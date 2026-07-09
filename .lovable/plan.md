## Objetivo
Replicar o layout de cards KPI do Dashboard no topo da página **Demandas**, exibindo indicadores calculados a partir dos dados de demandas.

## Alterações

**Arquivo único:** `src/routes/demandas.tsx`

1. Importar `KPICard` e os ícones `ClipboardList`, `Clock`, `Loader2`, `AlertTriangle`, `CheckCircle2`, `Users` de `lucide-react`.
2. Inserir, logo após o `<PageHeader>` e antes do bloco de filtros, uma grid de 6 KPIs idêntica à do Dashboard:

   ```text
   [354 Total de Demandas] [12 Vencendo em 7 dias] [59 Em Progresso]
   [78 Atrasadas]          [171 Concluídas]         [266 Total de Contatos]
   ```

   Grid responsiva: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6`, com `mb-8` de espaçamento.

3. Manter o restante da página (filtros, tabela "Todas as Demandas") inalterado.

## Detalhes visuais
- Reutilizar as mesmas cores/tons do Dashboard (`navy`, `orange`, `blue`, `red`, `green`, `purple`) para consistência visual.
- Valores permanecem estáticos (mock), coerentes com o Dashboard atual — sem alterações em lógica de negócio ou dados.

## Fora do escopo
- Nenhuma alteração em outras páginas, componentes ou estilos globais.
- Nenhuma integração de backend/banco.
