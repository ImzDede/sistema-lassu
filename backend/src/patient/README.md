# 🏥 Módulo Patients
O módulo Patients gerencia o cadastro e o ciclo de vida dos pacientes da clínica. Ele lida com dados sensíveis, vinculação com terapeutas e status do tratamento.

### [↩️Voltar ao README principal](/backend/README.md)

## 🗺️ Sumário das Rotas

### 🔐 Autenticadas (Qualquer usuário logado)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | [``/patients``](#1-📋-listar-pacientes) | Lista pacientes (Seus pacientes ou todos se for Admin). |

### 🏥 Operacional (Terapeuta Responsável)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | [``/patients/:targetId``](#2-🔍-buscar-paciente-por-id) | Consulta o prontuário/detalhes de uma paciente. |
| **POST** | [``/patients``](#3-➕-cadastrar-paciente) | Inicia um novo ciclo de atendimento (Cadastro). |
| **PUT** | [``/patients/:targetId``](#4-✏️-atualizar-paciente) | Atualiza dados cadastrais (Nome, Telefone, etc). |
| **PATCH** | [``/patients/:targetId/refer``](#5-🏥-encaminhar-paciente) | Finaliza o ciclo e muda status para ``encaminhada``. |
| **DELETE** | [``/patients/:targetId``](#8-🗑️-excluir-paciente-soft-delete) | Move a paciente para a lixeira (Soft Delete). |
| **PATCH** | [``/patients/:targetId/restore``](#9-♻️-restaurar-paciente) | Recupera uma paciente excluída da lixeira. |

### 🛡️ Admin
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **PATCH** | [``/patients/:targetId/unrefer``](#6-↩️-desfazer-encaminhamento) | Reverte status de ``encaminhada`` para ``atendimento``. |
| **PATCH** | [``/patients/:targetId/transfer``](#7-⇄-transferir-paciente-troca-de-terapeuta) | Transfere a responsabilidade para outra terapeuta. |

## 🗄️ Persistência no Banco de Dados
Tabela: ``pacientes``
Coluna               | Tipo         | Nulo  | Observações
-----                | -----        | ----- | -----
 ``id``              | uuid         | ❌   | Chave Primária 
 ``nome``            | varchar      | ❌   | Nome completo
 ``data_nascimento`` | date         | ❌   | Formato YYYY-MM-DD
 ``cpf``             | varchar(11)  |  ❌  | Apenas números, Unique
 ``telefone``        | varchar(20)  | ❌   | Apenas números
 ``status``          | varchar      | ❌   | Enum: 'triagem', 'encaminhada'
 ``terapeuta_id``    | uuid         | ❌   | FK para usuarios (Quem atende)
 ``created_at``      | timestamp    | ❌   | Data de cadastro
 ``deleted_at``      |	timestamp	  | ✅   |	Data de exclusão (Soft Delete). Se nulo, está ativo.

## 🧠 Comportamento dos Campos
### ``id``
- **UUID**
- Gerado automaticamente pelo sistema na criação.

### ``nome``
- **String**
- Nome completo da paciente.

#### ``data_nascimento``
- **Date**
- O backend valida se a data é válida, formatação e se não é futura.

### ``cpf``
- **String (11)**
- Armazena apenas os dígitos (sem pontos ou traço).
- **Validação**: Deve passar pelo algoritmo oficial de CPF e ser único no sistema para evitar duplicidade de prontuários.

### ``telefone``
- **String**
- Principal meio de contato para agendamento das sessões.
- Deve ser sanitizado para conter apenas números antes de salvar.

### ``status``
- **ENUM**
- Define a etapa do ciclo de acolhimento breve.
- Valores:
    - **atendimento**: Estado inicial. Indica que a paciente está realizando o ciclo de consultas (geralmente ~3 sessões).
    - **encaminhada**: Estado final. Indica que o ciclo no laboratório foi concluído e a paciente foi direcionada para a rede de apoio externa.

### ``terapeuta_id``
- **UUID**
- Define a terapeuta responsável pelo acolhimento (FK para usuarios).
- Uma paciente sempre deve ter uma terapeuta vinculada desde o cadastro.

### ``created_at``
- **Timestamp**
- Data de entrada da paciente no sistema.

### ``deleted_at``
- **Timestamp (Nullable)**
- Controla a exclusão lógica (Lixeira).
- Se estiver preenchido, a paciente é considerada excluída e não aparece nas listagens padrões.
- Se estiver `NULL`, a paciente está ativa.

## 🧩 Responsabilidades do Módulo
- **CRUD Completo**: Criação, Leitura, Atualização (Delete não implementado por segurança de dados).
- **Segurança de Dados Sensíveis**: Garantir que informações das pacientes sejam acessadas apenas pela terapeuta responsável e administradores.
- **Validação**: Garantir integridade de CPF e datas.

## Rotas

### 1. 📋 Listar Pacientes
#### ``GET /patients``
Retorna a lista paginada de pacientes.

#### 🎯 Objetivo da Rota
- **Visão Geral:** Permitir que administradores vejam o volume total de atendimentos.
- **Operacional:** Permitir que a terapeuta veja rapidamente sua lista de "Minhas Pacientes".

#### 🔐 Autorização
- Requer autenticação.
- **Regra de Negócio:**
    - **Admin:** Retorna todos os pacientes.
    - **Comum (Terapeuta):** O sistema força um filtro `WHERE terapeuta_id = id_logado`.

#### 📥 Query Parameters
| Parâmetro | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| ``page`` | number | 1 | Página atual. |
| ``limit`` | number | 10 | Itens por página. |
| ``nome`` | string | - | (Opcional) Filtra por parte do nome (Case Insensitive). |
| ``userId`` | uuid | - | (Opcional) Filtra por terapeuta responsável. |
| ``status`` | string | - | (Opcional) Filtra por 'atendimento' ou 'encaminhada'. |
| ``orderBy`` | string | 'nome' | Campo de ordenação ('nome', 'created_at'). |
| ``direction`` | string | 'ASC' | 'ASC' ou 'DESC'. |
| ``deleted`` |	boolean	| ``false``	| Se ``true``, lista apenas pacientes da lixeira. |

#### 📤 Response — Sucesso (200)
````JSON
{
  "data": [
    {
      "id": "a1b2c3d4-...",
      "nome": "Maria Souza",
      "dataNascimento": "1990-05-15",
      "cpf": "12345678900",
      "telefone": "85999999999",
      "status": "atendimento",
      "terapeutaId": "user-uuid-xyz",
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "totalItems": 50,
    "totalPages": 5,
    "currentPage": 1,
    "itemsPerPage": 10,
    "filterName": "Maria"
  },
  "error": null
}
````

#### ❌ Possíveis Erros
- **401 Unauthorized:** Token inválido ou expirado.
- **500 Internal Server Error:** Erro de conexão com o banco.

---

### 2. 🔍 Buscar Paciente por ID
#### ``GET /patients/:targetId``
Retorna os detalhes completos de uma paciente específica.

#### 🎯 Objetivo da Rota
- Exibir o "Prontuário" ou ficha cadastral detalhada da paciente antes de iniciar uma sessão.

#### 🔐 Autorização
- Requer autenticação.
- **Validação de Propriedade:** Se o usuário não for Admin, ele só pode ver pacientes vinculados ao seu ID. Caso contrário, recebe erro.

#### 📥 Path Parameters
| Parâmetro | Tipo | Obrigatório |
| :--- | :--- | :--- |
| ``targetId`` | UUID | ✅ |

#### 📤 Response — Sucesso (200)
````JSON
{
  "data": {
      "id": "a1b2c3d4-...",
      "nome": "Maria Souza",
      "dataNascimento": "1990-05-15",
      "cpf": "12345678900",
      "telefone": "85999999999",
      "status": "atendimento",
      "terapeutaId": "user-uuid-xyz",
      "createdAt": "2025-01-01T10:00:00.000Z"
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
- **400 Bad Request:** ID inválido (não é um UUID).
- **401 Unauthorized:** Token inválido.
- **404 Not Found:** Paciente não existe OU o usuário logado não tem permissão para vê-la.

---

### 3. ➕ Cadastrar Paciente
#### ``POST /patients``
Registra uma nova paciente no sistema para iniciar o ciclo de acolhimento.

#### 🎯 Objetivo da Rota
- Inserir a paciente no banco e vincular imediatamente a uma terapeuta responsável.
- Disparar notificações automáticas para a terapeuta e admins.

#### 🔐 Autorização
- Requer autenticação.
- Requer permissão explícita ``perm_cadastro``.

#### 📥 Request Body
````JSON
{
  "nome": "João da Silva",
  "dataNascimento": "1985-10-20",
  "cpf": "12345678900",
  "telefone": "85988887777",
  "terapeutaId": "uuid-do-terapeuta"
}
````

#### 📤 Response — Sucesso (201)
````JSON
{
  "data": {
      "id": "novo-uuid-gerado",
      "nome": "João da Silva",
      "status": "atendimento",
      "terapeutaId": "uuid-do-terapeuta",
      "createdAt": "..."
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
- **400 Bad Request:**
    - CPF inválido (dígito verificador incorreto).
    - CPF já cadastrado no sistema.
    - Campos obrigatórios faltando.
- **401 Unauthorized:** Token inválido.
- **403 Forbidden:** Usuário logado não tem permissão ``perm_cadastro``.
- **404 Not Found:** O ``terapeutaId`` informado não existe no banco.

---

### 4. ✏️ Atualizar Paciente
#### ``PUT /patients/:targetId``
Atualiza os dados cadastrais ou o status da paciente.

#### 🎯 Objetivo da Rota
- Corrigir erros de digitação ou atualizar contato.

#### 🔐 Autorização
- Requer autenticação.
- Apenas a Terapeuta Responsável pela paciente (ou Admin) pode editar os dados.

#### 📥 Request Body (Exemplo Parcial)
````JSON
{
  "telefone": "85999990000",
  "status": "encaminhada"
}
````

#### 📤 Response — Sucesso (200)
````JSON
{
  "data": {
      "id": "uuid-da-paciente",
      "nome": "Maria Souza",
      "telefone": "85999990000",
      "status": "encaminhada",
      "...": "..."
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
- **400 Bad Request:** Dados inválidos (ex: status que não existe no Enum).
- **401 Unauthorized:** Token inválido.
- **403 Forbidden:** Sem permissão de edição.
- **404 Not Found:** Paciente não encontrada.

### 5. 🏥 Encaminhar Paciente
#### ``PATCH /patients/:targetId/refer``
Finaliza o ciclo de acolhimento e altera o status da paciente para ``encaminhada``.

#### 🎯 Objetivo da Rota
- Formalizar que a paciente concluiu o ciclo na clínica escola e foi direcionada para a rede externa.
- **Nota:** Esta ação remove a paciente da lista de "atendimentos ativos".

#### 🔐 Autorização
- Requer autenticação.
- **Restrição:** Apenas a **Terapeuta Responsável** pela paciente pode realizar o encaminhamento.

#### 📤 Response — Sucesso (200)
````JSON
{
  "data": {
      "id": "uuid-da-paciente",
      "nome": "Maria Souza",
      "status": "encaminhada",
      "terapeutaId": "uuid-terapeuta",
      "updatedAt": "2025-10-25T14:00:00.000Z"
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
- **403 Forbidden:** Usuário logado não é a terapeuta responsável pela paciente.
- **404 Not Found:** Paciente não encontrada.
- **409 Conflict:** Paciente já está com status 'encaminhada'.

---

### 6. ↩️ Desfazer Encaminhamento
#### ``PATCH /patients/:targetId/unrefer``
Reverte o status da paciente de ``encaminhada`` para ``atendimento``.

#### 🎯 Objetivo da Rota
- Corrigir encaminhamentos feitos por engano.
- Reabrir o caso para novos atendimentos no laboratório.

#### 🔐 Autorização
- Requer autenticação.
- **Restrição:** Apenas **Administradores** podem desfazer um encaminhamento.

#### 📤 Response — Sucesso (200)
````JSON
{
  "data": {
      "id": "uuid-da-paciente",
      "nome": "Maria Souza",
      "status": "atendimento",
      "terapeutaId": "uuid-terapeuta"
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
- **403 Forbidden:** Usuário logado não tem permissão de Administrador (perm_admin).
- **400 Bad Request:** A paciente não está no status 'encaminhada'.
- **404 Not Found:** Paciente não encontrada.

### 7. ⇄ Transferir Paciente (Troca de Terapeuta)
#### ``PATCH /patients/:targetId/transfer``
Transfere a responsabilidade de uma paciente para outra terapeuta.

#### 🎯 Objetivo da Rota
- Permitir a troca de profissional em casos de: rotatividade de alunos, incompatibilidade de horários ou saída da terapeuta atual.
- **Importante:** Esta ação altera apenas a **responsabilidade atual**. O histórico de sessões passadas permanece vinculado à terapeuta que realizou o atendimento na época, garantindo a integridade do prontuário.

#### 🔐 Autorização
- Requer autenticação.
- **Restrição:** Apenas **Administradores** podem realizar transferências.

#### 📥 Request Body
````JSON
{
  "newTherapistId": "uuid-da-nova-terapeuta"
}
````

#### 📤 Response — Sucesso (200)
````JSON
{
  "data": {
      "id": "uuid-da-paciente",
      "nome": "Maria Souza",
      "status": "atendimento",
      "terapeutaId": "uuid-da-nova-terapeuta",
      "updatedAt": "2025-11-01T10:00:00.000Z"
  },
  "meta": {
      "message": "Paciente transferida com sucesso."
  },
  "error": null
}
````

#### ❌ Possíveis Erros
- **400 Bad Request:** ID do novo terapeuta inválido ou ausente.
- **403 Forbidden:** Usuário logado não é Administrador.
- **404 Not Found:** Paciente não encontrada OU Nova Terapeuta não encontrada.

### 8. 🗑️ Excluir Paciente (Soft Delete)
#### ``DELETE /patients/:targetId``
Move a paciente para a lixeira (preenche o campo `deleted_at`), removendo-a das listagens padrões.

#### 🎯 Objetivo da Rota
- Remover pacientes criadas por engano ou que desistiram antes do processo iniciar.
- **Segurança:** Não apaga o registro físico do banco, mantendo histórico de auditoria.

#### 🔐 Autorização
- Requer autenticação.
- **Permissão:** Apenas **Admin** ou a **Terapeuta Responsável** podem excluir.

#### 📤 Response — Sucesso (204)
Não retorna conteúdo (`No Content`).

#### ❌ Possíveis Erros
- **403 Forbidden:** Usuário não tem permissão sobre esta paciente.
- **404 Not Found:** Paciente não encontrada (ou já excluída).

### 9. ♻️ Restaurar Paciente
#### ``PATCH /patients/:targetId/restore``
Recupera uma paciente da lixeira, tornando-a ativa novamente (limpa o campo `deleted_at`).

#### 🎯 Objetivo da Rota
- Corrigir exclusões acidentais.

#### 🔐 Autorização
- Requer autenticação.
- **Permissão:** Apenas **Admin** ou a **Terapeuta Responsável** podem restaurar.

#### 📤 Response — Sucesso (200)
Retorna os dados da paciente recuperada.
&&&&JSON
{
  "data": {
      "id": "uuid-da-paciente",
      "nome": "Maria Souza",
      "status": "atendimento",
      "deletedAt": null
  },
  "meta": {
      "message": "Paciente restaurada com sucesso."
  },
  "error": null
}
&&&&

#### ❌ Possíveis Erros
- **400 Bad Request:** Erro ao restaurar (talvez a paciente não estivesse excluída).
- **403 Forbidden:** Sem permissão.
- **404 Not Found:** ID não encontrado.