# Documentação da API - Sistema Lassu
Este documento detalha as rotas disponíveis, os parâmetros esperados e as respostas do servidor

**BASE URL:** http://localhost:3001

## Autenticação e Segurança
O sistema utiliza **JWT (JSON Web Token)** para segurança.

**Obter Token:** Realize login na rota /users/login.

**Usar Token:** Em todas as rotas protegidas, você deve enviar o cabeçalho:

`Authorization: Bearer <token>`

## Módulo de Usuários
### 1. Cadastrar Novo Usuário
**Rota:** POST /users

**Acesso:** Permissão de **Cadastro** ou **Admin**

**Descrição:** Cria um novo usuário no sistema. A senha inicial é gerada automaticamente, L + matrícula. As permissões nascem apenas com atendimento.

**Corpo da requisição (JSON):**

````json 
{
  "nome": "Nova Bolsista",              
  "email": "novabolsista@gmail.com",    
  "matricula": 20250412,                
  "telefone": "889995555"   //Opcional
}
````

**Resposta Sucesso (201 Created):**
````json 
{
  "user": {
    "id": "6385ddd7-48dd-4517-85d1-c182253e740c",
    "matricula": 20250412,
    "nome": "Nova Bolsista",
    "email": "novabolsista@gmail.com",
    "telefone": "889995555",
    "fotoUrl": null,
    "permAtendimento": true,
    "permCadastro": false,
    "permAdmin": false,
    "ativo": true,
    "primeiroAcesso": true,
    "createdAt": "2025-12-07T00:48:25.548Z"
  }
}
````
**Erros Comuns:**

• 400 Bad Request: Dados inválidos ou faltando.

• 400 Bad Request: Este e-mail ou matrícula já estão cadastrados.

• 403 Forbidden: Esta ação requer privilégios de cadastro.



### 2. Login
**Rota:** POST /users/login

**Acesso:** Público

**Descrição:** Autentica o usuário, verifica se a conta está ativa e retorna o Token de acesso.

**Corpo da requisição (JSON):**

````json 
{
  "email": "novabolsista@gmail.com",
  "senha": "L20250412"
}
````

**Resposta Sucesso (200 OK):**
````json 
{
  "user": {
    "id": "6385ddd7-48dd-4517-85d1-c182253e740c",
    "matricula": 20250412,
    "nome": "Nova Bolsista",
    "email": "novabolsista@gmail.com",
    "telefone": "889995555",
    "fotoUrl": null,
    "permAtendimento": true,
    "permCadastro": false,
    "permAdmin": false,
    "ativo": true,
    "primeiroAcesso": true,
    "createdAt": "2025-12-07T00:48:25.548Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzODVkZGQ3LTQ4ZGQtNDUxNy04NWQxLWMxODIyNTNlNzQwYyIsIm5vbWUiOiJOb3ZhIEJvbHNpc3RhIiwicGVybUF0ZW5kaW1lbnRvIjp0cnVlLCJwZXJtQ2FkYXN0cm8iOmZhbHNlLCJwZXJtQWRtaW4iOmZhbHNlLCJwcmltZWlyb0FjZXNzbyI6dHJ1ZSwiaWF0IjoxNzY1MDU3NzM4LCJleHAiOjE3NjU2NjI1Mzh9.ek-RGmDegJGfOKxRkLAqyOOTW3w_C87YHP7HXHJ7c7o"
}
````
**Erros Comuns:**

• 401 Unauthorized: E-mail ou senha incorretos.

• 401 Unauthorized: Conta desativada. Entre em contato com a administração.


### 3. Obter Perfil
**Rota:** GET /users/profile

**Acesso:** Qualquer usuário logado

**Descrição:** Retorna os dados atualizados do usuário logado baseando-se no Token enviado. Utilizado pelo Frontend ao recarregar a página para verificar validade da sessão.

**Corpo da requisição (JSON):** Vazio

**Resposta Sucesso (200 OK):**
````json 
{
  "user": {
    "id": "6385ddd7-48dd-4517-85d1-c182253e740c",
    "matricula": 20250412,
    "nome": "Nova Bolsista",
    "email": "novabolsista@gmail.com",
    "telefone": "889995555",
    "fotoUrl": null,
    "permAtendimento": true,
    "permCadastro": false,
    "permAdmin": false,
    "ativo": true,
    "primeiroAcesso": true,
    "createdAt": "2025-12-07T00:48:25.548Z"
  }
}
````
**Erros Comuns:**

• 401 Unauthorized: Token inválido ou não fornecido.

• 401 Unauthorized: Conta desativada. Entre em contato com a administração.

### 4. Completar Primeiro Acesso
**Rota:** PATCH /users/first-access

**Acesso:** Usuário logado com senha provisória

**Descrição:** Rota obrigatória para quem tem `primeiroAcesso: true`. Obriga a definição de uma nova senha e o cadastro da disponibilidade de horários. Se as disponibildiades forem inválidas, a senha não é alterada. Retorna o usuário atualizado, a grade salva e o novo token.

**Corpo da requisição (JSON):**

````json 
{
  "senha": "SenhaNova123!",
  "disponibilidade": [
    {
      "dia": 1,           // 1 = Segunda-feira
      "horaInicio": 14,   // 14:00
      "horaFim": 18       // 18:00
    },
    {
      "dia": 3,           // 3 = Quarta-feira
      "horaInicio": 8,
      "horaFim": 12
    }
  ]
}
````

**Resposta Sucesso (200 OK):**
````json 
{
  "user": {
    "id": "6385ddd7-48dd-4517-85d1-c182253e740c",
    "matricula": 20250412,
    "nome": "Nova Bolsista",
    "email": "novabolsista@gmail.com",
    "telefone": "889995555",
    "fotoUrl": "url",
    "permAtendimento": true,
    "permCadastro": false,
    "permAdmin": false,
    "ativo": true,
    "primeiroAcesso": false, // Atualizado
    "createdAt": "2025-12-07T00:48:25.548Z"
  },
  "availability": [
    {
      "dia": 1,
      "horaInicio": 14,
      "horaFim": 18
    },
    {
      "dia": 3,
      "horaInicio": 8,
      "horaFim": 12
    }
  ],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
````
**Erros Comuns:**

• 400 Bad Request: A nova senha deve ser diferente da anterior.

• 400 Bad Request: Este usuário já realizou primeiro acesso.

• 400 Bad Request: Formato inválido. Envie uma array.

• 400 Bad Request: Horário inválido no dia X: Fim deve ser maior que início.

• 400 Bad Request: Conflito de horários no dia X.

### 5. Atualizar Peril
**Rota:** PUT /users/profile

**Acesso:** Usuário logado

**Descrição:** Atualiza dados de perfil de usuário, (nome, email, telefone, foto e senha)

**Corpo da requisição (JSON):**

````json 
{
  "nome": "Bolsista Veterana",
  "email": "bolsista2@gmail.com",
  "telefone": "859998888",
  "senha": "SenhaNova123!",
  "fotoUrl": "url"
}
````

**Resposta Sucesso (200 OK):**
````json 
{
  "user": {
    "id": "6385ddd7-48dd-4517-85d1-c182253e740c",
    "matricula": 20250412,
    "nome": "Bolsista Veterana",
    "email": "bolsista2@gmail.com",
    "telefone": "859998888",
    "fotoUrl": "url",
    "permAtendimento": true,
    "permCadastro": false,
    "permAdmin": false,
    "ativo": true,
    "primeiroAcesso": false,
    "createdAt": "2025-12-07T00:48:25.548Z"
  }
}
````
**Erros Comuns:**

• 404 Not Found: Usuário não encontrado.

### 6. Atualizar Usuário
**Rota:** PUT /users/:targetId

**Acesso:** Permissão de Admin

**Descrição:** Atualiza qualquer dado de um usuário específico. Diferente da rota de perfil, esta rota permite alterar dados sensíveis como Matrícula, Permissões e Status (Ativo/Inativo).

**Corpo da requisição (JSON):**

````json 
{
  "nome": "Nome Corrigido",
  "matricula": 20259999,
  "permAdmin": true,        // Promover a Admin
  "permCadastro": true,     // Dar permissão de cadastro
  "ativo": false            // Desativar usuário (Soft Delete)
}
````

**Resposta Sucesso (200 OK):**
````json 
{
  "user": {
    "id": "6385ddd7-48dd-4517-85d1-c182253e740c",
    "matricula": 20259999,
    "nome": "Nome Corrigido",
    "email": "bolsista2@gmail.com",
    "telefone": "859998888",
    "fotoUrl": "url",
    "permAtendimento": true,
    "permCadastro": true,
    "permAdmin": true,
    "ativo": false,
    "primeiroAcesso": false,
    "createdAt": "2025-12-07T00:48:25.548Z"
  }
}
````
**Erros Comuns:**

• 403 Forbidden: Acesso negado. Esta ação requer privilégios de administrador.

• 404 Not Found: Usuário não encontrado.

### 7. Listar Todos os Usuários
**Rota:** GET /users

**Acesso:** Permissão de Admin

**Descrição:** Retorna a lista completa de todos os usuários cadastrados no sistema. Utilizado para a tela de gestão de equipe.

**Corpo da requisição (JSON):** (Vazio)

**Resposta Sucesso (200 OK):**
````json 
[
  {
    "user": {
      "id": "6385ddd7-48dd-4517-85d1-c182253e740c",
      "matricula": 20250412,
      "nome": "Nova Bolsista",
      "email": "novabolsista@gmail.com",
      "telefone": "889995555",
      "fotoUrl": null,
      "permAtendimento": true,
      "permCadastro": false,
      "permAdmin": false,
      "ativo": true,
      "primeiroAcesso": true,
      "createdAt": "2025-12-07T00:48:25.548Z"
    }
  },
  {
    "user": {
      "id": "uuid-outro-usuario",
      "matricula": 20240101,
      "nome": "Coordenadora",
      "email": "coord@gmail.com",
      // ...
    }
  }
]
````
**Erros Comuns:**

• 403 Forbidden: Acesso negado. Esta ação requer privilégios de administrador.

### 8. Listar um Usuário
**Rota:** GET /users/:targetId

**Acesso:** Permissão de Admin

**Descrição:** Retorna os detalhes completos de um usuário específico. Utilizado pelos administradores para visualizar dados de outros usuários.

**Corpo da requisição (JSON):** (Vazio)

**Resposta Sucesso (200 OK):**
````json 
{
  "user": {
    "id": "6385ddd7-48dd-4517-85d1-c182253e740c",
    "matricula": 20259999,
    "nome": "Nome Corrigido",
    "email": "bolsista2@gmail.com",
    "telefone": "859998888",
    "fotoUrl": "url",
    "permAtendimento": true,
    "permCadastro": true,
    "permAdmin": true,
    "ativo": false,
    "primeiroAcesso": false,
    "createdAt": "2025-12-07T00:48:25.548Z"
  }
}
````
**Erros Comuns:**

• 403 Forbidden: Acesso negado. Esta ação requer privilégios de administrador.

• 404 Not Found: Usuário não encontrado.

### 9. Renovar Token
**Rota:** POST /users/refresh

**Acesso:** Requer um token válido

**Descrição:** Gera um novo Token JWT contendo os dados mais recentes do banco de dados (permissões atualizadas, nome, etc). O Frontend deve chamar esta rota automaticamente se perceber (ao comparar com /profile) que o cargo do usuário mudou, atualizando o token sem deslogar a pessoa.

**Corpo da requisição (JSON):** (Vazio - O servidor identifica o usuário pelo Token atual enviado no Header)

**Resposta Sucesso (200 OK):**
````json 
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
````
**Erros Comuns:**

• 401 Unauthorized: Token inválido ou expirado.

• 401 Unauthorized: Conta desativada. Entre em contato com a administração.

• 404 Not Found: Usuário não encontrado.

### 10. Buscar Extensionistas Disponíveis
**Rota:** POST /users/available

**Acesso:** Requer permissão de Cadastro

**Descrição:** Busca quais usuários (com permissão de atendimento) possuem disponibilidade em um dia e intervalo de horário específico. Útil para encontrar quem pode atender um paciente naquele momento.

**Parâmetros de Consulta (Query Params)**: Exemplo: /users/available?dia=2&inicio=11&fim=15

`dia:` (Obrigatório) Número do dia (0=Dom, 1=Seg... 6=Sáb).

`inicio:` (Obrigatório) Hora de início em hora.

`fim:` (Obrigatório) Hora de fim em hora.

**Corpo da requisição (JSON):** Vazio

**Resposta Sucesso (200 OK):** Retorna uma lista de usuários e qual horário deles coincidiu com a busca.
````json 
[
  {
    "user": {
      "id": "6be94a9e-214e-4357-9b8e-488129ec4574",
      "nome": "Cadastro"
    },
    "availabilities": [
      {
        "dia": 2,
        "inicio": 8,
        "fim": 12
      },
      {
        "dia": 2,
        "inicio": 13,
        "fim": 16
      }
    ]
  },
  {
    "user": {
      "id": "9483193c-4b5a-4ea4-a9f3-cfdc65f2b8aa",
      "nome": "Atendimento"
    },
    "availabilities": [
      {
        "dia": 2,
        "inicio": 10,
        "fim": 16
      }
    ]
  }
]
````
**Erros Comuns:**

• 401 Unauthorized: Token inválido ou expirado.

• 401 Unauthorized: Conta desativada. Entre em contato com a administração.

• 404 Not Found: Usuário não encontrado.

## Módulo Disponibilidade

### 1. Gerenciar Disponibilidade (Salvar)
**Rota:** PUT /availability

**Acesso:** Qualquer usuário logado

**Descrição:** Define a grade de horários do usuário.

• **Lógica de Substituição:** Esta rota apaga todos os horários anteriores do usuário e grava a nova lista enviada.

• **Limpar Agenda:** Para remover todos os horários, basta enviar um array vazio [].

• **Validação:** O sistema verifica automaticamente se há conflitos (horários sobrepostos) ou erros de lógica (início maior que fim) antes de salvar.

**Corpo da requisição (JSON - Array):**

````json 
[
  {
    "dia": 3,            // Quarta-feira
    "horaInicio": 8,
    "horaFim": 12
  },
  {
    "dia": 1,            // Segunda-feira
    "horaInicio": 14,    // 14:00
    "horaFim": 18        // 18:00
  }
]
````

**Resposta Sucesso (201 Created):**
````json 
[
  {
    "dia": 1,
    "horaInicio": 14,
    "horaFim": 18
  },
  {
    "dia": 3,
    "horaInicio": 8,
    "horaFim": 12
  }
]
````
**Erros Comuns:**

• 400 Bad Request: Formato inválido. Envie uma array.

• 400 Bad Request: Horário inválido no dia X: Fim deve ser maior que início.

• 400 Bad Request: Conflito de horários no dia X.

### 2. Obter Disponibilidade do Perfil
**Rota:** GET /availability

**Acesso:** Qualquer usuário logado

**Descrição:** Retorna a grade de horários cadastrada para o usuário logado.

**Corpo da requisição (JSON):** Vazio

**Resposta Sucesso (200 OK):**
````json 
[
  {
    "dia": 1,
    "horaInicio": 14,
    "horaFim": 18
  },
  {
    "dia": 3,
    "horaInicio": 8,
    "horaFim": 12
  }
]
````
**Erros Comuns:**

• 401 Unauthorized: Token inválido ou não fornecido.

• 401 Unauthorized: Erro de conexão com o banco.


## Módulo Notificação

### 1. Listar Notificações
**Rota:** GET /notification

**Acesso:** Qualquer usuário logado

**Descrição:** Retorna a lista de notificações do usuário logado, ordenadas das mais recentes para as mais antigas.

**Corpo da requisição (JSON):** Vazio

**Resposta Sucesso (200 OK):**
````json 
[
  {
    "id": 50,
    "usuarioId": "02e6b058-a427-4d07-a39e-c849424a7f31",
    "titulo": "Nova Usuária Cadastrada",
    "mensagem": "A usuária [Nova Bolsista](user:49ddb05f-f819-4e4d-b8c3-f3c5a67d078e) acabou de ser criada.",
    "lida": false,
    "createdAt": "2025-12-13T00:09:22.657Z"
  },
  {
    "id": 48,
    "usuarioId": "02e6b058-a427-4d07-a39e-c849424a7f31",
    "titulo": "Nova Paciente Cadastrada",
    "mensagem": "A paciente [paciente1](patient:01fcc35c-fb1a-4fce-b7d1-2bb7d8db5ada) acaba de ser registrada por [Nocta](user:02e6b058-a427-4d07-a39e-c849424a7f31), com a extensionista [Cadastro](user:6be94a9e-214e-4357-9b8e-488129ec4574) como responsável.",
    "lida": false,
    "createdAt": "2025-12-12T23:16:38.816Z"
  }
]
````
(Retorna [] se não houver notificações).

### 2. Marcar como Lida
**Rota:** PATCH /notifications/:notificationId/read

**Acesso:** Qualquer usuário logado

**Descrição:** Marca uma notificação específica como "Lida" (true). O sistema garante que você só pode marcar as notificações que pertencem a você.

**Corpo da requisição (JSON):** Vazio

**Resposta Sucesso (200 OK):**
````json 
{
  "message": "Notificação marcada como lida."
}
````
**Erros Comuns:**

• 404 Not Found: Notificação não encontrada

## Módulo de Pacientes

### 1. Cadastrar Paciente
**Rota:** POST /patient

**Acesso:** Permissão de **Cadastro** ou **Admin**

**Descrição:** É obrigatório vincular uma profissionalResponsavelId (Terapeuta) no momento do cadastro. O CPF deve ser único no sistema. O status inicial é definido automaticamente. Envia notificação para todos os Admins ("Nova Paciente Cadastrada"). Envia notificação para a Profissional Responsável ("Nova Paciente Vinculada").

**Corpo da requisição (JSON):**

````json 
{
  "nome": "Nova Paciente",
  "dataNascimento": "1995-05-20", // Formato YYYY-MM-DD
  "cpf": "123.456.789-00",
  "telefone": "85999998888",
  "profissionalResponsavelId": "uuid-da-terapeuta-responsavel"
}
````

**Resposta Sucesso (201 Created):**
````json 
{
  "patient": {
    "id": "uuid-gerado",
    "nome": "Ana Clara",
    "dataNascimento": "1995-05-20T00:00:00.000Z",
    "cpf": "123.456.789-00",
    "telefone": "85999998888",
    "profissionalResponsavelId": "uuid-da-extensionista-responsavel",
    "status": "triagem",
    "createdAt": "2025-12-10T10:00:00.000Z"
  }
}
````
**Erros Comuns:**

• 400 Bad Request: "Campos obrigatórios não preenchidos."

• 400 Bad Request: "Paciente já cadastrada com este CPF."

### 2. Listar Pacientes
**Rota:** GET /patients

**Acesso:** Qualquer usuário logado

**Descrição:** Retorna a lista de pacientes. O sistema aplica um filtro de visualização baseado no nível de permissão do usuário logado:

- Se tiver permissão Admin: Visualiza TODOS os pacientes do sistema.
- Se não: Visualiza APENAS os pacientes vinculados a você (profissionalResponsavelId igual ao seu ID).

**Corpo da requisição (JSON):** Vazio

**Resposta Sucesso (200 OK):**
````json 
[
  {
    "patient": {
      "id": "def364a8-d23e-4279-bdb1-d1313d8bec4a",
      "nome": "Nova Paciente 2",
      "dataNascimento": "2007-01-18T03:00:00.000Z",
      "cpf": "012345678-92",
      "telefone": "889995555",
      "profissionalResponsavelId": "9483193c-4b5a-4ea4-a9f3-cfdc65f2b8aa",
      "status": "triagem",
      "createdAt": "2025-12-10T03:42:57.108Z"
    }
  },
  {
    "patient": {
      "id": "4451f715-7202-4e0f-b254-aa822354a8fa",
      "nome": "Nova Paciente 3",
      "dataNascimento": "2007-01-18T03:00:00.000Z",
      "cpf": "012345678-93",
      "telefone": "889995555",
      "profissionalResponsavelId": "9483193c-4b5a-4ea4-a9f3-cfdc65f2b8aa",
      "status": "triagem",
      "createdAt": "2025-12-10T03:43:06.543Z"
    }
  },
]
````

### 3. Detalhes Pacientes
**Rota:** GET /patients/:targetId

**Acesso:** Permissão de Cadastro

**Descrição:** Retorna a ficha completa de um paciente específico pelo ID.

**Corpo da requisição (JSON):** Vazio

**Resposta Sucesso (200 OK):**
````json 
{
  "patient": {
    "id": "c9a053ea-03f1-4241-b145-887aad7371ac",
    "nome": "Paciente 4",
    "dataNascimento": "2006-01-17T03:00:00.000Z",
    "cpf": "012345678-94",
    "telefone": "859995555",
    "profissionalResponsavelId": "42b83a9a-06cd-4dc7-bf1d-c6c6583b3fe3",
    "status": "triagem",
    "createdAt": "2025-12-10T03:43:10.951Z"
  }
}
````
**Erros Comuns:**

• 403 Forbidden: Usuário sem permissão de cadastro.

• 404 Not Found: Paciente não encontrado.

### 4. Atualizar Paciente
**Rota:** PUT /patient/:targetId

**Acesso:** Permissão de Cadastro

**Descrição:** Atualiza dados cadastrais do paciente ou altera o status/vínculo. Validação: Se o CPF for enviado, verifica se ele já existe no banco.

**Corpo da requisição (JSON):**

````json 
{
  "nome": "Paciente 4",
  "dataNascimento": "2006-01-17",
  "cpf": "012345678-94",
  "telefone": "859995555",
  "profissionalResponsavelId": "42b83a9a-06cd-4dc7-bf1d-c6c6583b3fe3",
  "status": "encaminhada"
}
````

**Resposta Sucesso (200 OK):**
````json 
{
  "patient": {
    "id": "c9a053ea-03f1-4241-b145-887aad7371ac",
    "nome": "Paciente 4",
    "dataNascimento": "2006-01-17T03:00:00.000Z",
    "cpf": "012345678-94",
    "telefone": "859995555",
    "profissionalResponsavelId": "42b83a9a-06cd-4dc7-bf1d-c6c6583b3fe3",
    "status": "encaminhada",
    "createdAt": "2025-12-10T03:43:10.951Z"
  }
}
````
**Erros Comuns:**

• 400 Bad Request: "Paciente já cadastrada com este CPF."

• 404 Not Found: Paciente não encontrada.