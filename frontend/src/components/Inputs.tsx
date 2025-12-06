"use client";

import React from "react";
import { Input as MTInput } from "@material-tailwind/react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  icon?: React.ReactNode;
}

const Input = ({ label, icon, ...props }: InputProps) => {
  return (
    <div className="w-full">
      <MTInput
        label={label}
        icon={icon}
        size="lg"
        color="deep-purple"
        className="bg-transparent font-medium"
        containerProps={{ className: "min-w-[100px]" }}
        {...props}
      />
    </div>
  );
};

export default Input;
