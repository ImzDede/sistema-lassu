"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/hooks/useFeedback";
import { userService } from "@/services/userServices";
import { cleanFormat, formatPhone } from "@/utils/format";

export default function NewExtensionist() {
  const router = useRouter();
  const { user, isTeacher, isLoading: authLoading } = useAuth();
  const [formLoading, setFormLoading] = useState(false);
  const { feedback, showFeedback, closeFeedback } = useFeedback();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registration: "",
    phone: "",
  });

  useEffect(() => {
    if (!authLoading && user) {
      const canAccess = user.permAdmin || user.permCadastro;
      if (!canAccess) router.push("/home/cadastro");
    }
  }, [authLoading, user, isTeacher, router]);

  const canAccess = user?.permAdmin || user?.permCadastro;
  if (authLoading || !canAccess) {
    return (
      <div className="flex items-center justify-center w-full h-[80vh]">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
    } else if (name === "registration") {
      const onlyNumbers = value.replace(/\D/g, "");
      if (onlyNumbers.length <= 7) {
        setFormData((prev) => ({ ...prev, [name]: onlyNumbers }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    closeFeedback();

    try {
      const payload = {
        nome: formData.name,
        email: formData.email,
        matricula: formData.registration,
        telefone: cleanFormat(formData.phone),
      };

      await userService.create(payload);

      showFeedback("Extensionista cadastrada com sucesso!", "success");
      setFormData({ name: "", email: "", registration: "", phone: "" });
    } catch (error: any) {
      console.error("Error creating extensionist:", error);
      const dataError = error.response?.data;
      const msgBackend = dataError?.error || dataError?.message;
      showFeedback(
        typeof msgBackend === "string"
          ? msgBackend
          : "Erro ao realizar o cadastro.",
        "error"
      );
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative">
      <FeedbackAlert
        open={feedback.open}
        color={feedback.type === "error" ? "red" : "green"}
        message={feedback.message}
        onClose={closeFeedback}
      />

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography
            variant="h4"
            className="font-bold uppercase tracking-wide text-brand-dark"
          >
            Nova Terapeuta
          </Typography>
          <Typography
            variant="paragraph"
            className="text-gray-500 font-normal text-sm"
          >
            Preencha os dados abaixo.
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface">
        <CardBody className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className="p-2 bg-brand-purple/10 rounded-lg">
              <UserPlus className="w-6 h-6 text-brand-purple" />
            </div>
            <Typography variant="h6" className="font-bold text-brand-dark">
              Informações Pessoais
            </Typography>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Nome Completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="E-mail"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Matrícula"
                name="registration"
                value={formData.registration}
                onChange={handleChange}
                required
                maxLength={7}
                minLength={7}
              />
              <Input
                label="Celular"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                required
              />
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4">
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
                <Button type="submit" loading={formLoading} fullWidth>
                  {formLoading ? "SALVANDO..." : "CADASTRAR EXTENSIONISTA"}
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
