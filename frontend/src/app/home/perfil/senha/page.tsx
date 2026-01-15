"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useFeedback } from "@/contexts/FeedbackContext";
import { authService } from "@/services/authServices";
import { useFormHandler } from "@/hooks/useFormHandler";

export default function ProfilePassword() {
  const router = useRouter();
  const { showFeedback } = useFeedback();
  const { loading, handleSubmit } = useFormHandler();
  
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [errors, setErrors] = useState({ new: "", confirm: "" });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    const newErrors = { new: "", confirm: "" };

    // Regex: Pelo menos uma maiúscula (A-Z) E um caractere especial (!@#$&*)
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).+$/;

    if (passwords.new.length < 6) {
      newErrors.new = "A senha deve ter no mínimo 6 caracteres.";
      isValid = false;
    } else if (!strongPasswordRegex.test(passwords.new)) {
      newErrors.new = "A senha deve ter letra maiúscula e caractere especial.";
      isValid = false;
    }

    if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "As senhas não coincidem.";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
        // Se houver erro, apenas exibe nos inputs (via prop error) e um toast genérico
        showFeedback("Verifique os campos destacados.", "error");
        return; 
    }

    await handleSubmit(async () => {
      await authService.updateProfile({ senha: passwords.new } as any);
      router.push("/home/perfil?success=senha");
    });
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase text-brand-dark">Segurança</Typography>
          <Typography className="text-gray-500 text-sm">Gerencie sua senha de acesso.</Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface">
        <CardBody className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className="p-2 bg-brand-purple/10 rounded-lg"><Lock className="w-6 h-6 text-brand-purple" /></div>
            <Typography variant="h6" className="font-bold text-brand-dark">Redefinir Senha</Typography>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-8">
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg text-sm flex gap-2 items-start">
              <CheckCircle size={18} className="mt-0.5 shrink-0" />
              <span>Para sua segurança, utilize uma senha forte e evite reutilizar senhas antigas.</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Nova Senha"
                type="password" // O componente Input gerencia o ícone de olho
                value={passwords.new}
                onChange={(e) => {
                    setPasswords({ ...passwords, new: e.target.value });
                    setErrors({ ...errors, new: "" });
                }}
                error={errors.new}
                required
                leftIcon={Lock}
                placeholder="Digite a nova senha"
              />
              <Input
                label="Confirmar Nova Senha"
                type="password"
                value={passwords.confirm}
                onChange={(e) => {
                    setPasswords({ ...passwords, confirm: e.target.value });
                    setErrors({ ...errors, confirm: "" });
                }}
                error={errors.confirm}
                required
                leftIcon={Lock}
                placeholder="Confirme a nova senha"
              />
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="w-full lg:w-1/2">
                <Button variant="outline" type="button" onClick={() => router.back()} fullWidth>VOLTAR</Button>
              </div>
              <div className="w-full lg:w-1/2">
                <Button type="submit" loading={loading} fullWidth>ATUALIZAR SENHA</Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}