"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import { Lock, Clock, ArrowRight, EyeOff, Eye } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import AvailabilityEditor from "@/components/AvailabilityEditor";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useFormHandler } from "@/hooks/useFormHandler";
import { saveToken, verifyUserRedirect } from "@/utils/auth";
import { dayMap, numberToDayMap } from "@/utils/constants";
import { TimeSlot } from "@/types/disponibilidade";
import { authService } from "@/services/authServices";
import { useAuth } from "@/contexts/AuthContext";

export default function FirstAccess() {
  const router = useRouter();
  const pathname = usePathname();
  const { user: contextUser } = useAuth();
  const { showFeedback, closeFeedback } = useFeedback();
  const { loading, handleSubmit } = useFormHandler();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [errors, setErrors] = useState({ new: "", confirm: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [availability, setAvailability] = useState<TimeSlot[]>([
    { id: "1", day: "Segunda-feira", start: "08:00", end: "12:00" },
  ]);

  useEffect(() => {
    const userFromToken = verifyUserRedirect(router, pathname);
    const finalUser = userFromToken || contextUser;

    if (finalUser) {
      if (finalUser.nome) setUserName(finalUser.nome);

      if (finalUser.primeiroAcesso === false) {
        router.replace("/home");
        return;
      }
      setIsAuthorized(true);
    }
  }, [router, pathname, contextUser]);

  const validateStep1 = () => {
    let isValid = true;
    const newErrors = { new: "", confirm: "" };

    // 1. Validação de tamanho
    if (passwords.new.length < 8) {
      newErrors.new = "Mínimo de 8 caracteres.";
      isValid = false;
    }

    // 2. Validação de complexidade (Regex)
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).+$/;
    if (!strongPasswordRegex.test(passwords.new)) {
      if (!newErrors.new) { 
        newErrors.new = "Necessário letra maiúscula e caractere especial.";
      }
      isValid = false;
    }

    // 3. Validação de igualdade
    if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "As senhas não coincidem.";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      // Pega o erro da senha nova. Se não tiver, pega o da confirmação.
      const mensagemEspecifica = newErrors.new || newErrors.confirm;
      
      showFeedback(mensagemEspecifica, "error");
    }

    return isValid;
  };

  const handleGoToStep2 = () => {
    if (validateStep1()) {
      closeFeedback();
      setStep(2);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const handleFinalize = async () => {
    // Validação de horários (client-side)
    const hasInvalidTime = availability.some(
      (slot) =>
        parseInt(slot.start.split(":")[0], 10) >=
        parseInt(slot.end.split(":")[0], 10)
    );

    if (hasInvalidTime) {
      showFeedback("Horário final deve ser maior que inicial.", "error");
      return;
    }

    await handleSubmit(
      async () => {
        const disponibilidadeFormatada = availability.map((slot) => ({
          diaSemana: dayMap[slot.day],
          horaInicio: parseInt(slot.start.split(":")[0], 10),
          horaFim: parseInt(slot.end.split(":")[0], 10),
        }));

        // Chamada API
        try {
          const { token } = await authService.completeFirstAccess(passwords.new, disponibilidadeFormatada);
          if (!token) throw new Error("Token não retornado pela API.");
          
          saveToken(token);
          showFeedback("Cadastro finalizado! Entrando...", "success");
          setTimeout(() => router.push("/home"), 1500);
          
        } catch (error: any) {
          // Lógica de tradução de mensagem (Backend retorna "dia 1", Front mostra "Segunda")
          let msg = error.response?.data?.error || error.message || "Erro ao salvar.";
          
          if (typeof msg === "object" && msg.message) msg = msg.message;

          if (typeof msg === "string") {
            msg = msg.replace(/\b([0-6])\b/g, (match: string) => {
              const n = parseInt(match, 10);
              return numberToDayMap[n] || match;
            });
            
            // Lançamos um novo erro com a mensagem traduzida para o useFormHandler exibir
            throw new Error(msg);
          }
          
          throw error; // Se não for string, lança o erro original
        }
      },
      undefined, // onSuccess (já tratado dentro da action)
      (error) => {
        // onError: callback para decidir se volta ou fica na tela
        const msg = error.message || "";
        if (!msg.toLowerCase().includes("senha")) {
           setStep(2); 
        }
      }
    );
  };

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

      <div className="w-full max-w-2xl flex flex-col gap-6 relative z-10">
        <div className="text-center space-y-2 px-4 mt-8 md:mt-0">
          <Image
            src="/lassuLogoCor.svg"
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto my-6"
          />
          <Typography className="text-xl md:text-3xl text-brand-dark font-bold uppercase break-words px-4 leading-tight">
            Olá, {userName ? userName.split(" ")[0] : "Usuário"}!
          </Typography>
          <Typography className="text-gray-500 font-normal text-sm md:text-base">
            Como é seu primeiro acesso, precisamos configurar algumas coisas.
          </Typography>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-brand-purple" : "text-gray-300"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold ${step >= 1 ? "border-brand-purple bg-brand-purple text-white" : "border-gray-300"}`}>1</div>
            <span className="font-bold text-sm">SENHA</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-brand-purple" : "text-gray-300"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold ${step >= 2 ? "border-brand-purple bg-brand-purple text-white" : "border-gray-300"}`}>2</div>
            <span className="font-bold text-sm">DISPONIBILIDADE</span>
          </div>
        </div>

        <Card className="shadow-lg border border-brand-pink/20 bg-brand-surface">
          <CardBody className="p-6 md:p-10">
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-brand-purple/10 rounded-lg">
                    <Lock className="w-6 h-6 text-brand-purple" />
                  </div>
                  <div>
                    <Typography variant="h6" className="text-brand-dark font-bold">Definir Nova Senha</Typography>
                    <Typography variant="small" className="text-gray-400">Sua segurança é importante para nós.</Typography>
                  </div>
                </div>

                <div className="space-y-6">
                  <Input
                    label="Nova Senha"
                    type={showNew ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) => {
                      setPasswords({ ...passwords, new: e.target.value });
                      setErrors({ ...errors, new: "" });
                    }}
                    error={errors.new}
                    icon={
                      <button type="button" tabIndex={-1} onClick={() => setShowNew(!showNew)} className="focus:outline-none hover:text-brand-purple text-gray-400 transition-colors">
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                  <Input
                    label="Confirmar Senha"
                    type={showConfirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => {
                      setPasswords({ ...passwords, confirm: e.target.value });
                      setErrors({ ...errors, confirm: "" });
                    }}
                    error={errors.confirm}
                    icon={
                      <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} className="focus:outline-none hover:text-brand-purple text-gray-400 transition-colors">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <Button onClick={handleGoToStep2} className="flex items-center gap-2">
                    PRÓXIMO <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-brand-purple/10 rounded-lg">
                    <Clock className="w-6 h-6 text-brand-purple" />
                  </div>
                  <div>
                    <Typography variant="h6" className="text-brand-dark font-bold">Definir Disponibilidade</Typography>
                    <Typography variant="small" className="text-gray-400">Informe seus horários livres.</Typography>
                  </div>
                </div>

                <AvailabilityEditor
                  availability={availability}
                  setAvailability={setAvailability}
                  onError={(msg) => showFeedback(msg, "error")}
                />

                <div className="flex flex-col-reverse md:flex-row justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="w-full md:w-1/3">
                    <Button variant="outline" onClick={handleBackToStep1} fullWidth>VOLTAR</Button>
                  </div>
                  <div className="w-full md:w-2/3">
                    <Button onClick={handleFinalize} loading={loading} fullWidth>FINALIZAR CADASTRO</Button>
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