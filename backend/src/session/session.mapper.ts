import { SessionResponseDTO, SessionRow } from "./session.type";

export class SessionMapper {
    static toResponse(row: SessionRow): SessionResponseDTO {
        return {
            id: row.id,
            pacienteId: row.paciente_id,
            usuarioId: row.usuario_id,
            dia: row.dia,
            hora: row.hora,
            sala: row.sala,
            status: row.status,
        };
    }
}