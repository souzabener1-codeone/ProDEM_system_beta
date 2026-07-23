## Objetivo

Ao clicar em **Salvar Demanda** e **Salvar Contato**, exibir uma mensagem de sucesso no estilo do componente `AlertSoftSuccessDemo` (fundo verde suave, ícone `CheckCheck`, título + descrição), no lugar do atual `toast.success`.

## Escopo

Apenas as duas telas de cadastro:
- `src/routes/demandas.novo.tsx`
- `src/routes/contatos.novo.tsx`

Nada mais será alterado (telas de edição, layout, lógica de mutation, redirecionamento etc. permanecem iguais).

## Como implementar

1. Em cada arquivo, importar:
   - `Alert`, `AlertTitle`, `AlertDescription` de `@/components/ui/alert`
   - `CheckCheck` de `@/components/icons` (mantém consistência com os demais ícones do projeto).

2. Adicionar um estado local `showSuccess: boolean`.

3. No `onSuccess` da mutation:
   - Manter `queryClient.invalidateQueries(...)`.
   - Remover a chamada `toast.success(...)`.
   - Setar `showSuccess = true`.
   - Atrasar o `navigate({ to: "/demandas" | "/contatos" })` em ~1,8s (via `setTimeout`) para o usuário conseguir ler o alerta antes do redirecionamento.

4. Renderizar o `Alert` no topo do formulário quando `showSuccess` for `true`, usando exatamente as classes do exemplo:
   ```tsx
   <Alert className="border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400 mb-4">
     <CheckCheck />
     <AlertTitle>{titulo}</AlertTitle>
     <AlertDescription className="text-green-600/80 dark:text-green-400/80">
       {descricao}
     </AlertDescription>
   </Alert>
   ```

   Textos (conforme solicitado pelo usuário):
   - **Demanda** — título: `Demanda Salva com sucesso` / descrição: `A demanda foi cadastrada e já está disponível na lista de demandas.`
   - **Contato** — título: `Contato Salvo com sucesso` / descrição: `O contato foi cadastrado e já está disponível na lista de contatos.`

## Fora do escopo

- Telas de edição (`Atualizar Demanda` / `Atualizar Contato`) — não alteradas.
- `AlertDialog` de confirmação prévia — mantido.
- Mensagens de erro (`toast.error`) — mantidas como estão.
