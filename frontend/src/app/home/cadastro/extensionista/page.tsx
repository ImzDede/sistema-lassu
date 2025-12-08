"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import { getUserFromToken, verifyUserRedirect } from "@/utils/auth";
import { getAuthHeader } from "@/utils/api";

export default function NewExtensionist() {
  const router = useRouter();
  const pathname = usePathname();

  // States do formulário
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // States do feedback
  const [feedback, setFeedback] = useState({
    open: false,
    color: "green" as "green" | "red",
    message: "",
  });

  // Dados a serem enviados
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registration: "",
    phone: "", 
  });

  // Verificação de Segurança e Permissões
  useEffect(() => {
    const user = verifyUserRedirect(router, pathname);
    
    if (user) {
      // Exige permissão de Admin ou Cadastro
      if (!user.permAdmin && !user.permCadastro) {
        router.push("/home/cadastro");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [router, pathname]);

  // Atualiza os estados dos inputs simples (Nome, Email, Matricula e Celular)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showAlert = (color: "green" | "red", message: string) => {
    setFeedback({ open: true, color, message });
    setTimeout(() => {
      setFeedback((prev) => ({ ...prev, open: false }));
    }, 4000);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback((prev) => ({ ...prev, open: false }));

    try {
      const payload = {
        nome: formData.name,
        email: formData.email,
        matricula: Number(formData.registration),
        telefone: formData.phone,
      };

      await axios.post("http://localhost:3001/users", payload, getAuthHeader());

      showAlert("green", "Extensionista cadastrada com sucesso!");
      
      setFormData({ name: "", email: "", registration: "", phone: "" });

    } catch (error: any) {
      console.error("Error creating extensionist:", error);
      const dataError = error.response?.data;
      const msgBackend = dataError?.error || dataError?.message;
      const finalMsg = typeof msgBackend === "string" ? msgBackend : "Erro ao realizar o cadastro.";
      
      showAlert("red", finalMsg);
    } finally {
      setLoading(false);
    }
  }

  // Spinner
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center w-full h-[80vh]">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative">
      <FeedbackAlert 
        open={feedback.open} 
        color={feedback.color} 
        message={feedback.message} 
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))} 
      />

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="p-3 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors focus:outline-none" 
          title="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase tracking-wide text-brand-dark">
            Nova Extensionista
          </Typography>
          <Typography variant="paragraph" className="text-gray-500 font-normal text-sm">
            Preencha os dados abaixo.
          </Typography>
        </div>
      </div>

      {/* FORM CARD */}
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
                type="number" 
                name="registration" 
                value={formData.registration} 
                onChange={handleChange} 
                required 
              />
              <Input 
                label="Telefone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="(00) 00000-0000" 
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
                <Button type="submit" loading={loading} fullWidth>
                  {loading ? "SALVANDO..." : "CADASTRAR EXTENSIONISTA"}
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
