import React from "react";
import { Spinner } from "@material-tailwind/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "solid" | "outline";
  fullWidth?: boolean;
  children: React.ReactNode;
  accentColorClass?: string;
}

export default function Button({
  loading = false,
  variant = "solid",
  fullWidth = false,
  className = "",
  disabled,
  children,
  accentColorClass,
  ...props
}: ButtonProps) {
  const accent = accentColorClass ?? "brand-purple";

  const baseStyles =
    `h-12 px-6 rounded-full font-bold transition-all duration-200 ` +
    `flex items-center justify-center gap-2 focus:outline-none ` +
    `focus:ring-2 focus:ring-${accent}/50 active:scale-95`;

  const variants = {
    solid:
      `bg-${accent} text-white ` +
      `disabled:bg-gray-300 disabled:text-gray-500`,
    outline:
      `bg-transparent border-2 border-${accent} text-${accent} ` +
      `hover:bg-${accent}/5 disabled:border-gray-300 disabled:text-gray-400`,
  };

  const widthStyle = fullWidth ? "w-full" : "w-full md:w-auto";
  const opacityStyle =
    disabled || loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer";

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
