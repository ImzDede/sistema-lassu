import React from "react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CardConsulta from "@/components/CardConsulta";

export default function Home() {
  const hoje = new Date();
  const dataHojeFormatada = format(hoje, 'dd/MM');
  const mesAtual = format(hoje, 'MMMM', { locale: ptBR });
  const semanaDoMes = Math.ceil(hoje.getDate() / 7)

  return (
    <div className="flex flex-col gap-8">
      {/* Seção 1: Hoje */}
      <section className="bg-gray-200 p-4 md:p-6 rounded-none md:rounded-lg">
        <h2 className="text-lg font-normal uppercase mb-4">Hoje, {dataHojeFormatada}</h2>

        <div className="flex flex-col gap-3">
          <CardConsulta
            name="Neuza, B"
            type="1ª Consulta"
            time="09:00"
            date="17/11"
          />
          <CardConsulta
            name="Francisca, L"
            type="2ª Consulta"
            time="11:00"
            date="17/11"
          />
        </div>
      </section>

      {/* Seção 2: Calendário */}
      <section className="bg-gray-200 p-4 md:p-6 rounded-none md:rounded-lg mb-8">
        <h2 className="text-lg font-normal uppercase mb-4">
          Semana {semanaDoMes}, {mesAtual}
        </h2>
        {/* <Calendario /> */}
      </section>
    </div>
  );
}
