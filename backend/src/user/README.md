# 📘 Módulo User

O módulo User representa as terapeutas, coordenadoras e administradores do sistema.
Ele é responsável por autenticação, permissões, perfil do usuário e disponibilidade de agenda.

### [↩️ Voltar ao README principal](/backend/README.md)

---

## 🗺️ Sumário das Rotas

### 🔓 Públicas
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **POST** | [``/users/login``](#1-realizar-login) | Autenticação (Login) e recebimento do Token JWT. |

### 🔐 Autenticadas (Qualquer usuário logado)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **POST** | [``/users/refresh``](#2-atualizar-token-refresh) | Renova o token de acesso (Refresh Token). |
| **PATCH** | [``/users/first-access``](#3-realizar-primeiro-acesso) | Finaliza o cadastro inicial (Senha, Foto e Agenda). |
| **GET** | [``/users/profile``](#4-consultar-próprio-perfil) | Consulta os dados do próprio perfil. |
| **PUT** | [``/users/profile``](#5-atualizar-próprio-perfil) | Atualiza dados pessoais (Foto, Telefone, Senha). |

### 🏥 Cadastro
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **POST** | [``/users``](#6-criar-usuário) | Cria um novo usuário. |
| **GET** | [``/users/available``](#7-buscar-terapeutas-disponíveis) | Busca terapeutas disponíveis por dia/horário. |

### 🛡️ Admin
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | [``/users``](#8-listar-usuários) | Lista todos os usuários (Paginado, Ordenado, Filtrado). |
| **GET** | [``/users/:targetId``](#9-buscar-usuário-por-id) | Consulta detalhes de um usuário específico. |
| **PUT** | [``/users/:targetId``](#10-gerenciar-usuário) | Altera permissões, matrícula e status (Ativo/Inativo). |
| **PATCH** | [``/users/:targetId/reset-password``](#11-resetar-senha) | Reseta a senha para o padrão e força primeiro acesso. |

---

## 🧠 Regras de Negócio e Conceitos

Antes de consumir as rotas, entenda como o sistema gerencia os usuários.

### 1. Permissões
O sistema não usa cargos fixos, mas sim **flags de permissão** que podem ser combinadas:
* **Admin (`perm_admin`):** Acesso total, incluindo resetar senhas e alterar permissões de outros.
* **Cadastro (`perm_cadastro`):** Pode cadastrar novos pacientes e criar novos usuários.
* **Atendimento (`perm_atendimento`):** Usuário que atende pacientes. Aparece nas buscas de disponibilidade.

### 2. Ciclo de Vida e Acesso
1.  **Criação:** Usuário é criado por quem tem permissão de Cadastro/Admin.
2.  **Senha Inicial:** O sistema gera automaticamente no padrão `L` + `Matrícula` (Ex: `L1234567`).
3.  **Primeiro Acesso:** Ao logar pela primeira vez, o token JWT contém a flag `primeiroAcesso: true`. O front-end deve forçar o usuário a definir uma nova senha e seus horários de atendimento.
4.  **Reset de Senha:** Apenas Admins podem resetar. A senha volta a ser o padrão (`L` + Matrícula).

---

## 🗄️ Persistência (Banco de Dados)

A tabela `usuarios` é a fonte de verdade.

**Tabela: `usuarios`**

| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | uuid | ✅ | Gerado automaticamente (v4). |
| `nome` | varchar | ✅ | Nome de exibição. |
| `email` | varchar | ✅ | Único no sistema. Usado para login. |
| `matricula` | varchar | ✅ | Única (7 dígitos). Usada para senha padrão. |
| `telefone` | varchar | ❌ | Opcional (apenas números). |
| `senha_hash` | varchar | ✅ | Bcrypt. Nunca exposto na API. |
| `foto_url` | varchar | ❌ | URL da imagem de perfil. |
| `perm_atendimento`| boolean | ✅ | Define se aparece na agenda. |
| `perm_cadastro` | boolean | ✅ | Define se pode cadastrar registros. |
| `perm_admin` | boolean | ✅ | Define acesso total. |
| `ativo` | boolean | ✅ | Controle de acesso (Soft Delete). |
| `primeiro_acesso` | boolean | ✅ | Controla fluxo obrigatório de setup. |
| `created_at` | timestamp| ✅ | Data de criação. |

---

## 📋 Regras de Validação (Campos)

Todos os endpoints que recebem estes campos aplicam as seguintes validações (Erro `400 Bad Request`).

| Campo | Regra / Cenário | Mensagem de Erro |
| :--- | :--- | :--- |
| **Nome** | Vazio ou ausente. | "O nome completo é obrigatório." |
| **Email** | Formato inválido. | "Insira um e-mail válido (ex: nome@dominio.com)." |
| **Senha** | Menos de 8 caracteres.<br>Sem letra maiúscula.<br>Sem letra minúscula.<br>Sem número.<br>Sem caractere especial. | "A senha é muito curta (mínimo de 8 caracteres)."<br>"A senha precisa ter pelo menos uma letra maiúscula."<br>"A senha precisa ter pelo menos uma letra minúscula."<br>"A senha precisa ter pelo menos um número."<br>"A senha precisa ter pelo menos um caractere especial (!@#$...)." |
| **Matrícula** | Tamanho diferente de 7.<br>Contém letras/símbolos. | "A matrícula deve ter exatamente 7 caracteres."<br>"A matrícula deve conter apenas números." |
| **Telefone** | Tamanho fora de 8-20.<br>Contém letras/símbolos. | "O telefone deve ter entre 8 e 20 dígitos."<br>"O telefone deve conter apenas números." |
| **Foto URL** | URL inválida. | "URL inválida." |
| **Horários** | Início maior que fim.<br>Dia inválido. | "A hora final não pode ser anterior à hora inicial."<br>"Dia da semana inválido." |
---

## 📡 Referência da API

### **🔓 Públicas**

### 1. Realizar Login
`POST /users/login`

Autentica o usuário e retorna o JWT.

**Body:**
````json
{
  "email": "terapeuta@gmail.com",
  "senha": "SenhaForte123!"
}
````

**Response (200):**
````json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "uuid...",
      "nome": "Fulana",
      "matricula": "1234567"
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros de Negócio
**401 Unauthorized:**
- E-mail ou senha incorretos.
- Esta conta foi desativada. Contate a administração.

---

### **🔐 Autenticadas (Qualquer usuário logado)**

### 2. Atualizar Token (Refresh)
`POST /users/refresh`

Renova o token para atualizar permissões ou estender a sessão. Não requer body (usa o token atual no header).

**Response (200):**
````json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros de Negócio
**404 Not Found:**

- Usuário não encontrado.

### 3. Realizar Primeiro Acesso
`PATCH /users/first-access`

Finaliza o cadastro inicial. **Obrigatório** quando `primeiroAcesso: true`.

**Body:**
````json
{
  "senha": "NovaSenhaSegura123!",
  "fotoUrl": "https://...",
  "disponibilidade": [
    { "diaSemana": 1, "horaInicio": 8, "horaFim": 12 },
    { "diaSemana": 3, "horaInicio": 14, "horaFim": 18 }
  ]
}
````

**Response:**
````json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "uuid...",
      "nome": "Fulana",
      "fotoUrl": "https://...",
      "primeiroAcesso": false
    },
    "availability": [
      { "diaSemana": 1, "horaInicio": 8, "horaFim": 12 },
      { "diaSemana": 3, "horaInicio": 14, "horaFim": 18 }
    ]
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros de Negócio
**400 Bad Request:**
- Informe uma senha diferente da atual.
- O cadastro inicial deste usuário já foi finalizado.

**404 Not Found:**
- Usuário não encontrado.

### 4. Consultar Próprio Perfil
`GET /users/profile`

Retorna dados detalhados do usuário logado. Usada também para front poder verificar se token está em dia, se usuário não foi desativado ou mudou permissão etc...

**Response:**

````json
{
  "data": {
    "user": {
      "id": "uuid...",
      "nome": "Fulana",
      "email": "terapeuta@gmail.com",
      "telefone": "88999999999",
      "matricula": "0000001",
      "fotoUrl": "https://...",
      "permAtendimento": true,
      "permCadastro": false,
      "permAdmin": false,
      "ativo": true,
      "primeiroAcesso": false,
      "createdAt": "2026-01-12T21:03:48.745Z"
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros de Negócio
**401 Unauthorized:**
- Esta conta foi desativada. Contate a administração.

**404 Not Found:**
- Usuário não encontrado.

### 5. Atualizar Próprio Perfil
`PUT /users/profile`

Atualiza dados cadastrais básicos. Todos são opcionais.

**Body (Parcial):**
````json
{
  "nome": "Nome Corrigido",
  "email": "novoemail@gmail.com",
  "telefone": "11999999999",
  "senha": "NovaSenhaSeQuiserTrocar123!" 
}
````

**Response:**
````json
{
  "data": {
    "user": {
      "id": "uuid...",
      "nome": "Nome Corrigido",
      "email": "novoemail@gmail.com",
      "telefone": "11999999999",
      "fotoUrl": "https://..."
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros de Negócio
**404 Not Found:**
- Usuário não encontrado.

**409 Conflict:**
- Este e-mail já está sendo usado por outro usuário.

---

### **🏥 Cadastro (Requer `perm_cadastro`)**

### 6. Criar Usuário
`POST /users`

Cria um novo usuário com senha padrão (`L` + Matrícula).

**Body:**
````json
{
  "nome": "Nova Terapeuta",
  "email": "nova@clinica.com",
  "matricula": "0123456",
  "telefone": "11988887777"
}
````
#### ❌ Possíveis Erros de Negócio
**409 Conflict:**

- Este e-mail já está sendo usado por outro usuário.
- Esta matrícula já está cadastrada no sistema.

### 7. Buscar Terapeutas Disponíveis
`GET /users/available`

Busca terapeutas ativos que atendem em determinado horário. Essencial para o agendamento.

**Query Params:**
* `diaSemana`: 0 (Dom) a 6 (Sáb)
* `horaInicio`: Inteiro (ex: 8)
* `horaFim`: Inteiro (ex: 12)

**Exemplo:** `/users/available?diaSemana=1&horaInicio=8&horaFim=12`

**Response (200):**
````json
{
  "data": [
    {
      "user": { "id": "...", "nome": "Dra. Ana" },
      "availability": [
        { "diaSemana": 1, "horaInicio": 8, "horaFim": 12 }
      ]
    }
  ]
}
````
*Nota: ele sempre retornarar ``horaInicio`` e ``horaFim`` recortados de acordo com o pedido, então mesmo a terapeuta atendendo de 8 às 14, se for pedido de 9 às 15, retornará 9 às 14.*

---

### **🛡️ Admin (Requer `perm_admin`)**

### 8. Listar Usuários
`GET /users`

Lista geral com paginação e filtros.

**Query Params:**
* `page`: Número da página (Default: 1)
* `limit`: Itens por página (Default: 10)
* `orderBy`: `nome`, `created_at`, `ativo`
* `ativo`: `true` ou `false` (Opcional)
* `nome`: Filtro parcial por nome (Opcional)

**Reponse:**
````json
{
  "data": [
    {
      "user": {
        "id": "uuid...",
        "nome": "Juliana Sobral ",
        "matricula": "1111111",
        "fotoUrl": null,
        "permAtendimento": true,
        "permCadastro": false,
        "ativo": true,
        "createdAt": "2026-01-06T22:37:31.160Z"
      }
    },
    {
      "user": {...}
    },
    {
      "user": {...}
    },
    {
      "user": {...}
    },
    {
      "user": {...}
    }
  ],
  "meta": {
    "totalItems": 13,
    "totalPages": 3,
    "currentPage": 2,
    "itemsPerPage": 5,
    "sortBy": "nome",
    "sortDirection": "ASC"
  },
  "error": null
}
````

### 9. Buscar Usuário por ID
`GET /users/:targetId`

Retorna perfil completo + disponibilidade de um usuário específico.

**Response:**
````json
{
  "data": {
    "user": {
      "id": "uuid...",
      "nome": "Nome Corrigido",
      "email": "novoemail@gmail.com",
      "telefone": "11999999999",
      "matricula": "0000001",
      "fotoUrl": "https://...",
      "permAtendimento": true,
      "permCadastro": true,
      "permAdmin": false,
      "ativo": true,
      "primeiroAcesso": false,
      "createdAt": "2026-01-12T21:03:48.745Z"
    },
    "availability": [
      { "diaSemana": 1, "horaInicio": 8, "horaFim": 12 },
      { "diaSemana": 3, "horaInicio": 14, "horaFim": 18 }
    ]
  },
  "meta": {},
  "error": null
}
````

### 10. Gerenciar Usuário
`PUT /users/:targetId`

Altera dados sensíveis de sistema.

**Body (Parcial):**
````json
{
  "matricula": "0000002",
  "perm_atendimento": true,
  "perm_cadastro": true,
  "ativo": true 
}
````
*Nota: `ativo: false` impede o login imediato do usuário.*

**Response:**
````json
{
  "data": {
    "user": {
      "id": "uuid...",
      "nome": "Fulana",
      "matricula": "0000002",
      "permAtendimento": true,
      "permCadastro": true,
      "ativo": true
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros de Negócio
**404 Not Found:**
- Usuário não encontrado.

**409 Conflict:**
- Esta matrícula já está cadastrada no sistema.

### 11. Resetar Senha
`PATCH /users/:targetId/reset-password`

Reseta a senha para o padrão (`L`+Matrícula) e força o fluxo de primeiro acesso novamente.

**Response:**
````json
{
  "data": {
    "user": {
      "id": "e2e64d9d-1c3d-4b1e-83eb-509e404bb410",
      "nome": "Nome Corrigido"
    }
  },
  "meta": {},
  "error": null
}
````