import React from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const Calendario = () => {
  const hoje = new Date();

  const dataInicial = startOfWeek(hoje, { weekStartsOn: 0 });

  const diasDaSemana = Array.from({ length: 7 }).map((_, index) => {
    return addDays(dataInicial, index);
  });

  const agendamentosFalsos = [hoje, hoje, addDays(hoje, 2), addDays(hoje, 4)];

  return (
    <div className="bg-white border-2 border-black rounded-md overflow-hidden">
      <div className="bg-white border-b-2 border-black text-center font-bold py-1 uppercase">
        {format(hoje, "MMM", { locale: ptBR })}
      </div>

      <div className="grid grid-cols-7 text-center">
        {diasDaSemana.map((dia, index) => (
          <div
            key={`header-${index}`}
            className="bg-gray-500 text-white font-bold py-2 border-r-2 border-black last:border-r-0 uppercase"
          >
            {format(dia, "EEEEE", { locale: ptBR })}
          </div>
        ))}

        {diasDaSemana.map((dia, index) => {
          const temAgendamento = agendamentosFalsos.filter((agendamento) =>
            isSameDay(agendamento, dia)
          );

          const ehHoje = isSameDay(dia, hoje);

          return (
            <div
              key={`day-${index}`}
              className={`
                h-32 
                border-r-2 border-black last:border-r-0 
                flex flex-col items-center pt-2 relative
                ${ehHoje ? "bg-gray-50" : "bg-white"} 
              `}
            >
              <span
                className={`font-bold text-lg mb-2 ${
                  ehHoje ? "text-blue-600" : "text-black"
                }`}
              >
                {format(dia, "d")}
              </span>

              {/* Renderiza os bloquinhos cinzas se tiver agendamento */}
              {temAgendamento.length > 0 && (
                <div className="flex flex-col gap-1 w-full px-1">
                  {temAgendamento.map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-full bg-gray-500 border border-gray-600"
                    ></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendario;
