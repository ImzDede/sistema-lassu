import { useState } from "react";
import api from "@/services/api";

export interface SearchResult {
  user: {
    id: string;
    nome: string;
    matricula: number;
    email: string;
  };
  availabilities: {
    dia: number;
    inicio: number;
    fim: number;
  }[];
}

export function useProfessionalSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchProfessionals = async (dayString: string, startHour: string, endHour: string) => {
    setLoading(true);
    setError(null);
    setResults([]);

    // 1. Mapeamento local
    const localDayMap: { [key: string]: number } = {
      "Domingo": 0, 
      "Segunda-feira": 1, 
      "Terça-feira": 2, 
      "Quarta-feira": 3, 
      "Quinta-feira": 4, 
      "Sexta-feira": 5, 
      "Sábado": 6
    };

    try {
      const diaNum = localDayMap[dayString];
      const inicioNum = parseInt(startHour.split(":")[0]);
      const fimNum = parseInt(endHour.split(":")[0]);

      if (diaNum === undefined || isNaN(inicioNum) || isNaN(fimNum)) {
        throw new Error("Dados de data/hora inválidos para a busca.");
      }

      // Uso da API centralizada (sem precisar passar header manual)
      const response = await api.get(`/users/available?dia=${diaNum}&inicio=${inicioNum}&fim=${fimNum}`);

      setResults(response.data);

    } catch (err: any) {
      // Mantivemos apenas o log de erro real
      console.error("Erro na busca:", err);
      const msg = err.response?.data?.error || "Erro ao buscar profissionais disponíveis.";
      setError(msg);
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
    error
  };
}