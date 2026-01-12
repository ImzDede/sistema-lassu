"use client";

import React from "react";
import { Input as MTInput, Typography } from "@material-tailwind/react";
import { AlertCircle } from "lucide-react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "color"> {
  label?: string;
  icon?: React.ReactNode;
  error?: boolean | string;
}

const Input = ({ label, icon, error, ...props }: InputProps) => {
  const isError = !!error;

  return (
    <div className="w-full min-w-[200px]">
      <MTInput
        label={label}
        icon={
          icon ? (
            // 1. TEM ÍCONE (ex: Olho)?
            // Mantém o ícone. Se tiver erro, força ele (e o botão dentro dele) a ficar vermelho.
            <div className={`${isError ? "text-red-500 [&>button]:text-red-500" : ""}`}>
              {icon}
            </div>
          ) : isError ? (
            // 2. NÃO TEM ÍCONE, mas tem ERRO?
            // Adiciona o ícone de alerta vermelho.
            <AlertCircle className="text-red-500 h-5 w-5" />
          ) : undefined
        }
        size="lg"
        variant="standard"
        error={isError}
        className={`
            bg-transparent font-medium text-brand-dark
            !border-b-[1px] focus:!border-b-[2px]
            placeholder:opacity-0 focus:placeholder:opacity-100 placeholder:text-gray-300
            
            ${isError 
              ? "!border-b-red-500 text-red-900 focus:!border-b-red-500" 
              : "!border-b-brand-pink focus:!border-b-brand-purple"
            }
        `}
        labelProps={{
          className: `
              font-medium
              before:content-none after:content-none
              ${isError ? "!text-red-500" : "text-gray-400 peer-focus:text-brand-purple"}
          `,
        }}
        containerProps={{ className: "min-w-[100px]" }}
        {...props as any}
      />
    </div>
  );
};

export default Input;
