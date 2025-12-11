import { differenceInYears, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Calcula idade
export function calculateAge(dateString: string): string {
  if (!dateString) return "-";
  try {
    const date = parseISO(dateString);
    const age = differenceInYears(new Date(), date);
    return `${age} anos`;
  } catch (error) {
    return "-";
  }
}

// Formata data simples: "20/05/1995"
export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  try {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    return dateString;
  }
}