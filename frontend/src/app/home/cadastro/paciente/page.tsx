"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, UserPlus, Clock, Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardBody,
  Typography,
  Spinner,
  IconButton,
} from "@material-tailwind/react";
import Input from "@/components/Input";
import DateInput from "@/components/DateInput";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import Select from "@/components/SelectBox";
import InfoBox from "@/components/InfoBox";
import { verifyUserRedirect } from "@/utils/auth";
import { TimeSlot } from "@/types/disponibilidade";
import { getAuthHeader } from "@/utils/api";

const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
];

// Gera horário de início (8:00 - 17:00)
const HOURS_START = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});

// Gera horário de fim (9:00 - 18:00)
const HOURS_END = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 9;
  return `${hour.toString().padStart(2, "0")}:00`;
});

export default function NewPatient() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // Para verificar permissões
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Alerta
  const [feedback, setFeedback] = useState({
    open: false,
    color: "green" as "green" | "red",
    message: "",
  });

  // Dados do form
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    cellphone: "",
  });

  // Disponibilidade
  const [availability, setAvailability] = useState<TimeSlot[]>([
    { id: "1", day: "Segunda-feira", start: "08:00", end: "12:00" },
  ]);

  // Verificação de Segurança e Permissões
  useEffect(() => {
    const user = verifyUserRedirect(router, pathname);

    if (user) {
      // Exige permissão de Admin ou Cadastro
      if (!user.permAdmin && !user.permCadastro) {
        router.push("/home/cadastro");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [router, pathname]);

  // Atualiza os estados dos inputs simples (Nome, Data, Celular)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Adiciona um novo slot de horário com valores padrão
  const addSlot = () => {
    const newSlot: TimeSlot = {
      id: Math.random().toString(36).substr(2, 9),
      day: "Segunda-feira",
      start: "08:00",
      end: "18:00",
    };
    setAvailability([...availability, newSlot]);
  };

  // Remove um slot da lista
  const removeSlot = (id: string) => {
    if (availability.length === 1) {
      showAlert("red", "O paciente deve ter pelo menos um horário disponível.");
      return;
    }
    setAvailability(availability.filter((slot) => slot.id !== id));
  };

  // Atualiza um campo específico (dia, início ou fim)
  const updateSlot = (id: string, field: keyof TimeSlot, value: string) => {
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  const showAlert = (color: "green" | "red", message: string) => {
    setFeedback({ open: true, color, message });
    setTimeout(() => {
      setFeedback((prev) => ({ ...prev, open: false }));
    }, 4000);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback((prev) => ({ ...prev, open: false }));

    try {
      const hasInvalidTime = availability.some(slot => 
        parseInt(slot.start.split(':')[0]) >= parseInt(slot.end.split(':')[0])
      );

      if (hasInvalidTime) {
        showAlert("red", "O horário de término deve ser maior que o de início.");
        setLoading(false);
        return;
      }

      const payload = {
        nome: formData.name,
        dataNascimento: formData.birthDate,
        celular: formData.cellphone,
        // disponibilidade: availability
      };

      await axios.post("http://localhost:3001/users", payload, getAuthHeader());
      
      showAlert("green", "Paciente cadastrada com sucesso!");
      
      setFormData({ name: "", birthDate: "", cellphone: "" });
      setAvailability([{ id: '1', day: "Segunda-feira", start: "08:00", end: "12:00" }]);

    } catch (error: any) {
      console.error("Error creating patient:", error);
      const dataError = error.response?.data;
      const msgBackend = dataError?.error || dataError?.message;
      const finalMsg = typeof msgBackend === "string" ? msgBackend : "Erro ao realizar o cadastro.";
      
      showAlert("red", finalMsg);
    } finally {
      setLoading(false);
    }
  }

  // Spinner
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center w-full h-[80vh]">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative">
      <FeedbackAlert
        open={feedback.open}
        color={feedback.color}
        message={feedback.message}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
      />

      {/* Botão de voltar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors focus:outline-none"
          title="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Titulo */}
        <div>
          <Typography
            variant="h4"
            className="font-bold uppercase tracking-wide text-brand-dark"
          >
            Nova Paciente
          </Typography>
          <Typography
            variant="paragraph"
            className="text-gray-500 font-normal text-sm"
          >
            Preencha os dados e disponibilidade.
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface">
        <CardBody className="p-6 md:p-10">
          <form onSubmit={handleSave} className="flex flex-col gap-8">
            {/* SEÇÃO 1: DADOS PESSOAIS */}
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
                <Input
                  label="Nome Completo"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <DateInput
                  label="Data de Nascimento"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input
                  label="Celular"
                  name="cellphone"
                  value={formData.cellphone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  required
                />
                <div className="hidden lg:block"></div>
              </div>
            </div>

            {/* SEÇÃO 2: DISPONIBILIDADE */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <div className="p-2 bg-brand-purple/10 rounded-lg">
                  <Clock className="w-6 h-6 text-brand-purple" />
                </div>
                <Typography variant="h6" className="font-bold text-brand-dark">
                  Disponibilidade
                </Typography>
              </div>

              <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {availability.map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-brand-bg p-4 rounded-lg border border-gray-100 flex flex-col lg:flex-row gap-3 lg:items-center transition-colors hover:border-brand-pink/50"
                  >
                    <div className="flex items-center justify-between gap-2 w-full lg:w-1/3">
                      <div className="w-full">
                        <Select
                          options={DAYS_OF_WEEK}
                          value={slot.day}
                          onChange={(e) =>
                            updateSlot(slot.id, "day", e.target.value)
                          }
                        />
                      </div>
                      
                      {/* Lixeira Mobile */}
                      <div className="shrink-0 lg:hidden">
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => removeSlot(slot.id)}
                          className="hover:bg-red-50"
                          placeholder={undefined}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 w-full lg:w-2/3">
                      <div className="w-full">
                        <Select
                          options={HOURS_START}
                          value={slot.start}
                          onChange={(e) =>
                            updateSlot(slot.id, "start", e.target.value)
                          }
                        />
                      </div>

                      <span className="hidden lg:block text-gray-400 font-bold">
                        -
                      </span>

                      <div className="w-full">
                        <Select
                          options={HOURS_END}
                          value={slot.end}
                          onChange={(e) =>
                            updateSlot(slot.id, "end", e.target.value)
                          }
                        />
                      </div>
                      
                      {/* Lixeira Desktop */}
                      <div className="hidden lg:block ml-auto">
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => removeSlot(slot.id)}
                          className="hover:bg-red-50"
                          placeholder={undefined}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botões */}
              <Button
                variant="outline"
                type="button"
                onClick={addSlot}
                className="flex items-center justify-center gap-2 border-dashed border-2"
              >
                <Plus size={18} /> ADICIONAR NOVO HORÁRIO
              </Button>

              <InfoBox>
                Esses horários ajudarão a encontrar os melhores momentos para as
                sessões deste paciente.
              </InfoBox>
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="w-full lg:w-1/2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  fullWidth
                >
                  CANCELAR
                </Button>
              </div>
              <div className="w-full lg:w-1/2">
                <Button type="submit" loading={loading} fullWidth>
                  {loading ? "SALVANDO..." : "CADASTRAR PACIENTE"}
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
