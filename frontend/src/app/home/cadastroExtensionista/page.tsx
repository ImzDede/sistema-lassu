"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types/usuarios";
import Input from '@/components/Inputs'; 
import Button from '@/components/Button';
import { Card, CardBody, Typography, Alert, Spinner } from "@material-tailwind/react";
import { ArrowLeft, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';

export default function NovoExtensionista() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const [feedback, setFeedback] = useState({
    open: false,
    color: "green" as "green" | "red",
    message: ""
  });
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    matricula: '',
    telefone: ''
  });

  // === 1. LÓGICA DE SEGURANÇA ===
  useEffect(() => {
    const { "lassuauth.token": token } = parseCookies();

    if (!token) {
      router.push('/'); 
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);

      if (!decoded.permAdmin && !decoded.permCadastro) {
        router.push('/home/cadastro');
      } else {
        setAuthorized(true);
      }
    } catch (error) {
      router.push('/');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showAlert = (color: "green" | "red", message: string) => {
    setFeedback({ open: true, color, message });
    setTimeout(() => {
        setFeedback(prev => ({ ...prev, open: false }));
    }, 4000);
  };

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(prev => ({ ...prev, open: false }));

    try {
      const { 'lassuauth.token': token } = parseCookies();

      const dadosParaEnviar = {
        nome: formData.nome,
        email: formData.email,
        matricula: Number(formData.matricula),
        telefone: formData.telefone 
      };

      await axios.post('http://localhost:3001/users', dadosParaEnviar, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      showAlert("green", "Extensionista cadastrada com sucesso!");
      
      setFormData({
        nome: '',
        email: '',
        matricula: '',
        telefone: ''
      });

    } catch (error: any) {
      console.error("Erro na requisição:", error);

      const dadosErro = error.response?.data;
      const msgBackend = dadosErro?.error || dadosErro?.message;
      const msgFinal = typeof msgBackend === 'string' ? msgBackend : 'Erro ao realizar o cadastro.';
      
      showAlert("red", msgFinal);
    } finally {
      setLoading(false);
    }
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center w-full h-[80vh]">
        <Spinner className="h-12 w-12 text-deep-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative">
      
      {/* === ALERTA FLUTUANTE === */}
      <div className="fixed top-20 right-4 z-50 w-full max-w-sm">
        <Alert
            open={feedback.open}
            color={feedback.color}
            className="flex items-center gap-3 shadow-xl border border-white/20"
            onClose={() => setFeedback(prev => ({ ...prev, open: false }))}
            animate={{ mount: { y: 0 }, unmount: { y: -100 } }}
            icon={feedback.color === "green" ? <CheckCircle /> : <AlertTriangle />}
        >
            <Typography variant="small" className="font-bold" placeholder={undefined}>
                {feedback.color === "green" ? "Sucesso" : "Erro"}
            </Typography>
            <Typography variant="small" className="font-normal opacity-90" placeholder={undefined}>
                {feedback.message}
            </Typography>
        </Alert>
      </div>

      {/* === HEADER === */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-3 rounded-full hover:bg-deep-purple-50 text-deep-purple-500 transition-colors focus:outline-none"
          title="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
            <Typography variant="h4" color="blue-gray" className="font-bold uppercase tracking-wide" placeholder={undefined}>
                Nova Extensionista
            </Typography>
            <Typography variant="paragraph" className="text-gray-500 font-normal text-sm" placeholder={undefined}>
                Preencha os dados abaixo.
            </Typography>
        </div>
      </div>

      {/* === CARD DO FORMULÁRIO === */}
      <Card className="w-full shadow-lg border-t-4 border-deep-purple-500" placeholder={undefined}>
        <CardBody className="p-6 md:p-10" placeholder={undefined}>
            
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="p-2 bg-deep-purple-50 rounded-lg">
                    <UserPlus className="w-6 h-6 text-deep-purple-500" />
                </div>
                <Typography variant="h6" color="blue-gray" className="font-bold" placeholder={undefined}>
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
                            {loading ? 'SALVANDO...' : 'CADASTRAR EXTENSIONISTA'}
                        </Button>
                    </div>
                </div>

            </form>
        </CardBody>
      </Card>
    </div>
  );
}