# 📅 Módulo Sessions

O módulo Sessions é responsável exclusivamente pela Gestão de Agenda e marcação de sessões.

## 🗄️ Persistência no Banco de Dados
#### `Tabela: sessoes`

| Coluna | Tipo | Nulo | Observações |
| :--- | :--- | :--- | :--- |
| id | serial | ❌ | Inteiro, Auto-incremento (PK) |
| paciente_id | uuid | ❌ | FK para pacientes |
| usuario_id | uuid | ❌ | FK para usuarios (Terapeuta) |
| dia | date | ❌ | Data da sessão (YYYY-MM-DD) |
| hora | integer | ❌ | Hora cheia (Ex: 8, 14, 16) |
| sala | integer | ❌ | Número da sala física |
| status | varchar | ❌ | Enum de Status |
| updated_at | timestamp | ✅ | Data da última atualização |
| created_at | timestamp | ❌ | Data de criação (Default NOW) |

## 🧠 Regras de Negócio

### `dia` e `hora`
- **Dia:** String no formato ISO `YYYY-MM-DD`.
- **Hora:** Número inteiro representando a hora de início (ex: `14` para 14:00).
- **Regra de Conflito:** O sistema impede:
    1. Mesma **Sala** ocupada no mesmo horário.
    2. Mesma **Terapeuta** ocupada no mesmo horário.

### `status`
- **Valores Permitidos:**
    - `agendada` (Padrão ao criar)
    - `realizada`
    - `falta`
    - `cancelada_paciente`
    - `cancelada_terapeuta`

---

## Rotas

### 1. 📅 Listar Sessões (Agenda)
#### `GET /sessions`
Retorna a lista de sessões filtrada.

#### 📥 Query Parameters (`SessionListDTO`)
| Parâmetro | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `start` | string | ✅ | Início (YYYY-MM-DD) |
| `end` | string | ✅ | Fim (YYYY-MM-DD) |
| `status` | string | ❌ | Filtro de status |
| `patientTargetId` | uuid | ❌ | Filtrar por paciente |
| `userTargetId` | uuid | ❌ | (Admin) Filtrar por terapeuta |

#### 📤 Response — Sucesso (200)
````json
{
  "data": [
    {
      "session": {
        "id": 105,
        "dia": "2025-10-20",
        "hora": 14,
        "sala": 2,
        "status": "agendada"
      },
      "therapist": {
        "id": "uuid-terapeuta",
        "nome": "Dra. Ana"
      },
      "patient": {
        "id": "uuid-paciente",
        "nome": "Maria Souza"
      }
    }
  ],
  "meta": { "totalItems": 1 },
  "error": null
}
````

---

### 2. 🔍 Ver Detalhes
#### `GET /sessions/:targetId`
Retorna os dados completos de uma sessão específica.

#### 📤 Response — Sucesso (200)
````json
{
  "data": {
      "session": {
        "id": 105,
        "dia": "2025-10-20",
        "hora": 14,
        "sala": 2,
        "status": "cancelada_paciente",
        "updatedAt": "2025-10-19T10:00:00Z",
        "createdAt": "2025-10-01T10:00:00Z"
      },
      "therapist": {
        "id": "uuid-terapeuta",
        "nome": "Dra. Ana"
      },
      "patient": {
        "id": "uuid-paciente",
        "nome": "Maria Souza"
      }
  },
  "meta": {},
  "error": null
}
````

---

### 3. ➕ Criar Sessão (Agendar)
#### `POST /sessions`

#### 📥 Request Body (`SessionCreateDTO`)
````json
{
  "pacienteId": "uuid-paciente",
  "dia": "2025-10-20",
  "hora": 14,
  "sala": 2
}
````

#### 📤 Response — Sucesso (201)
````json
{
  "data": {
    "session": {
      "id": 106,
      "dia": "2025-10-20",
      "hora": 14,
      "sala": 2,
      "status": "agendada",
      "createdAt": "2025-10-05T14:30:00Z"
    },
    "patient": {
      "id": "uuid-paciente",
      "nome": "Maria Souza"
    }
  },
  "meta": {},
  "error": null
}
````

---

### 4. 📝 Atualizar Status
#### `PATCH /sessions/:targetId/status`

#### 📥 Request Body (`SessionUpdateStatusDTO`)
````json
{
  "status": "realizada"
}
````

#### 📤 Response — Sucesso (200)
````json
{
  "data": {
    "session": {
      "id": 105,
      "status": "realizada",
      "updatedAt": "2025-10-20T14:05:00Z"
    }
  },
  "meta": {},
  "error": null
}
````

---

### 5. 🔄 Remarcar (Reschedule)
#### `PUT /sessions/:targetId/reschedule`
Cancela a sessão atual e cria uma nova imediatamente (Atômico).

#### 📥 Request Body (`SessionRescheduleDTO`)
````json
{
  "dia": "2025-10-25",
  "hora": 16,
  "sala": 2,
  "statusCancelamento": "cancelada_paciente"
}
````

#### 📤 Response — Sucesso (200)
*Retorna a nova sessão criada e a antiga cancelada.*

````json
{
  "data": {
    "session": {
      "id": 107,
      "dia": "2025-10-25",
      "hora": 16,
      "sala": 2,
      "status": "agendada",
      "createdAt": "2025-10-20T18:00:00Z"
    },
    "canceledSession": {
       "id": 105,
       "dia": "2025-10-20",
       "hora": 14,
       "sala": 2,
       "status": "cancelada_paciente",
       "updatedAt": "2025-10-20T18:00:00Z"
    }
  },
  "meta": {},
  "error": null
}
````

---

### 6. ✏️ Edição (Dia/Hora/Sala)
#### `PUT /sessions/:targetId`
Atualiza dados da sessão existente (sem criar nova). Valida conflitos.

#### 📥 Request Body (`SessionUpdateDTO`)
*Campos opcionais (Partial)*
````json
{
  "sala": 5,
  "hora": 15
}
````

#### 📤 Response — Sucesso (200)
````json
{
  "data": {
    "session": {
      "id": 105,
      "dia": "2025-10-20",
      "hora": 15,
      "sala": 5,
      "status": "agendada",
      "updatedAt": "2025-10-10T09:00:00Z"
    }
  },
  "meta": {},
  "error": null
}
````

---

### 7. 🗑️ Excluir
#### `DELETE /sessions/:targetId`
Remove a sessão do banco (Hard Delete).

#### 📤 Response — Sucesso (204)
*Sem corpo de resposta (No Content).*