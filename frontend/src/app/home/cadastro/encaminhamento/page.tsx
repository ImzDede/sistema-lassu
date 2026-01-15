"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, FileText } from "lucide-react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Button from "@/components/Button";
import FileUploadBox from "@/components/FileUploadBox";

export default function Encaminhamento() {
  const router = useRouter();

  const [selectedPatient, setSelectedPatient] = useState("");
  const [encaminhamentoTipo, setEncaminhamentoTipo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSave = async () => {
    setLoading(true);

    console.log("Salvando encaminhamento...", {
      paciente: selectedPatient,
      tipo: encaminhamentoTipo,
      obs: observacoes,
      arquivo: selectedFile?.name
    });

    setTimeout(() => {
      setLoading(false);
      alert("Encaminhamento salvo com sucesso!");
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative pb-20">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/home/cadastro")}
          className="p-3 rounded-full hover:bg-[#D9A3B6]/20 text-[#D9A3B6] transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div>
          <Typography variant="h4" className="font-bold uppercase tracking-wide text-brand-dark">
            Encaminhamento
          </Typography>
          <Typography variant="paragraph" className="text-gray-500 text-sm">
            Preencha os dados abaixo para registrar o encaminhamento.
          </Typography>
        </div>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className="w-full shadow-lg border-t-4 border-[#D9A3B6] bg-pink-50">
        <CardBody className="p-6 md:p-10">
          <div className="flex flex-col gap-6">

            {/* Seleção do Paciente */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#D9A3B6]/20 rounded-lg">
                  <User className="w-5 h-5 text-[#D9A3B6]" />
                </div>

                <Typography variant="small" className="text-gray-700 font-medium">
                  Selecione a paciente
                </Typography>
              </div>

              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 outline-none"
              >
                <option value="">Escolher paciente...</option>
                <option value="Paciente 1">Paciente 1</option>
                <option value="Paciente 2">Paciente 2</option>
                <option value="Paciente 3">Paciente 3</option>
              </select>
            </div>

            {/* Seleção da Sessão */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#D9A3B6]/20 rounded-lg">
                  <FileText className="w-5 h-5 text-[#D9A3B6]" />
                </div>

                <Typography variant="small" className="text-brand-dark font-medium">
                  Selecione a sessão
                </Typography>
              </div>

              <select
                value={encaminhamentoTipo}
                onChange={(e) => setEncaminhamentoTipo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-brand-dark outline-none"
              >
                <option value="">Escolher sessão...</option>
                <option value="Sessão 1">1ª Sessão</option>
                <option value="Sessão 2">2ª Sessão</option>
                <option value="Sessão 3">3ª Sessão</option>
              </select>
            </div>

            {/* Upload */}
            <Typography variant="paragraph" className="text-brand-dark font-normal mt-2">
              Tem algum arquivo de encaminhamento?
            </Typography>

            <FileUploadBox
              selectedFile={selectedFile}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
            />

            {/* Observações */}
            <Typography variant="paragraph" className="text-brand-dark font-normal">
              Se não, digite aqui para onde a paciente foi encaminhada
            </Typography>

            <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-300 hover:border-[#D9A3B6] transition-colors">
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Escreva observações adicionais..."
                className="w-full h-24 outline-none text-brand-dark placeholder:text-gray-700 resize-none"
              ></textarea>
            </div>

          </div>
        </CardBody>
      </Card>

      {/* Botão Salvar */}
      <Button
        onClick={handleSave}
        loading={loading}
        fullWidth
        className="h-12 bg-[#D9A3B6] hover:bg-[#c58ea0]"
      >
        {loading ? "SALVANDO..." : "CADASTRAR"}
      </Button>
    </div>
  );

        /*Seu botão já está rosa, mas como o componente Button é personalizado (vem de @/components/Button), 
        ele provavelmente sobrescreve o estilo passado pela className.

        Ou seja:
        Mesmo colocando className="bg-[#D9A3B6]", o botão pode continuar com a cor padrão do projeto 
        (provavelmente roxo). */


}
