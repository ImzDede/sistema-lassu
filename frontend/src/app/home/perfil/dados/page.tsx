"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, Hash, Lock } from "lucide-react";
import { Card, CardBody, Typography, Tooltip } from "@material-tailwind/react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useFormHandler } from "@/hooks/useFormHandler";
import { authService } from "@/services/authServices";
import { formatPhone, cleanFormat } from "@/utils/format";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ProfileData() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { loading: loadingSave, handleSubmit } = useFormHandler();

  // TEMA: brand-peach
  const { color, borderClass, lightBgClass, textClass } = useAppTheme();

  const themeAccentColor = `brand-${color}`;
  const inputFocusClass = `focus-within:!border-${themeAccentColor} focus-within:!ring-${themeAccentColor}`;

  const [formData, setFormData] = useState({
    nome: "",
    matricula: "",
    email: "",
    telefone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || "",
        matricula: user.matricula ? String(user.matricula) : "",
        email: user.email || "",
        telefone: user.telefone ? formatPhone(user.telefone) : "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "telefone")
      setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(async () => {
      await authService.updateProfile({
        nome: formData.nome,
        email: formData.email,
        telefone: cleanFormat(formData.telefone),
      });
      await refreshProfile();
      router.push("/home/perfil?success=dados");
    });
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className={`p-2 rounded-full hover:bg-opacity-20 transition-colors ${lightBgClass} ${textClass}`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography
            variant="h4"
            className="font-bold uppercase text-brand-peach"
          >
            Meus Dados
          </Typography>
          <Typography className="text-gray-500 text-sm">
            Mantenha suas informações atualizadas.
          </Typography>
        </div>
      </div>

      <Card
        className={`w-full shadow-lg border-t-4 ${borderClass} bg-brand-surface`}
      >
        <CardBody className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className={`p-2 rounded-lg ${lightBgClass}`}>
              <User className={`w-6 h-6 ${textClass}`} />
            </div>
            <Typography variant="h6" className="font-bold text-brand-peach">
              Informações da Conta
            </Typography>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                leftIcon={User}
                placeholder="Nome"
                focusColorClass={inputFocusClass}
              />
              <Input
                label="E-mail"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                leftIcon={Mail}
                placeholder="email"
                focusColorClass={inputFocusClass}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Matrícula/CRP"
                name="matricula"
                value={formData.matricula}
                readOnly
                placeholder="0000000"
                leftIcon={Hash}
                rightIcon={
                  <Tooltip content="Não editável">
                    <Lock size={16} className="text-gray-400" />
                  </Tooltip>
                }
                focusColorClass={inputFocusClass}
              />
              <Input
                label="Celular"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                maxLength={15}
                placeholder="(00) 00000-0000"
                leftIcon={Phone}
                error=""
                focusColorClass={inputFocusClass}
              />
            </div>
            <div className="flex flex-col-reverse md:flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="w-full md:w-1/2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  fullWidth
                  accentColorClass={themeAccentColor}
                  className="border bg-transparent hover:bg-opacity-10"
                >
                  VOLTAR
                </Button>
              </div>
              <div className="w-full md:w-1/2">
                <Button
                  type="submit"
                  loading={loadingSave}
                  fullWidth
                  accentColorClass={themeAccentColor}
                >
                  SALVAR ALTERAÇÕES
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
