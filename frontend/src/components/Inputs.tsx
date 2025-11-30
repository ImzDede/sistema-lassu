import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = ({ label, ...props }: InputProps) => {
  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <label className="text-sm font-bold text-gray-700">{label}</label>
      )}
      <input
        className="w-full bg-gray-300 border-2 border-gray-600 p-3 text-gray-900 placeholder-gray-600 focus:outline-none focus:border-black transition-colors"
        {...props}
      />
    </div>
  );
};

export default Input;
