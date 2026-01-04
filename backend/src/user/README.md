# 📘 Módulo User

O módulo User representa as terapeutas e a coordenadora do sistema.
Ele é responsável por autenticação, permissões, perfil do usuário e vínculos com outros módulos.

### [↩️Voltar ao README principal](/backend/README.md)

## 🗺️ Sumário das Rotas

### 🔓 Públicas
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **POST** | [``/users/login``](#1-🔐-realizar-login) | Autenticação (Login) e recebimento do Token JWT. |

### 🔐 Autenticadas (Qualquer usuário logado)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **POST** | [``/users/refresh``](#2-🔄-atualizar-token-refresh) | Renova o token de acesso (Refresh Token). |
| **PATCH** | [``/users/first-access``](#3-🚀-realizar-primeiro-acesso) | Finaliza o cadastro inicial (Senha, Foto e Agenda). |
| **GET** | [``/users/profile``](#4-👤-consultar-próprio-perfil) | Consulta os dados do próprio perfil. |
| **PUT** | [``/users/profile``](#5-✏️-atualizar-próprio-perfil) | Atualiza dados pessoais (Foto, Telefone, Senha). |

### 🏥 Cadastro
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **POST** | [``/users``](#6-➕-criar-usuário) | Cria um novo usuário. |
| **GET** | [``/users/available``](#7-📅-buscar-terapeutas-disponíveis) | Busca terapeutas disponíveis por dia/horário. |

### 🛡️ Admin
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | [``/users``](#8-📋-listar-usuários-admin) | Lista todos os usuários (Paginado, Ordenado, Filtrado). |
| **GET** | [``/users/:targetId``](#9-🔍-buscar-usuário-por-id-admin) | Consulta detalhes de um usuário específico. |
| **PUT** | [``/users/:targetId``](#10-🛠️-gerenciar-usuário-admin) | Altera permissões, matrícula e status (Ativo/Inativo). |
| **PATCH** | [``/users/:targetId/reset-password``](#11-🔄-resetar-senha-admin) | Reseta a senha para o padrão e força primeiro acesso. |


## 🗄️ Persistência no Banco de Dados
#### ``Tabela: usuarios``

A tabela ``usuarios`` é a fonte de verdade dos dados do usuário.
Ela armazena exclusivamente dados persistentes e não contém regras de negócio.

Os dados seguem o padrão ``snake_case`` no banco e são convertidos para ``camelCase`` na API através de mappers.

Estrutura da tabela:

| Coluna          |	Tipo        |	Nulo       	| Observações 
| -----------     | ----------- | ----------- | ----------- 
| id              | uuid        | ❌          | Gerado pela aplicação
|nome	            | varchar	    | ❌	         | Nome completo
|email	          | varchar	    | ❌	         | Único
|matricula	      | varchar	    | ❌	         | Única, pode iniciar com 0
|telefone	        | varchar	    | ✅	         | Opcional
|senha_hash	      | varchar	    | ❌	         | Hash da senha
|foto_url	        | varchar	    | ✅	         | URL da foto do usuário
|perm_atendimento	| boolean	    | ❌	         | Permissão de atendimento
|perm_cadastro	  | boolean	    | ❌          | Permissão de cadastro
|perm_admin	      | boolean	    | ❌	         | Permissão administrativa
|ativo	          | boolean	    | ❌	         | Indica se a conta está ativa
|primeiro_acesso	| boolean	    | ❌	         | Controla fluxo inicial
|created_at	      | timestamp	  | ❌	         | Data de criação

## 🧠 Comportamento dos Campos
### ``id``

- UUID
- Gerado pela aplicação
- Nunca alterado
- Usado como identificador principal em todas as relações

### ``nome``

- Obrigatório
- String
- Usado para exibição no sistema
- Pode ser atualizado

### ``email``

- Obrigatório
- Único
- Validado por formato
- Usado para login
- Pode ser atualizado, desde que permaneça único

### ``matricula``

- Obrigatória
- Tratada como string
- Aceita apenas números
- Pode iniciar com zero
- Única no sistema
- Nunca usada como identificador interno

### ``telefone``

- Opcional
- String (tamanho mínimo 8)
- Quando ausente, armazenado como ``NULL``
- Não participa de regras de negócio

### ``senha_hash``

- Obrigatório
- Nunca armazenada em texto puro
- Gerada a partir de hash seguro
- Nunca retornada pela API
- Utilizada apenas em login e alterada em update profile

### ``foto_url``

- Opcional
- ``null`` por padrão na criação
- String
- Representa apenas a URL da imagem
- Upload e armazenamento da imagem são responsabilidade de outro fluxo
- Quando ausente, pode ser NULL

### ``perm_atendimento``

- Boolean
- ``true`` por padrão na criação
- Define acesso às funcionalidades de atendimento
- Controlada apenas por administradores

### ``perm_cadastro``

- Boolean
- ``false`` por padrão na criação
- Define acesso às funcionalidades de cadastro (usuário e paciente)
- Controlada apenas por administradores

### ``perm_admin``

- Boolean
- ``false`` por padrão na criação
- Define acesso administrativo total
- Controlada apenas por administradores

### ``ativo``

- Boolean
- ``true`` por padrão na criação
- Indica se a conta pode acessar o sistema
- Usuários não são removidos fisicamente do banco; o campo ativo controla o acesso ao sistema.
- Usuários inativos não conseguem autenticar

### ``primeiro_acesso``

- Boolean
- ``true`` por padrão na criação
- Define se o usuário precisa completar o fluxo inicial

### ``created_at``

- Timestamp
- Gerado automaticamente no momento da criação
- Apenas leitura
- Nunca atualizado

## 🧩 Responsabilidades do Módulo

- Gerenciar dados persistentes do usuário
- Garantir integridade e consistência das informações
- Controlar permissões e níveis de acesso
- Garantir segurança nos fluxos de autenticação
- Servir como base de identidade para outros módulos do sistema
- Fornecer dados no formato adequado para o front

## Rotas
### 1. 🔐 Realizar Login
#### ``POST /users/login``
Realiza a autenticação de um usuário no sistema via credenciais (e-mail e senha).

#### 🎯 Objetivo da Rota
- Verificar a identidade do usuário

- Validar se a conta está ativa

- Gerar e retornar um token JWT (Bearer) para acesso aos recursos protegidos

- Retornar informações básicas de identificação do usuário logado

#### 🔓 Autorização
Público: Não requer autenticação prévia.

#### 📥 Request Body
````JSON
{
  "email": "terapeuta@gmail.com",
  "senha": "SenhaForte123!"
}
````
#### 📤 Response — Sucesso (200)
Retorna o token de acesso e os dados mínimos do usuário.
````JSON
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "502007c5-c34e-4cd0-9118-1dc694b17e27",
      "nome": "Nova Terapeuta",
      "matricula": "0123456"
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
#### 400 Bad Request:
- Email inválido.

#### 401 Unauthorized:
- E-mail ou senha incorretos.
- Conta desativada. Entre em contato com a administração.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

---

### 2. 🔄 Atualizar Token (Refresh)
#### ``POST /users/refresh``
Gera um novo token de acesso para o usuário atualmente autenticado.

#### 🎯 Objetivo da Rota
- Atualizar as permissões e primeiro acesso no payload do token (caso tenham mudado desde o último login)

#### 🔐 Autorização
- Requer autenticação

#### 📥 Request Body
Não requer corpo na requisição. A identificação é feita exclusivamente pelo token no Header.
#### 📤 Response — Sucesso (200)
Retorna apenas o novo token gerado.
````JSON
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
#### 401 Unauthorized:
- Token inválido ou expirado.
- Token não fornecido.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

---

### 3. 🚀 Realizar Primeiro Acesso
#### ```PATCH /users/first-access```
Finaliza o cadastro do usuário, obrigando a definição de uma nova senha e da disponibilidade de horário. Também permite, opcionalmente, definir a foto de perfil neste momento.

#### 🎯 Objetivo da Rota
- Alterar a senha temporária (padrão) para uma senha pessoal

- Cadastrar a grade de horários de atendimento (disponibilidade) inicial

- Definir foto de perfil (Opcional)

- Mudar o status de ``primeiro_acesso`` para ``false``

#### 🔐 Autorização
- Requer autenticação

- O usuário deve estar com a flag ``primeiro_acesso: true`` no banco.

#### 📥 Request Body
````JSON
{
  "senha": "MinhaNovaSenhaForte123!",
  "fotoUrl": "https://exemplo.com",
  "disponibilidade": [
    { "diaSemana": 1, "horaInicio": 8, "horaFim": 12 },
    { "diaSemana": 3, "horaInicio": 14, "horaFim": 18 }
  ]
}
````
*Nota*: O campo ``fotoUrl`` é opcional.
#### 📤 Response — Sucesso (200)
Retorna o usuário e sua disponibilidade atualizados e um novo token (pois o status de primeiro acesso no payload mudou).

````JSON
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "502007c5-c34e-4cd0-9118-1dc694b17e27",
      "nome": "Nova Terapeuta",
      "fotoUrl": "https://exemplo.com",
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

#### ❌ Possíveis Erros
#### 400 Bad Request:
- A nova senha deve ser diferente da anterior.

- Primeiro acesso já foi realizado anteriormente.

Validação ZOD como:
- A senha deve conter ao menos um caractere especial.
- Invalid URL
- horaFim deve ser maior que horaInicio

#### 401 Unauthorized:
- Token inválido ou expirado.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

---

### 4. 👤 Consultar Próprio Perfil
#### ``GET /users/profile``
Retorna os dados detalhados do usuário autenticado. Esta rota é frequentemente utilizada pelo frontend para validação de sessão (verificar se o usuário não foi desativado, ou atualizar suas permissões) e para carregar as permissões do usuário na interface.

#### 🎯 Objetivo da Rota
- Obter dados cadastrais do usuário logado

- Validar se os dados do token batem com os dados atuais do banco de dados

#### 🔐 Autorização
- Requer autenticação

- O acesso é restrito aos dados do próprio usuário (identificado pelo token).

#### 📥 Request Body
Não requer corpo na requisição. A identificação é feita exclusivamente pelo token no Header.
#### 📤 Response — Sucesso (200)
Retorna o objeto completo do usuário (exceto senha).
````JSON
{
  "data": {
    "user": {
      "id": "502007c5-c34e-4cd0-9118-1dc694b17e27",
      "nome": "Nova Terapeuta",
      "email": "terapeuta@gmail.com",
      "telefone": "88999383058",
      "matricula": "0123456",
      "fotoUrl": "https://...",
      "permAtendimento": true,
      "permCadastro": false,
      "permAdmin": false,
      "ativo": true,
      "primeiroAcesso": true,
      "createdAt": "2025-12-30T00:52:14.147Z"
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
#### 401 Unauthorized:
- Token inválido ou expirado.
- Token não fornecido.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

---

### 5. ✏️ Atualizar Próprio Perfil
#### ``PUT /users/profile``
Permite que o usuário autenticado atualize seus dados pessoais e de acesso.

#### 🎯 Objetivo da Rota
- Atualizar informações cadastrais (Nome, E-mail, Telefone, Foto)

- Alterar a própria senha

- Não permite alterar dados sensíveis de sistema (Matrícula, Permissões, Status)
#### 🔐 Autorização
- Requer autenticação

- O acesso é restrito aos dados do próprio usuário (identificado pelo token).

#### 📥 Request Body
Todos os campos são opcionais. O usuário envia apenas o que deseja alterar.
````JSON
{
  "nome": "Terapeuta Editada",
  "email": "novoemail@gmail.com",
  "fotoUrl": "https://exemplo.com",
  "telefone": "85988888888",
  "senha": "NovaSenhaForte123!"
}
````
#### 📤 Response — Sucesso (200)
Retorna os dados atualizados do usuário.
````JSON
{
  "data": {
    "user": {
      "id": "502007c5-c34e-4cd0-9118-1dc694b17e27",
      "nome": "Terapeuta Editada",
      "email": "novoemail@gmail.com",
      "telefone": "85988888888",
      "fotoUrl": "https://exemplo.com"
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
#### 400 Bad Request:
Validação ZOD como:
- A senha deve conter ao menos um caractere especial.
- Email inválido.
- A senha deve conter ao menos um número

#### 401 Unauthorized:
- Token inválido ou expirado.
- Token não fornecido.

#### 409 Conflict:
- Este e-mail já está cadastrado.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

---

### 6. ➕ Criar Usuário
#### ``POST /users``
Cria um novo usuário no sistema, gerando o registro inicial desse usuário.


#### 🎯 Objetivo da Rota
- Criar um usuário válido no sistema

- Garantir unicidade de email e matrícula

- Definir valores iniciais de controle (permissões, status, primeiro acesso)

- Definir senha inicial padrão, deve ser alterada posteriormente

#### 🔐 Autorização

- Requer autenticação

- Cadastro: Requer permissão ``perm_cadastro: true``.


#### 📥 Request Body
````json
{
  "nome": "Nova Terapeuta",
  "email": "terapeuta@gmail.com",
  "matricula": "0123456",
  "telefone": "01234567"
}
````
``telefone`` é opicional.

#### 📤 Response — Sucesso (201)
````json
{
  "data": {
    "user": {
      "id": "502007c5-c34e-4cd0-9118-1dc694b17e27",
      "nome": "Nova Terapeuta",
      "createdAt": "2025-12-30T00:52:14.147Z"
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
#### 400 Bad Request:
Validação ZOD como:
- Email inválido.
- A matrícula deve conter 7 dígitos

#### 401 Unauthorized:
- Token inválido ou expirado.

#### 403 Forbidden:
- Esta ação requer privilégios de cadastro.

#### 409 Conflict:
- Este e-mail ou matrícula já estão cadastrados.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

---

### 7. 📅 Buscar Terapeutas Disponíveis
#### ``GET /users/available``
Busca quais usuários (terapeutas) estão ativos, possuem permissão de atendimento e têm disponibilidade na agenda para o intervalo solicitado. Essencial para o fluxo de agendamento.

#### 🎯 Objetivo da Rota
- Filtrar terapeutas livres num horário específico.

- Retorna apenas usuários com ``ativo: true`` e ``perm_atendimento: true``.

#### 🔐 Autorização
- Requer autenticação

- Cadastro: Requer permissão ``perm_cadastro: true``.

#### 📥 Query Parameters
Parâmetros enviados na própria URL.
 Parâmetro    | Tipo      | Obrigatório    | Descrição
 ---------    | --------- | ---------      | ---------
``diaSemana``	| number    | ✅	           | 0 (Dom) a 6 (Sáb).
``horaInicio``| number    | ✅	           | Hora de início da busca 8 a 17.
``horaFim``	  | number    | ✅	           | Hora de término da busca 9 a 18.

**Exemplo de URL:** ``GET /users/available?diaSemana=1&horaInicio=14&horaFim=15``

#### 📥 Request Body
Não requer corpo da requisição.

#### 📤 Response — Sucesso (200)
Retorna os dados paginados dentro de ``data`` e as informações de navegação em ``meta``.
````JSON
{
  "data": [
    {
      "user": {
        "id": "502007c5-c34e-4cd0-9118-1dc694b17e27",
        "nome": "Terapeuta Editada"
      },
      "availability": [
        {
          "diaSemana": 1,
          "horaInicio": 8,
          "horaFim": 9
        },
        {
          "diaSemana": 1,
          "horaInicio": 11,
          "horaFim": 12
        },
        {
          "diaSemana": 1,
          "horaInicio": 14,
          "horaFim": 18
        }
      ]
    },
    {
      "user": {
        "id": "5e4dfffe-a1d9-41aa-9acb-814b09b0ba30",
        "nome": "Nova Terapeuta"
      },
      "availability": [
        {
          "diaSemana": 1,
          "horaInicio": 8,
          "horaFim": 12
        }
      ]
    }
  ],
  "meta": {
    "count": 2
  },
  "error": null
}
````

#### ❌ Possíveis Erros
#### 400 Bad Request:
- ``horaFim`` menor ou igual a ``horaInicio``.

- ``diaSemana`` inválido.

#### 401 Unauthorized:
- Token inválido ou expirado.

#### 403 Forbidden:
- Esta ação requer privilégios de cadastro.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

---

### 8. 📋 Listar Usuários (Admin)
#### ``GET /users``
Retorna a lista completa de usuários cadastrados no sistema, com suporte a paginação, ordenação e filtros.

#### 🎯 Objetivo da Rota
- Listagem eficiente para painéis administrativos (Grid/Tabela).

- Filtrar usuários ativos ou inativos.

- Ordenar por nome, data de criação ou matrícula.

#### 🔐 Autorização
- Requer autenticação

- Admin: Requer permissão ``perm_admin: true``.

#### 📥 Query Parameters (URL)
Todos são opcionais.
 Parâmetro    | Tipo      | Padrão    | Descrição
 ---------    | --------- | --------- | ---------
``page``	    | number    | 	1	      | Número da página atual.
``limit``	    | number	  | 10	      | Quantidade de itens por página (Max: 100).
``orderBy``	  | string	  | nome	    | Coluna para ordenação. Opções: nome, created_at, ativo.
``direction`` |	string	  | ASC	      | Direção da ordenação: ASC (Crescente) ou DESC (Decrescente).
``ativo``	    | string	  | Todos	    | Filtro de status. Envie ``true`` para ver apenas ativos, ``false`` para inativos ou não envie nada para ver todos.

**Exemplo de URL:** ``GET /users?page=2&limit=5&orderBy=created_at&direction=DESC&ativo=true`` (Página 2, 5 itens por vez, ordenado pelos mais recentes, apenas usuários ativos)

#### 📥 Request Body
Não requer corpo da requisição.

#### 📤 Response — Sucesso (200)
Retorna os dados paginados dentro de ``data`` e as informações de navegação em ``meta``.
````JSON
{
  "data": [
    {
      "user": {
        "id": "690cff1a-a253-42e4-8a25-0f1ea88866f2",
        "nome": "Terapeuta Teste 110",
        "matricula": "5000236",
        "fotoUrl": null,
        "permAtendimento": true,
        "permCadastro": false,
        "ativo": true,
        "createdAt": "2025-12-31T06:32:05.680Z"
      }
    },
    {
      "user": {
        "id": "c210bd7e-9618-4c00-a4d2-39207c5e9e54",
        "nome": "Terapeuta Teste 109",
        "matricula": "5000071",
        "fotoUrl": null,
        "permAtendimento": true,
        "permCadastro": false,
        "ativo": true,
        "createdAt": "2025-12-30T14:26:10.576Z"
      }
    },
    {
      "user": {
        ...
      }
    },
    {
      "user": {
        ...
      }
    },
    {
      "user": {
        ...
      }
    }
  ],
  "meta": {
    "totalItems": 100,
    "totalPages": 20,
    "currentPage": 1,
    "itemsPerPage": 5,
    "sortBy": "created_at",
    "sortDirection": "DESC"
  },
  "error": null
}
````

#### ❌ Possíveis Erros
#### 400 Bad Request:
- Erro de validação ZOD.

#### 401 Unauthorized:
- Token inválido ou expirado.

#### 403 Forbidden:
- Esta ação requer privilégios de administrador.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

---

### 9. 🔍 Buscar Usuário por ID (Admin)
#### ``GET /users/:targetId``
Retorna os dados completos e sua disponibilidade de um usuário específico baseado no seu ID.

#### 🎯 Objetivo da Rota
- Visualizar detalhes de um colaborador específico.

- Carregar dados para o formulário de edição administrativa.

#### 🔐 Autorização
- Requer autenticação

- Admin: Requer permissão ``perm_admin: true``.

#### 📥 Path Parameters
Parâmetros enviados na própria URL.
 Parâmetro    | Tipo      | Obrigatório    | Descrição
 ---------    | --------- | ---------      | ---------
``targetId``	| UUID      | ✅	           | O ID único do usuário que você deseja buscar.

**Exemplo de URL:** ``GET /users/5e4dfffe-a1d9-41aa-9acb-814b09b0ba30``

#### 📥 Request Body
Não requer corpo da requisição.

#### 📤 Response — Sucesso (200)
Retorna os dados paginados dentro de ``data`` e as informações de navegação em ``meta``.
````JSON
{
  "data": {
    "user": {
      "id": "5e4dfffe-a1d9-41aa-9acb-814b09b0ba30",
      "nome": "Nova Terapeuta",
      "email": "terapeuta@gmail.com",
      "telefone": "88999383058",
      "matricula": "0123456",
      "fotoUrl": "https://exemplo.com",
      "permAtendimento": true,
      "permCadastro": false,
      "permAdmin": false,
      "ativo": true,
      "primeiroAcesso": false,
      "createdAt": "2025-12-30T12:10:58.248Z"
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

#### ❌ Possíveis Erros
#### 400 Bad Request:
- Invalid UUID

#### 401 Unauthorized:
- Token inválido ou expirado.

#### 403 Forbidden:
- Esta ação requer privilégios de administrador.

#### 404 Not Found:
- Usuário não encontrado.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

---

### 10. 🛠️ Gerenciar Usuário (Admin)
#### ``PUT /users/:targetId``
Rota administrativa para alterar dados sensíveis e de acesso de outro usuário. Usada para promover usuários, desativar contas ou corrigir matrículas.

#### 🎯 Objetivo da Rota
- Alterar permissões (promover/rebaixar)

- Desativar/Ativar conta (Demissão ou retorno)

- Corrigir matrícula errada

#### 🔐 Autorização
- Requer autenticação

- Admin: Requer permissão ``perm_admin: true``.

#### 📥 Request Body
Todos os campos são opcionais.
````JSON
{
  "matricula": "6543210",
  "permAtendimento": true,
  "permCadastro": true,
  "ativo": true
}
````
*Nota:* Se enviar ``ativo: false``, o usuário perde acesso imediato ao tentar entrar no sistema.

#### 📤 Response — Sucesso (200)
Retorna os dados atualizados do usuário.
````JSON
{
  "data": {
    "user": {
      "id": "502007c5-c34e-4cd0-9118-1dc694b17e27",
      "nome": "Terapeuta Editada",
      "matricula": "6543210",
      "permAtendimento": true,
      "permCadastro": true,
      "ativo": true
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
#### 400 Bad Request:
Validação ZOD como:
- A matrícula deve conter 7 dígitos.

#### 401 Unauthorized:
- Token inválido ou expirado.

#### 403 Forbidden:
- Esta ação requer privilégios de administrador.

#### 409 Conflict:
- Esta matrícula já está cadastrada.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

---

### 11. 🔄 Resetar Senha (Admin)
#### ``PATCH /users/:targetId/reset-password``
Rota administrativa para redefinir a senha de um usuário para o padrão do sistema.

#### 🎯 Objetivo da Rota
- Redefinir a senha para uma senha temporária padrão.

#### 🔐 Autorização
- Requer autenticação

- Admin: Requer permissão ``perm_admin: true``.

#### 📥 Path Parameters
 Parâmetro    | Tipo      | Obrigatório    | Descrição
 ---------    | --------- | ---------      | ---------
``targetId``	| UUID      | ✅	           | O ID único do usuário que você deseja buscar.

**Exemplo de URL:** ``PATCH /users/502007c5-c34e-4cd0-9118-1dc694b17e27/reset-password`

#### 📥 Request Body
Não requer corpo da requisição.

#### 📤 Response — Sucesso (200)
````JSON
{
  "data": {
    "user": {
      "id": "502007c5-c34e-4cd0-9118-1dc694b17e27",
      "nome": "Terapeuta Editada"
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
#### 401 Unauthorized:
- Token inválido ou expirado.

#### 403 Forbidden:
- Esta ação requer privilégios de administrador.

#### 404 Not Found:
- Usuário não encontrado.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.