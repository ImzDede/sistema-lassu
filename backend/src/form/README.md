# 📘 Módulo Forms (Anamnese & Síntese)

O módulo Forms gerencia os formulários clínicos dinâmicos do sistema.
Diferente de um CRUD comum, ele implementa **versionamento de estrutura** (para manter histórico fiel) e **lógica condicional** de preenchimento.

Existem dois formulários fixos por paciente: **Anamnese** (Triagem) e **Síntese** (Pós-atendimento).

### [↩️ Voltar ao README principal](/backend/README.md)

---

## 🗺️ Sumário das Rotas

### 🧠 Gestão de Estrutura (Admin)
Define quais perguntas aparecem na tela.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | [``/anamnese/modelo``](#1-buscar-modelo-ativo) | Busca a estrutura completa (JSON) da Anamnese ativa. |
| **PUT** | [``/anamnese/modelo``](#2-atualizar-modelo) | Cria uma nova versão da estrutura da Anamnese. |
| **GET** | [``/sintese/modelo``](#1-buscar-modelo-ativo) | Busca a estrutura completa (JSON) da Síntese ativa. |
| **PUT** | [``/sintese/modelo``](#2-atualizar-modelo) | Cria uma nova versão da estrutura da Síntese. |

### ✍️ Preenchimento (Estagiário)
Salva e lê as respostas dos pacientes.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | [``/anamnese/paciente/:id``](#3-buscar-pelo-paciente) | Retorna o preenchimento do paciente. |
| **POST** | [``/anamnese``](#4-salvar-resposta) | Salva ou atualiza (Rascunho) a anamnese. |
| **GET** | [``/sintese/paciente/:id``](#3-buscar-pelo-paciente) | Retorna o preenchimento do paciente. |
| **POST** | [``/sintese``](#4-salvar-resposta) | Salva ou atualiza (Rascunho) a síntese. |

---

## 🧠 Regras de Negócio e Conceitos

### 1. Entidade Única (1:1) e Inicialização
Cada paciente possui apenas **UMA** Anamnese e **UMA** Síntese.
* **Inicialização Antecipada:** Assim que um paciente é cadastrado no sistema, os rascunhos em branco desses formulários são criados automaticamente, vinculados à versão vigente. O paciente nunca fica "sem formulário".

### 2. Ciclo de Vida do Preenchimento
1.  **Rascunho:** Estado inicial ou em edição. Permite salvar dados parciais.
2.  **Upsert:** O endpoint de salvar (`POST`) detecta se já existe um rascunho. Se existir, ele apaga as respostas antigas e grava as novas.
3.  **Finalizado:** Quando enviado com flag `finalizar: true`, o sistema valida os campos obrigatórios. Se sucesso, o status muda para `finalizado` e **bloqueia edições futuras**.

### 3. Versionamento Automático
Para garantir que a mudança numa pergunta hoje não quebre a leitura de uma ficha de 5 anos atrás:
* Admin envia nova estrutura -> Sistema arquiva a versão atual (`ativo = false`) -> Sistema cria nova versão (`ativo = true`).
* Fichas antigas continuam apontando para a `versao_id` antiga.

### 4. Lógica Condicional
Uma pergunta pode ter dependência de uma opção anterior (Ex: "Qual remédio?" só aparece se responder "Sim" em "Toma remédio?").
* O Backend só valida a obrigatoriedade dessa pergunta se a condição for satisfeita.

---

## 🗄️ Persistência (Banco de Dados)

O módulo utiliza 8 tabelas relacionais para montar a estrutura em árvore e salvar as respostas.

### Tabelas de Estrutura
Define o "Esqueleto" do formulário.

| Tabela | Descrição |
| :--- | :--- |
| `formulario_modelos` | Define o tipo (`ANAMNESE` ou `SINTESE`). |
| `formulario_versoes` | Histórico de alterações. Apenas uma fica `ativa` por modelo. |
| `formulario_secoes` | Abas ou capítulos do formulário (Ex: "Dados Pessoais"). |
| `formulario_perguntas` | Enunciado, tipo e regras de validação. |
| `formulario_opcoes` | Itens selecionáveis para perguntas de escolha. |

### Tabelas de Preenchimento
Onde ficam os dados do paciente.

| Tabela | Descrição |
| :--- | :--- |
| `formulario_preenchidos` | Cabeçalho. Liga Paciente + Versão do Formulário. Status (`rascunho`/`finalizado`). |
| `formulario_respostas` | Guarda valores de texto, número ou data. |
| `formulario_selecionados` | Guarda os IDs das opções escolhidas (Multipla/Unica escolha). |

---

## 📋 Regras de Validação

Os endpoints aplicam as seguintes validações (Erro `400 Bad Request`).

| Campo | Regra / Cenário | Mensagem de Erro |
| :--- | :--- | :--- |
| **Título (Modelo)** | Menor que 3 caracteres. | "O título deve ter pelo menos 3 caracteres." |
| **Seções** | Array vazio. | "O formulário deve ter pelo menos uma seção." |
| **Enunciado** | Vazio. | "O enunciado da pergunta é obrigatório." |
| **Tipo de Pergunta** | Valor inválido. | Tipos aceitos: `texto`, `longo_texto`, `inteiro`, `data`, `unica_escolha`, `multipla_escolha`. |
| **Respostas** | Valor e Opções vazios simultaneamente. | "A resposta deve conter um 'valor' ou 'opcaoIds'." |
| **Campos Obrigatórios** | `finalizar: true` e campo vazio. | "A pergunta '{Enunciado}' é obrigatória." |

---

## 📡 Referência da API

### **🧠 Gestão de Estrutura (Admin)**

### 1. Buscar Modelo Ativo
`GET /anamnese/modelo` ou `GET /sintese/modelo`

Retorna a árvore completa para montar a tela.

**Response (200):**
````json
{
  "data": {
    "versionId": "uuid-da-versao-atual",
    "titulo": "Ficha de Anamnese 2025.2",
    "secoes": [
      {
        "id": "uuid-secao-1",
        "nome": "Dados Pessoais",
        "ordem": 1,
        "perguntas": [
          {
            "id": "uuid-pergunta-1",
            "enunciado": "Nome Social",
            "tipo": "texto",
            "obrigatoria": true,
            "ordem": 1,
            "dependeDeOpcaoId": null
          },
          {
            "id": "uuid-pergunta-2",
            "enunciado": "Possui filhos?",
            "tipo": "unica_escolha",
            "obrigatoria": true,
            "opcoes": [
              { "id": "uuid-opt-1", "enunciado": "Sim" },
              { "id": "uuid-opt-2", "enunciado": "Não" }
            ]
          }
        ]
      }
    ]
  },
  "meta": {},
  "error": null
}
````

### 2. Atualizar Modelo
`PUT /anamnese/modelo` ou `PUT /sintese/modelo`

Recebe a nova estrutura e gera uma nova versão no banco.

**Body:**
````json
{
  "titulo": "Anamnese 2026.1",
  "secoes": [
    {
      "nome": "Dados Pessoais",
      "ordem": 1,
      "perguntas": [
        {
          "enunciado": "Nome Social",
          "tipo": "texto",
          "obrigatoria": true,
          "ordem": 1
        },
        {
          "enunciado": "Quantos filhos?",
          "tipo": "inteiro",
          "ordem": 2,
          "dependeDeOpcaoId": "uuid-da-opcao-sim-da-pergunta-anterior"
        }
      ]
    }
  ]
}
````

---

### **✍️ Preenchimento (Estagiário)**

### 3. Buscar pelo Paciente
`GET /anamnese/paciente/:patientId`

Retorna o preenchimento do paciente. Como a criação é automática, sempre retornará um objeto (mesmo que vazio).

**Response (200):**
````json
{
  "data": {
    "id": "uuid-do-preenchimento",
    "status": "rascunho",
    "updatedAt": "2026-01-12T10:00:00Z",
    "secoes": [
      {
        "nome": "Dados Pessoais",
        "perguntas": [
          {
            "enunciado": "Nome Social",
            "tipo": "texto",
            "resposta": "Maria da Silva" 
          },
          {
            "enunciado": "Sintomas",
            "tipo": "multipla_escolha",
            "resposta": ["Dor de cabeça", "Insônia"] 
          }
        ]
      }
    ]
  },
  "meta": {},
  "error": null
}
````

### 4. Salvar Resposta
`POST /anamnese` ou `POST /sintese`

Salva as respostas. Funciona como "Upsert" (Limpa respostas anteriores deste formulário e salva as novas).

**Body:**
````json
{
  "pacienteId": "uuid-paciente",
  "versaoId": "uuid-versao-que-esta-na-tela",
  "finalizar": true, 
  "respostas": [
    {
      "perguntaId": "uuid-pergunta-1",
      "valor": "Maria da Silva"
    },
    {
      "perguntaId": "uuid-pergunta-2",
      "opcaoIds": ["uuid-opcao-sim"] 
    }
  ]
}
````

#### ❌ Possíveis Erros de Negócio
**400 Bad Request:**
- A pergunta 'Nome' é obrigatória. (Apenas se `finalizar: true`).
- Formato de resposta inválido.

**403 Forbidden:**
- Este formulário já foi finalizado e não pode ser editado.