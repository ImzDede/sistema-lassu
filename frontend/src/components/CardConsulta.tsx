import React from "react";
import { User } from "lucide-react";

interface CardConsultaProps {
  name: string;
  type: string;
  time: string;
  date: string;
}

const CardConsulta = ({ name, type, time, date }: CardConsultaProps) => {
  return (
    <div className="bg-white border-2 border-gray-800 rounded-md p-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center bg-gray-100">
          <User className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <h3 className="font-bold text-sm uppercase">{name}</h3>
          <p className="text-xs text-gray-600">{type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm">{time}</p>
        <p className="font-bold text-sm">{date}</p>
      </div>
    </div>
  );
};

export default CardConsulta;
