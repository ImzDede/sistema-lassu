"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import {
  Card,
  CardBody,
  Typography,
  IconButton,
  Spinner,
} from "@material-tailwind/react";
import {
  Lock,
  Clock,
  Plus,
  Trash2,
  ArrowRight,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import Select from "@/components/SelectBox";
import InfoBox from "@/components/InfoBox";
import { logout, saveToken, verifyUserRedirect } from "@/utils/auth";
import { TimeSlot } from "@/types/disponibilidade";
import { getAuthHeader } from "@/utils/api";

const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
];

// Horários Início (08:00 - 17:00)
const HOURS_START = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});

// Horários Fim (09:00 - 18:00)
const HOURS_END = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 9;
  return `${hour.toString().padStart(2, "0")}:00`;
});

export default function FirstAccess() {
  const router = useRouter();
  const pathname = usePathname();

  // Controle de acesso e carregamento
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [step, setStep] = useState(1);
  const [loadingSave, setLoadingSave] = useState(false);

  const [userName, setUserName] = useState("");
  const [feedback, setFeedback] = useState({
    open: false,
    color: "green" as "green" | "red",
    message: "",
  });

  // States do Formulário
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [availability, setAvailability] = useState<TimeSlot[]>([
    { id: "1", day: "Segunda-feira", start: "08:00", end: "12:00" },
  ]);

  useEffect(() => {
    // Middleware Client-Side: Verifica se o usuário tem a flag 'primeiroAcesso: true'
    const user = verifyUserRedirect(router, pathname);

    if (user) {
      setUserName(user.nome);
      setIsAuthorized(true);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Gerenciamento de Slots de Disponibilidade
  const addSlot = () => {
    const newSlot: TimeSlot = {
      id: Math.random().toString(36).substr(2, 9),
      day: "Segunda-feira",
      start: "08:00",
      end: "18:00",
    };
    setAvailability([...availability, newSlot]);
  };

  const removeSlot = (id: string) => {
    if (availability.length === 1) {
      showAlert("red", "Defina pelo menos um horário.");
      return;
    }
    setAvailability(availability.filter((slot) => slot.id !== id));
  };

  const updateSlot = (id: string, field: keyof TimeSlot, value: string) => {
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  // Funções Auxiliares
  const showAlert = (color: "green" | "red", message: string) => {
    setFeedback({ open: true, color, message });
    setTimeout(() => setFeedback((prev) => ({ ...prev, open: false })), 4000);
  };

  const handleNextStep = () => {
    if (passwords.new.length < 6) {
      showAlert("red", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showAlert("red", "As senhas não coincidem.");
      return;
    }
    setStep(2);
  };

  // Envia os dados para o backend
  const handleSaveAll = async () => {
    setLoadingSave(true);
    try {
      // Validação de horário reverso
      const hasInvalidTime = availability.some(
        (slot) =>
          parseInt(slot.start.split(":")[0]) >= parseInt(slot.end.split(":")[0])
      );

      if (hasInvalidTime) {
        showAlert("red", "Horário final deve ser maior que inicial.");
        setLoadingSave(false);
        return;
      }

      const payload = {
        senha: passwords.new,
        fotoUrl: null,
        // disponibilidade: availability
      };

      
      const response = await axios.patch(
        "http://localhost:3001/users/first-acess", 
        payload, 
        getAuthHeader()
      );

      // SUCESSO: Força o logout e manda para o login
      showAlert("green", "Senha definida! Faça login novamente.");
      logout();
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        "Erro ao salvar";
      showAlert("red", msg);
    } finally {
      setLoadingSave(false);
    }
  };

  // Spinner
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-brand-purple"></div>

      {/* BOTÃO DE SAIR (TEMPORÁRIO) */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-brand-pink text-brand-pink hover:bg-brand-pink/10 px-4 py-2"
        >
          <LogOut size={16} className="mr-2" /> Sair
        </Button>
      </div>

      {/* Feedback Alerta */}
      <FeedbackAlert
        open={feedback.open}
        color={feedback.color}
        message={feedback.message}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
      />

      <div className="w-full max-w-2xl flex flex-col gap-6 relative z-10">
        <div className="text-center space-y-2 px-4 mt-8 md:mt-0">
          <Image
            src="/logoLassu.svg"
            alt="Logo"
            width={60}
            height={60}
            className="mx-auto mb-4"
          />

          <Typography
            className="text-xl md:text-3xl text-brand-dark font-bold uppercase break-words px-4 leading-tight"
            placeholder={undefined}
          >
            Olá, {userName.split(" ")[0]}!
          </Typography>
          <Typography
            className="text-gray-500 font-normal text-sm md:text-base"
            placeholder={undefined}
          >
            Como é seu primeiro acesso, precisamos configurar algumas coisas.
          </Typography>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div
            className={`flex items-center gap-2 ${
              step >= 1 ? "text-brand-purple" : "text-gray-300"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold ${
                step >= 1
                  ? "border-brand-purple bg-brand-purple text-white"
                  : "border-gray-300"
              }`}
            >
              1
            </div>
            <span className="font-bold text-sm">SENHA</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-200"></div>
          <div
            className={`flex items-center gap-2 ${
              step >= 2 ? "text-brand-purple" : "text-gray-300"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold ${
                step >= 2
                  ? "border-brand-purple bg-brand-purple text-white"
                  : "border-gray-300"
              }`}
            >
              2
            </div>
            <span className="font-bold text-sm">DISPONIBILIDADE</span>
          </div>
        </div>

        <Card
          className="shadow-lg border border-brand-pink/20 bg-brand-surface"
          placeholder={undefined}
        >
          <CardBody className="p-6 md:p-10" placeholder={undefined}>
            {/* PASSO 1: SENHA */}
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-brand-purple/10 rounded-lg">
                    <Lock className="w-6 h-6 text-brand-purple" />
                  </div>
                  <div>
                    <Typography
                      variant="h6"
                      className="text-brand-dark font-bold"
                      placeholder={undefined}
                    >
                      Definir Nova Senha
                    </Typography>
                    <Typography
                      variant="small"
                      className="text-gray-400"
                      placeholder={undefined}
                    >
                      Sua segurança é importante para nós.
                    </Typography>
                  </div>
                </div>

                <div className="space-y-6">
                  <Input
                    label="Nova Senha"
                    type={showNew ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    icon={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowNew(!showNew)}
                        className="focus:outline-none hover:text-brand-purple text-gray-400"
                      >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                  <Input
                    label="Confirmar Senha"
                    type={showConfirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    icon={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="focus:outline-none hover:text-brand-purple text-gray-400"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleNextStep}
                    className="flex items-center gap-2"
                  >
                    PRÓXIMO <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            )}

            {/* PASSO 2: DISPONIBILIDADE */}
            {step === 2 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-brand-purple/10 rounded-lg">
                    <Clock className="w-6 h-6 text-brand-purple" />
                  </div>
                  <div>
                    <Typography
                      variant="h6"
                      className="text-brand-dark font-bold"
                      placeholder={undefined}
                    >
                      Definir Disponibilidade
                    </Typography>
                    <Typography
                      variant="small"
                      className="text-gray-400"
                      placeholder={undefined}
                    >
                      Informe seus horários livres.
                    </Typography>
                  </div>
                </div>

                {/* SCROLLBAR CONTAINER */}
                <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {availability.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-brand-bg p-4 rounded-lg border border-gray-100 flex flex-col md:flex-row gap-3 md:items-center transition-colors hover:border-brand-pink/50"
                    >
                      <div className="flex items-center justify-between gap-2 w-full md:w-1/3">
                        <div className="w-full">
                          <Select
                            options={DAYS_OF_WEEK}
                            value={slot.day}
                            onChange={(e) =>
                              updateSlot(slot.id, "day", e.target.value)
                            }
                          />
                        </div>
                        {/* Lixeira Mobile (Fica ao lado do dia) */}
                        <div className="md:hidden shrink-0">
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

                      <div className="grid grid-cols-2 md:flex md:items-center gap-2 w-full md:w-2/3">
                        <div className="w-full">
                          <Select
                            options={HOURS_START}
                            value={slot.start}
                            onChange={(e) =>
                              updateSlot(slot.id, "start", e.target.value)
                            }
                          />
                        </div>

                        <span className="hidden md:block text-gray-400 font-bold">
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

                        {/* Lixeira Desktop (Fica no final) */}
                        <div className="hidden md:block ml-auto">
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

                <Button
                  variant="outline"
                  onClick={addSlot}
                  className="flex items-center justify-center gap-2 border-dashed border-2"
                >
                  <Plus size={18} /> ADICIONAR NOVO HORÁRIO
                </Button>

                <InfoBox>
                  Não se preocupe, você poderá alterar ou adicionar novos
                  horários a qualquer momento no seu <b>Perfil</b>.
                </InfoBox>

                {/* BOTÕES */}
                <div className="flex flex-col-reverse md:flex-row justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="w-full md:w-1/3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      fullWidth
                    >
                      VOLTAR
                    </Button>
                  </div>
                  <div className="w-full md:w-2/3">
                    <Button
                      onClick={handleSaveAll}
                      loading={loadingSave}
                      fullWidth
                    >
                      FINALIZAR CADASTRO
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
