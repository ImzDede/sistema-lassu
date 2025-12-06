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
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <CardBody className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-deep-purple-50 flex items-center justify-center text-deep-purple-500 border border-deep-purple-100">
            <User size={24} />
          </div>
          <div>
            <Typography
              variant="h6"
              color="blue-gray"
              className="uppercase text-sm font-bold leading-tight"
            >
              {name}
            </Typography>
            <Typography
              variant="small"
              className="text-xs font-medium text-deep-purple-300"
            >
              {type}
            </Typography>
          </div>
        </div>
        <div className="text-right">
          <Typography
            variant="small"
            color="blue-gray"
            className="font-bold text-sm"
          >
            {time}
          </Typography>
          <Typography
            variant="small"
            className="font-bold text-xs text-gray-400"
          >
            {date}
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
};

export default CardConsulta;
