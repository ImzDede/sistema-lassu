"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Textarea,
  Checkbox,
  Radio,
} from "@material-tailwind/react";
import { Save } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useFeedback } from "@/contexts/FeedbackContext";

// --- TIPAGEM ---
interface Opcao {
  id: string;
  enunciado: string;
  requerTexto: boolean;
  labelTexto?: string | null;
}
interface Pergunta {
  id: string;
  enunciado: string;
  tipo:
    | "texto"
    | "inteiro"
    | "data"
    | "unica_escolha"
    | "multipla_escolha"
    | "longo_texto";
  obrigatoria: boolean;
  dependeDeOpcaoId: string | null;
  opcoes: Opcao[];
}
interface Secao {
  id: string;
  titulo: string;
  ordem: number;
  perguntas: Pergunta[];
}
interface FormularioData {
  data: { secoes: Secao[] };
}

export type ThemeKey =
  | "sessao"
  | "sintese"
  | "anamnese"
  | "encaminhamento"
  | "anotacoes"
  | "paciente"
  | "terapeuta";

interface FormularioBuilderProps {
  modeloJson: FormularioData;
  dadosIniciais?: any;
  onFinalizar: (respostas: any) => void;
  onSalvarRascunho?: (respostas: any) => void;
  themeKey?: ThemeKey;
  temaCor?: string;
  readOnly?: boolean;
}

const THEME_TW_MAP: Record<ThemeKey, string> = {
  sessao: "brand-sessao",
  sintese: "brand-sintese",
  anamnese: "brand-anamnese",
  encaminhamento: "brand-encaminhamento",
  anotacoes: "brand-anotacoes",
  paciente: "brand-paciente",
  terapeuta: "brand-terapeuta",
};

const THEME_MT_MAP: Record<ThemeKey, string> = {
  sessao: "deep-purple",
  sintese: "orange",
  anamnese: "pink",
  encaminhamento: "pink",
  anotacoes: "blue-gray",
  paciente: "amber",
  terapeuta: "purple",
};

export const FormularioBuilder: React.FC<FormularioBuilderProps> = ({
  modeloJson,
  dadosIniciais = {},
  onFinalizar,
  onSalvarRascunho,
  themeKey,
  temaCor = "purple",
  readOnly = false,
}) => {
  const [passoAtual, setPassoAtual] = useState(0);
  const [respostas, setRespostas] = useState<any>(dadosIniciais);
  const { showFeedback } = useFeedback();
  const topRef = useRef<HTMLDivElement | null>(null);

  const twColor = themeKey ? THEME_TW_MAP[themeKey] : "brand-purple";
  const resolvedTemaCor = themeKey ? THEME_MT_MAP[themeKey] : temaCor;

  const resolvedInputFocusClass = `focus-within:!border-${twColor} focus-within:!ring-1 focus-within:!ring-${twColor}`;
  const resolvedTextareaFocusClass = `focus:!border-${twColor} focus:!ring-1 focus:!ring-${twColor}`;

  // AutoSave (Rascunho) - Só ativa se NÃO for readOnly
  useEffect(() => {
    if (onSalvarRascunho && !readOnly) {
      const timer = setTimeout(() => onSalvarRascunho(respostas), 2000);
      return () => clearTimeout(timer);
    }
  }, [respostas, onSalvarRascunho, readOnly]);

  const secaoAtual = modeloJson.data.secoes[passoAtual];

  const rolarParaTopo = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const deveExibirPergunta = (pergunta: Pergunta) => {
    if (!pergunta.dependeDeOpcaoId) return true;
    const valores = Object.values(respostas);
    return valores.some((resp: any) => {
      if (Array.isArray(resp))
        return resp.some((item: any) => item.id === pergunta.dependeDeOpcaoId);
      return resp?.id === pergunta.dependeDeOpcaoId;
    });
  };

  const handleSimples = (perguntaId: string, valor: string) => {
    if (readOnly) return; // Bloqueia edição
    setRespostas((prev: any) => ({ ...prev, [perguntaId]: valor }));
  };

  const handleUnicaEscolha = (
    perguntaId: string,
    opcaoId: string,
    textoExtra: string | null = null,
  ) => {
    if (readOnly) return; // Bloqueia edição
    setRespostas((prev: any) => {
      const anterior = prev[perguntaId] || {};
      if (anterior.id === opcaoId && textoExtra !== null) {
        return {
          ...prev,
          [perguntaId]: { id: opcaoId, complemento: textoExtra },
        };
      }
      return {
        ...prev,
        [perguntaId]: { id: opcaoId, complemento: textoExtra || null },
      };
    });
  };

  const handleMultiplaEscolha = (
    perguntaId: string,
    opcaoId: string,
    isChecked: boolean,
    textoExtra: string | null = null,
  ) => {
    if (readOnly) return; // Bloqueia edição
    setRespostas((prev: any) => {
      const listaAtual = prev[perguntaId] || [];
      if (isChecked) {
        const existe = listaAtual.find((item: any) => item.id === opcaoId);
        if (existe && textoExtra !== null) {
          return {
            ...prev,
            [perguntaId]: listaAtual.map((item: any) =>
              item.id === opcaoId ? { ...item, complemento: textoExtra } : item,
            ),
          };
        } else if (!existe) {
          return {
            ...prev,
            [perguntaId]: [
              ...listaAtual,
              { id: opcaoId, complemento: textoExtra },
            ],
          };
        }
        return prev;
      } else {
        return {
          ...prev,
          [perguntaId]: listaAtual.filter((item: any) => item.id !== opcaoId),
        };
      }
    });
  };

  const handleSalvarManual = () => {
    if (onSalvarRascunho && !readOnly) {
      onSalvarRascunho(respostas);
      showFeedback("Rascunho salvo com sucesso!", "success");
    }
  };

  // --- RENDERIZAÇÃO DOS INPUTS ---
  const renderInputs = (pergunta: Pergunta) => {
    if (!deveExibirPergunta(pergunta)) return null;
    const valorAtual = respostas[pergunta.id];

    switch (pergunta.tipo) {
      case "texto":
        return (
          <Input
            label=""
            placeholder={pergunta.enunciado}
            value={typeof valorAtual === "string" ? valorAtual : ""}
            onChange={(e) => handleSimples(pergunta.id, e.target.value)}
            focusColorClass={resolvedInputFocusClass}
            disabled={readOnly} // <--- BLOQUEIO
          />
        );

      // 1. INPUT INTEIRO
      case "inteiro":
        return (
          <Input
            type="number"
            min={0}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") e.preventDefault();
            }}
            label=""
            placeholder={pergunta.enunciado}
            value={typeof valorAtual === "string" ? valorAtual : ""}
            onChange={(e) => handleSimples(pergunta.id, e.target.value)}
            focusColorClass={resolvedInputFocusClass}
            disabled={readOnly} // <--- BLOQUEIO
          />
        );

      // 2. INPUT DATA
      case "data":
        return (
          <Input
            type="date"
            label=""
            value={typeof valorAtual === "string" ? valorAtual : ""}
            onChange={(e) => handleSimples(pergunta.id, e.target.value)}
            focusColorClass={resolvedInputFocusClass}
            disabled={readOnly} // <--- BLOQUEIO
          />
        );

      case "longo_texto":
        return (
          <Textarea
            placeholder={pergunta.enunciado}
            value={typeof valorAtual === "string" ? valorAtual : ""}
            onChange={(e) => handleSimples(pergunta.id, e.target.value)}
            rows={4}
            className={`!border-gray-300 bg-white ${resolvedTextareaFocusClass}`}
            labelProps={{ className: "hidden" }}
            disabled={readOnly} // <--- BLOQUEIO
          />
        );
      case "unica_escolha":
        return (
          <div className="flex flex-col gap-2">
            {pergunta.opcoes.map((opt) => {
              const selecionado = valorAtual?.id === opt.id;
              return (
                <div key={opt.id} className="flex flex-col ml-1">
                  <Radio
                    name={pergunta.id}
                    label={
                      <Typography className="text-brand-dark font-medium">
                        {opt.enunciado}
                      </Typography>
                    }
                    checked={selecionado}
                    onChange={() => handleUnicaEscolha(pergunta.id, opt.id)}
                    color={resolvedTemaCor as any}
                    crossOrigin={undefined}
                    disabled={readOnly} // <--- BLOQUEIO
                  />
                  {opt.requerTexto && selecionado && (
                    <div className="ml-9 mt-1 w-full md:w-1/2">
                      <Input
                        placeholder={opt.labelTexto || "Descreva..."}
                        value={valorAtual?.complemento || ""}
                        onChange={(e) =>
                          handleUnicaEscolha(
                            pergunta.id,
                            opt.id,
                            e.target.value,
                          )
                        }
                        focusColorClass={resolvedInputFocusClass}
                        disabled={readOnly} // <--- BLOQUEIO
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      case "multipla_escolha":
        return (
          <div className="flex flex-col gap-2">
            {pergunta.opcoes.map((opt) => {
              const lista = Array.isArray(valorAtual) ? valorAtual : [];
              const itemSalvo = lista.find((i: any) => i.id === opt.id);
              const isChecked = !!itemSalvo;
              return (
                <div key={opt.id} className="flex flex-col ml-1">
                  <Checkbox
                    label={
                      <Typography className="text-brand-dark font-medium">
                        {opt.enunciado}
                      </Typography>
                    }
                    checked={isChecked}
                    onChange={(e) =>
                      handleMultiplaEscolha(
                        pergunta.id,
                        opt.id,
                        e.target.checked,
                      )
                    }
                    color={resolvedTemaCor as any}
                    crossOrigin={undefined}
                    disabled={readOnly} // <--- BLOQUEIO
                  />
                  {opt.requerTexto && isChecked && (
                    <div className="ml-9 mt-1 w-full md:w-1/2">
                      <Input
                        placeholder={opt.labelTexto || "Descreva..."}
                        value={itemSalvo?.complemento || ""}
                        onChange={(e) =>
                          handleMultiplaEscolha(
                            pergunta.id,
                            opt.id,
                            true,
                            e.target.value,
                          )
                        }
                        focusColorClass={resolvedInputFocusClass}
                        disabled={readOnly} // <--- BLOQUEIO
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  // 3. VALIDAÇÃO GLOBAL (Só roda no Finalizar)
  const validarTudoParaFinalizar = () => {
    // Varre TODAS as seções, não só a atual
    for (const secao of modeloJson.data.secoes) {
      const obrigatorias = secao.perguntas.filter(
        (p) => p.obrigatoria && deveExibirPergunta(p),
      );

      for (const p of obrigatorias) {
        const resp = respostas[p.id];
        const isVazio =
          !resp ||
          (typeof resp === "string" && resp.trim() === "") ||
          (Array.isArray(resp) && resp.length === 0) ||
          (typeof resp === "object" && !Array.isArray(resp) && !resp.id);

        if (isVazio) {
          showFeedback(
            `A pergunta "${p.enunciado}" (na seção ${secao.titulo}) é obrigatória.`,
            "error",
          );
          return false;
        }
      }
    }
    return true;
  };

  const proximoPasso = () => {
    setPassoAtual((prev) => prev + 1);
    rolarParaTopo();
  };

  const passoAnterior = () => {
    setPassoAtual((prev) => prev - 1);
    rolarParaTopo();
  };

  if (!secaoAtual)
    return <div className="text-center p-4">Carregando formulário...</div>;
  const isUltimoPasso = passoAtual === modeloJson.data.secoes.length - 1;

  return (
    <div className="w-full">
      <div ref={topRef} />
      <div className="mb-6 flex justify-between items-center text-sm text-gray-500 font-medium border-b pb-2">
        <span className="uppercase tracking-wide text-xs font-bold">
          {secaoAtual.titulo}
        </span>
        <span>
          Passo {passoAtual + 1} / {modeloJson.data.secoes.length}
        </span>
      </div>
      <div className="flex flex-col gap-8 mb-10 min-h-[300px]">
        {secaoAtual.perguntas.map((pergunta) => {
          if (!deveExibirPergunta(pergunta)) return null;
          return (
            <div
              key={pergunta.id}
              className="flex flex-col gap-2 animate-fade-in"
            >
              <Typography className="text-brand-dark font-bold text-sm md:text-base">
                {pergunta.enunciado}{" "}
                {pergunta.obrigatoria && (
                  <span className="text-red-500">*</span>
                )}
              </Typography>
              {renderInputs(pergunta)}
            </div>
          );
        })}
      </div>
      <div className="pt-6 border-t border-gray-200 mt-auto">
        <div
          className={[
            "grid gap-4",
            "grid-cols-1",
            isUltimoPasso ? "md:grid-cols-3" : "md:grid-cols-2",
          ].join(" ")}
        >
          {/* BOTÃO VOLTAR */}
          <Button
            variant="outline"
            onClick={passoAnterior}
            disabled={passoAtual === 0}
            fullWidth
            accentColorClass={twColor}
            className="h-12 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent hover:bg-opacity-10 transition-colors"
          >
            VOLTAR
          </Button>

          {!isUltimoPasso ? (
            /* BOTÃO PRÓXIMO */
            <Button
              onClick={proximoPasso}
              fullWidth
              accentColorClass={twColor}
              className="h-12 text-white shadow-none hover:shadow-md transition-all"
            >
              PRÓXIMO
            </Button>
          ) : (
            !readOnly && (
              <>
                <Button
                  onClick={handleSalvarManual}
                  variant="outline"
                  fullWidth
                  accentColorClass={twColor}
                  className="h-12 flex items-center justify-center gap-2 bg-transparent hover:bg-opacity-10 transition-colors"
                  title="Salvar Rascunho"
                >
                  <Save size={18} />
                  <span>RASCUNHO</span>
                </Button>
                <Button
                  onClick={() => {
                    if (validarTudoParaFinalizar()) onFinalizar(respostas);
                  }}
                  fullWidth
                  accentColorClass={twColor}
                  className="h-12 text-white shadow-none hover:shadow-md transition-all"
                >
                  FINALIZAR
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};
