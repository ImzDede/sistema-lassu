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
  onClick,
  ...props
}: ButtonProps) => {
  const isPrimary = variant === "primary";

  return (
    <MTButton
      variant={isPrimary ? "filled" : "outlined"}
      fullWidth={fullWidth}
      loading={loading}
      onClick={onClick}
      className={`
        rounded-lg py-3 text-sm font-bold shadow-none hover:shadow-md transition-all uppercase
        ${
          isPrimary
            ? "!bg-brand-purple text-white hover:!bg-[#967bb3] focus:!ring-brand-purple/50"
            : "!border-brand-purple !text-brand-purple hover:!bg-brand-purple/5 focus:!ring-brand-purple/50 bg-transparent"
        }
        ${className}
      `}
      {...props as any}
    >
      {children}
    </MTButton>
  );
};

export default Button;
