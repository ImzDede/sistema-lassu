import { useState } from "react";

export interface PaginationMetadata {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Avançar página
  const nextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  // Voltar página
  const prevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  // Ir para página específica
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  // Atualiza tudo quando a API responde
  const setMetadata = (meta: PaginationMetadata) => {
    if (meta) {
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      if (meta.currentPage && meta.currentPage !== page) {
         setPage(meta.currentPage);
      }
    }
  };

  return {
    page,
    totalPages,
    totalItems,
    setPage,
    nextPage,
    prevPage,
    goToPage,
    setMetadata,
    // Helpers visuais para desabilitar botões
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}