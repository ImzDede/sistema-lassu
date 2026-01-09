// (Visual)
export interface TimeSlot {
  id: string;
  day: string;
  start: string;
  end: string;
}

// (DTO)
export interface CreateAvailabilityDTO {
  diaSemana: number;
  horaInicio: number;
  horaFim: number;
}

export interface AvailabilityResponse {
  id: string;
  usuarioId: string;
  diaSemana: number;
  horaInicio: number;
  horaFim: number;
}