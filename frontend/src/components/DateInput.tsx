"use client";

import React from "react";
import Input from "./Input";

interface DateInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  maxDate?: string;
}

const DateInput = ({ maxDate, ...props }: DateInputProps) => {
  const handleOpenPicker = (e: React.SyntheticEvent<HTMLInputElement>) => {
    try {
      // Verificação de segurança
      if (typeof e.currentTarget.showPicker === "function") {
        e.currentTarget.showPicker();
      }
    } catch (error) {
      console.warn("Browser does not support showPicker API");
    }
  };

  return (
    <Input
      {...props}
      type="date"
      max={maxDate || new Date().toISOString().split("T")[0]}
      onClick={(e) => {
        handleOpenPicker(e);
        if (props.onClick) props.onClick(e);
      }}
      onFocus={(e) => {
        handleOpenPicker(e);
        if (props.onFocus) props.onFocus(e);
      }}
    />
  );
};

export default DateInput;