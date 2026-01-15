import React from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  error?: string;
  leftIcon?: LucideIcon;
  placeholder?: string;
}

const Select = ({
  label,
  value,
  onChange,
  options,
  error,
  leftIcon: LeftIcon,
  placeholder,
  className = "",
  disabled,
  required,
  ...props
}: SelectProps) => {
  
  // Verifica se tem valor selecionado para mudar a cor do texto
  const hasValue = value !== "" && value !== null && value !== undefined;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-brand-dark ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className={`
        relative flex items-center bg-white rounded-lg border transition-colors
        ${error 
          ? "border-feedback-error-text focus-within:ring-1 focus-within:ring-feedback-error-text" 
          : "border-gray-300 focus-within:border-brand-purple focus-within:ring-1 focus-within:ring-brand-purple"
        }
        ${disabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : ""}
      `}>
        {LeftIcon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none z-10">
            <LeftIcon size={20} />
          </div>
        )}

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className={`
            w-full h-12 bg-transparent outline-none text-base appearance-none cursor-pointer z-20
            ${LeftIcon ? "pl-10" : "pl-4"} 
            pr-10 rounded-lg
            ${!hasValue ? "text-gray-400" : "text-brand-dark"} 
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          
          {options.map((opt, index) => {
            const labelOpt = typeof opt === "string" ? opt : opt.label;
            const valueOpt = typeof opt === "string" ? opt : opt.value;

            return (
              <option key={index} value={valueOpt} className="text-brand-dark">
                {labelOpt}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3 text-gray-400 pointer-events-none z-10">
          <ChevronDown size={20} />
        </div>
      </div>

      {error && (
        <span className="text-xs text-feedback-error-text font-bold ml-1 mt-0.5 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;