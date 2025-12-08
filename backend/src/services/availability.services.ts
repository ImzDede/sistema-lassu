import pool from "../config/db";
import { HTTP_ERRORS } from "../errors/messages";
import { AppError } from "../errors/AppError";
import { Availability } from "../types/Availability";

export class AvailabilityService {

    async save(userId: string, hours: Availability[]) {
        //Verifica se é uma array
        if (!Array.isArray(hours)) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.NO_ARRAY, 400)
        }
        //Ordena e valida todos os horários
        const hoursCorrect = this.validate(hours)

        //Abre uma conexão
        const client = await pool.connect();

        //Tenta deletar os horários antigos e salvar tudo de novo, caso haja uma perca de conexão no meio nada é realizado
        try {
            await client.query('BEGIN');

            //Deleta todos os horários do usuário
            await client.query('DELETE FROM disponibilidades WHERE usuario_id = $1', [userId]);

            //Comando para criar um horário
            const queryInsert = `
                INSERT INTO disponibilidades (usuario_id, dia_semana, hora_inicio, hora_fim)
                VALUES ($1, $2, $3, $4)
                RETURNING dia_semana, hora_inicio, hora_fim;
            `;

            const results = [];

            //Percorre todos os horários salvando ele no banco e adicionando ele na array para retornar no banco já formatado em camelCase
            for (const hour of hoursCorrect) {
                const res = await client.query(queryInsert, [
                    userId,
                    hour.dia,
                    hour.horaInicio,
                    hour.horaFim
                ]);
                results.push({
                    dia: res.rows[0].dia_semana,
                    horaInicio: res.rows[0].hora_inicio,
                    horaFim: res.rows[0].hora_fim
                });
            }

            await client.query('COMMIT');
            return results;

        } catch (error) {
            //Rollback caso haja perca de conexão
            await client.query('ROLLBACK');
            throw error;
        } finally {
            //Fecha a conexão
            client.release();
        }
    }

    private validate(hours: Availability[]) {
        let hoursCorrect: Availability[] = [];
        //Percorre todos os dias
        for (let i = 0; i < 7; i++) {
            let hoursDay: Availability[] = [];
            //Percorre todos os horários para verificar se são do dia
            for (let j = 0; j < hours.length; j++) {
                const hour = hours[j];
                //Procura horaráios no dia
                if (hour.dia == i) {
                    //Valida horário e adiciona na array de horário do dia
                    if (hour.horaFim <= hour.horaInicio) throw new AppError(HTTP_ERRORS.BAD_REQUEST.HOUR(i), 400);
                    hoursDay.push(hour)
                }
            }
            //Ordena os horários do dia para poder realizar a validação
            hoursDay.sort((a, b) => a.horaInicio - b.horaInicio)

            //Percorre horários do dia
            for (let k = 0; k < hoursDay.length - 1; k++) {
                //Valida se nenhum horário invade outro
                if (hoursDay[k].horaFim > hoursDay[k + 1].horaInicio) {
                    throw new AppError(HTTP_ERRORS.BAD_REQUEST.HOURS(i), 400);
                }
            }

            //Se tiver tudo correto integra os horários do dia na array final até chegar o ultimo dia
            hoursCorrect.push(...hoursDay)

        }
        return hoursCorrect;
    }

    async getByUserId(userId: string) {

        //Busca no banco todos os horários do usuário pelo o Id
        const query = `
        SELECT dia_semana, hora_inicio, hora_fim
        FROM disponibilidades
        WHERE usuario_id = $1
        `;

        const result = await pool.query(query, [userId]);

        //Retorna uma array do resultado formatado em camelCase
        return result.rows.map(row => ({
            dia: row.dia_semana,
            horaInicio: row.hora_inicio,
            horaFim: row.hora_fim
        }));
    }
}