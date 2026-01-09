import { differenceInYears, parseISO, format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export function calculateAge(dateString: string): string {
  if (!dateString) return "-";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "-";
    
    const age = differenceInYears(new Date(), date);
    return `${age} anos`;
  } catch {
    return "-";
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;

    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}