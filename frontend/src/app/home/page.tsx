import React from "react";
import CardConsulta from "@/components/CardConsulta";
import Calendario from "@/components/Calendario";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      {/* Seção 1: Hoje */}
      <section className="bg-gray-200 p-4 md:p-6 rounded-none md:rounded-lg">
        <h2 className="text-lg font-normal uppercase mb-4">Hoje, 17/11</h2>

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
          Semana 3, Novembro
        </h2>
        {/* <Calendario /> */}
      </section>
    </div>
  );
}
