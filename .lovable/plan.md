# Plano: Substituir ícones Lucide por Iconoir

Como o Flaticon UIcons (Regular Straight) exige licença paga e webfont hospedada, adotaremos **Iconoir React** — biblioteca gratuita (MIT), open source, com estilo de traço uniforme e cantos retos, visualmente muito próxima dos UIcons Regular Straight.

## Etapas

1. **Instalar dependência**
   - `bun add iconoir-react`

2. **Criar camada de compatibilidade** em `src/components/icons/index.ts`
   - Reexporta um mapa dos ícones usados no projeto com os mesmos nomes atuais (LayoutDashboard, Users, ClipboardList, Tags, Activity, BarChart3, LogOut, Plus, Pencil, Search, X, Save, ChevronDown, Filter, Upload, FileText, etc.) apontando para os equivalentes da Iconoir (ex.: `HomeSimple`, `Group`, `Task`, `PriceTags`, `Activity`, `StatsReport`, `LogOut`, `Plus`, `EditPencil`, `Search`, `Xmark`, `FloppyDisk`, `NavArrowDown`, `Filter`, `CloudUpload`, `Page`).
   - Mantém a API `{ className, strokeWidth, size }` para minimizar alterações nos consumidores.

3. **Substituir imports** em todo o projeto
   - Trocar `from "lucide-react"` por `from "@/components/icons"` em:
     - `src/components/layout/Sidebar.tsx`, `PageHeader.tsx`, `SectionHeader.tsx`
     - `src/components/ui/KPICard.tsx`, `StatusSelect.tsx`, `CategorySelect.tsx`, `SimpleSelect.tsx`, `MultiSelect.tsx`, `ContactAutocomplete.tsx`, `FileUpload.tsx`
     - `src/components/demandas/MovimentacaoStepper.tsx`
     - Rotas: `index.tsx`, `contatos.*`, `demandas.*`, `categorias.tsx`, `status.tsx`, `relatorios.tsx`

4. **Ajustes visuais**
   - Padronizar tamanho (`h-5 w-5` sidebar, `h-4 w-4` botões) e `strokeWidth={1.75}` para casar com o traço fino dos UIcons Straight.
   - Verificar contraste nos KPICards e nos badges de Status/Categoria.

5. **Remover Lucide** (opcional, após validação)
   - `bun remove lucide-react` se nenhum import remanescente.

6. **Verificação**
   - Build + inspeção visual das telas: Dashboard, Contatos, Demandas (lista, novo, editar), Categorias, Status, Relatórios.

## Detalhes técnicos

- **Por que Iconoir e não Phosphor?** Iconoir usa traço 1.5px com terminações retas — resultado quase idêntico ao Flaticon UIcons Regular Straight. Phosphor Regular tem cantos levemente arredondados.
- A camada `@/components/icons` isola a troca: se no futuro quiser migrar para outra biblioteca (ex.: kit UIcons self-hosted), altera-se apenas 1 arquivo.
- Nenhuma alteração em lógica de negócio, rotas, dados mockados ou tokens de cor.
