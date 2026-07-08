# PRODEM System Beta

O **PRODEM System** é uma plataforma desenvolvida para cadastro e gestão de cidadãos, contatos e demandas atendidas pelo gabinete.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias e bibliotecas modernas:

- **[React 19](https://react.dev/)** - Biblioteca principal para construção de interfaces.
- **[Vite](https://vitejs.dev/)** - Ferramenta de build rápida e moderna.
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework utilitário para estilização rápida e responsiva.
- **[TanStack Router](https://tanstack.com/router/latest)** - Roteamento avançado para React.
- **[Radix UI](https://www.radix-ui.com/)** - Componentes base acessíveis.
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones.
- **[Sonner](https://sonner.emilkowal.ski/)** - Notificações (Toasts).
- **[React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)** - Validação de formulários e schemas type-safe.

## 📦 Como executar o projeto localmente

### Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) ou [Bun](https://bun.sh/) instalado na sua máquina. O projeto atualmente gerencia dependências usando o Bun.

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/souzabener1-codeone/ProDEM_system_beta.git
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd ProDEM_system_beta
   ```
3. Instale as dependências:
   ```bash
   bun install
   ```

### Executando o servidor de desenvolvimento

Para iniciar a aplicação em modo de desenvolvimento:

```bash
bun run dev
```

A aplicação estará disponível no seu navegador, geralmente em `http://localhost:5173`.

## 📁 Estrutura de Diretórios

- `/src/components`: Componentes reutilizáveis da interface (Layouts, UI, etc).
- `/src/routes`: Definições das páginas e rotas usando o TanStack Router (file-based routing).
- `/src/hooks`: Custom hooks do React.
- `/src/lib`: Funções utilitárias e configurações.

## 🤝 Contribuição

As alterações realizadas via editor são automaticamente integradas com a plataforma Lovable. Certifique-se de realizar o *commit* e o *push* das suas alterações de forma atômica para manter o histórico claro.

---
*Desenvolvido para gerenciar demandas e contatos de forma eficiente com tecnologia e inovação.*
