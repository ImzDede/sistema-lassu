import { PatientIdRow, PatientListRow, PatientRow, PatientUpdateRow, ReferRow } from "./patient.type";
import { Pool, PoolClient } from "pg";

export class PatientRepository {

    constructor (private readonly client: Pool | PoolClient) {}

    async verifyCpfExist(cpf: string, ignoreId?: string): Promise<PatientIdRow | null> {
        let query = 'SELECT id FROM pacientes WHERE cpf = $1'
        let values = [cpf]

        if (ignoreId) {
            query += ' AND id != $2'
            values.push(ignoreId)
        }

        const result = await this.client.query(query, values)
        return result.rows[0] ?? null;
    }

    async getName(id: string): Promise<string | null> {
        const result = await this.client.query('SELECT nome FROM pacientes WHERE id = $1', [id])
        return result.rows[0].nome ?? null;
    }

    async getTherapistId(patientId: string): Promise<string | null> {
        const result = await this.client.query('SELECT terapeuta_id FROM pacientes WHERE id = $1', [patientId]);
        return result.rows[0].terapeuta_id ?? null;
    }

    async getById(patientId: string): Promise<PatientRow | null> {
        const result = await this.client.query('SELECT * FROM pacientes WHERE id = $1', [patientId]);
        return result.rows[0] ?? null;
    }

    async list(
        params: {
            limit: number;
            offset: number;
            orderBy: 'nome' | 'created_at';
            direction: 'ASC' | 'DESC';
            nome?: string;
            filterUserId?: string;
            status?: 'atendimento' | 'encaminhada';
            deleted: boolean;
        }): Promise<{ patientRows: PatientListRow[], total: number }> {
        const values: any[] = [];
        let whereClause = 'WHERE deleted_at IS NULL';
        
        if (params.deleted) {
            whereClause = 'WHERE deleted_at IS NOT NULL'
        }

        if (params.filterUserId !== undefined) {
            whereClause += ` AND terapeuta_id = $${values.length + 1}`;
            values.push(params.filterUserId);
        }

        if (params.status !== undefined) {
            whereClause += ` AND status = $${values.length + 1}`;
            values.push(params.status);
        }

        if (params.nome !== undefined) {
            whereClause += ` AND nome ILIKE $${values.length + 1}`;
            values.push(`%${params.nome}%`);
        }

        const queryCount = `SELECT COUNT(*) as total FROM pacientes ${whereClause}`;
        const sortColumn = params.orderBy;

        //Precisa vim antes de limit e offset serem adicionados
        const resultCount = await this.client.query(queryCount, values)

        const limitParamIndex = values.length + 1;
        const offsetParamIndex = values.length + 2;
        values.push(params.limit, params.offset);

        const queryData = `
            SELECT id, nome, data_nascimento, terapeuta_id, status, created_at
            FROM pacientes 
            ${whereClause}
            ORDER BY ${sortColumn} ${params.direction} 
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
        `;

        const resultData = await this.client.query(queryData, values);

        return {
            patientRows: resultData.rows,
            total: Number(resultCount.rows[0].total)
        };
    }

    async create(
        data: {
            nome: string,
            dataNascimento: string,
            cpf: string,
            telefone: string,
            terapeutaId: string,
        },
        patientId: string
    ): Promise<PatientRow> {

        const query = `
        INSERT INTO pacientes (
                id, nome, data_nascimento, cpf, telefone, terapeuta_id
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `

        const values = [
            patientId,
            data.nome,
            data.dataNascimento,
            data.cpf,
            data.telefone,
            data.terapeutaId,
        ]

        const result = await this.client.query(query, values);
        return result.rows[0];
    }

    async update(
        patientId: string,
        data: {
            nome?: string | null,
            dataNascimento?: string | null,
            cpf?: string | null,
            telefone?: string | null
        }
    ): Promise<PatientUpdateRow | null> {
        const query = `
            UPDATE pacientes
            SET 
                nome = COALESCE($1, nome),
                data_nascimento = COALESCE($2, data_nascimento),
                cpf = COALESCE($3, cpf),
                telefone = COALESCE($4, telefone)

            WHERE id = $5
            RETURNING id, nome, data_nascimento, cpf, telefone;
        `;

        const values = [
            data.nome || null,
            data.dataNascimento || null,
            data.cpf || null,
            data.telefone || null,
            patientId
        ];

        const result = await this.client.query(query, values);
        return result.rows[0] ?? null;
    }

    async updateStatus(patientId: string, status: string): Promise<PatientRow | null> {
        const query = `UPDATE pacientes SET status = $1 WHERE id = $2 RETURNING *;`;
        const result = await this.client.query(query, [status, patientId]);
        return result.rows[0] ?? null;
    }

    async updateTherapist(patientId: string, newTherapistId: string): Promise<PatientRow | null> {
        const query = `UPDATE pacientes SET terapeuta_id = $1 WHERE id = $2 RETURNING *;`;
        const result = await this.client.query(query, [newTherapistId, patientId]);
        return result.rows[0] ?? null;
    }

    async delete(id: string): Promise<PatientRow | null> {
        const query = `
            UPDATE pacientes 
            SET deleted_at = NOW() 
            WHERE id = $1 AND deleted_at IS NULL 
            RETURNING *;
        `;
        const result = await this.client.query(query, [id]);
        return result.rows[0] ?? null;
    }

    async restore(id: string): Promise<PatientRow | null> {
        const query = `
            UPDATE pacientes 
            SET deleted_at = NULL 
            WHERE id = $1 AND deleted_at IS NOT NULL 
            RETURNING *;
        `;
        const result = await this.client.query(query, [id]);
        return result.rows[0] ?? null;
    }

    async upsertRefer(patientId: string, destino: string, filename: string | null) {
        const query = `
            INSERT INTO encaminhamentos (paciente_id, destino, arquivo_url)
            VALUES ($1, $2, $3)
            ON CONFLICT (paciente_id) 
            DO UPDATE SET 
                destino = EXCLUDED.destino, 
                arquivo_url = COALESCE($3, encaminhamentos.arquivo_url),
                created_at = NOW()
            RETURNING *
        `;
        const result = await this.client.query(query, [patientId, destino, filename]);
        return result.rows[0];
    }

    async getRefer(patientId: string): Promise<ReferRow | null> {
        const query = `SELECT * FROM encaminhamentos WHERE paciente_id = $1`;
        const result = await this.client.query(query, [patientId]);
        return result.rows[0] || null;
    }

}