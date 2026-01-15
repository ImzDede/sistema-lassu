"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, Upload, File, X } from "lucide-react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Button from "@/components/Button"; 
import FileUploadBox from "@/components/FileUploadBox";


export default function Anotacoes() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    campo2: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  // Função para salvar rascunho
  const handleSaveDraft = async () => {
    setLoading(true);
    
    // Aqui você pode adicionar a lógica de salvar
    // Por exemplo: enviar para API
    console.log("Salvando rascunho...", {
      anotacoes: formData.campo2,
      arquivo: selectedFile?.name
    });

    // Simulação de salvamento
    setTimeout(() => {
      setLoading(false);
      alert("Rascunho salvo com sucesso!");
    }, 1000);
  };


  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative pb-20">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/home/cadastro")}
          className="p-3 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div>
          <Typography variant="h4" className="font-bold uppercase tracking-wide text-brand-dark">
            Anotações
          </Typography>
          <Typography variant="paragraph" className="text-gray-500 text-sm">
            Descrição breve da página
          </Typography>
        </div>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface">

        <CardBody className="p-6 md:p-10">
          
          <div className="flex flex-col gap-6">

            {/* Retângulo 1: Nome da Paciente */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-purple/10 rounded-lg">
                    <User className="w-5 h-5 text-brand-purple" />
                </div>

                <Typography variant="small" className="text-gray-700 font-medium">
                  Nome da paciente
                </Typography>
              </div>
            </div>

            {/* Retângulo 2: Informações de Consulta */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-purple/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-brand-purple" />
                </div>
                <Typography variant="small" className="text-gray-700 font-medium">
                  Informações de consulta/calendário
                </Typography>
              </div>
            </div>
          

            {/* TEXTO SEPARADOR */}
            <Typography variant="paragraph" className="text-brand-dark font-normal mt-2 mb-0">
              Digite suas anotações rápidas aqui
            </Typography>

            {/* Retângulo 4: Input de Texto */}
            <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-300 hover:border-gray-400 transition-colors">
              <input
                type="text"
                name="campo2"
                value={formData.campo2}
                onChange={handleChange}
                placeholder="Insira o texto..."
                className="w-full outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>

          </div>

        </CardBody>
      </Card>

        {/* BOTÃO SALVAR RASCUNHO - FORA DO CARD */}
            <Button
                onClick={handleSaveDraft}
                loading={loading}
                fullWidth
                className="h-12"
                >
                {loading ? "SALVANDO..." : "SALVAR RASCUNHO"}
            </Button>

    </div>
  );
}
       