"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Clock, Search } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import Input from "@/components/Input";
import DateInput from "@/components/DateInput";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import InfoBox from "@/components/InfoBox";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/hooks/useFeedback";
import { formatCPF, formatPhone, cleanFormat, formatTimeInterval } from "@/utils/format";
import { TimeSlot } from "@/types/disponibilidade";
import { useProfessionalSearch } from "@/hooks/useProfessionalSearch";
import AvailabilitySearchSelector from "@/components/AvailabilitySearchSelector";
import api from "@/services/api";
import CardListagem from "@/components/CardListagem";

export default function NewPatient() {
  const router = useRouter();
  const { user, isTeacher, isLoading: authLoading } = useAuth();
  const { feedback, showAlert, closeAlert } = useFeedback();
  
  // Hook de busca
  const {
    searchProfessionals,
    results: searchResults,
    loading: searchLoading,
    clearResults,
  } = useProfessionalSearch();

  const [loadingSave, setLoadingSave] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    cpf: "",
    cellphone: "",
  });
  
  // Estado do Filtro de Disponibilidade
  const [availability, setAvailability] = useState<TimeSlot[]>([
    { id: "1", day: "Segunda-feira", start: "08:00", end: "09:00" },
  ]);
  
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);

  // Proteção de Rota
  useEffect(() => {
    if (!authLoading && user) {
      const canAccess = isTeacher || user.permCadastro;
      if (!canAccess) router.push("/home/cadastro");
    }
  }, [authLoading, user, isTeacher, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "cpf")
      setFormData((prev) => ({ ...prev, [name]: formatCPF(value) }));
    else if (name === "cellphone")
      setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // BUSCA
  const handleSearch = async () => {
    setSelectedProfessionalId(null);
    clearResults();
    closeAlert();

    const slot = availability[0];
    if (!slot) return;

    await searchProfessionals(slot.day, slot.start, slot.end);
  };

  // SALVAR
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSave(true);
    closeAlert();

    if (!selectedProfessionalId) {
      showAlert("red", "Por favor, selecione um profissional responsável.");
      setLoadingSave(false);
      return;
    }

    try {
      const payload = {
        nome: formData.name,
        dataNascimento: formData.birthDate,
        cpf: cleanFormat(formData.cpf),
        telefone: cleanFormat(formData.cellphone),
        profissionalResponsavelId: selectedProfessionalId,
      };

      await api.post("/patient", payload);

      showAlert("green", "Paciente cadastrada e vinculada com sucesso!");

      setFormData({ name: "", birthDate: "", cpf: "", cellphone: "" });
      setSelectedProfessionalId(null);
      clearResults();
    } catch (error: any) {
      console.error("Erro cadastro:", error);
      const msg = error.response?.data?.error || "Erro ao realizar cadastro.";
      showAlert("red", msg);
    } finally {
      setLoadingSave(false);
    }
  };

  if (authLoading || (!isTeacher && !user?.permCadastro)) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spinner className="text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative pb-20">
      <FeedbackAlert
        open={feedback.open}
        color={feedback.color}
        message={feedback.message}
        onClose={closeAlert}
      />

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase tracking-wide text-brand-dark">
            Nova Paciente
          </Typography>
          <Typography variant="paragraph" className="text-gray-500 text-sm">
            Dados pessoais e vinculação.
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface">
        <CardBody className="p-6 md:p-10">
          <form onSubmit={handleSave} className="flex flex-col gap-10">
            
            {/* 1. DADOS PESSOAIS */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <div className="p-2 bg-brand-purple/10 rounded-lg">
                  <UserPlus className="w-6 h-6 text-brand-purple" />
                </div>
                <Typography variant="h6" className="font-bold text-brand-dark">
                  Informações Pessoais
                </Typography>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input label="Nome Completo" name="name" value={formData.name} onChange={handleChange} required />
                <DateInput label="Data de Nascimento" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} required />
                <Input label="Telefone" name="cellphone" value={formData.cellphone} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} required />
              </div>
            </div>

            {/* 2. VINCULAÇÃO */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <div className="p-2 bg-brand-purple/10 rounded-lg">
                  <Clock className="w-6 h-6 text-brand-purple" />
                </div>
                <Typography variant="h6" className="font-bold text-brand-dark">
                  Definir Profissional Responsável
                </Typography>
              </div>

              <InfoBox>
                Selecione o horário preferencial da paciente para encontrar extensionistas disponíveis.
              </InfoBox>

              <div className="flex flex-col gap-4">
                <AvailabilitySearchSelector
                  availability={availability}
                  setAvailability={setAvailability}
                />

                <Button
                  type="button"
                  onClick={handleSearch}
                  loading={searchLoading}
                  fullWidth
                  className="h-[52px] bg-brand-purple text-white hover:bg-brand-purple/90 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> BUSCAR DISPONÍVEIS
                </Button>
              </div>

              {/* RESULTADOS DA BUSCA */}
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {searchResults.map((item) => {
                    const prof = item.user;
                    const isSelected = selectedProfessionalId === prof.id;
                    
                    // CORREÇÃO: O cálculo da string deve ser feito AQUI DENTRO do map
                    const horariosString = item.availabilities
                      .map(a => formatTimeInterval(a.inicio, a.fim))
                      .join(" / ");

                    return (
                      <CardListagem
                        key={prof.id}
                        nomePrincipal={prof.nome}
                        detalhe={
                          <span className="text-xs font-medium text-brand-purple bg-brand-purple/5 px-2 py-1 rounded-md">
                            {horariosString || "Disponível"}
                          </span>
                        }
                        onClick={() => setSelectedProfessionalId(prof.id)}
                        selected={isSelected}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  {searchLoading
                    ? "Buscando..."
                    : "Faça uma busca para ver os profissionais."}
                </div>
              )}
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4 pt-6 border-t border-gray-100">
              <div className="w-full lg:w-1/2">
                <Button variant="outline" type="button" onClick={() => router.back()} fullWidth>
                  CANCELAR
                </Button>
              </div>
              <div className="w-full lg:w-1/2">
                <Button
                  type="submit"
                  loading={loadingSave}
                  disabled={!selectedProfessionalId}
                  fullWidth
                >
                  {loadingSave ? "SALVANDO..." : "CADASTRAR E VINCULAR"}
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}