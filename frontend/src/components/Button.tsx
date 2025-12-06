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
  return (
    <MTButton
      variant={variant === "primary" ? "filled" : "outlined"}
      color={variant === "primary" ? "purple" : "gray"}
      fullWidth={fullWidth}
      loading={loading}
      className={`
        rounded-lg py-3 text-sm font-bold shadow-md transition-all
        ${
          variant === "primary"
            ? "!bg-[#A78FBF] text-white hover:!bg-[#967bb3] hover:shadow-[#D9A3B6]/40 shadow-none"
            : "!border-[#D9A3B6] !text-[#A78FBF] hover:!bg-[#D9A3B6]/10 focus:ring-[#D9A3B6]/50"
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
