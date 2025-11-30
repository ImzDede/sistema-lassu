import Link from "next/link";
import { PlusCircle } from "lucide-react";

interface CardCadastroProps {
  label: string;
  href: string;
}

const CardCadastro = ({ label, href }: CardCadastroProps) => {
  return (
    <Link
      href={href}
      className="bg-white border-2 border-black rounded-md h-24 md:h-32 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 shadow-sm relative group active:scale-95 transition-transform"
    >
      <span className="font-bold text-black uppercase text-sm md:text-base text-center px-2">
        {label}
      </span>
      <PlusCircle className="w-6 h-6 text-black" />
    </Link>
  );
};

export default CardCadastro;
