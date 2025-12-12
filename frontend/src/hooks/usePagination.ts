import { useState } from "react";

export function usePagination(initialCount = 10, increment = 10) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const loadMore = () => {
    setVisibleCount((prev) => prev + increment);
  };

  // Função auxiliar para verificar se mostramos o botão
  // Recebe o tamanho total da lista e diz se tem mais para ver
  const hasMore = (totalItems: number) => visibleCount < totalItems;

  // Função para resetar
  const resetPagination = () => {
    setVisibleCount(initialCount);
  };

  return {
    visibleCount,
    loadMore,
    hasMore,
    resetPagination
  };
}