"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Clock, Search, Calendar, User, CreditCard, Phone } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import InfoBox from "@/components/InfoBox";
import AvailabilitySearchSelector from "@/components/AvailabilitySearchSelector";
import CardTerapeuta from "@/components/CardTerapeuta"; 
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { patientService } from "@/services/patientServices";
import { useFormHandler } from "@/hooks/useFormHandler";
import { formatCPF, formatPhone, cleanFormat, formatTimeInterval } from "@/utils/format";
import { validateBirthDateISO } from "@/utils/validation";
import { TimeSlot } from "@/types/disponibilidade";
import { useProfessionalSearch } from "@/hooks/useProfessionalSearch";
import { usePatients } from "@/hooks/usePatients";

export default function NewPatient() {
  const router = useRouter();
  const { user, isTeacher, isLoading: authLoading } = useAuth();
  const { createPatient } = usePatients();
  const { showFeedback } = useFeedback();
  const { loading: loadingSave, handleSubmit } = useFormHandler();

  const {
    searchProfessionals,
    results: searchResults,
    loading: searchLoading,
    clearResults,
  } = useProfessionalSearch();

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    cpf: "",
    cellphone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [availability, setAvailability] = useState<TimeSlot[]>([
    { id: "1", day: "Segunda-feira", start: "08:00", end: "09:00" },
  ]);

  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [professionalPatientCounts, setProfessionalPatientCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      if (!searchResults || searchResults.length === 0) {
        setProfessionalPatientCounts({});
        return;
      }
      try {
        const results = await Promise.all(
          searchResults.map(async (prof: any) => {
            try {
              const resp = await patientService.getAll({ page: 1, limit: 1, userTargetId: prof.id });
              return [prof.id, resp.meta?.total ?? 0] as const;
            } catch {
              return [prof.id, 0] as const;
            }
          })
        );
        if (!cancelled) {
          const map: Record<string, number> = {};
          results.forEach(([id, total]) => (map[id] = total));
          setProfessionalPatientCounts(map);
        }
      } catch {
        if (!cancelled) setProfessionalPatientCounts({});
      }
    }
    loadCounts();
    return () => { cancelled = true; };
  }, [searchResults]);

  useEffect(() => {
    if (!authLoading && user) {
      const canAccess = user.permAdmin || user.permCadastro;
      if (!canAccess) router.push("/home/cadastro");
    }
  }, [authLoading, user, isTeacher, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Limpa erro ao digitar
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));

    if (name === "cpf") setFormData((prev) => ({ ...prev, [name]: formatCPF(value) }));
    else if (name === "cellphone") setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setSelectedProfessionalId(null);
    clearResults();
    
    const slot = availability[0];
    if (!slot) return;

    const startHour = parseInt(slot.start.split(":")[0], 10);
    const endHour = parseInt(slot.end.split(":")[0], 10);

    if (startHour >= endHour) {
      showFeedback("O horário final deve ser maior que o horário inicial.", "error");
      return;
    }

    await searchProfessionals(slot.day, slot.start, slot.end);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    
    // Validação Explícita
    if (!formData.name.trim()) nextErrors.name = "Campo obrigatório.";
    if (!formData.birthDate) nextErrors.birthDate = "Campo obrigatório.";
    
    const cleanCPF = cleanFormat(formData.cpf);
    if (!cleanCPF || cleanCPF.length < 11) nextErrors.cpf = "CPF incompleto.";
    
    const cleanPhone = cleanFormat(formData.cellphone);
    if (!cleanPhone || cleanPhone.length < 10) nextErrors.cellphone = "Telefone incompleto.";

    if (formData.birthDate) {
      const birthCheck = validateBirthDateISO(formData.birthDate, { maxAge: 120 });
      if (!birthCheck.valid) nextErrors.birthDate = birthCheck.message;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showFeedback("Preencha todos os campos obrigatórios corretamente.", "error");
      return;
    }

    if (!selectedProfessionalId) {
      showFeedback("Por favor, selecione um profissional responsável.", "error");
      return;
    }

    await handleSubmit(async () => {
      await createPatient({
        nome: formData.name,
        dataNascimento: formData.birthDate,
        cpf: cleanFormat(formData.cpf),
        telefone: cleanFormat(formData.cellphone),
        terapeutaId: selectedProfessionalId,
      });

      showFeedback("Paciente cadastrada e vinculada com sucesso!", "success");

      setFormData({ name: "", birthDate: "", cpf: "", cellphone: "" });
      setSelectedProfessionalId(null);
      clearResults();
      setErrors({});
    });
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

      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-3 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors focus:outline-none">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase tracking-wide text-brand-dark">Nova Paciente</Typography>
          <Typography variant="paragraph" className="text-gray-500 font-normal text-sm">Preencha os dados abaixo.</Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface">
        <CardBody className="p-6 md:p-10">
          <form onSubmit={handleSave} className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <div className="p-2 bg-brand-purple/10 rounded-lg"><UserPlus className="w-6 h-6 text-brand-purple" /></div>
                <Typography variant="h6" className="font-bold text-brand-dark">Informações Pessoais</Typography>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input 
                  label="Nome Completo" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  leftIcon={User}
                  placeholder="Ex: Maria Silva"
                  error={errors.name}
                />
                
                <Input 
                  type="date"
                  label="Data de Nascimento" 
                  name="birthDate" 
                  value={formData.birthDate} 
                  required 
                  max={new Date().toISOString().split("T")[0]} 
                  onChange={(e) => {
                      setErrors(prev => ({ ...prev, birthDate: "" }));
                      setFormData((prev) => ({ ...prev, birthDate: e.target.value }));
                  }} 
                  leftIcon={Calendar}
                  error={errors.birthDate}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input 
                  label="CPF" 
                  name="cpf" 
                  value={formData.cpf} 
                  onChange={handleChange} 
                  placeholder="000.000.000-00" 
                  maxLength={14} 
                  required 
                  leftIcon={CreditCard}
                  error={errors.cpf}
                />
                <Input 
                  label="Celular" 
                  name="cellphone" 
                  value={formData.cellphone} 
                  onChange={handleChange} 
                  placeholder="(00) 90000-0000" 
                  maxLength={15} 
                  required 
                  leftIcon={Phone}
                  error={errors.cellphone}
                />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <div className="p-2 bg-brand-purple/10 rounded-lg"><Clock className="w-6 h-6 text-brand-purple" /></div>
                <Typography variant="h6" className="font-bold text-brand-dark">Definir Profissional Responsável</Typography>
              </div>

              <InfoBox>Selecione o horário preferencial da paciente para encontrar extensionistas disponíveis.</InfoBox>

              <div className="flex flex-col gap-4">
                <AvailabilitySearchSelector availability={availability} setAvailability={setAvailability} />
                <Button type="button" onClick={handleSearch} loading={searchLoading} fullWidth className="h-[52px] bg-brand-purple text-white hover:bg-brand-purple/90 flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> BUSCAR PROFISSIONAIS DISPONÍVEIS
                </Button>
              </div>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {searchResults.map((item) => {
                    const prof = item.user;
                    const isSelected = selectedProfessionalId === prof.id;
                    const listaDisponibilidade = item.availability || [];
                    const horariosString = listaDisponibilidade.map((a: any) => formatTimeInterval(a.horaInicio, a.horaFim)).join(" / ");

                    return (
                      <CardTerapeuta
                        key={prof.id}
                        name={prof.nome}
                        registration={horariosString || "Disponível"}
                        secondaryLabel="Disponibilidade"
                        occupiedSlots={professionalPatientCounts[prof.id] ?? 0}
                        capacity={5}
                        onClick={() => setSelectedProfessionalId(prof.id)}
                        selected={isSelected}
                        avatarUrl={null}
                        className="h-full"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  {searchLoading ? "Buscando..." : "Faça uma busca para ver os profissionais."}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4 pt-6 border-t border-gray-100">
              <div className="w-full lg:w-1/2">
                <Button variant="outline" type="button" onClick={() => router.back()} fullWidth>CANCELAR</Button>
              </div>
              <div className="w-full lg:w-1/2">
                <Button type="submit" loading={loadingSave} fullWidth>
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