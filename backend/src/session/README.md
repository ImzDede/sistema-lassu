# 🛋️ Módulo Session (Sessões)

O módulo de Sessões é o coração do agendamento. Ele gerencia os atendimentos, alocação de salas e o histórico clínico/financeiro.
Possui lógica robusta para evitar **conflitos de agenda** (duas sessões na mesma sala ou mesmo terapeuta no mesmo horário).

### [↩️ Voltar ao README principal](../README.md)

---

## 🗺️ Sumário das Rotas

### 📅 Agendamento e Gestão
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | [``/sessions``](#1-listar-sessões) | Lista sessões por período (obrigatório informar datas). |
| **POST** | [``/sessions``](#2-agendar-sessão) | Cria um novo agendamento. |
| **GET** | [``/sessions/:targetId``](#3-buscar-sessão-por-id) | Detalhes de uma sessão específica. |

### 🔄 Alteração de Estado e Agenda
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **PATCH** | [``/sessions/:targetId/status``](#4-atualizar-status) | Atualiza apenas a situação (Realizada, Falta, Cancelada). |
| **PUT** | [``/sessions/:targetId/reschedule``](#5-reagendar-sessão) | **Flow complexo:** Cancela a atual e cria uma nova em outro horário. |
| **PUT** | [``/sessions/:targetId``](#6-editar-detalhes) | Altera sala ou horário da mesma sessão (correção administrativa). |
| **DELETE** | [``/sessions/:targetId``](#7-excluir-sessão) | Remove o registro do banco (Exclusão permanente). |

---

## 🧠 Regras de Negócio

### 1. Prevenção de Conflitos
O sistema impede agendamentos se:
* **Conflito de Sala:** Já existe uma sessão `agendada` ou `realizada` naquela Sala + Dia + Hora.
* **Conflito de Terapeuta:** A terapeuta já tem outro paciente agendado naquele Dia + Hora.

### 2. Visibilidade
* **Admin:** Pode ver e gerenciar sessões de qualquer pessoa.
* **Terapeuta:** Só vê sessões onde ela é a responsável (`usuario_id`) e de seus próprios pacientes.

### 3. Reagendamento (Smart Logic)
A rota de reagendar (`PUT .../reschedule`) não apenas muda a data. Ela:
1.  Verifica se o novo horário está livre.
2.  Marca a sessão original como `cancelada` (mantendo o histórico).
3.  Cria uma **nova** sessão com o novo horário.

---

## 🗄️ Persistência (Banco de Dados)

**Tabela: `sessoes`**

| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | serial | ✅ | PK. |
| `paciente_id` | uuid | ✅ | FK para pacientes. |
| `usuario_id` | uuid | ✅ | FK para usuarios (Terapeuta). |
| `dia` | date | ✅ | YYYY-MM-DD. |
| `hora` | int | ✅ | Hora cheia (8 a 17). |
| `sala` | int | ✅ | Número da sala. |
| `status` | varchar | ✅ | Enum de status (veja abaixo). |
| `created_at` | timestamp | ✅ | Data de criação. |
| `updated_at` | timestamp | ❌ | Data da última alteração. |

**Status Possíveis:**
* `agendada` (Padrão ao criar)
* `realizada` (Concluída com sucesso)
* `falta` (Paciente não apareceu)
* `cancelada_paciente` (Aviso prévio do paciente)
* `cancelada_terapeuta` (Imprevisto da terapeuta)

---

## 📋 Regras de Validação (Campos)

Todos os endpoints aplicam as seguintes validações (Erro `400 Bad Request`).

| Campo | Regra / Cenário | Mensagem de Erro |
| :--- | :--- | :--- |
| **Data (Start/End/Dia)** | Formato YYYY-MM-DD. | "Data inválida. Use o formato AAAA-MM-DD." |
| **Hora** | Inteiro entre 8 e 17. | "Hora inválida." |
| **Sala** | Número maior que 0. | "Sala inválida." |
| **Filtro de Lista** | `start` e `end` são obrigatórios. | "Datas de início e fim são obrigatórias." |

---

## 📡 Referência da API

### 1. Listar Sessões
`GET /sessions`

Lista atendimentos dentro de um intervalo de datas.
* **Terapeuta:** Vê sua agenda.
* **Admin:** Vê a agenda da clínica toda (pode filtrar por usuário).

**Query Params:**
* `start`: Data inicial YYYY-MM-DD (**Obrigatório**).
* `end`: Data final YYYY-MM-DD (**Obrigatório**).
* `status`: Filtrar por status (ex: `agendada`).
* `patientTargetId`: Filtrar por paciente específico.
* `userTargetId`: (Admin) Filtrar por terapeuta.

**Exemplo:** `/sessions?start=2026-01-01&end=2026-01-31&status=agendada`

**Response (200):**
````json
{
  "data": [
    {
      "session": {
        "id": 105,
        "dia": "2026-01-15",
        "hora": 14,
        "sala": 2,
        "status": "agendada"
      },
      "therapist": { "id": "...", "nome": "Dra. Ana" },
      "patient": { "id": "...", "nome": "Paciente X" }
    }
  ],
  "meta": {
    "totalItems": 1
  }
}
````

---

### 2. Agendar Sessão
`POST /sessions`

Cria um agendamento. Verifica automaticamente conflitos de sala e horário.

**Body:**
````json
{
  "pacienteId": "uuid-do-paciente",
  "dia": "2026-01-20",
  "hora": 10,
  "sala": 3
}
````

**Response (201):**
````json
{
  "data": {
    "session": {
      "id": 106,
      "dia": "2026-01-20",
      "hora": 10,
      "sala": 3,
      "status": "agendada",
      "createdAt": "..."
    },
    "patient": { "id": "...", "nome": "Paciente X" }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Erros de Negócio
* `409 Conflict`: "Já existe uma sessão agendada para essa sala nesse horário."
* `409 Conflict`: "Você já tem uma sessão para esse horário."
* `403 Forbidden`: Você não é a terapeuta responsável por este paciente.

---

### 3. Buscar Sessão por ID
`GET /sessions/:targetId`

Retorna detalhes completos da sessão.

**Response (200):**
````json
{
  "data": {
    "session": { "id": 106, "status": "agendada", ... },
    "therapist": { "id": "...", "nome": "..." },
    "patient": { "id": "...", "nome": "..." }
  },
  "meta": {},
  "error": null
}
````

---

### 4. Atualizar Status
`PATCH /sessions/:targetId/status`

Usado para dar baixa (`realizada`) ou marcar faltas/cancelamentos sem mudar o horário.

**Body:**
````json
{
  "status": "realizada"
}
````

**Response (200):**
````json
{
  "data": {
    "session": {
      "id": 106,
      "status": "realizada",
      "updatedAt": "..."
    }
  },
  "meta": {},
  "error": null
}
````

---

### 5. Reagendar Sessão (Smart Reschedule)
`PUT /sessions/:targetId/reschedule`

Cancela a sessão atual e cria uma nova imediatamente.

**Body:**
````json
{
  "dia": "2026-01-22",
  "hora": 11,
  "sala": 3,
  "statusCancelamento": "cancelada_paciente"
}
````

**Response (200):**
````json
{
  "data": {
    "session": {
      "id": 107,
      "dia": "2026-01-22",
      "status": "agendada",
      "createdAt": "..."
    },
    "canceledSession": {
      "id": 106,
      "status": "cancelada_paciente",
      "updatedAt": "..."
    }
  },
  "meta": {},
  "error": null
}
````

#### ❌ Erros de Negócio
* `409 Conflict`: Não foi possível reagendar: Sala já ocupada no novo horário.
* `409 Conflict`: Não foi possível reagendar: Você já tem atendimento no novo horário.

---

### 6. Editar Detalhes
`PUT /sessions/:targetId`

Altera dados da sessão (Dia, Hora, Sala) **sem criar uma nova**. Use com cautela (geralmente para correções de erro de cadastro).

**Body (Parcial):**
````json
{
  "sala": 4
}
````

**Response (200):**
````json
{
  "data": {
    "session": {
      "id": 106,
      "sala": 4,
      "updatedAt": "..."
    }
  },
  "meta": {},
  "error": null
}
````

---

### 7. Excluir Sessão
`DELETE /sessions/:targetId`

**Atenção:** Remove permanentemente o registro do banco.
Para cancelamentos de rotina, prefira usar a rota de Status.

**Response (204):** No Content.

---

### 🔔 Notificações Geradas

| Gatilho (Rota) | Público | Título | Mensagem |
| :--- | :--- | :--- | :--- |
| `POST /sessions` | **Admin** | Nova Sessão | "[Terapeuta] agendou com [Paciente] em [Data] às [Hora]h." |
| `POST /sessions` | **Terapeuta** | Sessão Criada | "Sessão confirmada com [Paciente] em [Data] às [Hora]h." |