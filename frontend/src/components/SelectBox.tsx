"use client";

import React from "react";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: (string | SelectOption)[];
}

const Select = ({ label, options, className = "", ...props }: SelectProps) => {
  return (
    <div className="w-full relative min-w-[100px]">
      {label && (
        <label className="block text-xs font-bold text-brand-purple mb-1 ml-1 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full bg-transparent text-brand-dark font-medium text-sm
            px-3 py-3 rounded-lg
            border border-brand-pink
            focus:border-brand-purple focus:ring-1 focus:ring-brand-purple
            outline-none appearance-none transition-all
            cursor-pointer
            ${className}
          `}
          {...props}
        >
          {options.map((opt, index) => {
            const label = typeof opt === "string" ? opt : opt.label;
            const value = typeof opt === "string" ? opt : opt.value;
            return (
              <option key={index} value={value} className="text-gray-700">
                {label}
              </option>
            );
          })}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-brand-purple">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;