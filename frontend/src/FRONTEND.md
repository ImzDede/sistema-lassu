# 📘 Documentação Técnica do Frontend - Sistema LASSU

Este documento serve como guia de referência para a arquitetura, padrões de código e estrutura do frontend do Sistema LASSU. O projeto foi desenvolvido como uma **Single Page Application (SPA)** utilizando **Next.js 14 (App Router)** com foco em modularidade, tipagem estrita e separação de responsabilidades.

---

## 1. Visão Geral e Tech Stack

### Tecnologias Principais
* **Core:** Next.js 14, React 18, TypeScript.
* **Estilização:** Tailwind CSS + Material Tailwind (Biblioteca Base).
* **Ícones:** Lucide React.
* **Comunicação:** Axios (com Interceptors).
* **Autenticação:** JWT (Armazenado em Cookies via `nookies`) + JWT Decode.
* **Gerenciamento de Estado:** React Context API + Custom Hooks.

### Segurança
1.  **Middleware (Edge):** Bloqueia requisições sem token válido antes da renderização.
2.  **AuthContext (Client):** Gerencia a sessão e persistência do usuário.
3.  **Redirecionamento Lógico:** Impede que usuários em "Primeiro Acesso" naveguem pelo sistema sem concluir o setup, e vice-versa.

---

## 2. Arquitetura do Projeto (SoC)

O projeto segue estritamente o padrão **Separation of Concerns (SoC)**. Cada arquivo tem uma única responsabilidade.

### Regras de Ouro por Pasta

| Pasta | Responsabilidade | O que é PROIBIDO? |
| :--- | :--- | :--- |
| **`src/types`** | **Contrato de Dados**. Interfaces TypeScript que espelham o Backend. | Conter lógica ou implementações. |
| **`src/services`** | **Camada de API**. Apenas chamadas HTTP (Axios). | Usar Hooks (`useState`, `useEffect`) ou JSX. |
| **`src/hooks`** | **ViewModel / Lógica**. Gerencia estado (`loading`, `error`), chama Services e formata dados. | Retornar JSX (HTML). |
| **`src/utils`** | **Ferramentas Puras**. Formatadores (CPF, Data) e Constantes. | Depender de APIs ou Contextos. |
| **`src/components`** | **UI Pura**. Componentes visuais reutilizáveis. | Fazer chamadas de API diretas. |
| **`src/app`** | **View / Páginas**. Monta a tela usando componentes e hooks. | Regras de negócio complexas soltas no arquivo. |

---

## 3. Estrutura de Pastas

```bash
src/
├── app/                     # Rotas do Next.js (App Router)
│   ├── page.tsx             # Login
│   ├── primeiroAcesso/      # Wizard de Setup
│   └── home/                # Área Logada
│       ├── cadastro/        # Cadastros (Paciente, Extensionista)
│       ├── pacientes/       # Listagem de Pacientes
│       ├── terapeutas/      # Gestão de Equipe
│       └── perfil/          # Configurações do Usuário
├── components/              # Biblioteca de Componentes (Puros)
├── contexts/                # Estados Globais (Auth, Notifications)
├── hooks/                   # Lógica de Negócio (usePatients, useSessions)
├── services/                # Chamadas HTTP (api.ts, patientService.ts)
├── types/                   # Interfaces TS (User, Patient, Session)
├── utils/                   # Helpers (format.ts, constants.ts, auth.ts)
└── middleware.ts            # Proteção de Rotas
```

## 4. Biblioteca de Componentes (`src/components`)

Os componentes visuais seguem o padrão **"Puros" (Dumb Components)**. Eles recebem dados via `props` e emitem eventos via callbacks.

### Padrões Adotados
* **Wrappers:** Utilizamos wrappers sobre o Material Tailwind (ex: `Input.tsx`, `Button.tsx`, `SelectBox.tsx`) para garantir que os estilos da marca (bordas roxas/rosas) sejam aplicados automaticamente.
* **Pureza:** Componentes como `Sidebar` e `Calendar` não acessam o `AuthContext` internamente. Eles recebem props como `isTeacher={true}` para decidir o que renderizar.
* **Tipagem (`d.ts`):** O arquivo `src/types/material-tailwind.d.ts` corrige conflitos de tipagem entre React 18 e a biblioteca visual (propriedades como `onResize`, `placeholder`).

---

## 5. Serviços e Utilitários

### 📡 Services (`src/services`)
* **`api.ts`:** Instância única do Axios. Injeta o Token automaticamente no header.
* **Módulos:** Arquivos separados por entidade (`authService.ts`, `patientService.ts`) contendo apenas os métodos `get`, `post`, `put`, `delete`.

### 🛠 Utils (`src/utils`)
* **`constants.ts`:** Listas estáticas (Dias da semana, Horários de 08:00 às 18:00).
* **`format.ts`:** Funções puras para máscaras de CPF, Telefone e Moeda.
* **`date.ts`:** Manipulação de datas usando `date-fns` (pt-BR).

---

## 6. Style Guide (Design Tokens)

Utilizamos **Tailwind CSS** com tokens customizados definidos no `tailwind.config.js`.

### Paleta de Cores
Não utilize hexadecimais soltos (`#A78FBF`). Use as classes semânticas:

* **Principal:** `bg-brand-purple`, `text-brand-purple` (Roxo Suave)
* **Secundária:** `bg-brand-pink` (Rosa)
* **Acento:** `bg-brand-peach` (Pêssego)
* **Gradiente:** `bg-brand-gradient` (Utilizado em botões e cards selecionados)

### Sistema de Feedback (Alertas)
Padronização para Toasts e Badges:

* ✅ **Sucesso:** `bg-feedback-success-bg` + `text-feedback-success-text`
* ⚠️ **Aviso:** `bg-feedback-warning-bg` + `text-feedback-warning-text`
* ❌ **Erro:** `bg-feedback-error-bg` + `text-feedback-error-text`

---

## 7. Fluxo de Desenvolvimento (Como Contribuir)

Para criar uma nova funcionalidade, siga esta ordem para manter a arquitetura:

1.  **Modelagem:** Crie a Interface em `src/types/`.
2.  **API:** Crie a função de chamada em `src/services/`.
3.  **Lógica:** Crie o Hook em `src/hooks/` para consumir o serviço e gerenciar estado.
4.  **UI:** Crie a página em `src/app/` utilizando os componentes de `src/components/` e chamando o Hook.