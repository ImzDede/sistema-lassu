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
      <Card className="h-28 w-full cursor-pointer transition-all duration-300 active:scale-95 hover:shadow-lg hover:shadow-brand-purple/10 border border-brand-purple/10 hover:border-brand-purple bg-brand-surface">
        <CardBody className="flex flex-col items-center justify-center h-full gap-3 p-0">
          <div className="p-3 bg-brand-bg rounded-full group-hover:bg-brand-purple/10 transition-colors duration-300">
            <PlusCircle className="w-6 h-6 text-gray-400 group-hover:text-brand-purple" />
          </div>
          <Typography
            variant="small"
            color="blue-gray"
            className="font-bold uppercase text-center text-gray-500 group-hover:text-brand-purple transition-colors font-heading"
          >
            {label}
          </Typography>
        </CardBody>
      </Card>
    </Link>
  );
};

export default CardCadastro;
