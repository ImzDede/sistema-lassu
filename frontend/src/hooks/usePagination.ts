import { useState } from "react";

export function usePagination(initialCount = 10, increment = 10) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const loadMore = () => {
    setVisibleCount((prev) => prev + increment);
  };

  const hasMore = (totalItems: number) => visibleCount < totalItems;

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