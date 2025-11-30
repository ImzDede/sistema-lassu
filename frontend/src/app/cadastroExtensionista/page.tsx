"use client";

import React, { useState } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Input from "@/components/Inputs";
import Button from "@/components/Button";

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
        nome: formData.nome,
        email: formData.email,
        matricula: Number(formData.matricula),
        telefone: formData.telefone,
        ...permissoesFixas,
      };

      await axios.post("http://localhost:3001/users", dadosParaEnviar, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Extensionista de Atendimento cadastrada com sucesso!");

      setFormData({
        nome: "",
        email: "",
        matricula: "",
        telefone: "",
      });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Erro ao cadastrar.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="mb-8 cursor-pointer hover:opacity-80 transition-opacity">
        <Link href="/home">
          <Image
            src="/logoVertical.svg"
            alt="LASSU Logo"
            width={150}
            height={150}
            className="hidden md:block w-64 h-auto"
          />
          <Image
            src="/logoLassu.svg"
            alt="LASSU Logo"
            width={150}
            height={150}
            className="md:hidden w-24 h-auto md:w-32"
          />
        </Link>
      </div>

      <div className="w-full max-w-3xl bg-white p-6 md:p-10 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold uppercase text-black mb-8 text-center md:text-left">
          Nova Extensionista
        </h1>

        <form onSubmit={handleSalvar} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              name="nome"
              placeholder="Ex: Ana Souza"
              value={formData.nome}
              onChange={handleChange}
              required
            />
            <Input
              label="E-mail"
              type="email"
              name="email"
              placeholder="Ex: ana@lassu.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Matrícula"
              type="number"
              name="matricula"
              placeholder="Ex: 2024001"
              value={formData.matricula}
              onChange={handleChange}
              required
            />
            <Input
              label="Telefone"
              name="telefone"
              placeholder="(85) 99999-9999"
              value={formData.telefone}
              onChange={handleChange}
            />
          </div>

          <div className="border-t border-gray-300 my-2"></div>

          <div className="flex flex-col-reverse md:flex-row gap-4 mt-2">
            <div className="w-full md:w-1/2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                CANCELAR
              </Button>
            </div>

            <div className="w-full md:w-1/2">
              <Button type="submit" disabled={loading}>
                {loading ? "SALVANDO..." : "CADASTRAR EXTENSIONISTA"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
