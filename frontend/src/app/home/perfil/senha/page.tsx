"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useFeedback } from "@/contexts/FeedbackContext";
import { authService } from "@/services/authServices";
import { useFormHandler } from "@/hooks/useFormHandler";
import { useAppTheme } from "@/hooks/useAppTheme";
import InfoBox from "@/components/InfoBox";

export default function ProfilePassword() {
  const router = useRouter();
  const { showFeedback } = useFeedback();
  const { loading, handleSubmit } = useFormHandler();
  const { color, borderClass, lightBgClass, textClass } = useAppTheme();

  const themeAccentColor = `brand-${color}`;
  const inputFocus = `focus-within:!border-${themeAccentColor} focus-within:!ring-1 focus-within:!ring-${themeAccentColor}`;

  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [errors, setErrors] = useState<{ new: string; confirm: string }>({ new: "", confirm: "" });

  const pickBackendMsg = (fieldErrors: Record<string, string>, keys: string[]) => {
    for (const k of keys) if (fieldErrors[k]) return fieldErrors[k];
    return "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ new: "", confirm: "" });

    // UX mínima
    if (!passwords.new.trim()) {
      setErrors((p) => ({ ...p, new: "Campo obrigatório." }));
      showFeedback("Verifique os campos.", "error");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setErrors((p) => ({ ...p, confirm: "As senhas não coincidem." }));
      showFeedback("Verifique os campos.", "error");
      return;
    }

    await handleSubmit(
      async () => {
        await authService.updateProfile({ senha: passwords.new } as any);
        router.push("/home/perfil?success=senha");
      },
      undefined,
      (_err, fieldErrors) => {
        // destaca com o que vier do back
        if (!fieldErrors || Object.keys(fieldErrors).length === 0) return;

        setErrors((prev) => ({
          ...prev,
          new: prev.new || pickBackendMsg(fieldErrors, ["senha", "password", "newPassword", "new"]),
          confirm: prev.confirm || pickBackendMsg(fieldErrors, ["confirm", "confirmPassword"]),
        }));
      }
    );
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
          <Typography variant="h4" className="font-bold uppercase text-brand-peach">
            Segurança
          </Typography>
          <Typography className="text-gray-500 text-sm">Gerencie sua senha.</Typography>
        </div>
      </div>

      <Card className={`w-full shadow-lg border-t-4 ${borderClass} bg-brand-surface`}>
        <CardBody className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className={`p-2 rounded-lg ${lightBgClass}`}>
              <Lock className={`w-6 h-6 ${textClass}`} />
            </div>
            <Typography variant="h6" className="font-bold text-brand-peach">
              Redefinir Senha
            </Typography>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-8">
            <InfoBox accentColor={themeAccentColor}>
              Utilize uma senha forte com letras maiúsculas e caracteres especiais.
            </InfoBox>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Nova Senha"
                type="password"
                value={passwords.new}
                onChange={(e) => {
                  setPasswords({ ...passwords, new: e.target.value });
                  setErrors({ ...errors, new: "" });
                }}
                error={errors.new}
                required
                leftIcon={Lock}
                placeholder="Nova senha"
                focusColorClass={inputFocus}
              />
              <Input
                label="Confirmar Senha"
                type="password"
                value={passwords.confirm}
                onChange={(e) => {
                  setPasswords({ ...passwords, confirm: e.target.value });
                  setErrors({ ...errors, confirm: "" });
                }}
                error={errors.confirm}
                required
                leftIcon={Lock}
                placeholder="Confirme a senha"
                focusColorClass={inputFocus}
              />
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="w-full lg:w-1/2">
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
              <div className="w-full lg:w-1/2">
                <Button type="submit" loading={loading} fullWidth accentColorClass={themeAccentColor}>
                  ATUALIZAR SENHA
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
