import { AvailabilityResponseDTO, AvailabilityRow } from "./availability.type";

export class AvailabilityMapper {
  static toResponse(data: { availabilityRows: AvailabilityRow[] }): AvailabilityResponseDTO {
    const { availabilityRows } = data
    return {
      availability: availabilityRows.map((row) => {
        return {
          diaSemana: row.dia_semana,
          horaInicio: row.hora_inicio,
          horaFim: row.hora_fim
        }
      })
    };
  }
}