import { PatientListDTO } from "./patient.schema";
import { PatientListResponseDTO, PatientListRow, PatientResponseDTO, PatientRow, PatientUpdateResponseDTO, PatientUpdateRow } from "./patient.type";

export class PatientMapper {
    static toComplete(data: { patientRow: PatientRow }): PatientResponseDTO {
        const { patientRow } = data
        return {
            patient: {
                id: patientRow.id,
                nome: patientRow.nome,
                dataNascimento: patientRow.data_nascimento,
                cpf: patientRow.cpf,
                telefone: patientRow.telefone,
                terapeutaId: patientRow.terapeuta_id,
                status: patientRow.status,
                createdAt: patientRow.created_at
            }
        }
    }

    static toUpdate(data: { patientRow: PatientUpdateRow }): PatientUpdateResponseDTO {
        const { patientRow } = data
        return {
            patient: {
                id: patientRow.id,
                nome: patientRow.nome,
                dataNascimento: patientRow.data_nascimento,
                cpf: patientRow.cpf,
                telefone: patientRow.telefone
            }
        }
    }

    static toList(data: { patientRows: PatientListRow[] }): PatientListResponseDTO {
        const { patientRows } = data
        return patientRows.map((row) => {
            return {
                patient: {
                    id: row.id,
                    nome: row.nome,
                    dataNascimento: row.data_nascimento,
                    terapeutaId: row.terapeuta_id,
                    status: row.status,
                    createdAt: row.created_at
                }
            }
        })
    }
}