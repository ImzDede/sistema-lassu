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
      <Card className="h-28 w-full cursor-pointer transition-all duration-300 active:scale-95 hover:shadow-xl hover:shadow-deep-purple-100 border border-gray-200 group-hover:border-deep-purple-200">
        <CardBody className="flex flex-col items-center justify-center h-full gap-3 p-0">
          <div className="p-3 bg-gray-50 rounded-full group-hover:bg-deep-purple-50 transition-colors duration-300">
            <PlusCircle className="w-6 h-6 text-gray-600 group-hover:text-deep-purple-500" />
          </div>
          <Typography
            variant="small"
            color="blue-gray"
            className="font-bold uppercase text-center group-hover:text-deep-purple-700 transition-colors"
          >
            {label}
          </Typography>
        </CardBody>
      </Card>
    </Link>
  );
};

export default CardCadastro;
