// Gera strings "08:00", "09:00"... até "17:00" (Para inputs de texto/select simples)
export const hoursStartStrings = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});

// Gera strings "09:00", "10:00"... até "18:00"
export const hoursEndStrings = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 9;
  return `${hour.toString().padStart(2, "0")}:00`;
});

// Gera objetos para o Select de Sessão: { label: "08:00 - 09:00", value: 8 }
export const sessionHourOptions = Array.from({ length: 10 }, (_, i) => {
  const start = i + 8;
  const end = start + 1;
  const startStr = start.toString().padStart(2, '0');
  const endStr = end.toString().padStart(2, '0');
  
  return { 
    label: `${startStr}:00 - ${endStr}:00`, 
    value: start 
  };
});

// Gera opções de Salas: Sala 1 até Sala 12
export const roomOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `Sala ${i + 1}`,
  value: i + 1
}));