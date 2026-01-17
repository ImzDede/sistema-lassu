import { PatientGetResponseDTO, PatientListResponseDTO, PatientListRow, PatientResponseDTO, PatientRow, PatientUpdateResponseDTO, PatientUpdateRow, ReferResponseDTO, ReferRow } from "./patient.type";

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

    static toGet(data: { patientRow: PatientRow, therapistName: string }): PatientGetResponseDTO {
        const { patientRow, therapistName } = data
        return {
            patient: {
                id: patientRow.id,
                nome: patientRow.nome,
                dataNascimento: patientRow.data_nascimento,
                cpf: patientRow.cpf,
                telefone: patientRow.telefone,
                status: patientRow.status,
                createdAt: patientRow.created_at
            },
            therapist: {
                id: patientRow.terapeuta_id,
                nome: therapistName
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

    static toRefer(data: { patientRow: PatientRow, referRow: ReferRow }): ReferResponseDTO {
        const { patientRow, referRow } = data;
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
            },
            refer: {
                id: referRow.id,
                destino: referRow.destino,
                arquivoUrl: referRow.arquivo_url,
                dataEncaminhamento: referRow.created_at
            }
        };
    }
}