# 🔔 Módulo Notification (Central de Avisos)

O módulo de Notificações centraliza a comunicação assíncrona do sistema.
Ele utiliza um padrão de mensagens estruturadas (`markdown-like`) para permitir que o Frontend crie links dinâmicos para os recursos citados (Pacientes, Sessões, etc).

### [↩️ Voltar ao README principal](../README.md)

---

## 🗺️ Sumário das Rotas

### 📬 Caixa de Entrada
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | [``/notifications``](#1-listar-notificações) | Lista notificações do usuário logado (Paginado). |
| **PATCH** | [``/notifications/read``](#2-marcar-como-lida) | Marca uma ou várias notificações como lidas. |
| **POST** | [``/notifications/delete``](#3-excluir-notificações) | Exclui uma ou várias notificações permanentemente. |

---

## 🧠 Regras de Negócio

### 1. Segurança e Privacidade
* O usuário só tem acesso às suas próprias notificações.
* Operações de `Ler` e `Excluir` validam se o ID pertence ao usuário logado. Tentar manipular notificações de terceiros não gera erro, mas a operação é ignorada (0 linhas afetadas).

### 2. Formato da Mensagem (Frontend)
As mensagens retornadas pela API contêm marcações especiais para links internos.
* **Formato:** `[Texto Exibido](tipo:id)`
* **Exemplo:** `"Nova sessão com [Maria](patient:uuid-123)"`
* **Implementação no Front:** Deve-se fazer um parser para transformar esses trechos em links clicáveis para a rota correta.

### 3. Persistência
* Notificações são persistentes até que o usuário as exclua explicitamente.

---

## 🗄️ Persistência (Banco de Dados)

**Tabela: `notificacoes`**

| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | serial | ✅ | PK (Auto Incremento). |
| `usuario_id` | uuid | ✅ | FK para usuarios. |
| `titulo` | varchar | ✅ | Resumo curto. |
| `mensagem` | text | ✅ | Texto com formatação de links. |
| `lida` | boolean | ✅ | Default: `false`. |
| `created_at` | timestamp | ✅ | Data de envio. |

---

## 📋 Regras de Validação (Campos)

Todos os endpoints aplicam as seguintes validações (Erro `400 Bad Request`).

| Campo | Regra / Cenário | Mensagem de Erro |
| :--- | :--- | :--- |
| **IDs (Array)** | Array vazio ou contendo valores não numéricos. | "A lista de IDs deve conter apenas números positivos." |

---

## 📡 Referência da API

### 1. Listar Notificações
`GET /notifications`

Lista o histórico do usuário.

**Query Params:**
* `page`: Número da página (Default: 1).
* `limit`: Itens por página (Default: 10).
* `lida`: `true` (apenas lidas), `false` (apenas não lidas). Se omitido, traz todas.

**Response (200):**
````json
{
  "data": {
    "notifications": [
      {
        "id": 50,
        "titulo": "Sessão Marcada",
        "mensagem": "Uma [sessão](session:102) foi marcada com [Ana](patient:uuid...)",
        "lida": false,
        "createdAt": "2026-01-12T10:00:00.000Z"
      }
    ]
  },
  "meta": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "filterActive": false
  },
  "error": null
}
````

---

### 2. Marcar como Lida
`PATCH /notifications/read`

Aceita um array de IDs para processamento em lote (Bulk Update).

**Body:**
````json
{
  "ids": [50, 51, 52]
}
````

**Response (200):**
````json
{
  "data": {
    "ids": [50, 51, 52]
  },
  "meta": {
    "count": 3
  },
  "error": null
}
````

---

### 3. Excluir Notificações
`POST /notifications/delete`

Exclui permanentemente. Usa método `POST` para permitir envio de corpo (body) com array de IDs de forma segura e compatível.

**Body:**
````json
{
  "ids": [50, 51]
}
````

**Response (200):**
````json
{
  "data": {
    "ids": [50, 51]
  },
  "meta": {
    "count": 2
  },
  "error": null
}
````