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
  const mtVariant = variant === "primary" ? "filled" : "outlined";

  return (
    <MTButton
      variant={mtVariant}
      color="deep-purple"
      fullWidth={fullWidth}
      loading={loading}
      className={`
        rounded-lg py-3 text-sm font-bold shadow-md transition-all
        ${
          variant === "primary"
            ? "hover:shadow-deep-purple-100"
            : "border-deep-purple-500 text-deep-purple-500 hover:bg-deep-purple-50"
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
