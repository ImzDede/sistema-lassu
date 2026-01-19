import { Pool, PoolClient } from "pg";
import { AvailabilityRow } from "./availability.type";

export class AvailabilityRepository {
    constructor (private readonly client: Pool | PoolClient) {}

    async create(
        userId: string,
        data: {
            diaSemana: number,
            horaInicio: number,
            horaFim: number
        }): Promise<AvailabilityRow> {
        const query = `
                INSERT INTO disponibilidades (usuario_id, dia_semana, hora_inicio, hora_fim)
                VALUES ($1, $2, $3, $4)
                RETURNING dia_semana, hora_inicio, hora_fim;
            `;

        const result = await this.client.query(query, [userId, data.diaSemana, data.horaInicio, data.horaFim])
        return result.rows[0];
    }

    async getByUser(userId: string): Promise<AvailabilityRow[]> {
        const query = `
            SELECT dia_semana, hora_inicio, hora_fim
            FROM disponibilidades
            WHERE usuario_id = $1
        `;

        const result = await this.client.query(query, [userId]);
        return result.rows;
    }

    async deleteByUser(userId: string) {
        await this.client.query('DELETE FROM disponibilidades WHERE usuario_id = $1', [userId]);
    }
}