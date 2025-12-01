# Documentação da API - Sistema Lassu
Este documento detalha as rotas disponíveis, os parâmetros esperados e as respostas do servidor

**BASE URL:** http://localhost:3001

## Autenticação e Segurança
O sistema utiliza **JWT (JSON Web Token)** para segurança.

**Obter Token:** Realize login na rota /users/login.

**Usar Token:** Em todas as rotas protegidas, você deve enviar o cabeçalho:

`Authorization: Bearer <token>`

## Módulo de Usuários
### 1. Login
**Rota:** POST /users/login

**Acesso:** Público

**Descrição:** Autentica o usuário, verifica se a conta está ativa e retorna o Token de acesso.

**Corpo da requisição (JSON):**

````json 
{
  "email": "maria@gmail.com",
  "senha": "Exemplo1234!"
}
````

**Resposta Sucesso (200 OK):**
````json 
{
  "user": {
    "id": "uuid-do-usuario",
    "nome": "Maria Silva",
    "email": "maria@gmail.com",
    "permAtendimento": true,
    "permCadastro": false,
    "permAdmin": false,
    "primeiroAcesso": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
````
**Erros Comuns:**

• 401 Unauthorized: Email ou senha inválidos.

• 401 Unauthorized: Acesso negado: Conta desativada.


### 2. Obter Perfil
**Rota:** GET /users/profile

**Acesso:** Qualquer usuário logado

**Descrição:** Retorna os dados atualizados do usuário logado baseando-se no Token enviado. Utilizado pelo Frontend ao recarregar a página para verificar validade da sessão.

**Corpo da requisição (JSON):** Vazio

**Resposta Sucesso (200 OK):**
````json 
{
  "id": "uuid-do-usuario",
  "nome": "Maria Silva",
  "email": "maria@gmail.com",
  "matricula": 1234567,
  "telefone": "85999998888",
  "foto_url": "http://...",
  "ativo": true,
  "permAtendimento": true,
  "permCadastro": false,
  "permAdmin": false
}
````
**Erros Comuns:**

• 401 Unauthorized: Token inválido ou não fornecido.

• 401 Unauthorized: Conta desativada.

### 3. Cadastrar Novo Usuário
**Rota:** POST /users

**Acesso:** Permissão de **Cadastro** ou **Admin**

**Descrição:** Cria um novo usuário no sistema. A senha inicial é gerada automaticamente, L + matrícula. As permissões nascem apenas com atendimento.

**Corpo da requisição (JSON):**

````json 
{
  "nome": "Nova Bolsista",
  "email": "nova@gmail.com",
  "matricula": 2024025,
  "telefone": "85988887777"
}
````

**Resposta Sucesso (201 Created):**
````json 
{
  "id": "uuid-novo-usuario",
  "nome": "Nova Bolsista",
  "email": "nova@teste.com",
  "matricula": 202402,
  "ativo": true
}
````
**Erros Comuns:**

• 400 Bad Request: Dados inválidos ou faltando.

• 400 Bad Request: Já existe um usuário com esse email ou matricula registrado.

• 403 Forbidden: Usuário logado não tem permissão para cadastrar.


### 4. Completar Primeiro Acesso
**Rota:** PATCH /users/primeiro-acesso

**Acesso:** Usuário logado com senha provisória

**Descrição:** Rota obrigatória para quem tem `primeiroAcesso: true`. Obriga a definição de uma nova senha.

**Corpo da requisição (JSON):**

````json 
{
  "senha": "nova_senha_forte", // Obrigatório
  "fotoUrl": "https://..."     // Opcional
}
````

**Resposta Sucesso (200 OK):**
````json 
{
  "id": "uuid...",
  "primeiro_acesso": false
}
````
**Erros Comuns:**

• 400 Bad Request: A nova senha deve ser diferente da senha atual.

• 400 Bad Request: É obrigatório definir uma nova senha.

### 5. Atualizar Usuário
**Rota:** PUT /users/:id

**Acesso:** Usuário logado

**Descrição:** Atualiza dados do usuário.

**Admin:** Pode editar qualquer usuário e alterar permissões/status.

**Comum:** Só pode editar a si mesmo, campos limitados.

**Corpo da requisição (JSON):**

````json 
{
  "nome": "Maria Editada",
  "email": "leticia@gmail.com",
  "telefone": "85988889999",
  "fotoUrl": "teste",
  "senha": "outra_senha_nova",
  
  // Campos abaixo só funcionam se quem estiver editando for ADMIN:
  "matricula"
  "permAtendimento": true,
  "permCadastro": true,
  "permAdmin": true,
  "ativo": true
}
````

**Resposta Sucesso (200 OK):**
````json 
{
  "id": "uuid...",
  "nome": "Maria Editada",
  "email": "maria@teste.com"
  // ... dados atualizados
}
````
**Erros Comuns:**

• 404 Not Found: Usuário não encontrado.

• 403 Unauthorized: Você não tem permissão para editar outros usuários.

### 6. Renovar Token
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

• 401 Unauthorized: Conta desativada (O sistema nega a renovação).

• 404 Not Found: Usuário não encontrado no banco.
