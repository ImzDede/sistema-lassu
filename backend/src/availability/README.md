# 📅 Módulo Disponibilidade

O módulo de Disponibilidade gerencia os horários de atendimento das terapeutas. Ele funciona de forma independente, mas seus dados são cruciais para o módulo de Agendamento e para a busca de terapeutas (/users/available).

### [↩️Voltar ao README principal](/backend/README.md)

## 🗄️ Persistência no Banco de Dados
#### ``Tabela: disponibilidades``

| Coluna         | Tipo      | Nulo  | Observações                           |
| -------------- | --------- | ----- | ------------------------------------- |
| id             | serial      | ❌    | Gerado automaticamente                |
| usuario_id     | uuid      | ❌    | FK para usuarios                      |
| dia_semana     | int       | ❌    | 0 (Dom) a 6 (Sáb)                     |
| hora_inicio    | int       | ❌    | 8 (8:00) a 17 (17:00)                 |
| hora_fim       | int       | ❌    | 9 (9:00) a 18 (18:00)                 |

## 🧠 Comportamento dos Campos

### ``id``
- **Integer (Serial)**
- Gerado automaticamente pelo banco.
- Identificador interno, raramente exposto pois a edição é feita via substituição total.

### ``usuario_id``
- **UUID**
- Vinculado à tabela ``usuarios.id``.
- **Cascade Delete:** Se o usuário for removido, suas disponibilidades somem automaticamente.

### ``dia_semana``
- **Inteiro (0-6)**
- 0 = Domingo, 1 = Segunda ... 6 = Sábado.
- Usado para montar a grade visual no frontend.

### ``hora_inicio`` & ``hora_fim``
- **Inteiros**
- Representam horas cheias.
- ``hora_fim`` > ``hora_inicio``.
- O sistema valida conflitos (ex: não pode ter 08-10 e 09-11 no mesmo dia).

## 🧩 Responsabilidades do Módulo

- **Gestão de Grade:** Permitir que o terapeuta defina quando pode atender.
- **Validação de Conflitos:** O algoritmo do Service garante que não existam horários sobrepostos.
- **Suporte a Buscas:** Serve de base para a rota `GET /users/available` encontrar terapeutas livres.
- **Sanitização:** Garante que os horários estejam sempre ordenados e consistentes antes de salvar no banco.

## Rotas
### 1. 💾 Gerenciar Disponibilidade (Salvar)
#### ``PUT /availability``
Define ou atualiza a grade de horários do usuário logado.

#### 🎯 Objetivo da Rota
- Substituição Total: Apaga todos os horários anteriores deste usuário e grava a nova lista enviada.

- Limpeza: Se enviar um array vazio, o usuário ficará sem horários disponíveis.

- Validação Lógica: Impede conflitos (sobreposição de horários no mesmo dia) e horários inválidos (início > fim).

#### 🔐 Autorização
- Requer autenticação.

- O usuário altera apenas a própria disponibilidade.

#### 📥 Request Body
Array contendo os objetos de horário.

````JSON
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

#### 📤 Response — Sucesso (200)
Retorna a lista confirmada que foi salva.

````JSON
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
  "meta": {
    "count": 2
  },
  "error": null
}
````
#### ❌ Possíveis Erros
#### 400 Bad Request:
Validações de negócio e ZOD:

- O corpo deve ser um array.

- horaFim deve ser maior que horaInicio.

- Conflito de horários (ex: tentar salvar 08-10 e 09-11 no mesmo dia).

- Dia da semana inválido (fora de 0-6).

#### 401 Unauthorized:
- Token inválido ou expirado.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.

### 2. 📅 Obter Minha Disponibilidade
#### ``GET /availability``
Retorna a grade de horários completa cadastrada para o usuário autenticado.

#### 🎯 Objetivo da Rota
- Carregar os horários atuais para exibir no calendário ou formulário de edição do frontend.

#### 🔐 Autorização
Requer autenticação.

#### 📥 Request Body
Não requer corpo.

#### 📤 Response — Sucesso (200)
````JSON
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
  "meta": {
    "count": 2
  },
  "error": null
}
````
*Nota:* Se o usuário não tiver horários, retorna um array vazio em availability.

#### ❌ Possíveis Erros
#### 401 Unauthorized:
- Token inválido ou expirado.

#### 500 Internal Server Error:
- Erro interno do servidor. Tente novamente mais tarde.