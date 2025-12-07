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
    <div className="w-full min-w-[200px]">
      <MTInput
        label={label}
        icon={icon}
        size="lg"
        variant="standard"
        color="gray"
        className={`
            bg-transparent font-medium text-gray-700
            !border-b-[#D9A3B6]
            focus:!border-b-[#A78FBF]
            !border-b-[1px] focus:!border-b-[2px]
            placeholder:opacity-0 focus:placeholder:opacity-100
        `}
        labelProps={{
          className: `
                text-gray-500 peer-focus:text-[#A78FBF]
                font-medium
                before:content-none after:content-none
            `,
        }}
        containerProps={{ className: "min-w-[100px]" }}
        {...props}
      />
    </div>
  );
};

export default Input;
