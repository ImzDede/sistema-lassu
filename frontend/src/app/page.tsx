"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import { Checkbox, Typography } from "@material-tailwind/react";
import { saveToken } from "@/utils/auth";
import { useFeedback } from "@/hooks/useFeedback";
import api from "@/services/api";

export default function Login() {
  // Dados para realizar login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // States do formulário
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepConnected, setKeepConnected] = useState(false);

  // Hook de Feedback
  const { feedback, showAlert, closeAlert } = useFeedback();

  const router = useRouter();

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    closeAlert();
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email: email,
        senha: password,
      });

      const { token, user } = response.data;

      showAlert("green", "Login efetuado com sucesso!");

      // Salva o token no cookie
      saveToken(token, keepConnected);

      // Redirecionamento condicional baseado no status do usuário
      setTimeout(() => {
        if (user.primeiroAcesso) {
          router.push("/primeiroAcesso"); // Fluxo obrigatório de troca de senha
        } else {
          router.push("/home"); // Fluxo normal
        }
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Erro de conexão ou credenciais inválidas.";
      showAlert("red", msg);
      setLoading(false);
    } finally {
      if (feedback.color === "red") {
        setPassword("");
      }
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-center md:flex-row md:justify-normal bg-brand-bg relative">
      <FeedbackAlert
        open={feedback.open}
        color={feedback.color}
        message={feedback.message}
        onClose={closeAlert}
      />

      {/* Lado Esquerdo - Logo */}
      <div className="w-full md:w-1/2 md:bg-[linear-gradient(to_bottom_right,_#A78FBF,_#D9A3B6,_#F2A9A2,_#F2B694)] flex flex-col items-center justify-center p-6 md:p-10 md:min-h-screen relative overflow-hidden">
        <div className="mb-4 md:mb-8 z-10">
          {/* logo desktop */}
          <Image
            src="/lassuLogo.svg"
            alt="Logo LSSSU"
            width={300}
            height={300}
            priority
            className="w-40 hidden md:block md:w-56 lg:w-64 h-auto md:brightness-0 md:invert"
          />

          {/* logo mobile */}
          <Image
            src="/lassuLogoCor.svg"
            alt="Logo LSSSU"
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
            />
            <Input
              type={showPassword ? "text" : "password"}
              label="Senha"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
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

          <div className="text-center mt-4">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-brand-purple hover:underline transition-colors font-medium"
            >
              Esqueceu sua senha?
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}