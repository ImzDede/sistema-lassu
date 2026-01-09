import { useState } from "react";
import { userService } from "@/services/userServices";
import { dayMap } from "@/utils/constants";

export interface SearchResult {
  user: {
    id: string;
    nome: string;
    matricula: number;
    email: string;
  };
  availability: {
    diaSemana: number;
    inicio: number;
    fim: number;
  }[];
}

export function useProfessionalSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchProfessionals = async (
    dayString: string,
    startHour: string,
    endHour: string
  ) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const diaNum = dayMap[dayString];

      const inicioNum = parseInt(startHour.split(":")[0]);
      const fimNum = parseInt(endHour.split(":")[0]);

      if (diaNum === undefined || isNaN(inicioNum) || isNaN(fimNum)) {
        throw new Error("Selecione um dia útil e horários válidos.");
      }

      // Chama o Service
      const data = await userService.searchAvailable(diaNum, inicioNum, fimNum);
      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Erro na busca:", err);
      const msg = err.response?.data?.error || "Erro ao buscar profissionais.";
      setError(typeof msg === "string" ? msg : "Erro ao buscar.");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    searchProfessionals,
    clearResults,
    results,
    loading,
    error,
  };
}
