"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Inputs";
import Button from "@/components/Button";
import { Checkbox, Typography, Alert } from "@material-tailwind/react";
import { Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { setCookie } from "nookies";

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

      showAlert("green", "Login realizado com sucesso!");

      const cookieOptions: any = { path: "/" };
      if (manterConectado) cookieOptions.maxAge = 60 * 60 * 24 * 7;
      setCookie(undefined, "lassuauth.token", token, cookieOptions);

      setTimeout(() => {
        router.push("/home");
      }, 500);
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
      {/* === ALERTA FLUTUANTE === */}
      <div className="fixed top-10 right-4 z-50 w-full max-w-sm">
        <Alert
          open={feedback.open}
          color={feedback.color}
          className="flex items-center gap-3 shadow-xl border border-white/20"
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
          animate={{ mount: { y: 0 }, unmount: { y: -100 } }}
          icon={
            feedback.color === "green" ? <CheckCircle /> : <AlertTriangle />
          }
        >
          <Typography
            variant="small"
            className="font-bold"
            placeholder={undefined}
          >
            {feedback.color === "green" ? "Sucesso" : "Erro"}
          </Typography>
          <Typography
            variant="small"
            className="font-normal opacity-90"
            placeholder={undefined}
          >
            {feedback.message}
          </Typography>
        </Alert>
      </div>

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
                  className="focus:outline-none hover:text-deep-purple-500 transition-colors cursor-pointer"
                >
                  {lookPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="-ml-2.5">
              <Checkbox
                label="Manter conectado?"
                color="deep-purple"
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
