"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Clock,
  Search,
  Calendar,
  User,
  CreditCard,
  Phone,
} from "lucide-react";
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
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatCPF, formatPhone, cleanFormat, formatTimeInterval } from "@/utils/format";
import { TimeSlot } from "@/types/disponibilidade";
import { useProfessionalSearch } from "@/hooks/useProfessionalSearch";
import { usePatients } from "@/hooks/usePatients";

export default function NewPatient() {
  const router = useRouter();
  const { user, isTeacher, isLoading: authLoading } = useAuth();
  const { createPatient } = usePatients();
  const { showFeedback } = useFeedback();
  const { loading: loadingSave, handleSubmit } = useFormHandler();

  const { bgClass, textClass, borderClass, lightBgClass, ringClass } = useAppTheme();

  const themeAccentColor = "brand-paciente";
  const inputFocusClass = `focus-within:!border-brand-paciente focus-within:!ring-1 focus-within:!ring-brand-paciente`;

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
  const [loadingCounts, setLoadingCounts] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCounts() {
      if (!searchResults || searchResults.length === 0) {
        if (isMounted) setProfessionalPatientCounts({});
        return;
      }

      if (isMounted) setLoadingCounts(true);

      try {
        const promises = searchResults.map(async (prof: any) => {
          try {
            const resp = await patientService.getAll({
              page: 1,
              limit: 1,
              userTargetId: prof.user.id,
              status: "atendimento",
            });

            const meta: any = resp.meta;
            const total = meta?.totalItems ?? meta?.total ?? 0;
            return { id: prof.user.id, total };
          } catch (error) {
            return { id: prof.user.id, total: 0 };
          }
        });

        const results = await Promise.all(promises);

        if (isMounted) {
          const newCounts: Record<string, number> = {};
          results.forEach((r) => {
            newCounts[r.id] = r.total;
          });
          setProfessionalPatientCounts(newCounts);
        }
      } finally {
        if (isMounted) setLoadingCounts(false);
      }
    }

    loadCounts();
    return () => {
      isMounted = false;
    };
  }, [searchResults]);

  useEffect(() => {
    if (!authLoading && user) {
      const canAccess = user.permAdmin || user.permCadastro;
      if (!canAccess) router.push("/home/cadastro");
    }
  }, [authLoading, user, isTeacher, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const nameToBackField: Record<string, string> = {
      name: "nome",
      birthDate: "dataNascimento",
      cpf: "cpf",
      cellphone: "telefone",
    };
    const backField = nameToBackField[name];
    if (backField && errors[backField]) {
      setErrors((prev) => ({ ...prev, [backField]: "" }));
    }

    if (name === "cpf") setFormData((prev) => ({ ...prev, [name]: formatCPF(value) }));
    else if (name === "cellphone") setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setSelectedProfessionalId(null);
    setProfessionalPatientCounts({});
    setErrors((prev) => ({ ...prev, terapeutaId: "" }));

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
    setErrors({});

    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.nome = "Campo obrigatório.";
    if (!formData.birthDate) next.dataNascimento = "Campo obrigatório.";
    if (!cleanFormat(formData.cpf)) next.cpf = "Campo obrigatório.";
    if (!cleanFormat(formData.cellphone)) next.telefone = "Campo obrigatório.";
    if (!selectedProfessionalId) next.terapeutaId = "Selecione um profissional.";

    if (Object.keys(next).length) {
      setErrors(next);
      showFeedback("Verifique os campos em destaque.", "error");
      return;
    }

    const selectedCount = selectedProfessionalId
      ? (professionalPatientCounts[selectedProfessionalId] ?? 0)
      : 0;

    if (selectedCount >= 5) {
      showFeedback("Esse profissional já atingiu o limite de 5 pacientes.", "error");
      return;
    }

    // CORREÇÃO: O callback de erro estava fora do handleSubmit
    await handleSubmit(
      async () => {
        await createPatient({
          nome: formData.name,
          dataNascimento: formData.birthDate,
          cpf: cleanFormat(formData.cpf),
          telefone: cleanFormat(formData.cellphone),
          terapeutaId: selectedProfessionalId!,
        });

        showFeedback("Paciente cadastrada e vinculada com sucesso!", "success");
        setFormData({ name: "", birthDate: "", cpf: "", cellphone: "" });
        setSelectedProfessionalId(null);
        clearResults();
        setProfessionalPatientCounts({});
        setErrors({});
      },
      undefined,
      (err, fieldErrors) => {
        if (fieldErrors && Object.keys(fieldErrors).length > 0) {
          const mappedErrors: Record<string, string> = { ...fieldErrors };
          
          if (fieldErrors.dataNascimento) mappedErrors.birthDate = fieldErrors.dataNascimento;
          if (fieldErrors.telefone) mappedErrors.cellphone = fieldErrors.telefone;
          
          setErrors(mappedErrors);
        }
      }
    );
  };

  if (authLoading || (!isTeacher && !user?.permCadastro)) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spinner className={`h-12 w-12 ${textClass}`} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative pb-20">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className={`p-3 rounded-full transition-colors focus:outline-none ${lightBgClass} ${textClass} hover:bg-opacity-20`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase tracking-wide text-brand-paciente">
            Nova Paciente
          </Typography>
          <Typography variant="paragraph" className="text-gray-500 font-normal text-sm">
            Preencha os dados abaixo.
          </Typography>
        </div>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className={`w-full shadow-lg border-t-4 border-brand-paciente bg-white`}>
        <CardBody className="p-6 md:p-10">
          <form onSubmit={handleSave} className="flex flex-col gap-10">
            {/* SEÇÃO 1 */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <div className={`p-2 rounded-lg ${lightBgClass}`}>
                  <UserPlus className={`w-6 h-6 ${textClass}`} />
                </div>
                <Typography variant="h6" className="font-bold text-brand-paciente">
                  Informações Pessoais
                </Typography>
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
                  error={errors.nome}
                  focusColorClass={inputFocusClass}
                />
                <Input
                  type="date"
                  label="Data de Nascimento"
                  name="birthDate"
                  value={formData.birthDate}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setErrors((prev) => ({ ...prev, dataNascimento: "" }));
                    setFormData((prev) => ({ ...prev, birthDate: e.target.value }));
                  }}
                  leftIcon={Calendar}
                  error={errors.dataNascimento}
                  focusColorClass={inputFocusClass}
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
                  focusColorClass={inputFocusClass}
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
                  error={errors.telefone}
                  focusColorClass={inputFocusClass}
                />
              </div>
            </div>

            {/* SEÇÃO 2 */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <div className={`p-2 rounded-lg ${lightBgClass}`}>
                  <Clock className={`w-6 h-6 ${textClass}`} />
                </div>
                <Typography variant="h6" className="font-bold text-brand-paciente">
                  Definir Profissional Responsável
                </Typography>
              </div>

              <InfoBox className={`!border-l-4 !border-brand-paciente !bg-brand-paciente/10 !text-brand-paciente`}>
                Selecione o horário preferencial da paciente para encontrar terapeutas disponíveis.
              </InfoBox>

              {errors.terapeutaId && (
                <div className="text-xs text-brand-encaminhamento font-bold -mt-2">
                  {errors.terapeutaId}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <AvailabilitySearchSelector
                  availability={availability}
                  setAvailability={setAvailability}
                  accentColorClass={inputFocusClass}
                />

                <Button
                  type="button"
                  onClick={handleSearch}
                  loading={searchLoading}
                  fullWidth
                  accentColorClass={themeAccentColor}
                  className="h-[52px] flex items-center justify-center gap-2 shadow-none hover:shadow-md transition-all"
                >
                  <Search className="w-4 h-4" /> BUSCAR PROFISSIONAIS DISPONÍVEIS
                </Button>
              </div>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 animate-fade-in">
                  {searchResults.map((item) => {
                    const prof = item.user;
                    const isSelected = selectedProfessionalId === prof.id;

                    const count = professionalPatientCounts[prof.id] ?? 0;
                    const reachedLimit = count >= 5;

                    const horariosString = (item.availability || [])
                      .map((a: any) => formatTimeInterval(a.horaInicio, a.horaFim))
                      .join(" / ");

                    return (
                      <div key={prof.id} className="relative">
                        {loadingCounts && typeof professionalPatientCounts[prof.id] === "undefined" && (
                          <div className="absolute top-2 right-2 z-10 p-1 bg-white/80 rounded-full">
                            <Spinner className={`h-4 w-4 ${textClass}`} />
                          </div>
                        )}

                        <CardTerapeuta
                          name={prof.nome}
                          registration={horariosString || "Disponível"}
                          secondaryLabel="Disponibilidade"
                          occupiedSlots={count}
                          capacity={5}
                          onClick={() => {
                            if (reachedLimit) {
                              showFeedback("Esse profissional já atingiu o limite de 5 pacientes.", "error");
                              return;
                            }
                            setSelectedProfessionalId(prof.id);
                            setErrors((prev) => ({ ...prev, terapeutaId: "" }));
                          }}
                          selected={isSelected}
                          avatarUrl={null}
                          accentColor={themeAccentColor}
                          className="h-full"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  {searchLoading ? "Buscando..." : "Faça uma busca para ver os profissionais."}
                </div>
              )}
            </div>

            {/* BOTÕES */}
            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4 pt-6 border-t border-gray-100">
              <div className="w-full lg:w-1/2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  fullWidth
                  accentColorClass={themeAccentColor}
                  className="hover:bg-opacity-10 bg-transparent border"
                >
                  CANCELAR
                </Button>
              </div>
              <div className="w-full lg:w-1/2">
                <Button
                  type="submit"
                  loading={loadingSave}
                  fullWidth
                  accentColorClass={themeAccentColor}
                  className="shadow-none hover:shadow-md transition-all"
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