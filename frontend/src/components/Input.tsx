import React, { useState } from "react";
import { Eye, EyeOff, LucideIcon } from "lucide-react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  leftIcon: LeftIcon,
  rightIcon,
  type = "text",
  className = "",
  fullWidth = true,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  // Verifica se o campo está desabilitado ou somente leitura
  const isDisabledOrReadOnly = props.disabled || props.readOnly;

  // Lógica para definir as cores da borda e do fundo
  let borderAndBackgroundClass = "";

  if (isDisabledOrReadOnly) {
    // ESTADO: Desabilitado
    borderAndBackgroundClass = "bg-gray-200 border-gray-200 cursor-not-allowed";
  } else if (error) {
    // ESTADO: Erro
    borderAndBackgroundClass = "bg-white border-feedback-error-text focus-within:ring-1 focus-within:ring-feedback-error-text focus-within:border-feedback-error-text";
  } else {
    // ESTADO: Normal
    borderAndBackgroundClass = "bg-white border-gray-300 focus-within:border-brand-purple focus-within:ring-1 focus-within:ring-brand-purple";
  }

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : "w-auto"} ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-brand-dark ml-1">
          {label}
        </label>
      )}

      <div className={`
        relative flex items-center rounded-lg border transition-colors
        ${borderAndBackgroundClass}
      `}>
        {LeftIcon && (
          <div className={`absolute left-3 pointer-events-none ${error ? "text-feedback-error-text" : "text-gray-400"}`}>
            <LeftIcon size={20} />
          </div>
        )}

        <input
          type={inputType}
          className={`
            w-full h-12 bg-transparent text-brand-dark placeholder-gray-400 outline-none text-base
            ${LeftIcon ? "pl-10" : "pl-4"} 
            ${(isPassword || rightIcon) ? "pr-10" : "pr-4"}
            rounded-lg
            ${isDisabledOrReadOnly ? "text-gray-500 cursor-not-allowed" : ""}
          `}
          {...props}
        />

        <div className="absolute right-3 text-gray-400 flex items-center">
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isDisabledOrReadOnly}
              className="hover:text-brand-purple transition-colors focus:outline-none disabled:cursor-not-allowed disabled:hover:text-gray-400"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          ) : (
            rightIcon
          )}
        </div>
      </div>

      {error && (
        <span className="text-xs text-feedback-error-text font-bold ml-1 mt-0.5 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
}