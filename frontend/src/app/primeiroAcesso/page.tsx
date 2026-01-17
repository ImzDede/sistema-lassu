"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Lock } from "lucide-react";
import { Spinner, Typography } from "@material-tailwind/react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import AvailabilityEditor from "@/components/AvailabilityEditor";
import RoleBadge from "@/components/RoleBadge";
import EditableProfileAvatar from "@/components/EditableProfileAvatar"; 
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useFormHandler } from "@/hooks/useFormHandler";
import { authService } from "@/services/authServices";
import { saveToken } from "@/utils/auth";
import { dayMap, numberToDayMap } from "@/utils/constants";
import { TimeSlot } from "@/types/disponibilidade";

function StepProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="w-full flex items-center gap-2 px-6 pt-4">
      <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-brand-purple" : "bg-gray-200"}`} />
      <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-brand-purple" : "bg-gray-200"}`} />
      <div className={`h-2 flex-1 rounded-full ${step >= 3 ? "bg-brand-purple" : "bg-gray-200"}`} />
      <div className={`w-2 h-2 rounded-full ${step >= 3 ? "bg-brand-purple" : "bg-gray-200"}`} />
    </div>
  );
}

export default function PrimeiroAcesso() {
  const router = useRouter();
  const pathname = usePathname();
  const { user: contextUser, isLoading: authLoading, refreshProfile } = useAuth();
  const { showFeedback, closeFeedback } = useFeedback();
  const { loading, handleSubmit } = useFormHandler();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [errors, setErrors] = useState({ new: "", confirm: "" });
  const [availability, setAvailability] = useState<TimeSlot[]>([]);

  const firstName = useMemo(() => {
    const nome = (contextUser as any)?.nome || "";
    return nome ? String(nome).split(" ")[0] : "";
  }, [contextUser]);

  const matricula = (contextUser as any)?.matricula;

  useEffect(() => {
    if (authLoading) return;
    if (!contextUser) return;
    if (contextUser.primeiroAcesso === false) {
      router.replace("/home");
      return;
    }
    setIsAuthorized(true);
  }, [authLoading, contextUser, router]);

  const validatePasswords = () => {
    let ok = true;
    const newErrors = { new: "", confirm: "" };

    if (passwords.new.length < 8) {
      newErrors.new = "Mínimo de 8 caracteres.";
      ok = false;
    }

    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).+$/;
    if (!strongPasswordRegex.test(passwords.new)) {
      if (!newErrors.new) newErrors.new = "Necessário letra maiúscula e caractere especial.";
      ok = false;
    }

    if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "As senhas não coincidem.";
      ok = false;
    }

    setErrors(newErrors);

    if (!ok) {
      showFeedback(newErrors.new || newErrors.confirm || "Senha inválida.", "error");
    }

    return ok;
  };

  const handleFinalize = async () => {
    if (availability.length > 0) {
        const hasInvalidTime = availability.some((slot) => {
        const startH = parseInt(String(slot.start).split(":")[0] || "0", 10);
        const endH = parseInt(String(slot.end).split(":")[0] || "0", 10);
        return startH >= endH;
        });

        if (hasInvalidTime) {
        showFeedback("Horário final deve ser maior que inicial.", "error");
        return;
        }
    }

    await handleSubmit(
      async () => {
        const disponibilidadeFormatada = availability.map((slot) => ({
          diaSemana: dayMap[slot.day],
          horaInicio: parseInt(String(slot.start).split(":")[0], 10),
          horaFim: parseInt(String(slot.end).split(":")[0], 10),
        }));

        try {
          const { token } = await authService.completeFirstAccess(passwords.new, disponibilidadeFormatada);
          if (!token) throw new Error("Token não retornado pela API.");

          saveToken(token);
          await refreshProfile(); 

          showFeedback("Cadastro finalizado! Entrando...", "success");
          router.replace("/home");
          
        } catch (error: any) {
          let msg = error.response?.data?.error || error.message || "Erro ao salvar.";
          if (typeof msg === "object" && msg.message) msg = msg.message;

          if (typeof msg === "string") {
            msg = msg.replace(/\b([0-6])\b/g, (match: string) => {
              const n = parseInt(match, 10);
              return (numberToDayMap as any)[n] || match;
            });
            throw new Error(msg);
          }

          throw error;
        }
      },
      undefined,
      (error) => {
        const msg = error.message || "";
        if (msg.toLowerCase().includes("senha")) setStep(2); 
      }
    );
  };

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <StepProgress step={step} />

      {/* STEP 1 - Boas vindas */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-10 animate-fade-in">
          <div className="w-full max-w-md flex flex-col items-center">
            <Typography className="text-brand-purple font-bold text-2xl md:text-3xl text-center mt-6">
              Seja Bem-vinda ao
            </Typography>

            <div className="my-8">
              <Image src="/lassuLogoCor.svg" alt="Lassu" width={150} height={150} priority />
            </div>

            <p className="text-brand-purple text-center text-sm md:text-base leading-6 max-w-sm">
              Aqui, você encontra uma equipe preparada para acolher, escutar e acompanhar cada etapa do seu processo, sempre com respeito, sigilo e sensibilidade.
            </p>
            <p className="text-brand-purple text-center text-sm md:text-base leading-6 max-w-sm mt-5">
              Este site foi criado para facilitar o seu acesso às informações do serviço e tornar sua experiência mais leve e segura.
            </p>

            <div className="w-full flex justify-end mt-10">
              <Button
                onClick={() => setStep(2)}
                className="!w-auto px-8"
              >
                Continuar <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 - Nova senha */}
      {step === 2 && (
        <div className="flex-1 flex flex-col px-6 pt-5 pb-10 animate-slide-in-right">
          <div className="w-full max-w-md mx-auto">
            
            <Typography className="text-brand-purple font-bold text-xl md:text-2xl mt-4 text-center">
              Olá, {firstName || ""}!
            </Typography>
            <p className="text-brand-purple/80 text-sm md:text-base leading-6 mt-3 text-center">
              Agora, você pode modificar a sua foto de perfil, visualizar o cargo que recebeu e criar a sua nova senha!
            </p>

            <div className="flex flex-col items-center mt-8 mb-6">
                <EditableProfileAvatar 
                    avatarUrl={contextUser?.fotoUrl}
                    onEdit={undefined}
                    editable={true}
                />

                <div className="mt-4 flex flex-col items-center gap-2">
                    {matricula && (
                        <span className="text-brand-purple font-bold text-sm bg-brand-purple/5 px-3 py-1 rounded-full border border-brand-purple/10">
                            Matrícula: {matricula}
                        </span>
                    )}
                    <RoleBadge user={contextUser} />
                </div>
            </div>

            <Typography className="text-brand-dark font-bold text-sm mt-6 mb-4">
              Cadastre abaixo sua nova senha:
            </Typography>

            <div className="flex flex-col gap-4">
              <Input
                type="password"
                label=""
                placeholder="Nova senha"
                leftIcon={Lock}
                value={passwords.new}
                onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
                error={errors.new || undefined}
              />
              <Input
                type="password"
                label=""
                placeholder="Confirmar senha"
                leftIcon={Lock}
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                error={errors.confirm || undefined}
              />
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-4 mt-8">
                <div className="w-full md:w-1/2">
                    <Button 
                        variant="outline" 
                        onClick={() => setStep(1)} 
                        fullWidth
                    >
                        VOLTAR
                    </Button>
                </div>
                <div className="w-full md:w-1/2">
                    <Button
                        onClick={() => {
                            closeFeedback();
                            if (validatePasswords()) setStep(3);
                        }}
                        fullWidth
                    >
                        CONTINUAR
                    </Button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 - Disponibilidade */}
      {step === 3 && (
        <div className="flex-1 flex flex-col px-6 pt-5 pb-10 animate-slide-in-right">
          <div className="w-full max-w-md mx-auto">

            <Typography className="text-brand-purple font-bold text-xl md:text-2xl mt-4 text-center">
              Disponibilidade
            </Typography>
            <p className="text-brand-purple/80 text-sm md:text-base leading-6 mt-3 text-center">
              Nessa seção, você irá cadastrar a sua disponibilidade atual para atendimentos. Fique tranquila, você pode alterar mais tarde!
            </p>

            <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <AvailabilityEditor
                availability={availability}
                setAvailability={setAvailability}
                onError={(msg) => showFeedback(msg, "error")}
                infoMessage="Adicione seus horários clicando no botão abaixo."
              />
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-4 mt-8">
                <div className="w-full md:w-1/2">
                    <Button 
                        variant="outline" 
                        onClick={() => setStep(2)} 
                        fullWidth
                    >
                        VOLTAR
                    </Button>
                </div>
                <div className="w-full md:w-1/2">
                    <Button 
                        onClick={handleFinalize} 
                        loading={loading} 
                        fullWidth
                    >
                        CADASTRAR
                    </Button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}