"use client";

import React, { useState, useEffect } from "react";
import { format, isValid, parse, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import Input from "./Input";

interface DateInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
  value?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  name?: string;
  minDate?: string;
  maxDate?: string;
}

export default function DateInput({
  value,
  onChange,
  name,
  minDate,
  maxDate,
  ...props
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value) {
      try {
        const parsed = parseISO(value);
        if (isValid(parsed)) {
          setDisplayValue(format(parsed, "dd/MM/yyyy"));
        }
      } catch {
        setDisplayValue("");
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length > 8) v = v.slice(0, 8);

    if (v.length > 4) {
      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length > 2) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }

    setDisplayValue(v);

    if (v.length === 10) {
      const parsedDate = parse(v, "dd/MM/yyyy", new Date());
      
      if (isValid(parsedDate)) {
        triggerChange(parsedDate);
      }
    } else if (v === "") {
        triggerChange(undefined);
    }
  };

  const triggerChange = (date: Date | undefined) => {
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: date ? format(date, "yyyy-MM-dd") : "",
        },
      });
    }
  };

  return (
    <div className="w-full">
      <Input
        {...props}
        name={name}
        value={displayValue}
        onChange={handleInputChange}
        placeholder="DD/MM/AAAA"
        maxLength={10}
        autoComplete="off"
        icon={
          <CalendarIcon
            size={18}
            className="text-brand-purple/50"
          />
        }
      />
    </div>
  );
}