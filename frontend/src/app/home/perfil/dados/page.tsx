"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Save, Lock } from "lucide-react";
import { Card, CardBody, Typography, Tooltip } from "@material-tailwind/react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/hooks/useFeedback";
import api from "@/services/api";
import { formatPhone, cleanFormat } from "@/utils/format";

export default function ProfileData() {
  const router = useRouter();
  const { user } = useAuth();
  const { feedback, showAlert, closeAlert } = useFeedback();
  const [loadingSave, setLoadingSave] = useState(false);

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
    if (name === "telefone") {
      setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSave(true);
    closeAlert();

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        telefone: cleanFormat(formData.telefone),
      };

      await api.put("/users/profile", payload);
      
      router.push('/home/perfil?success=dados')

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Erro ao atualizar perfil.";
      showAlert("red", msg);
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <FeedbackAlert
        open={feedback.open}
        color={feedback.color}
        message={feedback.message}
        onClose={closeAlert}
      />

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography
            variant="h4"
            className="font-bold uppercase text-brand-dark"
          >
            Meus Dados Pessoais
          </Typography>
          <Typography className="text-gray-500 text-sm">
            Mantenha suas informações atualizadas.
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface">
        <CardBody className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className="p-2 bg-brand-purple/10 rounded-lg">
              <User className="w-6 h-6 text-brand-purple" />
            </div>
            <Typography variant="h6" className="font-bold text-brand-dark">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Matrícula"
                name="matricula"
                value={formData.matricula}
                readOnly
                className="font-medium !border-b-[1px] !border-b-gray-400 text-gray-400 cursor-not-allowed select-none focus:!border-b-gray-400"
                icon={
                  <Tooltip content="A matrícula não pode ser alterada.">
                    <Lock size={16} className="text-gray-400" />
                  </Tooltip>
                }
              />

              <Input
                label="Celular"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                maxLength={15}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="w-full md:w-1/2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  fullWidth
                >
                  VOLTAR
                </Button>
              </div>
              <div className="w-full md:w-1/2">
                <Button
                  type="submit"
                  loading={loadingSave}
                  fullWidth
                  className="flex items-center justify-center gap-2"
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
