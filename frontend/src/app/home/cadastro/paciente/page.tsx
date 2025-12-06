"use client";

import React, { useState, useEffect } from "react";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types/usuarios";
import Input from "@/components/Input";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import { ArrowLeft, UserPlus } from "lucide-react";
import DateInput from "@/components/DateInput";

export default function NovoPaciente() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const [feedback, setFeedback] = useState({
    open: false,
    color: "green" as "green" | "red",
    message: "",
  });

  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    disponibilidade: "",
    celular: "",
  });

  useEffect(() => {
    const { "lassuauth.token": token } = parseCookies();
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (!decoded.permAdmin && !decoded.permCadastro) {
        router.push("/home/cadastro");
      } else {
        setAuthorized(true);
      }
    } catch (error) {
      router.push("/");
    }
  }, [router]);

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

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback((prev) => ({ ...prev, open: false }));

    try {
      // Lógica de salvar
      
      showAlert("green", "Paciente cadastrada com sucesso!");
      setFormData({
        nome: "",
        dataNascimento: "",
        disponibilidade: "",
        celular: "",
      });
    } catch (error: any) {
      console.error("Erro na requisição:", error);
      const msgFinal = "Erro ao realizar o cadastro.";
      showAlert("red", msgFinal);
    } finally {
      setLoading(false);
    }
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center w-full h-[80vh]">
        <Spinner className="h-12 w-12 text-[#A78FBF]" />
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

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full hover:bg-[#A78FBF]/10 text-[#A78FBF] transition-colors focus:outline-none"
          title="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography
            variant="h4"
            color="blue-gray"
            className="font-bold uppercase tracking-wide"
            placeholder={undefined}
          >
            Nova Paciente
          </Typography>
          <Typography
            variant="paragraph"
            className="text-gray-500 font-normal text-sm"
            placeholder={undefined}
          >
            Preencha os dados abaixo.
          </Typography>
        </div>
      </div>

      <Card
        className="w-full shadow-lg border-t-4 border-[#A78FBF]"
        placeholder={undefined}
      >
        <CardBody className="p-6 md:p-10" placeholder={undefined}>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className="p-2 bg-[#A78FBF]/10 rounded-lg">
              <UserPlus className="w-6 h-6 text-[#A78FBF]" />
            </div>
            <Typography
              variant="h6"
              color="blue-gray"
              className="font-bold"
              placeholder={undefined}
            >
              Informações Pessoais
            </Typography>
          </div>

          <form onSubmit={handleSalvar} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
              <DateInput
                label="Data de Nascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Disponibilidade"
                type="text"
                name="disponibilidade"
                value={formData.disponibilidade}
                onChange={handleChange}
                required
              />
              <Input
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
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
                <Button type="submit" loading={loading} fullWidth>
                  {loading ? "SALVANDO..." : "CADASTRAR PACIENTE"}
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
