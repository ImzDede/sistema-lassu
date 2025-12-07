"use client";

import React from "react";
import { Button as MTButton } from "@material-tailwind/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  children: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = ({
  children,
  variant = "primary",
  className = "",
  fullWidth = true,
  loading = false,
  ...props
}: ButtonProps) => {
  const isPrimary = variant === "primary";

  return (
    <MTButton
      variant={isPrimary ? "filled" : "outlined"}
      // @ts-ignore
      color={isPrimary ? "purple" : "gray"}
      fullWidth={fullWidth}
      loading={loading}
      className={`
        rounded-lg py-3 text-sm font-bold shadow-sm hover:shadow-md transition-all
        ${
          isPrimary
            ? "!bg-brand-purple text-white hover:!bg-[#967bb3] shadow-brand-purple/20"
            : "!border-brand-pink !text-brand-purple hover:!bg-brand-purple/5 focus:ring-brand-pink/50"
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </MTButton>
  );
};

export default Button;
