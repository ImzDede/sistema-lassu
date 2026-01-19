"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, User, Mail, Hash, Phone } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useFormHandler } from "@/hooks/useFormHandler";
import { userService } from "@/services/userServices";
import { cleanFormat, formatPhone } from "@/utils/format";

export default function NewExtensionist() {
  const router = useRouter();
  const { user, isTeacher, isLoading: authLoading } = useAuth();
  const { showFeedback } = useFeedback();
  const { loading: formLoading, handleSubmit } = useFormHandler();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registration: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

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
    setErrors({});
    const nextErrors: Record<string, string> = {};

    if (!formData.name?.trim()) nextErrors.name = "Campo obrigatório.";
    if (!formData.email?.trim()) nextErrors.email = "Campo obrigatório.";

    if (!formData.registration?.trim()) {
      nextErrors.registration = "Campo obrigatório.";
    } else if (formData.registration.length < 7) {
      nextErrors.registration = "Mínimo 7 dígitos.";
    }

    if (!formData.phone?.trim()) {
      nextErrors.phone = "Campo obrigatório.";
    } else if (cleanFormat(formData.phone).length < 10) {
      nextErrors.phone = "Telefone incompleto.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      showFeedback("Preencha todos os campos obrigatórios corretamente.", "error");
      return;
    }

    await handleSubmit(async () => {
      const payload = {
        nome: formData.name,
        email: formData.email,
        matricula: formData.registration,
        telefone: cleanFormat(formData.phone),
      };

      await userService.create(payload);

      showFeedback("Extensionista cadastrada com sucesso!", "success");
      setFormData({ name: "", email: "", registration: "", phone: "" });
      setErrors({});
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full transition-colors focus:outline-none bg-brand-terapeuta/20 text-brand-terapeuta hover:bg-brand-terapeuta/30"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase tracking-wide text-brand-purple">
            Nova Terapeuta
          </Typography>
          <Typography variant="paragraph" className="text-gray-500 font-normal text-sm">
            Preencha os dados abaixo.
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 bg-brand-surface border-brand-terapeuta">
        <CardBody className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-300">
            <div className="p-2 rounded-lg bg-brand-terapeuta/20">
              <UserPlus className="w-6 h-6 text-brand-terapeuta" />
            </div>
            <Typography variant="h6" className="font-bold text-brand-purple">
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
                leftIcon={User}
                placeholder="Ex: Maria Silva"
                error={errors.name}
              />
              <Input
                label="E-mail"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                leftIcon={Mail}
                placeholder="exemplo@dominio.com"
                error={errors.email}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Matrícula/CRP"
                name="registration"
                value={formData.registration}
                onChange={handleChange}
                required
                maxLength={7}
                minLength={7}
                leftIcon={Hash}
                placeholder="Ex: 1234567"
                error={errors.registration}
              />
              <Input
                label="Celular"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={15}
                required
                leftIcon={Phone}
                placeholder="(00) 90000-0000"
                error={errors.phone}
              />
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4">
              <div className="w-full lg:w-1/2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  fullWidth
                  className="bg-transparent hover:bg-opacity-10 border transition-colors border-brand-terapeuta text-brand-terapeuta"
                >
                  CANCELAR
                </Button>
              </div>
              <div className="w-full lg:w-1/2">
                <Button type="submit" loading={formLoading} fullWidth className="bg-brand-terapeuta">
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
