"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { setCookie } from "nookies";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

// Componentes
import Input from "@/components/Input";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import { Checkbox, Typography } from "@material-tailwind/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookPassword, setLookPassword] = useState(false);
  const [manterConectado, setManterConectado] = useState(false);

  const [feedback, setFeedback] = useState({
    open: false,
    color: "green" as "green" | "red",
    message: "",
  });

  const router = useRouter();

  const showAlert = (color: "green" | "red", message: string) => {
    setFeedback({ open: true, color, message });
    if (color === "red") {
      setTimeout(() => setFeedback((prev) => ({ ...prev, open: false })), 4000);
    }
  };

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setFeedback((prev) => ({ ...prev, open: false }));
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/users/login", {
        email: email,
        senha: senha,
      });

      const { token } = response.data;

      showAlert("green", "Login efetuado com sucesso!");

      const cookieOptions: any = { path: "/" };
      if (manterConectado) cookieOptions.maxAge = 60 * 60 * 24 * 7;
      setCookie(undefined, "lassuauth.token", token, cookieOptions);

      setTimeout(() => {
        router.push("/home");
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
        setSenha("");
      }
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-center md:flex-row md:justify-normal bg-white relative">
      <FeedbackAlert
        open={feedback.open}
        color={feedback.color}
        message={feedback.message}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
      />

      {/* LADO ESQUERDO */}
      <div className="w-full md:w-1/2 md:bg-[linear-gradient(to_bottom_right,_#A78FBF,_#D9A3B6,_#F2A9A2,_#F2B694)] flex flex-col items-center justify-center p-6 md:p-10 md:min-h-screen relative overflow-hidden">
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
            className="text-center mb-4 uppercase tracking-widest font-normal text-[#A78FBF]"
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
              type={lookPassword ? "text" : "password"}
              label="Senha"
              value={senha}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSenha(e.target.value)
              }
              required
              icon={
                <button
                  type="button"
                  onClick={() => setLookPassword(!lookPassword)}
                  className="focus:outline-none hover:text-[#A78FBF] text-gray-400 transition-colors cursor-pointer"
                >
                  {lookPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="-ml-2.5">
              <Checkbox
                label="Manter conectado?"
                color="purple"
                className="checked:bg-[#A78FBF] checked:border-[#A78FBF]"
                checked={manterConectado}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setManterConectado(e.target.checked)
                }
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
              className="text-sm text-gray-400 hover:text-[#A78FBF] hover:underline transition-colors font-medium"
            >
              Esqueceu sua senha?
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}