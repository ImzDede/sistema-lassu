import React from "react";
import { Spinner } from "@material-tailwind/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "solid" | "outline";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  loading = false,
  variant = "solid",
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "h-12 px-6 rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 active:scale-95";
  
  const variants = {
    solid: "bg-brand-purple text-white hover:bg-brand-purple-dark disabled:bg-gray-300 disabled:text-gray-500",
    outline: "bg-transparent border-2 border-brand-purple text-brand-purple hover:bg-brand-purple/5 disabled:border-gray-300 disabled:text-gray-400",
  };

  const widthStyle = fullWidth ? "w-full" : "w-full md:w-auto";
  const opacityStyle = (disabled || loading) ? "opacity-70 cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${opacityStyle} ${className}`}
      {...props}
    >
      {loading ? <Spinner className="h-5 w-5" /> : children}
    </button>
  );
}