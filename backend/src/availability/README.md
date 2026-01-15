# 📅 Módulo Availability (Disponibilidade)

O módulo de Disponibilidade gerencia os horários de atendimento das terapeutas.
A lógica funciona baseada em **substituição total**: ao salvar, a agenda antiga é removida e a nova é gravada.

### [↩️ Voltar ao README principal](../README.md)

---

## 🗺️ Sumário das Rotas

### 🔐 Autenticadas (Qualquer usuário logado)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **PUT** | [``/availability``](#1-gerenciar-disponibilidade-salvar) | Define ou substitui a grade de horários completa. |
| **GET** | [``/availability``](#2-obter-minha-disponibilidade) | Retorna a grade atual cadastrada. |

> **Nota:** Não existe rota `GET /availability/:id` neste módulo.
> * Para ver a agenda de outro usuário (Admin), use a rota `GET /users/:targetId` do módulo **User**.
> * Para buscar terapeutas livres, use `GET /users/available`.

---

## 🧠 Regras de Negócio

### 1. Horários Permitidos
* A clínica funciona das **08:00 às 18:00**.
* Não é permitido agendar horários fora dessa janela.
* A hora de término (`horaFim`) deve ser sempre maior que a de início.

### 2. Validação de Conflito
* O sistema impede automaticamente a sobreposição de horários no mesmo dia.
* *Exemplo:* Se tentar salvar `08-10` e `09-11` no mesmo dia, o sistema rejeita a operação.

### 3. Persistência (Substituição Total)
* A operação de salvar é destrutiva (Método `PUT`): ela apaga toda a disponibilidade anterior do usuário e grava a nova lista enviada.
* Se enviar um array vazio `[]`, o usuário ficará sem horários disponíveis (indisponível).

---

## 🗄️ Persistência (Banco de Dados)

**Tabela: `disponibilidades`**

| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | int | ✅ | PK (Auto Incremento). |
| `usuario_id` | uuid | ✅ | FK para tabela usuarios (Cascade Delete). |
| `dia_semana` | int | ✅ | 0 (Dom) a 6 (Sáb). |
| `hora_inicio` | int | ✅ | 8 a 17. |
| `hora_fim` | int | ✅ | 9 a 18. |

---

## 📋 Regras de Validação (Campos)

Todos os endpoints aplicam as seguintes validações (Erro `400 Bad Request`).

| Campo | Regra / Cenário | Mensagem de Erro |
| :--- | :--- | :--- |
| **diaSemana** | Número fora de 0-6. | "Dia da semana inválido." |
| **horaInicio** | Menor que 8 ou maior que 17. | "Os atendimentos devem ocorrer entre 08:00 e 18:00." |
| **horaFim** | Menor que 9 ou maior que 18.<br>Menor ou igual a horaInicio. | "Os atendimentos devem ocorrer entre 08:00 e 18:00."<br>"A hora final não pode ser anterior à hora inicial." |

---

## 📡 Referência da API

### 1. Gerenciar Disponibilidade (Salvar)
`PUT /availability`

Substitui toda a grade de horários do usuário logado.

**Body:**
````json
[
  {
    "diaSemana": 3,
    "horaInicio": 8,
    "horaFim": 12
  },
  {
    "diaSemana": 1,
    "horaInicio": 14,
    "horaFim": 18
  }
]
````

**Response (200):**
````json
{
  "data": {
    "availability": [
      {
        "diaSemana": 1,
        "horaInicio": 14,
        "horaFim": 18
      },
      {
        "diaSemana": 3,
        "horaInicio": 8,
        "horaFim": 12
      }
    ]
  },
  "meta": {},
  "error": null
}
````

#### ❌ Possíveis Erros de Negócio
**400 Bad Request:**
- Você tem um horário conflitante no dia ${day}. Verifique sua agenda.

---

### 2. Obter Minha Disponibilidade
`GET /availability`

Retorna a grade atual do usuário logado. Se não houver horários, retorna um array vazio.

**Response (200):**
````json
{
  "data": {
    "availability": [
      {
        "diaSemana": 1,
        "horaInicio": 14,
        "horaFim": 18
      }
    ]
  },
  "meta": {},
  "error": null
}
````