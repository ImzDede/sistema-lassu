"use client";

import React, { useEffect, useState } from "react";

export default function FormularioDinamico() {
  const [data, setData] = useState<any>(null); // JSON do GET
  const [answers, setAnswers] = useState<any>({}); // respostas do usuário
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForm() {
      // aqui você chama sua API real
      const mock = {
  data: {
    pacienteId: "uuid-do-paciente-123",
    versaoId: "uuid-versao-2025-2",
    secoes: [
      {
        id: "sec-01",
        titulo: "1. Identificação e Hábitos",
        perguntas: [
          {
            id: "q-nome",
            enunciado: "Nome Social",
            tipo: "texto",
            obrigatoria: true,
            dependeDeOpcaoId: null,
            opcoes: [],
            resposta: "Maria da Silva"
          },
          {
            id: "q-filhos",
            enunciado: "Possui filhos?",
            tipo: "unica_escolha",
            obrigatoria: true,
            opcoes: [
              { id: "opt-filho-sim", texto: "Sim" },
              { id: "opt-filho-nao", texto: "Não" }
            ],
            resposta: {
              opcoes: [{ id: "opt-filho-sim" }]
            }
          },
          {
            id: "q-qtd-filhos",
            enunciado: "Quantos filhos?",
            tipo: "inteiro",
            dependeDeOpcaoId: "opt-filho-sim",
            resposta: "2"
          }
        ]
      }
    ]
  }
};

setTimeout(() => {
  setData(mock.data);
  initAnswers(mock.data);
  setLoading(false);
}, 800);

    }

    loadForm();
  }, []);

  function initAnswers(form: any) {
    const initial: any = {};

    form.secoes.forEach((sec: any) => {
      sec.perguntas.forEach((p: any) => {
        if (p.tipo === "texto" || p.tipo === "inteiro" || p.tipo === "longo") {
          initial[p.id] = { valor: p.resposta ?? "" };
        }

        if (p.tipo === "unica_escolha" || p.tipo === "multipla_escolha") {
          initial[p.id] = {
            opcoes:
              p.resposta?.opcoes?.map((o: any) => ({
                id: o.id,
                complemento: o.complemento ?? "",
              })) ?? [],
          };
        }
      });
    });

    setAnswers(initial);
  }

  if (loading) return <p>Carregando…</p>;

  return (
    <div className="p-6">
      <h1 className="font-bold text-xl mb-4">Formulário Dinâmico</h1>

      {data.secoes.map((sec: any) => (
        <Section
          key={sec.id}
          secao={sec}
          answers={answers}
          setAnswers={setAnswers}
        />
      ))}

      <button onClick={() => console.log(formatForSubmit())}>
        Enviar
      </button>
    </div>
  );
}

function Section({ secao, answers, setAnswers }: any) {
  return (
    <div className="mb-10 p-4 border rounded">
      <h2 className="font-bold text-lg mb-4">{secao.titulo}</h2>

      {secao.perguntas.map((p: any) => (
        <Pergunta
          key={p.id}
          pergunta={p}
          answers={answers}
          setAnswers={setAnswers}
        />
      ))}
    </div>
  );
}


function Pergunta({ pergunta, answers, setAnswers }: any) {
  const ans = answers[pergunta.id];

  // VERIFICA SE ESTÁ DESABILITADO POR DEPENDÊNCIA
  const disabled = isDisabled(pergunta, answers);

  function updateValue(v: any) {
    setAnswers((prev: any) => ({
      ...prev,
      [pergunta.id]: { valor: v },
    }));
  }

  function updateOption(optionId: string, complemento?: string) {
    setAnswers((prev: any) => {
      const previous = prev[pergunta.id]?.opcoes || [];

      // única escolha → substitui tudo
      if (pergunta.tipo === "unica_escolha") {
        return {
          ...prev,
          [pergunta.id]: { opcoes: [{ id: optionId, complemento }] },
        };
      }

      // múltipla escolha:
      const exists = previous.find((o: any) => o.id === optionId);

      if (exists) {
        // desmarcar
        return {
          ...prev,
          [pergunta.id]: {
            opcoes: previous.filter((o: any) => o.id !== optionId),
          },
        };
      }

      // marcar
      return {
        ...prev,
        [pergunta.id]: {
          opcoes: [...previous, { id: optionId, complemento }],
        },
      };
    });
  }

  return (
    <div className="mb-6">
      <p className="font-medium">{pergunta.enunciado}</p>

      {/* TEXTO SIMPLES */}
      {pergunta.tipo === "texto" && (
        <input
          value={ans.valor}
          disabled={disabled}
          onChange={(e) => updateValue(e.target.value)}
          className="border p-2 w-full"
        />
      )}

      {/* LONGO TEXTO */}
      {pergunta.tipo === "longo" && (
        <textarea
          value={ans.valor}
          disabled={disabled}
          onChange={(e) => updateValue(e.target.value)}
          className="border p-2 w-full"
        />
      )}

      {/* ESOLHA ÚNICA */}
      {pergunta.tipo === "unica_escolha" &&
        pergunta.opcoes.map((op: any) => {
          const selected = ans.opcoes?.[0]?.id === op.id;

          return (
            <label key={op.id} className="flex gap-2 mt-2">
              <input
                type="radio"
                name={pergunta.id}
                checked={selected}
                disabled={disabled}
                onChange={() => updateOption(op.id)}
              />
              {op.texto}

              {op.requerTexto && selected && (
                <input
                  type="text"
                  placeholder={op.labelTexto}
                  className="border ml-2"
                  value={ans.opcoes[0]?.complemento || ""}
                  onChange={(e) =>
                    updateOption(op.id, e.target.value) // inclui complemento
                  }
                />
              )}
            </label>
          );
        })}

      {/* MÚLTIPLA ESCOLHA */}
      {pergunta.tipo === "multipla_escolha" &&
        pergunta.opcoes.map((op: any) => {
          const selected = ans.opcoes?.some((x: any) => x.id === op.id);

          const current = ans.opcoes?.find((x: any) => x.id === op.id);

          return (
            <label key={op.id} className="flex gap-2 mt-2">
              <input
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={() => updateOption(op.id)}
              />
              {op.texto}

              {op.requerTexto && selected && (
                <input
                  type="text"
                  placeholder={op.labelTexto}
                  className="border ml-2"
                  value={current?.complemento ?? ""}
                  onChange={(e) =>
                    updateOption(op.id, e.target.value)
                  }
                />
              )}
            </label>
          );
        })}
    </div>
  );
}

function isDisabled(pergunta: any, answers: any) {
  if (!pergunta.dependeDeOpcaoId) return false;

  const parentOptionId = pergunta.dependeDeOpcaoId;

  // Procura no estado se a opção pai foi marcada
  const enabled = Object.values(answers).some((resp: any) =>
    resp.opcoes?.some((o: any) => o.id === parentOptionId)
  );

  return !enabled; // se não marcada → disabled
}

function formatForSubmit() {
  const result = [];

  Object.entries(answers).forEach(([perguntaId, ans]: any) => {
    if (ans.valor !== undefined) {
      result.push({
        perguntaId,
        valor: ans.valor || "",
      });
    }

    if (ans.opcoes !== undefined) {
      result.push({
        perguntaId,
        opcoes: ans.opcoes,
      });
    }
  });

  return {
    pacienteId: data.pacienteId,
    versaoId: data.versaoId,
    finalizar: false,
    respostas: result,
  };
}
