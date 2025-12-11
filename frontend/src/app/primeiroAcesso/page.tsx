"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import { Lock, Clock, ArrowRight, EyeOff, Eye } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import AvailabilityEditor from "@/components/AvailabilityEditor";
import { saveToken, verifyUserRedirect } from "@/utils/auth";
import { dayMap, numberToDayMap } from "@/utils/format"; 
import { TimeSlot } from "@/types/disponibilidade";
import { useFeedback } from "@/hooks/useFeedback";
import api from "@/services/api";

export default function FirstAccess() {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  const { feedback, showAlert, closeAlert } = useFeedback();

  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [availability, setAvailability] = useState<TimeSlot[]>([
    { id: "1", day: "Segunda-feira", start: "08:00", end: "12:00" },
  ]);

  useEffect(() => {
    const user = verifyUserRedirect(router, pathname);
    if (user) {
      setUserName(user.nome);
      setIsAuthorized(true);
    }
  }, [router, pathname]);

  const handleGoToStep2 = () => {
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

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const handleFinalize = async () => {
    const hasInvalidTime = availability.some(
      (slot) =>
        parseInt(slot.start.split(":")[0], 10) >=
        parseInt(slot.end.split(":")[0], 10)
    );

    if (hasInvalidTime) {
      showAlert("red", "Horário final deve ser maior que inicial.");
      return;
    }

    setLoading(true);

    try {
      const disponibilidadeFormatada = availability.map((slot) => ({
        dia: dayMap[slot.day],
        horaInicio: parseInt(slot.start.split(":")[0], 10),
        horaFim: parseInt(slot.end.split(":")[0], 10),
      }));

      const payload = {
        senha: passwords.new,
        disponibilidade: disponibilidadeFormatada,
      };

      const response = await api.patch("/users/first-acess", payload);

      const newToken = response.data.token;
      if (!newToken) throw new Error("Erro: Token não retornado.");

      saveToken(newToken);

      showAlert("green", "Cadastro finalizado! Entrando...");

      setTimeout(() => router.push("/home"), 1500);
    } catch (error: any) {
      console.error(error);
      let msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erro ao salvar.";

      msg = msg.replace(/\b([1-5])\b/g, (match: string) => {
        const numero = parseInt(match, 10);
        return numberToDayMap[numero] || match;
      });

      if (typeof msg === "string" && msg.includes("diferente da anterior")) {
        setStep(1);
      }

      showAlert("red", msg);
    } finally {
      setLoading(false);
    }
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

      <FeedbackAlert
        open={feedback.open}
        color={feedback.color}
        message={feedback.message}
        onClose={closeAlert}
      />

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
            Olá, {userName.split(" ")[0]}!
          </Typography>
          <Typography
            className="text-gray-500 font-normal text-sm md:text-base"
            placeholder={undefined}
          >
            Como é seu primeiro acesso, precisamos configurar algumas coisas.
          </Typography>
        </div>

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
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    icon={
                      <button type="button" tabIndex={-1} onClick={() => setShowNew(!showNew)} className="focus:outline-none hover:text-brand-purple text-gray-400">
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                  <Input
                    label="Confirmar Senha"
                    type={showConfirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    icon={
                      <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} className="focus:outline-none hover:text-brand-purple text-gray-400">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <Button onClick={handleGoToStep2} className="flex items-center gap-2">PRÓXIMO <ArrowRight size={18} /></Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-brand-purple/10 rounded-lg"><Clock className="w-6 h-6 text-brand-purple" /></div>
                  <div>
                    <Typography variant="h6" className="text-brand-dark font-bold">Definir Disponibilidade</Typography>
                    <Typography variant="small" className="text-gray-400">Informe seus horários livres.</Typography>
                  </div>
                </div>

                <AvailabilityEditor availability={availability} setAvailability={setAvailability} onError={(msg) => showAlert("red", msg)} />

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