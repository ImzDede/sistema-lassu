"use client";

import React from "react";
import { Input as MTInput } from "@material-tailwind/react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "color"> {
  label?: string;
  icon?: React.ReactNode;
  error?: boolean;
}

const Input = ({ label, icon, error, ...props }: InputProps) => {
  return (
    <div className="w-full min-w-[200px]">
      <MTInput
        label={label}
        icon={icon}
        size="lg"
        variant="standard"
        error={error}
        className={`
            bg-transparent font-medium text-brand-dark
            !border-b-brand-pink
            focus:!border-b-brand-purple
            !border-b-[1px] focus:!border-b-[2px]
            placeholder:opacity-0 focus:placeholder:opacity-100 placeholder:text-gray-300
            ${error ? "!border-b-feedback-error-main text-feedback-error-text" : ""}
        `}
        labelProps={{
          className: `
              text-gray-400 peer-focus:text-brand-purple
              font-medium
              before:content-none after:content-none
              ${error ? "!text-feedback-error-text" : ""}
          `,
        }}
        containerProps={{ className: "min-w-[100px]" }}
        {...props as any}
      />
    </div>
  );
};

export default Input;
