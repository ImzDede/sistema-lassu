import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  children: React.ReactNode;
}

const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`w-full py-3 rounded-full font-bold uppercase border-2 border-black transition-transform active:scale-95
        ${
          variant === "primary"
            ? "bg-gray-300 text-black hover:bg-gray-400"
            : ""
        }
        ${
          variant === "outline"
            ? "bg-transparent text-black hover:bg-gray-100"
            : ""
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
