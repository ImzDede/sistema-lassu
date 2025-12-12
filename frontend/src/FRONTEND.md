# 📘 Documentação Técnica do Frontend - Sistema LASSU

Este documento serve como guia de referência para a arquitetura, fluxos, componentes e padrões do frontend do Sistema LASSU, desenvolvido para gerenciar extensionistas, pacientes e agendamentos do laboratório.

---

## 1. Visão Geral da Arquitetura

O sistema opera como uma **Single Page Application (SPA)** híbrida, utilizando o **Next.js 14 (App Router)**. A arquitetura prioriza a segurança e a modularidade.

### Camadas de Segurança
1.  **Middleware (Servidor/Edge):** Bloqueia requisições sem cookie antes mesmo de renderizar a página.
2.  **AuthContext (Cliente):** Gerencia o estado da sessão e níveis de acesso na interface.
3.  **Utils/Auth (Redirecionamento):** Controla regras de negócio críticas, como o bloqueio de navegação para usuários em "Primeiro Acesso".

### Tech Stack
* **Core:** Next.js 14, React 18, TypeScript.
* **UI:** Tailwind CSS + Material Tailwind (Biblioteca de Componentes Base).
* **Ícones:** Lucide React.
* **Comunicação:** Axios (Instância configurada com interceptors).
* **Autenticação:** JWT (JSON Web Token) armazenado em Cookies (via `nookies`) + JWT Decode.

---

## 2. Estrutura de Pastas

A organização do projeto reflete as rotas e funcionalidades do sistema:

```bash
src/
├── app/
│   ├── page.tsx                # Tela de Login (Rota Pública)
│   ├── primeiroAcesso/         # Wizard de Configuração Inicial (Senha/Disponibilidade)
│   ├── home/                   # Área logada do sistema (Protegida)
│   │   ├── layout.tsx          # Layout Principal (Sidebar, Header, Auth Check)
│   │   ├── page.tsx            # Dashboard (Cards de Hoje, Calendário)
│   │   ├── cadastro/           # Sub-rotas de cadastro (Pacientes, Extensionistas)
│   │   ├── terapeutas/         # Gestão de equipe
│   │   │   ├── page.tsx        # Listagem geral
│   │   │   └── [id]/           # Detalhes e gestão individual (Rota Dinâmica)
│   │   └── perfil/             # Visualização e edição de perfil pessoal
├── components/                 # Componentes reutilizáveis (UI Kit e Lógica)
├── contexts/                   # Estados globais (Sessão do Usuário)
├── hooks/                      # Lógica de negócio encapsulada (Custom Hooks)
├── services/                   # Configuração de serviços externos (API)
├── utils/
│   ├── api.ts                  # Configuração do Axios e Interceptors
│   ├── auth.ts                 # Lógica de Token, Cookies e Redirecionamento
│   ├── date.ts                 # Cálculos de datas (Idade, Diferenças)
│   └── format.ts               # Formatações de CPF, Telefone, Horários e Mapas
├── types/                      # Definições de Tipos TypeScript (Interfaces)
└── middleware.ts               # Porteiro do servidor (Verificação de Cookies)
```

## 3. Serviços e Utilitários (`src/services` & `src/utils`)

Camada responsável pela comunicação externa, segurança e formatação de dados.

### 📡 `services/api.ts`
* **Configuração:** Instância única do Axios apontando para a API.
* **Interceptor:** Injeta o token `Bearer` automaticamente no header `Authorization` em 100% das chamadas, eliminando repetição de código e garantindo segurança.

### 🔐 `utils/auth.ts`
* **`verifyUserRedirect`**: Função vital de segurança no cliente. Impede acesso cruzado: bloqueia usuários de "primeiro acesso" de ver a home, e impede usuários já configurados de voltar ao wizard inicial.
* **Gerenciamento de Cookies:** Funções para Salvar (`saveToken`), Ler (`getToken`) e Destruir (`logout`) cookies de sessão.

### 🛠 `utils/format.ts`
* **Formatadores:** Máscaras visuais para CPF, Telefone e Horários (`formatTimeInterval`).
* **Mapeamento:** Objetos auxiliares para tradução de dias da semana (Backend usa números 1-5, Frontend usa strings "Segunda-feira").

### 📅 `utils/date.ts`
* **Cálculos:** Funções puras para manipulação de datas, como `calculateAge` (converte data de nascimento em idade atual).

---

## 4. Contextos e Hooks (`src/contexts` & `src/hooks`)

Camada de Gerenciamento de Estado e Lógica de Negócio.

### 🌐 `AuthContext.tsx`
* **Responsabilidade:** Manter a sessão viva e acessível.
* **Funcionamento:** Ao iniciar, decodifica o token. Se válido, preenche o estado `user` e a flag `isTeacher`. Se inválido, realiza o logout. Provê esses dados para toda a árvore de componentes.

### 🎣 Custom Hooks
* **`useUsers.ts`**:
    * Centraliza o CRUD de usuários (Terapeutas/Admins).
    * Expõe: `fetchUsers`, `getUserById`, `updateUser`, `deleteUser`.
* **`usePatients.ts`**:
    * Centraliza o CRUD de pacientes.
    * Gerencia a listagem e atualizações.
* **`useProfessionalSearch.ts`**:
    * Lógica exclusiva da tela de cadastro.
    * Realiza busca cruzada (Dia x Hora) conectando com a rota `/users/available`.
* **`useFeedback.ts`**:
    * Controla a UI de alertas (Toasts) com temporizador automático via `useEffect`.
    * Retorna um array compatível com `useState` para facilitar a migração.
* **`usePagination.ts`**:
    * Gerencia a paginação no cliente (Client-Side Pagination).
    * Expõe: `visibleCount`, `loadMore`, `hasMore` e `resetPagination`.

---

## 5. Componentes (`src/components`)

Os componentes foram divididos em **Base** (UI Pura) e **Negócio** (Funcionais).

### 🎨 Componentes Base (UI Kit)
Componentes que "envelopam" o Material Tailwind para garantir a identidade visual (Cores Roxo/Rosa).

* **`Button.tsx`**: Botão padronizado. Suporta variantes `primary` e `outline`.
* **`Input.tsx`**: Campo de texto com estilização de borda inferior.
* **`SelectBox.tsx`**: Dropdown estilizado.
* **`DateInput.tsx`**: Wrapper especial para campos de data com trigger de calendário.
* **`MTRegistry.tsx`**: Infraestrutura para injetar estilos do Material Tailwind no Next.js.

### 🧩 Layout e Navegação
* **`Sidebar.tsx`**: Menu lateral esquerdo (Desktop).
* **`BottomNav.tsx`**: Menu fixo no rodapé (Mobile).
* **`NavItem.tsx`** & **`ProfileMenuItem.tsx`**: Itens de menu estilizados.

### 📦 Componentes de Negócio
* **`AvailabilityEditor.tsx`**: Gerenciador de grade horária (Perfil/Wizard).
* **`AvailabilitySearchSelector.tsx`**: Seletor de filtros de busca (Cadastro).
* **`AvailabilityDialog.tsx`**: Modal para visualização de disponibilidade de terceiros.
* **`Calendar.tsx`**: Widget visual de calendário.
* **`CardCadastro.tsx`**: Botão de navegação no Hub de Cadastro.
* **`CardListagem.tsx`**: Componente versátil para listas. Suporta `onClick` e seleção visual.
* **`ConfirmationDialog.tsx`**: Modal genérico para confirmar ações destrutivas ou de status.
* **`PermissionsDialog.tsx`**: Modal para gestão de cargos (Cadastro/Atendimento) com Switches.
* **`FeedbackAlert.tsx`**: Notificação flutuante (Toast).
* **`InfoBox.tsx`**: Caixa azul de instrução.
* **`RoleBadge.tsx`**: Etiqueta inteligente de permissões.
* **`SearchInputWithFilter.tsx`**: Barra de Busca + Dropdown de Filtro.
* **`TherapistProfileCard.tsx`**: Cartão de detalhes da terapeuta com estatísticas.

---

## 6. Fluxos e Rotas (`src/app`)

Detalhamento das páginas e lógicas de roteamento.

### 🔐 Autenticação
* **`page.tsx` (Login):** Ponto de entrada. Gerencia redirecionamento baseado em `primeiroAcesso`.
* **`primeiroAcesso/page.tsx`:** Wizard obrigatório para definição de senha e horário.

### 🏠 Dashboard (`/home`)
* **`layout.tsx`:** Define o esqueleto da área logada.
* **`page.tsx` (Dashboard):** Tela inicial com resumos adaptados ao cargo.

### 👥 Funcionalidades e Listagens
As telas de listagem implementam **Paginação no Cliente** (`usePagination`) e **Filtros Inteligentes**.

* **`terapeutas/page.tsx`:** Listagem de usuários.
    * Permite filtrar por Nome, Matrícula e Status (Ativo/Inativo).
    * Ao clicar no card, navega para a rota dinâmica de detalhes.
* **`terapeutas/[id]/page.tsx` (Detalhes):**
    * Visão exclusiva da Administradora.
    * Exibe perfil, estatísticas e lista de pacientes vinculados à terapeuta.
    * **Gestão:** Permite Ativar/Desativar conta e Editar Permissões (via Modais).
* **`pacientes/page.tsx`:** Listagem de pacientes.
    * Implementa filtro semântico onde "Ativo" inclui status como *Triagem* e *Encaminhada*.
* **`cadastro/page.tsx` (Hub):** Menu de botões com verificação de permissões.
    * **`cadastro/paciente/page.tsx`:** Formulário com busca de disponibilidade (`useProfessionalSearch`).
    * **`cadastro/extensionista/page.tsx`:** Formulário para criação de novos usuários.
* **`perfil/page.tsx`:** Gestão de dados pessoais e agenda do usuário logado.

---

## 7. Tipagem (`src/types`)

Definições TypeScript para garantir a integridade dos dados.

* **`usuarios.ts`**: Interface `TokenPayload` do JWT.
* **`disponibilidade.ts`**: Interface `TimeSlot`.
* **`paciente.ts`**: Interfaces `Patient` e `PatientResponseItem`.