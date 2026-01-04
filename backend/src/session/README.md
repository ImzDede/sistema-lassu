# 📅 Módulo Sessions

O módulo Sessions gerencia os agendamentos, o histórico de atendimentos e a evolução do tratamento. É o coração operacional da clínica.

## 🗄️ Persistência no Banco de Dados
#### ``Tabela: sessoes``

| Coluna | Tipo | Nulo | Observações |
| :--- | :--- | :--- | :--- |
| id | serial | ❌ | Inteiro, Auto-incremento (PK) |
| paciente_id | uuid | ❌ | FK para pacientes |
| usuario_id | uuid | ❌ | FK para usuarios (Terapeuta) |
| dia | date | ❌ | Data da sessão (YYYY-MM-DD) |
| hora | integer | ❌ | Hora cheia (Ex: 8, 14, 16) |
| sala | integer | ❌ | Número da sala física |
| status | varchar | ❌ | Enum de Status |
| anotacoes | text | ✅ | Campo livre para evolução/obs |
| created_at | timestamp | ❌ | Data de criação |
| deleted_at | timestamp | ✅ | Soft Delete (se nulo, está ativo) |

## 🧠 Comportamento dos Campos

### ``dia`` e ``hora``
- **Dia:** String no formato ISO `YYYY-MM-DD`.
- **Hora:** Número inteiro representando a hora de início (ex: `14` para 14:00).
- **Regra de Conflito:** O sistema impede que uma mesma terapeuta tenha duas sessões ativas (status != cancelada) no mesmo `dia` e `hora`.

### ``status``
- Controla o ciclo de vida do agendamento.
- **Valores Permitidos:**
    - `agendada`: Estado inicial.
    - `realizada`: Sessão ocorreu com sucesso (Gera pagamento/histórico).
    - `falta`: Paciente não compareceu.
    - `cancelada_paciente`: Paciente avisou com antecedência.
    - `cancelada_terapeuta`: Terapeuta precisou desmarcar.

### ``sala``
- Número da sala física.
- Útil para gestão de espaço na clínica escola.

### ``anotacoes``
- Texto livre para a terapeuta registrar a evolução breve ou lembretes sobre a sessão.
- **Privacidade:** Apenas a terapeuta responsável e admins podem ler.

---

## 🧩 Responsabilidades do Módulo

- **Agendamento:** Garantir que não existam choques de horário (Conflitos).
- **Integridade:** Garantir que uma terapeuta só agende pacientes vinculados a ela.
- **Auditoria:** Manter histórico de status (se o paciente faltou, se foi remarcado).
- **Notificações:** Avisar Admins sobre novos agendamentos.

---

## Rotas

### 1. 📅 Listar Sessões (Agenda)
#### ``GET /sessions``
Retorna a lista de sessões, geralmente filtrada por período.

#### 🎯 Objetivo da Rota
- Alimentar o calendário do frontend.
- Permitir filtros por data (início/fim) para carregar a semana ou mês.

#### 🔐 Autorização
- Requer autenticação.
- **Regra:**
    - **Admin:** Vê tudo (pode filtrar por `userId` específico).
    - **Terapeuta:** Vê apenas suas próprias sessões.

#### 📥 Query Parameters
| Parâmetro | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| ``dataInicio`` | string | - | (Opcional) YYYY-MM-DD. |
| ``dataFim`` | string | - | (Opcional) YYYY-MM-DD. |
| ``pacienteId`` | uuid | - | (Opcional) Filtrar histórico de um paciente. |
| ``status`` | string | - | (Opcional) Filtrar por status. |

#### 📤 Response — Sucesso (200)
````JSON
{
  "data": [
    {
      "id": 105,
      "pacienteId": "uuid-paciente",
      "pacienteNome": "Maria Souza",
      "usuarioId": "uuid-terapeuta",
      "dia": "2025-10-20",
      "hora": 14,
      "sala": 2,
      "status": "agendada",
      "anotacoes": null
    }
  ],
  "meta": {
    "totalItems": 15,
    "filterStart": "2025-10-01",
    "filterEnd": "2025-10-31"
  },
  "error": null
}
````

#### ❌ Possíveis Erros
- **400 Bad Request:** Datas inválidas.

---

### 2. ➕ Criar Sessão (Agendar)
#### ``POST /sessions``
Cria um novo agendamento.

#### 🎯 Objetivo da Rota
- Validar disponibilidade da terapeuta (conflito de horário).
- Validar vínculo (Terapeuta x Paciente).

#### 🔐 Autorização
- Requer autenticação.
- Só pode agendar para pacientes vinculados a si mesma (salvo Admin).

#### 📥 Request Body
````JSON
{
  "pacienteId": "uuid-paciente",
  "dia": "2025-10-20",
  "hora": 14,
  "sala": 2,
  "anotacoes": "Primeira sessão de acolhimento"
}
````

#### 📤 Response — Sucesso (201)
````JSON
{
  "data": {
      "id": 106,
      "status": "agendada",
      "dia": "2025-10-20",
      "hora": 14,
      "sala": 2
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
- **400 Bad Request:** Campos inválidos ou data no passado.
- **403 Forbidden:** Paciente não pertence a esta terapeuta.
- **409 Conflict:** Terapeuta já possui agendamento neste dia/hora.

---

### 3. 📝 Evolução (Mudar Status)
#### ``PATCH /sessions/:id/status``
Atualiza o status da sessão (confirmar presença, marcar falta, etc).

#### 🎯 Objetivo da Rota
- Registrar o que aconteceu na sessão.
- Finalizar o fluxo do atendimento.

#### 📥 Request Body
````JSON
{
  "status": "realizada",
  "anotacoes": "Paciente relatou melhora no quadro..."
}
````

#### 📤 Response — Sucesso (200)
Retorna a sessão atualizada.

#### ❌ Possíveis Erros
- **400 Bad Request:** Status inválido ou transição proibida.

---

### 4. ✏️ Remarcar / Editar
#### ``PUT /sessions/:id``
Altera dados críticos da sessão (Dia, Hora, Sala).

#### 🎯 Objetivo da Rota
- Remarcar atendimentos.
- **Atenção:** Ao mudar dia/hora, o sistema deve verificar conflitos novamente (ignorando a própria sessão atual).

#### 📥 Request Body (Parcial)
````JSON
{
  "dia": "2025-10-21",
  "hora": 15
}
````

#### 📤 Response — Sucesso (200)
````JSON
{
  "data": {
     "id": 106,
     "dia": "2025-10-21",
     "hora": 15,
     "status": "agendada"
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros
- **409 Conflict:** Novo horário já está ocupado.

---

### 5. 🗑️ Cancelar (Excluir)
#### ``DELETE /sessions/:id``
Realiza a exclusão lógica (Soft Delete) do agendamento.

#### 🎯 Objetivo da Rota
- Remover da agenda caso tenha sido criado por engano.
- Para cancelamentos oficiais, prefira usar a rota de Status (`cancelada_...`).

#### 📤 Response — Sucesso (200 ou 204)
````JSON
{
  "data": {
     "message": "Sessão removida."
  },
  "meta": {},
  "error": null
}
````