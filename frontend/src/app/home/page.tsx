import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import CardConsulta from "@/components/CardConsulta";
import CalendarWidget from "@/components/Calendar";

export default function Home() {
  const today = new Date();
  const formattedDate = format(today, "dd/MM");
  const currentMonth = format(today, "MMMM", { locale: ptBR });
  const weekOfMonth = Math.ceil(today.getDate() / 7);

  return (
    <div className="flex flex-col gap-8">
      {/* Seção Hoje */}
      <section className="bg-brand-surface border border-brand-pink/30 p-4 md:p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold uppercase mb-4 text-brand-dark">
          Hoje, {formattedDate}
        </h2>
        <div className="flex flex-col gap-3">
          <CardConsulta name="Neuza, B" type="1ª Consulta" time="09:00" date="17/11" />
          <CardConsulta name="Francisca, L" type="2ª Consulta" time="11:00" date="17/11" />
        </div>
      </section>

      {/* Seção Calendário */}
      <section className="bg-brand-surface border border-brand-pink/30 p-4 md:p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-lg font-bold uppercase mb-4 text-brand-dark">
          Semana {weekOfMonth}, {currentMonth}
        </h2>
        <CalendarWidget />
      </section>
    </div>
  );
}