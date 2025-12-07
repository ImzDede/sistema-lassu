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
    <Card className="w-full shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-brand-pink/30">
      <CardBody className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple border border-brand-purple/20">
            <User size={24} />
          </div>
          <div>
            <Typography variant="h6" className="uppercase text-sm font-bold leading-tight text-brand-dark">
              {name}
            </Typography>
            <Typography variant="small" className="text-xs font-medium text-brand-pink">
              {type}
            </Typography>
          </div>
        </div>
        <div className="text-right">
          <Typography variant="small" className="font-bold text-sm text-brand-purple">
            {time}
          </Typography>
          <Typography variant="small" className="font-bold text-xs text-gray-400">
            {date}
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
};

export default CardConsulta;