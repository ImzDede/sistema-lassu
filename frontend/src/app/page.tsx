"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Inputs";
import Button from "@/components/Button";
import { Checkbox, Typography } from "@material-tailwind/react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { setCookie } from "nookies";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lookPassword, setLookPassword] = useState(false);
  const [manterConectado, setManterConectado] = useState(false);

  const router = useRouter();

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/users/login", {
        email: email,
        senha: senha,
      });

      const { token } = response.data;
      const cookieOptions: any = { path: "/" };
      if (manterConectado) cookieOptions.maxAge = 60 * 60 * 24 * 7;
      setCookie(undefined, "lassuauth.token", token, cookieOptions);
      router.push("/home");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erro de conexão.");
    } finally {
      setLoading(false);
      setSenha("");
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-center md:flex-row md:justify-normal bg-white">
      {/* LADO ESQUERDO */}
      <div className="w-full md:w-1/2 md:bg-gradient-to-br md:from-deep-purple-900 md:to-deep-purple-500 flex flex-col items-center justify-center p-6 md:p-10 md:min-h-screen relative overflow-hidden">

        <div className="mb-4 md:mb-8 z-10">
          <Image
            src="/logo.svg"
            alt="Logo LSSSU"
            width={300}
            height={300}
            priority
            className="w-40 md:w-56 lg:w-64 h-auto md:brightness-0 md:invert"
          />
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col gap-6">
          <Typography
            variant="h2"
            color="blue-gray"
            className="text-center mb-4 uppercase tracking-widest font-normal"
          >
            Bem-vindo
          </Typography>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type={lookPassword ? "text" : "password"}
              label="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              icon={
                <i
                  onClick={() => setLookPassword(!lookPassword)}
                  className="cursor-pointer hover:text-deep-purple-500 transition-colors"
                >
                  {lookPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </i>
              }
            />

            {error && (
              <Typography
                variant="small"
                color="red"
                className="text-center font-bold bg-red-50 p-2 rounded-md"
              >
                {error}
              </Typography>
            )}

            <div className="-ml-2.5">
              <Checkbox
                label="Manter conectado?"
                color="deep-purple"
                checked={manterConectado}
                onChange={(e) => setManterConectado(e.target.checked)}
              />
            </div>

            <div className="mt-2">
              <Button type="submit" fullWidth loading={loading}>
                {loading ? "ENTRANDO..." : "ACESSAR SISTEMA"}
              </Button>
            </div>
          </form>

          <div className="text-center mt-4">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-deep-purple-500 hover:underline transition-colors font-medium"
            >
              Esqueceu sua senha?
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
