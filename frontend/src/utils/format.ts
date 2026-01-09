// Remove caracteres não numéricos.
export const cleanFormat = (value: string | undefined): string => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

// Formata CPF: 000.000.000-00
export const formatCPF = (value: string | undefined): string => {
  const numericValue = cleanFormat(value);
  if (!numericValue) return "";
  
  return numericValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

// Formata Telefone
export const formatPhone = (value: string | undefined): string => {
  const numericValue = cleanFormat(value);
  if (!numericValue) return "";
  
  // Celular (9 dígitos + DDD)
  if (numericValue.length > 10) {
    return numericValue
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  } 
  
  // Fixo (8 dígitos + DDD)
  return numericValue
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

// Helpers de Hora
export const formatTime = (hour: number): string => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

export const formatTimeInterval = (start: number, end: number): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};