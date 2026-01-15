# 🏥 Módulo Patient (Pacientes)

O módulo de Pacientes gerencia os cadastros administrativos, vínculos com terapeutas e status de atendimento.
Possui regras de visibilidade baseadas no vínculo (Terapeuta) e permissão de gestão (Coordenação).

### [↩️ Voltar ao README principal](../README.md)

---

## 🗺️ Sumário das Rotas

### 🔐 Gestão & Terapeutas
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | [``/patients``](#2-listar-pacientes) | Lista pacientes (Filtros: nome, status, terapeuta). |
| **GET** | [``/patients/:targetId``](#3-buscar-paciente-por-id) | Detalhes do paciente e nome da terapeuta responsável. |
| **PUT** | [``/patients/:targetId``](#4-atualizar-paciente) | Atualiza dados cadastrais (Nome, CPF, etc). |
| **DELETE** | [``/patients/:targetId``](#8-excluir-paciente) | Realiza a exclusão lógica (Soft Delete). |
| **PATCH** | [``/patients/:targetId/restore``](#9-restaurar-paciente) | Restaura um paciente excluído. |

### 🏥 Cadastro e Vínculo (Requer `perm_cadastro`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **POST** | [``/patients``](#1-criar-paciente) | Cria um novo paciente e vincula a uma terapeuta. |
| **PATCH** | [``/patients/:targetId/transfer``](#7-transferir-paciente) | Transfere o paciente para outra terapeuta. |

### 🛂 Fluxo de Alta
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **PATCH** | [``/patients/:targetId/refer``](#5-encaminhar-paciente) | Muda status para "Encaminhada". (Apenas a Terapeuta dona). |
| **PATCH** | [``/patients/:targetId/unrefer``](#6-desfazer-encaminhamento) | Reativa status para "Atendimento". (Apenas Admin). |

---

## 🧠 Regras de Negócio

### 1. Visibilidade e Edição
* **Terapeutas:** Acessam e editam apenas seus próprios pacientes. Tentar acessar paciente de outra colega gera erro `403 Forbidden`.
* **Coordenação (`perm_cadastro`):** Pode listar, visualizar e editar os dados cadastrais de **qualquer** paciente.

### 2. Validação de CPF
* O sistema valida o **algoritmo matemático** do CPF (dígitos verificadores).
* O CPF deve ser único no sistema.

### 3. Ciclo de Vida
* **Atendimento:** Status padrão. O paciente está ativo.
* **Encaminhada:** O paciente recebeu alta ou foi encaminhado.
* **Exclusão:** O sistema usa *Soft Delete*. O registro não é apagado do banco, apenas marcado com `deleted_at`.

---

## 🗄️ Persistência (Banco de Dados)

**Tabela: `pacientes`**

| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | uuid | ✅ | PK. |
| `nome` | varchar | ✅ | Nome completo. |
| `data_nascimento` | date | ✅ | Formato YYYY-MM-DD. |
| `cpf` | varchar | ✅ | 11 dígitos (apenas números). Único. |
| `telefone` | varchar | ✅ | Apenas números. |
| `terapeuta_id` | uuid | ✅ | FK para usuarios. |
| `status` | varchar | ✅ | 'atendimento' ou 'encaminhada'. |
| `created_at` | timestamp | ✅ | Data de cadastro. |
| `deleted_at` | timestamp | ❌ | Se preenchido, paciente está na lixeira. |

---

## 📋 Regras de Validação (Campos)

Todos os endpoints aplicam as seguintes validações (Erro `400 Bad Request`).

| Campo | Regra / Cenário | Mensagem de Erro |
| :--- | :--- | :--- |
| **Nome** | Vazio. | "O campo nome é obrigatório." |
| **CPF** | Algoritmo inválido.<br>Formato incorreto. | "CPF inválido." |
| **Telefone** | Menos de 8 ou mais de 20 dígitos. | "Telefone inválido." |
| **Data Nascimento** | Formato inválido (não ISO). | "Data inválida." |
| **Terapeuta ID** | UUID inválido. | "ID de terapeuta inválido." |

---

## 📡 Referência da API

### 1. Criar Paciente (Requer `perm_cadastro`)
`POST /patients`

Cria um paciente e o vincula imediatamente a uma terapeuta ativa.

**Body:**
````json
{
  "nome": "Paciente Exemplo",
  "dataNascimento": "1990-01-01",
  "cpf": "12345678909",
  "telefone": "11999998888",
  "terapeutaId": "uuid-da-terapeuta"
}
````

**Response (201):**
````json
{
  "data": {
    "patient": {
      "id": "uuid...",
      "nome": "Paciente Exemplo",
      "status": "atendimento",
      "terapeutaId": "uuid-da-terapeuta",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Erros de Negócio
* `409 Conflict`: CPF já cadastrado.
* `404 Not Found`: O ID da terapeuta informado não existe.

---

### 2. Listar Pacientes
`GET /patients`

Lista os pacientes.
* **Terapeuta:** Vê apenas os seus.
* **Coordenação:** Pode ver de todos ou filtrar por terapeuta específico.

**Query Params:**
* `page`, `limit`, `orderBy`, `direction`.
* `nome`: Filtro parcial por nome do paciente.
* `status`: `atendimento` ou `encaminhada`.
* `deleted`: `true` (ver lixeira) ou `false` (padrão).
* `userTargetId`: (Apenas Coordenação) Filtrar pacientes de uma terapeuta específica.

**Response (200):**
````json
{
  "data": [
    {
      "patient": {
        "id": "uuid...",
        "nome": "Paciente A",
        "status": "atendimento"
      }
    }
  ],
  "meta": {
    "totalItems": 50,
    "page": 1
  }
}
````

---

### 3. Buscar Paciente por ID
`GET /patients/:targetId`

Retorna dados do paciente e o nome da terapeuta responsável.

**Response (200):**
````json
{
  "data": {
    "patient": { "id": "...", "nome": "..." },
    "therapist": { "id": "...", "nome": "Dra. Ana" }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Erros de Negócio
* `403 Forbidden`: Este paciente pertence a outra terapeuta e você não tem permissão de cadastro.

---

### 4. Atualizar Paciente
`PUT /patients/:targetId`

Atualiza dados cadastrais. Se alterar o CPF, verifica unicidade novamente.

**Body (Parcial):**
````json
{
  "telefone": "11988887777",
  "nome": "Nome Corrigido"
}
````

#### ❌ Erros de Negócio
* `409 Conflict`: O novo CPF já pertence a outro paciente.
* `403 Forbidden`: Você não tem permissão para editar este paciente.

---

### 5. Encaminhar Paciente (Apenas Terapeuta)
`PATCH /patients/:targetId/refer`

Muda o status para `encaminhada`. Usado em casos de alta ou encaminhamento externo.

#### ❌ Erros de Negócio
* `409 Conflict`: Paciente já está com status 'encaminhada'.
* `403 Forbidden`: Você não é a terapeuta responsável por este paciente.

---

### 6. Desfazer Encaminhamento (Apenas Admin)
`PATCH /patients/:targetId/unrefer`

Reativa um paciente encaminhado, voltando o status para `atendimento`.

#### ❌ Erros de Negócio
* `400 Bad Request`: O paciente não está com status 'encaminhada'.

---

### 7. Transferir Paciente (Requer `perm_cadastro`)
`PATCH /patients/:targetId/transfer`

Transfere a responsabilidade do paciente para outra terapeuta.

**Body:**
````json
{
  "newTherapistId": "uuid-da-nova-terapeuta"
}
````

#### ❌ Erros de Negócio
* `404 Not Found`: Paciente ou Nova Terapeuta não encontrados.

---

### 8. Excluir Paciente
`DELETE /patients/:targetId`

Remove o paciente da listagem principal (Soft Delete).

### 9. Restaurar Paciente
`PATCH /patients/:targetId/restore`

Recupera um paciente da lixeira.

---

### 🔔 Notificações Geradas

| Gatilho (Rota) | Público | Título | Mensagem |
| :--- | :--- | :--- | :--- |
| `POST /patients` | **Admin** | Novo Paciente | "Novo paciente cadastrado: [Nome] vinculado a [Terapeuta]." |
| `POST /patients` | **Terapeuta** | Novo Paciente | "Você tem um novo paciente: [Nome]." |
| `PATCH .../transfer` | **Terapeuta** | Novo Paciente | "Você tem um novo paciente: [Nome] (Transferido)." |