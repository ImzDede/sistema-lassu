"use client";

import React, { useState } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import Input from "@/components/Inputs";
import Button from "@/components/Button";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function NovoExtensionista() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    matricula: "",
    telefone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { "lassuauth.token": token } = parseCookies();
      const permissoesFixas = {
        perm_atendimento: true,
        perm_cadastro: false,
        perm_admin: false,
      };
      const dadosParaEnviar = {
        ...formData,
        matricula: Number(formData.matricula),
        ...permissoesFixas,
      };

      await axios.post("http://localhost:3001/users", dadosParaEnviar, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Extensionista cadastrada com sucesso!");
      setFormData({ nome: "", email: "", matricula: "", telefone: "" });
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full hover:bg-deep-purple-50 text-deep-purple-500 transition-colors focus:outline-none"
          title="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography
            variant="h4"
            color="blue-gray"
            className="font-bold uppercase tracking-wide"
          >
            Nova Extensionista
          </Typography>
          <Typography
            variant="paragraph"
            className="text-gray-500 font-normal text-sm"
          >
            Preencha os dados abaixo.
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-deep-purple-500">
        <CardBody className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className="p-2 bg-deep-purple-50 rounded-lg">
              <UserPlus className="w-6 h-6 text-deep-purple-500" />
            </div>
            <Typography variant="h6" color="blue-gray" className="font-bold">
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
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                required
              />
              <Input
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4 justify-end">
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
