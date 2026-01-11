import React from "react";
import { Typography } from "@material-tailwind/react";
import Button from "@/components/Button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (newPage: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationControlsProps) {
  
  const handlePrev = () => {
    if (hasPrev) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (hasNext) onPageChange(currentPage + 1);
  };

  // Se não tiver páginas (lista vazia ou loading), não mostra nada ou mostra desabilitado
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-center items-center gap-4">
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={!hasPrev}
        className="border-brand-purple text-brand-purple disabled:opacity-50"
      >
        Anterior
      </Button>

      <Typography className="text-gray-600 font-medium">
        Página {currentPage} de {totalPages}
      </Typography>

      <Button
        variant="outline"
        onClick={handleNext}
        disabled={!hasNext}
        className="border-brand-purple text-brand-purple disabled:opacity-50"
      >
        Próxima
      </Button>
    </div>
  );
}