// Remove tudo que não é número
export const cleanFormat = (value: string) => {
  return value.replace(/\D/g, "");
};

// Formata CPF: 000.000.000-00
export const formatCPF = (value: string) => {
  const numericValue = cleanFormat(value);
  
  return numericValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

// Formata Telefone: (00) 0000-0000 ou (00) 00000-0000
export const formatPhone = (value: string) => {
  const numericValue = cleanFormat(value);
  
  // Se tiver mais de 10 digitos, assume que é celular (9 digitos)
  if (numericValue.length > 10) {
    return numericValue
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  } 
  // Senão, fixo
  return numericValue
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

// MAPAS DE DIAS DA SEMANA 

export const dayMap: Record<string, number> = {
  "Segunda-feira": 1,
  "Terça-feira": 2,
  "Quarta-feira": 3,
  "Quinta-feira": 4,
  "Sexta-feira": 5,
};

// Mapa Inverso (Número -> String) para mensagens de erro
export const numberToDayMap: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
};

// Helper para gerar as opções de Select
export const daysOptions = Object.keys(dayMap);