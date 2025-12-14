"use client";

import React from "react";
import Input from "./Input";

interface DateInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  maxDate?: string;
  minDate?: string;
}

const DateInput = ({ maxDate, minDate, ...props }: DateInputProps) => {
  const handleOpenPicker = (e: React.SyntheticEvent<HTMLInputElement>) => {
    try {
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
      // Se não passar maxDate, ele NÃO trava datas futuras por padrão
      max={maxDate} 
      min={minDate}
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