# Documentação Frontend - Sistema LASSU

Este documento descreve a arquitetura, fluxos, componentes e padrões do frontend do Sistema LASSU, desenvolvido para gerenciar extensionistas, pacientes e agendamentos.

---

## 1. Visão Geral da Arquitetura

O sistema segue uma arquitetura baseada em rotas protegidas e hierarquia de layouts, utilizando a renderização do lado do cliente (Client-Side) para verificações de segurança.

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Material Tailwind (Componentes Base)
- **HTTP Client:** Axios (Instância configurada com headers)
- **Gerenciamento de Estado:** React Hooks (`useState`, `useEffect`)
- **Autenticação:** JWT (JSON Web Token) armazenado em Cookies (via `nookies`)

---

## 2. Estrutura de Pastas (Principais)

A organização do projeto reflete as rotas e funcionalidades do sistema:

```bash
src/
├── app/
│   ├── page.tsx                # Tela de Login (Rota Pública)
│   ├── primeiroAcesso/         # Tela de Configuração Inicial (Senha/Disponibilidade)
│   ├── home/                   # Área logada do sistema (Protegida)
│   │   ├── layout.tsx          # Layout Principal (Sidebar, Header, Auth Check)
│   │   ├── page.tsx            # Dashboard (Cards de Hoje, Calendário)
│   │   ├── cadastro/           # Sub-rotas de cadastro (Pacientes, Extensionistas)
│   │   └── perfil/             # Visualização e edição de perfil
├── components/                 # Componentes reutilizáveis (Input, Button, SelectBox, etc.)
├── utils/
│   ├── auth.ts                 # Lógica de Token, Cookies e Redirecionamento
│   └── api.ts                  # Configuradores do Axios e Headers
├── types/                      # Definições de Tipos TypeScript (usuario, disponibilidade)