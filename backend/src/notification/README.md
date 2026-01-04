# 🔔 Módulo Notifications
O módulo Notifications centraliza a comunicação assíncrona com o usuário. Ele permite que eventos do sistema (agendamentos, cadastros) gerem alertas persistentes que o usuário pode consultar posteriormente.

### [↩️Voltar ao README principal](/backend/README.md)

## 🗄️ Persistência no Banco de Dados
#### ``Tabela: notificacoes``
| Coluna     | Tipo      | Nulo   | Observações
| ------     | ------    | ------ | ------ 
| id         | serial    | ❌    | Inteiro, auto-incremento ``PK``
| usuario_id | uuid      | ❌    | ``FK`` para usuarios                 
| titulo     | varchar   | ❌    | Resumo do aviso
| mensagem   | text      | ❌    | Corpo do aviso (pode conter markdown simples)
| lida       | boolean   | ❌    | Padrão: ``false``
| created_at | timestamp | ❌    | Data de criação


## 🧠 Comportamento dos Campos
### ``id``
- **Integer (Serial)**
- Gerado automaticamente pelo banco.
- Identificador único da notificação.

### ``usuario_id``
- **UUID**
- Define o dono da notificação.
- Privacidade: Um usuário jamais deve ver notificações vinculadas a outro ID.

### ``titulo``
- **String**
- Um resumo curto e objetivo do evento (ex: "Sessão Cancelada").

### ``mensagem``
- Text
- Detalhes completos do aviso.
- Suporta links no formato: ``[Texto](tipo:id)``. 
   - Ex: Nova paciente [Maria](patient:123) cadastrada.
   - O frontend deve fazer o parse disso para links clicáveis.

### ``lida``
- **Boolean**
- Indica se o usuário já visualizou ou interagiu com o alerta.
- ``false``: Incrementa o contador do "sininho".
- ``true``: Notificação arquivada/histórico.

### ``created_at``
- **Timestamp**
- Data e hora exata do evento.
- Ordenação: As listagens devem sempre ordenar por este campo de forma Decrescente (DESC) — mais recentes no topo.

## 🧩 Responsabilidades do Módulo
- **Centralização**: Receber chamadas de serviços (UserService, SessionService) e persistir o alerta.
- **Persistência**: Garantir que o aviso exista mesmo se o usuário estiver offline.
- **Rastreabilidade de Leitura**: Controlar o estado lida para contadores de notificação.

## Rotas
### 1. 📬 Listar Minhas Notificações
#### ``GET /notifications``
Retorna a lista paginada de notificações do usuário logado

#### 🎯 Objetivo da Rota
- Exibir a lista na central de notificações.
- Permitir filtrar por lidas/não lidas.

#### 🔐 Autorização
- Requer autenticação.

#### 📥 Query Parameters
Parâmetro | Tipo    | Padrão | Descrição
-----     | -----   | -----  |-----
page      | number  | 1      | Página atual.
limit     | number  | 10     | Itens por página.
lida      | boolean | null   | (Opcional) true = ver lidas, false = ver não lidas. Se omitido, traz todas.

#### 📤 Response — Sucesso (200)
````JSON
{
  "data": {
    "notifications": [
      {
        "id": 106,
        "titulo": "Nova Paciente Cadastrada",
        "mensagem": "A paciente [Juliana Fernandes Lima](patient:d360d07e-d356-4c28-ac5f-b62f38f25000) acaba de ser registrada por [Nocta](user:02e6b058-a427-4d07-a39e-c849424a7f31), com a terapeuta [Larissa Gomes Pimenta](user:3c943b50-82c7-4204-b469-d5212cd45f4a) como responsável.",
        "lida": false,
        "createdAt": "2025-12-15T20:56:08.257Z"
      },
      {
        "id": 108,
        "titulo": "Nova Paciente Cadastrada",
        "mensagem": "A paciente [Larissa Almeida Torres](patient:e5d1138e-092a-4cb7-832a-589d7156819a) acaba de ser registrada por [Nocta](user:02e6b058-a427-4d07-a39e-c849424a7f31), com a terapeuta [Juliana Martins Teixeira](user:626712d5-8e83-4c76-8c31-e49591587226) como responsável.",
        "lida": false,
        "createdAt": "2025-12-15T20:56:58.494Z"
      }
    ]
  },
  "meta": {
    "totalItems": 47,
    "totalPages": 24,
    "currentPage": 2,
    "itemsPerPage": 2,
    "sortBy": "created_at",
    "sortDirection": "ASC"
  },
  "error": null
}
````
*Nota:* O campo unreadCount no meta é um "plus" muito útil para o frontend atualizar o ícone do sininho sem fazer outra requisição.

#### ❌ Possíveis Erros
#### 401 Unauthorized:
- Token inválido.

### 2. 👁️ Marcar Notificações como Lidas
#### ``PATCH /notifications/read``
Marca uma ou múltiplas notificações como lidas.

#### 🎯 Objetivo da Rota
- Permitir a leitura de uma ou em lote via seleção.
- Delega ao front a decisão de quais IDs enviar.

#### 🔐 Autorização
- Requer autenticação.
- Apenas valida registros que pertençam ao usuário logado. IDs que não pertencem devem ser ignorados.

#### 📥 Request Body
Objeto contendo o array de IDs a serem marcados como lido.
````JSON
{
  "ids": [41, 42, 45]
}
````

#### 📤 Response — Sucesso (200)
Retorna os IDs que foram efetivamente atualizados. Útil para confirmar quais registros foram afetados (caso algum ID enviado não existisse).
````JSON
{
  "data": {
    "readIds": [41, 42, 45]
  },
  "meta": {
    "count": 3
  },
  "error": null
}
````

#### ❌ Possíveis Erros
#### 400 Bad Request:
- Selecione uma notificação.
- ``ids`` deve ser um array de números.

#### 401 Unauthorized:
Token inválido.

### 3. 🗑️ Excluir Notificações
#### ``POST /notifications/delete``
Remove uma notificação do histórico.

#### 🎯 Objetivo da Rota
- Permitir exclusão em lote.
- Delega ao front a decisão de quais IDs enviar.

#### 🔐 Autorização
- Requer autenticação.
- Apenas apaga registros que pertençam ao usuário logado. IDs que não pertencem devem ser ignorados.

#### 📥 Request Body
Objeto contendo o array de IDs a serem deletados.
````JSON
{
  "ids": [10, 11, 12]
}
````

#### 📤 Response — Sucesso (200)
Retorna a lista de IDs que foram deletados.
````JSON
{
  "data": {
    "deletedIds": [10, 11, 12]
  },
  "meta": {
    "count": 3
  },
  "error": null
}
````

#### ❌ Possíveis Erros
#### 400 Bad Request:
- Selecione uma notificação.
- ``ids`` deve ser um array de números.

#### 401 Unauthorized:
Token inválido.