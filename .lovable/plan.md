## Objetivo
Substituir o "Histórico de Movimentação" atual (timeline vertical) em `src/routes/demandas.$id.editar.tsx` por um **Stepper** shadcn (variante `stepper-05`) que mostre as etapas de movimentação da demanda, preservando o restante da UI/UX.

## Etapas

1. **Instalar dependência**
   - `bun add @stepperize/react`

2. **Criar o componente base do Stepper**
   - Arquivo: `src/components/ui/stepper.tsx` — copiar exatamente o código fornecido no prompt, ajustando apenas:
     - Remover `'use client'` (não é Next.js).
     - Import `cn` de `@/lib/utils` (já existe no projeto — confirmado em `components.json`).
   - Sem alterações no `globals.css` (nenhuma variável CSS extra é exigida pelo snippet).

3. **Criar o componente de histórico com Stepper**
   - Novo arquivo: `src/components/demandas/MovimentacaoStepper.tsx`
   - Usa `Stepper`, `StepperNav`, `StepperItem`, `StepperTrigger`, `StepperIndicator`, `StepperTitle`, `StepperDescription`, `StepperSeparator`.
   - Orientação `vertical` + `responsive`, seguindo o estilo do card atual.
   - Define as etapas de movimentação de uma demanda:
     1. Criação
     2. Em Progresso
     3. Aguardando Retorno
     4. Concluída
   - Recebe `currentStepId` via prop (com valor default derivado do `status` da demanda) para marcar automaticamente as etapas concluídas / ativa.
   - Mantém título "Histórico de Movimentação", subtítulo e o ícone `Clock` já usados no card.
   - Cada `StepperDescription` mostra autor + data (ex.: `jhiovana alcantara · 28/04/2026, 13:41`) para preservar as informações do histórico atual.

4. **Integrar na página**
   - Em `src/routes/demandas.$id.editar.tsx`, substituir o bloco da timeline vertical dentro do card "Histórico de Movimentação" pelo `<MovimentacaoStepper currentStepId="concluida" />` (mapeado a partir do `status` local).
   - Manter o container `rounded-[24px] border border-border bg-white p-8 shadow-sm` e o cabeçalho com o ícone `Clock` intactos.
   - Nenhuma outra alteração de UI/UX no formulário, cores, radius, botões ou demais seções.

5. **Validação**
   - `bun run build` limpo.
   - Verificar via Playwright que `/demandas/101/editar` renderiza o stepper com etapas marcadas corretamente e permanece responsivo.

## Fora do escopo
- Não mexer em `demandas.novo.tsx`, sidebar, filtros, KPIs, ou qualquer outra tela.
- Não adicionar tokens de cor novos nem alterar `styles.css`.
- Não trocar o mock atual do histórico por dados reais (apenas transportar as mesmas informações para o novo formato).
