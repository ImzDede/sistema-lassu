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

A organização do projeto reflete as rotas e funcionalidades do sistema, incluindo agora as sub-rotas de gestão de perfil:

```bash
src/
├── app/
│   ├── page.tsx                 # Tela de Login (Rota Pública)
│   ├── primeiroAcesso/          # Wizard de Configuração Inicial (Senha/Disponibilidade)
│   ├── home/                    # Área logada do sistema (Protegida)
│   │   ├── layout.tsx           # Layout Principal (Sidebar, Header, Auth Check)
│   │   ├── page.tsx             # Dashboard (Cards de Hoje, Calendário)
│   │   ├── cadastro/            # Sub-rotas de cadastro (Hub, Pacientes, Extensionistas)
│   │   ├── pacientes/           # Gestão de pacientes
│   │   ├── terapeutas/          # Gestão de equipe
│   │   │   ├── page.tsx         # Listagem geral com filtros
│   │   │   └── [id]/            # Detalhes, disponibilidade e permissões (Rota Dinâmica)
│   │   └── perfil/              # Hub de configurações do usuário
│   │       ├── dados/           # Edição de dados pessoais
│   │       ├── senha/           # Alteração de senha
│   │       └── disponibilidade/ # Editor de grade horária pessoal
├── components/                  # Componentes reutilizáveis (UI Kit e Lógica)
├── contexts/                    # Estados globais (Sessão e Notificações)
├── hooks/                       # Lógica de negócio encapsulada (Custom Hooks)
├── services/                    # Configuração de serviços externos (API)
├── utils/                       # Formatadores, Auth e Helpers
├── types/                       # Definições de Tipos TypeScript (Interfaces)
└── middleware.ts                # Porteiro do servidor (Verificação de Cookies)
```

## 3. Serviços e Utilitários (`src/services` & `src/utils`)

Camada responsável pela comunicação externa, segurança e formatação de dados.

### 📡 `services/api.ts`
* **Configuração:** Instância única do Axios apontando para a API.
* **Robustez:** Implementa `transformResponse` para tratar respostas vazias ou JSONs inválidos sem quebrar a aplicação.
* **Interceptor:** Injeta o token `Bearer` automaticamente no header `Authorization`.

### 🔐 `utils/auth.ts`
* **`verifyUserRedirect`:** Função vital de segurança no cliente. Impede acesso cruzado: bloqueia usuários de "primeiro acesso" de ver a home, e impede usuários já configurados de voltar ao wizard inicial.
* **Cookies:** Funções para gestão de sessão via `nookies`.

### 🛠 `utils/format.ts` & `date.ts`
* **Formatadores:** Máscaras visuais para CPF, Telefone e Horários.
* **Helpers:** Mapas de conversão de Dias da Semana (Backend `int` <-> Frontend `string`).

---

## 4. Contextos e Hooks (`src/contexts` & `src/hooks`)

Camada de Gerenciamento de Estado e Lógica de Negócio.

### 🌐 Contextos
* **`AuthContext.tsx`:** Gerencia a sessão do usuário. A interface `UserData` foi estendida para incluir dados de perfil completos (telefone, matrícula).
* **`NotificationContext.tsx`:** Gerencia o *polling* de notificações em tempo real (intervalo de 30s) e contagem de não lidas.

### 🎣 Custom Hooks
* **`useUsers.ts`:**
    * Centraliza o CRUD de usuários.
    * Método `getUserById` retorna o objeto completo (incluindo disponibilidade) para a tela de detalhes.
* **`usePatients.ts`:**
    * Centraliza a listagem e filtros de pacientes.
* **`useProfessionalSearch.ts`:**
    * Lógica exclusiva da tela de cadastro para busca cruzada de disponibilidade (Dia x Hora).
* **`useFeedback.ts`:**
    * Controla a UI de alertas (Toasts).
    * Implementa limpeza de *timers* via `useRef` para evitar conflitos em cliques rápidos.
* **`usePagination.ts`:**
    * Gerencia a paginação no cliente (Client-Side Pagination).

---

## 5. Componentes (`src/components`)

Os componentes foram divididos em **Base** (UI Pura) e **Negócio** (Funcionais).

### 🎨 Componentes Base (UI Kit)
Componentes que "envelopam" o Material Tailwind para garantir a identidade visual (Cores Roxo/Rosa).

* **`Input.tsx`:** Campo de texto com estilização inteligente. Altera automaticamente a cor da borda e cursor quando a prop `disabled` é ativa.
* **`Button.tsx`:** Botão padronizado com variantes `primary` e `outline`.
* **`SelectBox.tsx`** & **`DateInput.tsx`:** Inputs especializados mantendo o padrão visual.
* **`MTRegistry.tsx`:** Infraestrutura de estilos.

### 🧩 Layout e Navegação
* **`Sidebar.tsx`:** Menu lateral esquerdo (Desktop).
* **`BottomNav.tsx`:** Menu fixo no rodapé (Mobile).
* **`NotificationBell.tsx`:** Sino de notificações com *badge* de contagem e *dropdown*.

### 📦 Componentes de Negócio
* **`AvailabilityEditor.tsx`:** Editor visual da disponibilidade (Perfil/Wizard).
* **`AvailabilityDialog.tsx`:** Modal para visualização de horários de terceiros (somente leitura).
* **`TherapistProfileCard.tsx`:** Cartão de detalhes rico com estatísticas e tags de permissão.
* **`PermissionsDialog.tsx`:** Modal para gestão de cargos com *Switches*.
* **`NotificationDialog.tsx`:** Lista de notificações com parser de links (Markdown) e cores dinâmicas por tipo de aviso.
* **`FeedbackAlert.tsx`:** Toast flutuante de sucesso/erro.
* **`CardListagem.tsx`:** Componente versátil para listas de Terapeutas e Pacientes.

---

## 6. Fluxos e Rotas (`src/app`)

Detalhamento das páginas e lógicas de roteamento.

### 🔐 Autenticação & Setup
* **`page.tsx` (Login):** Gerencia login e redirecionamento condicional.
* **`primeiroAcesso/page.tsx`:** Wizard obrigatório. Valida senhas iguais e horários lógicos (fim > início) antes de liberar o acesso.

### 🏠 Dashboard & Gestão
* **`terapeutas/[id]/page.tsx`:** Tela completa de gestão.
    * Permite ver disponibilidade da terapeuta via modal.
    * Permite alterar permissões e status (Ativo/Inativo).
    * Lista pacientes vinculados com filtros.
 **`cadastro/paciente/page.tsx`:** Implementa fluxo de **Busca Cruzada**. O usuário define um horário preferencial e o sistema retorna apenas extensionistas disponíveis naquele slot para vínculo.
 **`cadastro/extensionista/page.tsx`:** O usuário com permissão de cadastro ou admin cria uma conta para uma terapeuta com permissão de atendimento.
 **`pacientes/page.tsx`:** Tela completa de gestão.
*

### 👤 Perfil (`/home/perfil`)
O perfil atua como um Hub de configurações, consumindo a rota `PUT /users/profile`:

* **`dados/page.tsx`:** Alteração de Nome, Email e Telefone. Campo de Matrícula exibido como *ReadOnly* com ícone de cadeado.
* **`senha/page.tsx`:** Alteração segura de senha.
* **`disponibilidade/page.tsx`:** Interface para o extensionista gerenciar sua própria disponibilidade.

---

## 7. Tipagem (`src/types`)

Definições TypeScript para garantir a integridade dos dados.

* **`usuarios.ts`:** Interfaces de Token e UserData.
* **`disponibilidade.ts`**: Interface `TimeSlot` para manipulação visual de horários.
* **`paciente.ts`**: Interfaces `Patient` e `PatientResponseItem`.