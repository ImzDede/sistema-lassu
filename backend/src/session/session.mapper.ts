import { SessionCreateResponseDTO, SessionGetResponseDTO, SessionGetRow, SessionListResponseDTO, SessionRescheduleResponseDTO, SessionRow, SessionUpdateResponseDTO, SessionUpdateStatusResponseDTO } from "./session.type";

export class SessionMapper {
    static toGet(data: { sessionRow: SessionGetRow }): SessionGetResponseDTO {
        const { sessionRow } = data
        return {
            session: {
                id: Number(sessionRow.id),
                dia: sessionRow.dia,
                hora: sessionRow.hora,
                sala: sessionRow.sala,
                status: sessionRow.status,
                updatedAt: sessionRow.updated_at,
                createdAt: sessionRow.created_at
            },
            therapist: {
                id: sessionRow.usuario_id,
                nome: sessionRow.terapeuta_nome
            },
            patient: {
                id: sessionRow.paciente_id,
                nome: sessionRow.paciente_nome
            }
        };
    }

    static toList(data: { sessionRows: SessionGetRow[] }): SessionListResponseDTO {
        const { sessionRows } = data
        return sessionRows.map((row) => {
            return {
                session: {
                    id: Number(row.id),
                    dia: row.dia,
                    hora: row.hora,
                    sala: row.sala,
                    status: row.status
                },
                therapist: {
                    id: row.usuario_id,
                    nome: row.terapeuta_nome
                },
                patient: {
                    id: row.paciente_id,
                    nome: row.paciente_nome
                }
            };
        })
    }

    static toCreate(data: { sessionRow: SessionRow, patientName: string }): SessionCreateResponseDTO {
        const { sessionRow, patientName } = data
        return {
            session: {
                id: Number(sessionRow.id),
                dia: sessionRow.dia,
                hora: sessionRow.hora,
                sala: sessionRow.sala,
                status: sessionRow.status,
                createdAt: sessionRow.created_at
            },
            patient: {
                id: sessionRow.paciente_id,
                nome: patientName
            }
        };
    }

    static toUpdateStatus(data: { sessionRow: SessionRow }): SessionUpdateStatusResponseDTO {
        const { sessionRow } = data
        return {
            session: {
                id: Number(sessionRow.id),
                status: sessionRow.status,
                updatedAt: sessionRow.updated_at
            }
        };
    }

    static toUpdate(data: { sessionRow: SessionRow }): SessionUpdateResponseDTO {
        const { sessionRow } = data
        return {
            session: {
                id: Number(sessionRow.id),
                dia: sessionRow.dia,
                hora: sessionRow.hora,
                sala: sessionRow.sala,
                status: sessionRow.status,
                updatedAt: sessionRow.updated_at
            }
        };
    }

    static toReschedule(data: { sessionRow: SessionRow, sessionCanceledRow: SessionRow }): SessionRescheduleResponseDTO {
        const { sessionRow, sessionCanceledRow } = data
        return {
            session: {
                id: Number(sessionRow.id),
                dia: sessionRow.dia,
                hora: sessionRow.hora,
                sala: sessionRow.sala,
                status: sessionRow.status,
                createdAt: sessionRow.created_at
            },
            canceledSession: {
                id: sessionCanceledRow.id,
                dia: sessionCanceledRow.dia,
                hora: sessionCanceledRow.hora,
                sala: sessionCanceledRow.sala,
                status: sessionCanceledRow.status,
                updatedAt: sessionCanceledRow.updated_at
            }
        };
    }
}