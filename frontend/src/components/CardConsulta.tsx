"use client";

import React from "react";
import { User } from "lucide-react";
import { Card, CardBody, Typography } from "@material-tailwind/react";

interface CardConsultaProps {
  name: string;
  type: string;
  time: string;
  date: string;
}

const CardConsulta = ({ name, type, time, date }: CardConsultaProps) => {
  return (
    <Card
      className="w-full shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#D9A3B6]/30"
      placeholder={undefined}
    >
      <CardBody
        className="p-4 flex justify-between items-center"
        placeholder={undefined}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#A78FBF]/10 flex items-center justify-center text-[#A78FBF] border border-[#A78FBF]/20">
            <User size={24} />
          </div>
          <div>
            <Typography
              variant="h6"
              className="uppercase text-sm font-bold leading-tight text-gray-800"
              placeholder={undefined}
            >
              {name}
            </Typography>
            <Typography
              variant="small"
              className="text-xs font-medium text-[#D9A3B6]"
              placeholder={undefined}
            >
              {type}
            </Typography>
          </div>
        </div>
        <div className="text-right">
          <Typography
            variant="small"
            className="font-bold text-sm text-[#A78FBF]"
            placeholder={undefined}
          >
            {time}
          </Typography>
          <Typography
            variant="small"
            className="font-bold text-xs text-gray-400"
            placeholder={undefined}
          >
            {date}
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
};

export default CardConsulta;
