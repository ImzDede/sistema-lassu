# 💻 Sistema LASSU - Frontend

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Bem-vindo ao repositório frontend do Sistema de Gestão LASSU. Este projeto foi desenvolvido como uma Single Page Application (SPA) utilizando **Next.js 14**, **TypeScript** e **Tailwind CSS**, seguindo rigorosamente a arquitetura de **Separation of Concerns (SoC)**.

---

## 📋 Índice

1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Arquitetura e Organização](#-arquitetura-do-projeto)
3. [Instalação e Execução](#-instalação-e-execução)
4. [Componentização](#-biblioteca-de-componentes)
5. [Style Guide](#-style-guide-design-tokens)
6. [Fluxo de Contribuição](#-como-contribuir)

---

## 🏗️ Arquitetura do Projeto

O projeto segue estritamente a separação de responsabilidades para facilitar a manutenção e escalabilidade. O fluxo de dados deve ser unidirecional e previsível.

### 📂 Estrutura de Pastas e Responsabilidades

| Pasta | Responsabilidade (Regra de Ouro) |
| :--- | :--- |
| **`src/types`** | **Contrato de Dados**. Interfaces TypeScript que espelham o Backend (DTOs). Não deve conter lógica. |
| **`src/services`** | **Camada de API**. Apenas chamadas HTTP (Axios) retornando Promises. Não conhece o React, não usa hooks. |
| **`src/hooks`** | **View Model / Lógica**. Gerencia estado (`loading`, `error`, `data`), chama Services e formata dados para a View. |
| **`src/contexts`** | **Estado Global**. Apenas para dados que precisam estar em toda a app (Sessão do Usuário, Notificações). |
| **`src/utils`** | **Ferramentas Puras**. Funções de formatação (CPF, Data) e Cookies (`nookies`) que não dependem de API ou React. |
| **`src/app`** e **`src/componentes`**| **View / Visualização**. Componentes "burros" que apenas exibem dados. **PROIBIDO** chamar API (`axios`, `fetch`) diretamente aqui. |

---

## 🚀 Instalação e Execução

Siga os passos abaixo para rodar o projeto localmente.

### Pré-requisitos
* Node.js (v18+)
* NPM ou Yarn

### Passo a Passo

1. **Clone o repositório:**
```bash
   git clone [https://github.com/seu-org/lassu-frontend.git](https://github.com/seu-org/lassu-frontend.git)
   cd lassu-frontend
```

2. **Instale as dependências:**
```bash
   npm install
   # ou
   yarn install
```

3. **Configure as Variáveis de Ambiente:** Crie um arquivo .env.local na raiz do projeto e configure a URL do seu backend:
```bash
   NEXT_PUBLIC_API_URL=http://localhost:3333
```

4. **Execute o servidor de desenvolvimento:**
```bash
   npm run dev
```

Acesse: http://localhost:3000

## 🚀 Biblioteca de Componentes (src/components)

Os componentes visuais seguem o padrão "Puros" (Dumb Components). Eles são responsáveis apenas pela interface e não devem conter lógica de negócio complexa ou chamadas de API.

### ⚠️ Regras de Desenvolvimento
1. **Pureza Obrigatória**
    Componentes não devem chamar APIs nem conectar com Contextos complexos (como AuthContext) se puderem ser evitados.

    ✅ Correto: <Sidebar isTeacher={true} /> (Recebe a regra via prop).

    ❌ Errado: <Sidebar /> (Dentro dele chama useAuth para descobrir se é teacher).

2. **Wrappers Padronizados**
    Sempre utilize os nossos componentes base localizados em src/components (ex: Button, Input, SelectBox) ao invés de importar direto do @material-tailwind/react.

    Motivo: Nossos wrappers já contêm as cores da marca (brand-purple) e estilos de borda customizados.

3. **Material Tailwind & TypeScript**
    Utilizamos a biblioteca @material-tailwind/react.

    Existe um arquivo de correção de tipos em src/types/material-tailwind.d.ts. Não remova este arquivo, ele corrige conflitos de versão do React 18 (erros como onResize, placeholder).

## 🎨 Style Guide (Design Tokens)

Utilizamos Tailwind CSS com tokens customizados definidos no tailwind.config.ts. Não utilize cores hexadecimais (#FFF) soltas no código. Use as classes semânticas:

### 🖌️ Cores da Marca

    bg-brand-purple (Cor Primária - Roxo Suave)
    bg-brand-pink (Cor Secundária - Rosa)
    bg-brand-peach (Acento - Pêssego)
    text-brand-dark (Textos principais)
    bg-brand-gradient (Gradiente oficial para Botões e Logos)

### 🔔 Sistema de Feedback (Alertas)

    Utilize os tons pastéis para fundo e tons fortes para texto para manter a legibilidade e acessibilidade:

    Sucesso	  bg-feedback-success-bg	  text-feedback-success-text
    Erro	  bg-feedback-error-bg	      text-feedback-error-text
    Aviso	  bg-feedback-warning-bg	  text-feedback-warning-text

## 🤝 Como Contribuir

Para manter a integridade da arquitetura, siga este fluxo rigorosamente ao criar uma nova funcionalidade:

    Tipagem: Crie a Interface em src/types (Modelagem).
    Service: Crie a função de API em src/services (Comunicação).
    Hook: Crie o Hook em src/hooks para consumir o serviço (Lógica/Estado).
    UI: Crie a tela em src/app usando os componentes (Visualização).

Developed for NOCTA 💜