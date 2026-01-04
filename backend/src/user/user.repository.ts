import pool from "../config/db";
import { AvailableUserRow, UserCreateRow, UserFirstAccessRow, UserIdRow, UserListRow, UserLoginRow, UserMinRow, UserRow, UserUpdateProfileRow, UserUpdateRow, UserVerifyFirstAcessRow } from "./user.type";


export class UserRepository {

    async verifyEmailExist(email: string, ignoreId?: string): Promise<UserIdRow | null> {
        let query = 'SELECT id FROM usuarios WHERE email = $1'
        let values = [email]

        if (ignoreId) {
            query += ' AND id != $2'
            values.push(ignoreId)
        }

        const result = await pool.query(query, values)
        return result.rows[0] ?? null;
    }

    async verifyRegistrationExist(registration: string, ignoreId?: string): Promise<UserIdRow | null> {
        let query = 'SELECT id FROM usuarios WHERE matricula = $1'
        let values = [registration]

        if (ignoreId) {
            query += ' AND id != $2'
            values.push(ignoreId)
        }

        const result = await pool.query(query, values)
        return result.rows[0] ?? null;
    }

    async verifyIdExist(userId: string): Promise<UserIdRow | null> {
        let query = 'SELECT id FROM usuarios WHERE id = $1'
        let values = [userId]
        const result = await pool.query(query, values)
        return result.rows[0] ?? null;
    }

    async getName(id: string): Promise<string | null> {
        const result = await pool.query('SELECT nome FROM usuarios WHERE id = $1', [id])
        return result.rows[0] ?? null;
    }

    async getByEmail(email: string): Promise<UserLoginRow | null> {
        const result = await pool.query('SELECT id, nome, matricula, senha_hash, perm_atendimento, perm_cadastro, perm_admin, primeiro_acesso, ativo FROM usuarios WHERE email = $1', [email])
        return result.rows[0] ?? null;
    }

    async getById(id: string): Promise<UserRow | null> {
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id])
        return result.rows[0] ?? null;
    }

    async findAll(
        params: {
            limit: number;
            offset: number;
            orderBy: 'nome' | 'created_at' | 'ativo';
            direction: 'ASC' | 'DESC';
            ativo?: boolean;
        }): Promise<{ userRows: UserListRow[], total: number }> {
        const values: any[] = [];
        let whereClause = 'WHERE perm_admin != true';

        if (params.ativo !== undefined) {
            whereClause += ` AND ativo = $${values.length + 1}`;
            values.push(params.ativo);
        }

        const queryCount = `SELECT COUNT(*) as total FROM usuarios ${whereClause}`;
        const sortColumn = params.orderBy;

        const limitParamIndex = values.length + 1;
        const offsetParamIndex = values.length + 2;
        values.push(params.limit, params.offset);

        const queryData = `
            SELECT id, nome, created_at, matricula, foto_url, ativo, perm_cadastro, perm_atendimento
            FROM usuarios 
            ${whereClause}
            ORDER BY ${sortColumn} ${params.direction} 
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
        `;

        const resultData = await pool.query(queryData, values);

        const countValues = params.ativo !== undefined ? [params.ativo] : [];
        const resultCount = await pool.query(queryCount, countValues)

        return {
            userRows: resultData.rows,
            total: Number(resultCount.rows[0].total)
        };
    }

    async findAvailableUsers(
        data: {
            diaSemana: number;
            horaInicio: number;
            horaFim: number;
        }): Promise<AvailableUserRow[]> {
        //Realiza uma busca de todos os horários que possuem uma parte dentro do horário informado
        const query = `
            SELECT 
                u.id, u.nome, 
                json_agg(
                  json_build_object(
                        'dia_semana', d.dia_semana,
                        'hora_inicio', d.hora_inicio, 
                        'hora_fim', d.hora_fim
                    )
                ) AS lista_disponibilidades
            FROM usuarios as u, disponibilidades as d
            WHERE u.id = d.usuario_id
			  AND d.dia_semana = $1
              AND u.ativo = TRUE
              AND u.perm_atendimento = TRUE
              AND d.hora_inicio < $3
              AND d.hora_fim > $2
            GROUP BY u.id, u.nome
			ORDER BY u.id;
        `;

        const result = await pool.query(query, [data.diaSemana, data.horaInicio, data.horaFim]);
        return result.rows;
    }

    async findAdmins(): Promise<UserRow[]> {
        const query = `SELECT * FROM usuarios WHERE perm_admin = true`;
        const result = await pool.query(query);
        return result.rows;
    }

    async create(
        newId: string,
        passwordHash: string,
        data: {
            matricula: string,
            nome: string,
            email: string,
            telefone?: string;
        }): Promise<UserCreateRow> {
        const query = `
        INSERT INTO usuarios (
                id, matricula, nome, email, telefone, senha_hash, perm_atendimento, perm_cadastro, perm_admin
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, nome, created_at;
        `;

        const values = [
            newId,
            data.matricula,
            data.nome,
            data.email,
            data.telefone || null,
            passwordHash,
            true,       //Atendimento
            false,      //Cadastro
            false       //Admin
        ]

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async verifyFirstAccess(userId: string): Promise<UserVerifyFirstAcessRow | null> {
        const result = await pool.query('SELECT senha_hash, primeiro_acesso FROM usuarios WHERE id = $1', [userId]);
        return result.rows[0] ?? null;
    }

    async completeFirstAccess(userId: string, passwordHash: string, fotoUrl?: string | null): Promise<UserFirstAccessRow | null> {
        const query = `
            UPDATE usuarios
            SET 
                senha_hash = $1,
                foto_url = $2,
                primeiro_acesso = false
            WHERE id = $3
            RETURNING id, nome, foto_url, perm_atendimento, perm_cadastro, perm_admin, primeiro_acesso;
        `;

        const values = [
            passwordHash,
            fotoUrl,
            userId
        ];

        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async updateProfile(
        id: string,
        data: {
            nome?: string | null,
            email?: string | null,
            telefone?: string | null,
            fotoUrl?: string | null,
            senha?: string | null;
        }): Promise<UserUpdateProfileRow | null> {
        const query = `
            UPDATE usuarios
            SET 
                nome = COALESCE($1, nome),
                email = COALESCE($2, email),
                telefone = COALESCE($3, telefone),
                foto_url = COALESCE($4, foto_url),
                senha_hash = COALESCE($5, senha_hash)
                
            WHERE id = $6
            RETURNING id, nome, email, matricula, telefone, foto_url;
        `;

        const values = [
            data.nome || null,
            data.email || null,
            data.telefone || null,
            data.fotoUrl || null,
            data.senha || null,
            id
        ];

        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async update(
        id: string, data: {
            matricula?: string | null;
            permAtendimento?: boolean | null;
            permCadastro?: boolean | null;
            ativo?: boolean | null;
        }): Promise<UserUpdateRow | null> {
        const query = `
            UPDATE usuarios
            SET 
                matricula = COALESCE($1, matricula),
                perm_atendimento = COALESCE($2, perm_atendimento),
                perm_cadastro = COALESCE($3, perm_cadastro),
                ativo = COALESCE($4, ativo)

            WHERE id = $5
            RETURNING id, nome, matricula, perm_atendimento, perm_cadastro, ativo;
        `;

        const values = [
            data.matricula || null,
            data.permAtendimento ?? null,
            data.permCadastro ?? null,
            data.ativo ?? null,
            id
        ];

        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }

    async updatePassword(id: string, password: string): Promise<UserMinRow | null> {
        const query = `
            UPDATE usuarios
            SET 
                senha_hash = $1
            WHERE id = $2
            RETURNING id, nome;
        `;

        const values = [
            password,
            id
        ];

        const result = await pool.query(query, values);
        return result.rows[0] ?? null;
    }
}