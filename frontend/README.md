# 💻 Sistema LASSU - Frontend

Bem-vindo ao repositório frontend do **Sistema de Gestão LASSU**. Este módulo é uma **Single Page Application (SPA)** desenvolvida com **Next.js 14 (App Router)**, **TypeScript** e **Tailwind CSS**.

O projeto segue rigorosamente a arquitetura de **Separation of Concerns (SoC)**, onde interface, lógica e comunicação com API são desacopladas para garantir escalabilidade e manutenção.

---

## 📋 Índice

1. [Visão Geral e Tech Stack](#-visão-geral-e-tech-stack)
2. [Arquitetura e Organização](#%EF%B8%8F-arquitetura-e-organização)
3. [Instalação e Execução](#-instalação-e-execução)
4. [Diretrizes de Componentização](#-diretrizes-de-componentização)
5. [Serviços e Utilitários](#-serviços-e-utilitários)
6. [Style Guide (Design Tokens)](#-style-guide-design-tokens)
7. [Fluxo de Contribuição](#-fluxo-de-contribuição)

---

## 🛠 Visão Geral e Tech Stack

Priorizamos a tipagem estrita e o fluxo de dados unidirecional.

### Tecnologias Principais
- **Core:** Next.js 14, React 18, TypeScript.
- **Estilização:** Tailwind CSS + Material Tailwind (Biblioteca Base).
- **Ícones:** Lucide React.
- **HTTP:** Axios (com Interceptors para injeção automática de Token).
- **Autenticação:** JWT (Armazenado em Cookies via `nookies`) + Middleware de proteção.
- **Estado:** React Context API + Custom Hooks.

### Funcionalidades Chave
- **Modo Offline:** Formulários de Anamnese/Síntese salvam rascunhos no `localStorage` automaticamente.
- **RBAC:** Controle de acesso granular (Admin, Professor, Estagiário) via `AuthContext`.
- **Feedback:** Sistema centralizado de Toasts/Alertas (`useFeedback`).

---

## 🏗️ Arquitetura e Organização

Cada pasta tem uma responsabilidade única e clara.

### 📜 Regras de Ouro (Responsabilidades)

| Pasta | Responsabilidade | O que é PROIBIDO? |
| :--- | :--- | :--- |
| **src/types** | **Contrato de Dados.** Interfaces TypeScript (DTOs). | Lógica de negócio ou implementações. |
| **src/services** | **Camada de API.** Chamadas HTTP puras (Axios). | Usar Hooks (`useState`) ou retornar JSX. |
| **src/hooks** | **Lógica (ViewModel).** Gerencia estado, validação e API. | Retornar JSX (HTML). |
| **src/utils** | **Ferramentas Puras.** Formatadores e validadores. | Depender de Contextos ou APIs. |
| **src/components** | **UI Pura.** Componentes visuais "burros". | Fazer chamadas de API diretas. |
| **src/app** | **Páginas.** Conecta Hooks aos Componentes para montar a tela. | Regras de negócio complexas soltas. |

### 📂 Estrutura de Pastas

```bash
src/
├── app/                     # Rotas (Next.js App Router)
│   ├── home/                # Área Logada (Dashboard, Cadastros)
│   ├── primeiroAcesso/      # Wizard de configuração inicial
│   └── page.tsx             # Login
├── components/              # UI
│   ├── pdfs/                # Templates de documentos PDF (@react-pdf)
│   └── ...                  # Componentes genéricos e Wrappers
├── contexts/                # Estado Global (Auth, Feedback)
├── hooks/                   # Lógica de Negócio (usePatients, useForm)
├── services/                # Comunicação HTTP
├── types/                   # Definições TypeScript
├── utils/                   # Helpers (formatadores, validadores)
└── middleware.ts            # Segurança de rotas (Edge)
```

## 🚀 Instalação e Execução

Siga os passos abaixo para rodar o **Frontend** localmente.

### Pré-requisitos
- Node.js (v18+)
- NPM ou Yarn

### Passo a Passo

1. **Clone o repositório:**
   ```bash
    git clone https://github.com/ImzDede/sistema-lassu.git
    cd lassu-frontend
   ```

2. **Instale as dependências:**
   ```bash
    npm install
    # ou
    yarn install
   ```

3. **Execute o servidor de desenvolvimento:**
   ```bash
    npm run dev
   ```

4. **Acesse: http://localhost:3000**

## 🧩 Diretrizes de Componentização

Os componentes localizados em `src/components` seguem o padrão **"Puros" (Dumb Components)**. Eles são responsáveis apenas pela interface e recebem dados via props.

### ⚠️ Regras de Desenvolvimento

1.  **Pureza Obrigatória:** Componentes não devem chamar APIs nem conectar com Contextos complexos internamente se puderem ser evitados.
    * ✅ **Correto:** Recebe dados e callbacks via props (`<Sidebar isTeacher={true} />`).
    * ❌ **Errado:** Chama `useAuth` dentro do componente visual para descobrir a role.

2.  **Wrappers Padronizados:** Sempre utilize nossos componentes base (ex: `Button`, `Input`, `SelectBox`) ao invés de importar direto do `@material-tailwind/react`.
    * **Motivo:** Nossos wrappers já aplicam automaticamente as cores da marca (`brand-purple`) e os estilos de borda customizados.

3.  **Material Tailwind & TypeScript:**
    * Existe um arquivo de definição de tipos em `src/types/material-tailwind.d.ts`. **Não remova este arquivo**, ele corrige conflitos de tipagem com o React 18.

4.  **Tratamento de Erros:**
    * Utilize o hook useFormHandler para submissões de formulário. Ele gerencia o estado de loading e exibe mensagens de erro padronizadas vindas do backend via Toast.

5.  **Formulários Dinâmicos:**
    * Para formulários longos (Anamnese/Síntese), utilize o hook useForm. Ele possui lógica de AutoSave e recuperação de dados locais, garantindo resiliência contra falhas de conexão.

## 📡 Serviços e Utilitários

### Services (`src/services`)
-   **`api.ts`**: Instância única do Axios. Injeta o Token JWT automaticamente no header de todas as requisições.
-   **Módulos**: Arquivos separados por entidade (ex: `authService.ts`, `patientService.ts`) contendo apenas os métodos `get`, `post`, `put`, `delete` e retornando os dados tipados.

### Utils (`src/utils`)
-   **`constants.ts`**: Listas estáticas (Dias da semana, Horários de 08:00 às 18:00).
-   **`format.ts`**: Funções puras para máscaras de CPF, Telefone e Moeda.
-   **`date.ts`**: Manipulação de datas padronizada usando `date-fns` (pt-BR).

## 🎨 Style Guide (Design Tokens)

Utilizamos Tailwind CSS com tokens customizados definidos no `tailwind.config.ts`. **Evite cores hexadecimais soltas no código.**

### 🖌️ Cores da Marca

| Classe | Descrição |
| :--- | :--- |
| `bg-brand-purple` | Cor Primária (Roxo Suave) - Ações principais |
| `bg-brand-pink` | Cor Secundária (Rosa) - Destaques |
| `bg-brand-peach` | Acento (Pêssego) - Detalhes e alertas suaves |
| `text-brand-dark` | Textos principais (Cinza escuro/Roxo profundo) |
| `bg-brand-gradient` | Gradiente oficial para Botões e Logos |

## 🤝 Fluxo de Contribuição

Para adicionar uma nova funcionalidade, siga a ordem da arquitetura para manter o padrão:

1.  **Modelagem:** Crie a Interface em `src/types`.
2.  **API:** Crie o método em `src/services`.
3.  **Lógica:** Crie o Hook em `src/hooks` para consumir o serviço.
4.  **Visual:** Crie a tela em `src/app` usando os componentes.