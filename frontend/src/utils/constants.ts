// Mapeamento de Dias da Semana
export const dayMap: Record<string, number> = {
  "Segunda-feira": 1,
  "Terça-feira": 2,
  "Quarta-feira": 3,
  "Quinta-feira": 4,
  "Sexta-feira": 5,
};

export const numberToDayMap: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
};

export const daysOptions = Object.keys(dayMap);

// Gera strings "08:00", "09:00"... até "17:00"
export const hoursStartStrings = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});

// Gera strings "09:00", "10:00"... até "18:00"
export const hoursEndStrings = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 9;
  return `${hour.toString().padStart(2, "0")}:00`;
});

// Opções de Horário para Selects
export const sessionHourOptions = Array.from({ length: 10 }, (_, i) => {
  const start = i + 8; // Começa as 08:00
  const end = start + 1;
  const startStr = start.toString().padStart(2, '0');
  const endStr = end.toString().padStart(2, '0');
  
  return { 
    label: `${startStr}:00 - ${endStr}:00`, 
    value: start 
  };
});

// Opções de Sala
export const roomOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `Sala ${i + 1}`,
  value: i + 1
}));