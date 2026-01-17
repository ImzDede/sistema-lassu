"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, FileDown, Stethoscope } from "lucide-react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { FormularioBuilder } from "@/components/FormularioBuilder";
import SearchableSelect from "@/components/SearchableSelect";
import { useFeedback } from "@/contexts/FeedbackContext";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/contexts/AuthContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { formatCPF } from "@/utils/format";
import { AnamnesePDF } from "@/components/pdfs/AnamnesePDF";

// ... MOCK JSON
const MOCK_ANAMNESE = {
  data: {
    secoes: [
      {
        id: "sec-01",
        titulo: "1. Dados Pessoais e Sociais",
        ordem: 1,
        perguntas: [
          {
            id: "q-prof",
            enunciado: "Profissão Atual",
            tipo: "texto",
            obrigatoria: true,
            dependeDeOpcaoId: null,
            opcoes: [],
          },
          {
            id: "q-civil",
            enunciado: "Estado Civil",
            tipo: "unica_escolha",
            obrigatoria: true,
            dependeDeOpcaoId: null,
            opcoes: [
              { id: "opt-solteiro", enunciado: "Solteira(o)", requerTexto: false },
              { id: "opt-casado", enunciado: "Casada(o)", requerTexto: false },
              { id: "opt-divorciado", enunciado: "Divorciada(o)", requerTexto: false },
              { id: "opt-viuvo", enunciado: "Viúva(o)", requerTexto: false },
            ],
          },
          {
            id: "q-filhos",
            enunciado: "Possui Filhos?",
            tipo: "unica_escolha",
            obrigatoria: true,
            dependeDeOpcaoId: null,
            opcoes: [
              { id: "opt-filhos-sim", enunciado: "Sim", requerTexto: false },
              { id: "opt-filhos-nao", enunciado: "Não", requerTexto: false },
            ],
          },
          {
            id: "q-qtd-filhos",
            enunciado: "Quantos filhos?",
            tipo: "inteiro",
            obrigatoria: true,
            dependeDeOpcaoId: "opt-filhos-sim",
            opcoes: [],
          },
        ],
      },
      {
        id: "sec-02",
        titulo: "2. Hábitos de Vida",
        ordem: 2,
        perguntas: [
          {
            id: "q-fuma",
            enunciado: "Tabagismo",
            tipo: "unica_escolha",
            obrigatoria: true,
            dependeDeOpcaoId: null,
            opcoes: [
              { id: "opt-fuma-sim", enunciado: "Fumante", requerTexto: false },
              { id: "opt-fuma-nao", enunciado: "Não Fumante", requerTexto: false },
              { id: "opt-fuma-ex", enunciado: "Ex-Fumante", requerTexto: false },
            ],
          },
          {
            id: "q-cigarros",
            enunciado: "Quantos cigarros por dia?",
            tipo: "inteiro",
            obrigatoria: true,
            dependeDeOpcaoId: "opt-fuma-sim",
            opcoes: [],
          },
          {
            id: "q-bebe",
            enunciado: "Consome álcool?",
            tipo: "unica_escolha",
            obrigatoria: true,
            dependeDeOpcaoId: null,
            opcoes: [
              { id: "opt-alcool-sim", enunciado: "Sim", requerTexto: false },
              { id: "opt-alcool-nao", enunciado: "Não", requerTexto: false },
            ],
          },
          {
            id: "q-freq-alcool",
            enunciado: "Qual a frequência?",
            tipo: "unica_escolha",
            obrigatoria: true,
            dependeDeOpcaoId: "opt-alcool-sim",
            opcoes: [
              { id: "opt-freq-social", enunciado: "Socialmente", requerTexto: false },
              { id: "opt-freq-fds", enunciado: "Todo fim de semana", requerTexto: false },
              { id: "opt-freq-diario", enunciado: "Diariamente", requerTexto: false },
            ],
          },
        ],
      },
      {
        id: "sec-03",
        titulo: "3. Queixa Principal e Histórico",
        ordem: 3,
        perguntas: [
          {
            id: "q-historico",
            enunciado: "Histórico de Doenças na Família (Pode marcar vários)",
            tipo: "multipla_escolha",
            obrigatoria: false,
            dependeDeOpcaoId: null,
            opcoes: [
              { id: "opt-hist-diabetes", enunciado: "Diabetes", requerTexto: false },
              { id: "opt-hist-hipertensao", enunciado: "Hipertensão", requerTexto: false },
              { id: "opt-hist-cancer", enunciado: "Câncer", requerTexto: false },
              { id: "opt-hist-depressao", enunciado: "Depressão", requerTexto: false },
              { id: "opt-hist-outros", enunciado: "Outros", requerTexto: true, labelTexto: "Quais?" },
            ],
          },
          {
            id: "q-motivo",
            enunciado: "Motivo da Consulta (Relato do Paciente)",
            tipo: "longo_texto",
            obrigatoria: true,
            dependeDeOpcaoId: null,
            opcoes: [],
          },
        ],
      },
    ],
  },
};

export default function AnamnesePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedPatientId = searchParams.get("patientId");
  const preSelectedPatientName = searchParams.get("patientName");

  const { user } = useAuth();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  const { showFeedback } = useFeedback();

  const [selectedPatient, setSelectedPatient] = useState<string | null>(preSelectedPatientId || null);
  const [formularioFinalizado, setFormularioFinalizado] = useState(false);
  const [respostasFinais, setRespostasFinais] = useState<any>({});

  useEffect(() => {
    if (user && !preSelectedPatientId) {
      fetchPatients({ page: 1, limit: 10, status: "atendimento" } as any);
    }
  }, [user, fetchPatients, preSelectedPatientId]);

  const handleSearchPatient = useCallback(
    (term: string) => {
      fetchPatients({ nome: term, page: 1, limit: 10, status: "atendimento" } as any);
    },
    [fetchPatients]
  );

  const patientOptions = patients.map((p) => ({
    id: p.id,
    label: p.nome,
    subLabel: p.cpf ? `CPF: ${formatCPF(p.cpf)}` : "Sem CPF",
  }));

  if (preSelectedPatientId && preSelectedPatientName && !patientOptions.find((p) => p.id === preSelectedPatientId)) {
    patientOptions.unshift({
      id: preSelectedPatientId,
      label: decodeURIComponent(preSelectedPatientName),
      subLabel: "Selecionado",
    });
  }

  const handleFinalizar = (respostas: any) => {
    if (!selectedPatient) {
      showFeedback("Por favor, selecione um paciente antes de finalizar.", "error");
      return;
    }
    setRespostasFinais(respostas);
    setFormularioFinalizado(true);
    showFeedback("Anamnese salva com sucesso!", "success");
  };

  if (formularioFinalizado) {
    const nomePaciente = patientOptions.find((p) => p.id === selectedPatient)?.label || "Paciente";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
        <Typography variant="h4" className="text-brand-dark">
          Tudo pronto!
        </Typography>
        <PDFDownloadLink
          document={<AnamnesePDF pacienteNome={nomePaciente} respostas={respostasFinais} />}
          fileName={`anamnese.pdf`}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold shadow-md hover:scale-105 transition-transform bg-brand-anamnese"
        >
          {({ loading }) => (loading ? "Gerando..." : <><FileDown size={20} /> BAIXAR PDF</>)}
        </PDFDownloadLink>
        <button onClick={() => router.back()} className="text-sm text-gray-500 underline">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative pb-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full transition-colors bg-brand-anamnese/20 text-brand-anamnese hover:bg-brand-anamnese/30"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase tracking-wide text-brand-anamnese">
            Anamnese
          </Typography>
          <Typography variant="paragraph" className="text-gray-500 text-sm">
            Preencha o formulário de avaliação inicial.
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 bg-white border-brand-anamnese">
        <CardBody className="p-0">
          {/* HEADER PADRÃO DO CARD (corrigido/adiicionado) */}
          <div className="p-6 md:p-10 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="p-2 rounded-lg bg-brand-anamnese/20">
                <Stethoscope className="w-6 h-6 text-brand-anamnese" />
              </div>
              <Typography variant="h6" className="font-bold text-brand-anamnese">
                Dados da Anamnese
              </Typography>
            </div>

            <SearchableSelect
              label="Selecione a Paciente"
              options={patientOptions}
              value={selectedPatient}
              onChange={setSelectedPatient}
              onSearch={handleSearchPatient}
              isLoading={loadingPatients}
              required
              disabled={!!preSelectedPatientId}
              accentColorClass="brand-anamnese"
              placeholder="Busque pelo nome..."
            />
          </div>

          <div className="px-6 md:px-10 py-8">
            <FormularioBuilder
              modeloJson={MOCK_ANAMNESE as any}
              onFinalizar={handleFinalizar}
              themeKey="anamnese"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
