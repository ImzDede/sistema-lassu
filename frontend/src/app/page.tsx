"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import { Checkbox, Typography } from "@material-tailwind/react";
import { useFeedback } from "@/hooks/useFeedback";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepConnected, setKeepConnected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { feedback, showFeedback, closeFeedback } = useFeedback();
  const { signIn, isLoading } = useAuth(); 

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    closeFeedback();

    try {
      // Salva o token, atualiza o usuário e redireciona.
      await signIn({ email, senha: password });
      
      showFeedback("Autenticado! Redirecionando...", "success");

    } catch (err: any) {
      console.error("Erro Login:", err);
      // Tratamento de erro robusto
      const msg = err.response?.data?.error || 
                  err.response?.data?.message || 
                  "Credenciais inválidas ou erro de conexão.";
      
      showFeedback(typeof msg === "string" ? msg : "Erro ao entrar.", "error");
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-center md:flex-row md:justify-normal bg-brand-bg relative">
      <FeedbackAlert
        open={feedback.open}
        color={feedback.type === "error" ? "red" : "green"}
        message={feedback.message}
        onClose={closeFeedback}
      />

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
          <Typography variant="h2" className="text-center mb-4 uppercase tracking-widest font-normal text-brand-purple">
            Bem-vindo
          </Typography>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            <Input
              type={showPassword ? "text" : "password"}
              label="Senha"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              icon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="focus:outline-none hover:text-brand-purple text-gray-400 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="-ml-2.5">
              <Checkbox
                label="Manter conectado?"
                color="purple"
                className="checked:bg-brand-purple checked:border-brand-purple"
                checked={keepConnected}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setKeepConnected(e.target.checked)}
                crossOrigin={undefined}
              />
            </div>

            <div className="mt-2">
              <Button type="submit" fullWidth loading={isLoading}>
                {isLoading ? "ENTRANDO..." : "ACESSAR SISTEMA"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
