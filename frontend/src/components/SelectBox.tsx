"use client";

import React from "react";
import { Select as MTSelect, Option } from "@material-tailwind/react";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  value: string | number;
  onChange: (value: any) => void;
  options: (string | SelectOption)[];
  className?: string;
  required?: boolean;
}

const Select = ({ label, value, onChange, options, required, className = "" }: SelectProps) => {
  return (
    <div className="w-full">
      <MTSelect
        label={label}
        value={String(value)}
        onChange={(val: string | undefined) => {
           if (val) onChange(val);
        }}
        size="lg"
        variant="standard"
        className={`
          bg-transparent font-medium text-brand-dark
          !border-b-brand-pink
          focus:!border-b-brand-purple
          !border-b-[1px] focus:!border-b-[2px]
          ${className}
        `}
        labelProps={{
          className: `
            text-gray-400 peer-focus:text-brand-purple
            font-medium
            before:content-none after:content-none
          `,
        }}
        containerProps={{ className: "min-w-0 w-full" }} 
        animate={{
          mount: { y: 0 },
          unmount: { y: 25 },
        }}>
        {options.map((opt, index) => {
          const labelOpt = typeof opt === "string" ? opt : opt.label;
          const valueOpt = typeof opt === "string" ? opt : opt.value;
          
          return (
            <Option key={index} value={String(valueOpt)} className="text-gray-700 hover:bg-brand-purple/10 hover:text-brand-purple font-medium">
              {labelOpt}
            </Option>
          );
        })}
      </MTSelect>
    </div>
  );
};

export default Select;