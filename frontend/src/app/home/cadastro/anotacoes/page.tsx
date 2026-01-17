"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, PenTool, List } from "lucide-react";
import { Card, CardBody, Typography, Textarea } from "@material-tailwind/react";
import Button from "@/components/Button";
import SearchableSelect from "@/components/SearchableSelect";
import Select from "@/components/SelectBox";
import { useFormHandler } from "@/hooks/useFormHandler";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/contexts/AuthContext";
import { formatCPF } from "@/utils/format";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function AnotacoesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedPatientId = searchParams.get("patientId");
  const preSelectedPatientName = searchParams.get("patientName");
  const { user } = useAuth();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  const { loading: loadingSave, handleSubmit } = useFormHandler();

  const { borderClass, textClass, lightBgClass } = useAppTheme();

  const [selectedPatient, setSelectedPatient] = useState<string | null>(preSelectedPatientId || null);
  const [sessionNumber, setSessionNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user && !preSelectedPatientId) fetchPatients({ page: 1, limit: 10, status: "atendimento" } as any);
  }, [user, fetchPatients, preSelectedPatientId]);

  const handleSearchPatient = useCallback((term: string) => fetchPatients({ nome: term, page: 1, limit: 10, status: "atendimento" } as any), [fetchPatients]);
  const patientOptions = patients.map((p) => ({ id: p.id, label: p.nome, subLabel: p.cpf ? `CPF: ${formatCPF(p.cpf)}` : "Sem CPF" }));

  if (preSelectedPatientId && preSelectedPatientName && !patientOptions.find((p) => p.id === preSelectedPatientId)) {
    patientOptions.unshift({ id: preSelectedPatientId, label: decodeURIComponent(preSelectedPatientName), subLabel: "Selecionado" });
  }
  
  const sessionOptions = [{ value: "1", label: "Sessão 1" }, { value: "2", label: "Sessão 2" }, { value: "3", label: "Sessão 3" }];

  const handleSave = async () => {
    await handleSubmit(async () => {
      console.log("Salvando:", { patientId: selectedPatient, sessao: sessionNumber, texto: notes });
      await new Promise((r) => setTimeout(r, 1000));
      router.back();
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className={`p-3 rounded-full transition-colors ${lightBgClass} ${textClass} hover:bg-opacity-20`}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase tracking-wide text-brand-anotacoes">Anotações</Typography>
          <Typography variant="paragraph" className="text-gray-500 text-sm">Registro livre.</Typography>
        </div>
      </div>

      <Card className={`w-full shadow-lg border-t-4 ${borderClass} bg-white`}>
        <CardBody className="p-6 md:p-10 flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
            <div className={`p-2 rounded-lg ${lightBgClass}`}><PenTool className={`w-6 h-6 ${textClass}`} /></div>
            <Typography variant="h6" className="font-bold text-brand-anotacoes">Registro de Notas</Typography>
          </div>

          <div className="w-full">
            <SearchableSelect
              label="Paciente"
              options={patientOptions}
              value={selectedPatient}
              onChange={setSelectedPatient}
              onSearch={handleSearchPatient}
              isLoading={loadingPatients}
              required
              disabled={!!preSelectedPatientId}
              placeholder="Busque pelo nome"
              accentColorClass="brand-anotacoes"
            />
          </div>
          <div className="w-full">
            <Select
              label="Referente à Sessão"
              options={sessionOptions}
              value={sessionNumber}
              onChange={setSessionNumber}
              placeholder="Selecione..."
              leftIcon={List}
              accentColorClass="brand-anotacoes"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2"><PenTool size={18} className={textClass} /><label className="text-sm font-bold text-gray-700">Conteúdo</label></div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              placeholder="Escreva o que desejar registrar..."
              className="!border-gray-300 focus:!border-brand-anotacoes focus:!ring-1 focus:!ring-brand-anotacoes bg-white"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="flex flex-col-reverse lg:flex-row gap-4 mt-2 border-t border-gray-100 pt-4">
            <div className="w-full lg:w-1/2">
              <Button variant="outline" onClick={() => router.back()} fullWidth accentColorClass="brand-anotacoes" className="bg-transparent hover:bg-opacity-10 border">CANCELAR</Button>
            </div>
            <div className="w-full lg:w-1/2">
              <Button onClick={handleSave} loading={loadingSave} fullWidth accentColorClass="brand-anotacoes">SALVAR ANOTAÇÃO</Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
