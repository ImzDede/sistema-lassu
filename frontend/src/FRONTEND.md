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
│   │   ├── terapeutas/         # Listagem de usuários
│   │   └── perfil/             # Visualização e edição de perfil
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
    * Expõe: `fetchUsers`, `updateUser`, `deleteUser`.
* **`usePatients.ts`**:
    * Centraliza o CRUD de pacientes.
    * Gerencia a listagem envelopada (`patientWrapper`) e atualizações.
* **`useProfessionalSearch.ts`**:
    * Lógica exclusiva da tela de cadastro.
    * Realiza busca cruzada (Dia x Hora) conectando com a rota `/users/available`.
* **`useFeedback.ts`**:
    * Controla a UI de alertas (Toasts). Permite chamar `showAlert('green', 'Mensagem')` de qualquer componente.

---

## 5. Componentes (`src/components`)

Os componentes foram divididos em **Base** (UI Pura) e **Negócio** (Funcionais).

### 🎨 Componentes Base (UI Kit)
Componentes que "envelopam" o Material Tailwind para garantir a identidade visual (Cores Roxo/Rosa).

* **`Button.tsx`**: Botão padronizado. Suporta variantes `primary` (roxo preenchido) e `outline` (borda rosa).
* **`Input.tsx`**: Campo de texto com estilização de borda inferior (estilo Material).
* **`SelectBox.tsx`**: Dropdown estilizado para manter consistência com o Input.
* **`DateInput.tsx`**: Wrapper especial para campos de data. Garante que o calendário nativo (`showPicker`) abra corretamente ao clicar no ícone.
* **`MTRegistry.tsx`**: Infraestrutura para injetar estilos do Material Tailwind no Next.js (Client Component).

### 🧩 Layout e Navegação
* **`Sidebar.tsx`**: Menu lateral esquerdo (Desktop). Contém lógica para mostrar/esconder itens baseado no cargo (`isTeacher`).
* **`BottomNav.tsx`**: Menu fixo no rodapé (Mobile). Replica a navegação da Sidebar.
* **`NavItem.tsx`** & **`ProfileMenuItem.tsx`**: Itens de lista estilizados para seus respectivos menus.

### 📦 Componentes de Negócio
* **`AvailabilityEditor.tsx`**: Gerenciador de grade horária. Permite adicionar linhas dinâmicas, escolher dia e intervalos. Usado no Primeiro Acesso e Perfil.
* **`AvailabilitySearchSelector.tsx`**: Versão simplificada do editor. Serve apenas para *selecionar* filtros de busca (Dia + Hora) no cadastro de pacientes.
* **`Calendar.tsx`**: Widget visual. Renderiza os dias do mês e destaca eventos.
* **`CardCadastro.tsx`**: Cartão grande usado como botão de navegação no Hub de Cadastro.
* **`CardListagem.tsx`**: Componente versátil para listas (Paciente ou Terapeuta).
    * Suporta modo interativo (`onClick`) e visual de seleção (`selected`) com borda em gradiente.
    * Aceita HTML no detalhe para formatações complexas.
* **`FeedbackAlert.tsx`**: Notificação flutuante (Toast) de sucesso ou erro.
* **`InfoBox.tsx`**: Caixa azul de instrução para formulários.
* **`RoleBadge.tsx`**: Etiqueta inteligente. Renderiza cor e texto baseados nas permissões do usuário (Admin, Cadastro, Atendimento).
* **`SearchInputWithFilter.tsx`**: Componente composto: Barra de Busca + Dropdown de Filtro na mesma linha.

---

## 6. Fluxos e Rotas (`src/app`)

Detalhamento das páginas e lógicas de roteamento.

### 🔐 Autenticação
* **`page.tsx` (Login):** Ponto de entrada. Gerencia login e redireciona inteligentemente baseando-se na flag `primeiroAcesso`.
* **`primeiroAcesso/page.tsx`:** Wizard obrigatório. Bloqueia a navegação até o usuário definir nova senha e disponibilidade.

### 🏠 Dashboard (`/home`)
* **`layout.tsx`:** Define o esqueleto da área logada (Sidebar + Header + Conteúdo).
* **`page.tsx` (Dashboard):** Tela inicial. Exibe cards de resumo e calendário. Adapta o conteúdo para Professor (visão geral) ou Aluno (visão pessoal).

### 👥 Funcionalidades
* **`terapeutas/page.tsx`:** Listagem de usuários. Utiliza `useUsers` e implementa filtragem local (client-side) via nome/matrícula/status.
* **`pacientes/page.tsx`:** Listagem de pacientes. Utiliza `usePatients` e aplica formatação de idade (`date.ts`) e telefone (`format.ts`) nos cards.
* **`cadastro/page.tsx` (Hub):** Menu de botões. Verifica permissões (`permCadastro` ou `isTeacher`) para exibir opções sensíveis.
    * **`cadastro/paciente/page.tsx`:** Formulário complexo. Integra `useProfessionalSearch` para encontrar terapeutas disponíveis e utiliza `CardListagem` selecionável para o vínculo.
    * **`cadastro/extensionista/page.tsx`:** Formulário para criação de novos usuários.
* **`perfil/page.tsx`:** Exibe dados do usuário e menu lateral de configurações (Dados, Senha, Disponibilidade).

---

## 7. Tipagem (`src/types`)

Definições TypeScript para garantir a integridade dos dados.

* **`usuarios.ts`**: Interface `TokenPayload` descrevendo a estrutura do JWT.
* **`disponibilidade.ts`**: Interface `TimeSlot` para manipulação da grade de horários.
* **`paciente.ts`**: Interface `Patient` e `PatientResponseItem` para tipagem da resposta do backend.