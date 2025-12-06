"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Card, CardBody, Typography } from "@material-tailwind/react";

interface CardCadastroProps {
  label: string;
  href: string;
}

const CardCadastro = ({ label, href }: CardCadastroProps) => {
  return (
    <Link href={href} className="block group">
      <Card
        className="h-28 w-full cursor-pointer transition-all duration-300 active:scale-95 hover:shadow-xl hover:shadow-[#D9A3B6]/20 border border-gray-100 hover:border-[#D9A3B6]"
        placeholder={undefined}
      >
        <CardBody
          className="flex flex-col items-center justify-center h-full gap-3 p-0"
          placeholder={undefined}
        >
          <div className="p-3 bg-gray-50 rounded-full group-hover:bg-[#A78FBF]/10 transition-colors duration-300">
            <PlusCircle className="w-6 h-6 text-gray-400 group-hover:text-[#A78FBF]" />
          </div>
          <Typography
            variant="small"
            color="blue-gray"
            className="font-bold uppercase text-center text-gray-600 group-hover:text-[#A78FBF] transition-colors"
            placeholder={undefined}
          >
            {label}
          </Typography>
        </CardBody>
      </Card>
    </Link>
  );
};

export default CardCadastro;
