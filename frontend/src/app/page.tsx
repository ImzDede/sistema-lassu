"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Checkbox, Typography } from "@material-tailwind/react";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFormHandler } from "@/hooks/useFormHandler";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepConnected, setKeepConnected] = useState(false);
  const { showFeedback } = useFeedback();
  const { signIn } = useAuth();
  const { loading, handleSubmit } = useFormHandler();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    await handleSubmit(
      async () => {
        await signIn({ email, senha: password });
        showFeedback("Sucesso!", "success");
      },
      undefined, // onSuccess
      (err: any) => {
        const msg = err.response?.data?.message || "E-mail ou senha incorretos.";
        setErrorMessage(msg);
      }
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-center md:flex-row md:justify-normal bg-brand-bg relative">
      {/* Lado Esquerdo - Logo */}
      <div className="w-full md:w-1/2 md:bg-[linear-gradient(to_bottom_right,_#A78FBF,_#D9A3B6,_#F2A9A2,_#F2B694)] flex flex-col items-center justify-center p-6 md:p-10 md:min-h-screen relative overflow-hidden">
        <div className="mb-4 md:mb-8 z-10">
          <Image
            src="/lassuLogo.svg"
            alt="Logo LASSU"
            width={300}
            height={300}
            priority
            className="w-40 hidden md:block md:w-56 lg:w-64 h-auto md:brightness-0 md:invert"
          />
          <Image
            src="/lassuLogoCor.svg"
            alt="Logo LASSU"
            width={300}
            height={300}
            priority
            className="w-40 md:hidden"
          />
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full md:w-1/2 bg-brand-bg flex items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col gap-6">
          <Typography
            variant="h2"
            className="text-center mb-4 uppercase tracking-widest font-normal text-brand-purple"
          >
            Bem-vindo
          </Typography>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              required
              error={errorMessage}
              leftIcon={Mail}
              placeholder="Digite seu e-mail"
            />
            
            <Input
              type="password"
              label="Senha"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              required
              error={errorMessage}
              leftIcon={Lock}
              placeholder="Digite sua senha"
            />

            <div className="-ml-2.5">
              <Checkbox
                label="Manter conectado?"
                color="purple"
                className="checked:bg-brand-purple checked:border-brand-purple"
                checked={keepConnected}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setKeepConnected(e.target.checked)
                }
                crossOrigin={undefined}
              />
            </div>

            <div className="mt-2">
              <Button type="submit" fullWidth loading={loading}>
                {loading ? "ENTRANDO..." : "ACESSAR SISTEMA"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}