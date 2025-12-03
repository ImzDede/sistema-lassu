import pool from "../config/db";
import { Disponibilidade } from "../types/Disponibilidade";

export class DisponibilidadeService {

    async save(userId: string, horarios: Disponibilidade[]) {

        const horariosValidos = this.validacaoHorarios(horarios)

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            await client.query('DELETE FROM disponibilidades WHERE usuario_id = $1', [userId]);

            const queryInsert = `
                INSERT INTO disponibilidades (usuario_id, dia_semana, hora_inicio, hora_fim)
                VALUES ($1, $2, $3, $4)
                RETURNING dia_semana, hora_inicio, hora_fim;
            `;

            const resultados = [];

            for (const item of horariosValidos) {
                // Conversão para minutos, usado no banco
                const inicioMin = item.horaInicio*60
                const fimMin = item.horaFim*60

                const res = await client.query(queryInsert, [
                    userId,
                    item.dia,
                    inicioMin,
                    fimMin
                ]);
                resultados.push({
                    dia: res.rows[0].dia_semana,
                    horaInicio: res.rows[0].hora_inicio / 60,
                    horaFim: res.rows[0].hora_fim / 60
                });
            }

            await client.query('COMMIT');
            return resultados;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    private validacaoHorarios(horarios: Disponibilidade[]) {
        let horariosArrumado: Disponibilidade[] = [];
        for (let i = 0; i < 7; i++) {
            let horariosDia: Disponibilidade[] = [];
            for (let j = 0; j < horarios.length; j++) {
                const horario = horarios[j];
                if (horario.dia == i) {
                    if (horario.horaFim <= horario.horaInicio) throw new Error(`Horário errado no dia ${i}: ${JSON.stringify(horario)}`);
                    horariosDia.push(horario)
                }
            }

            horariosDia.sort((a, b) => a.horaInicio - b.horaInicio)

            for (let k = 0; k < horariosDia.length - 1; k++) {
                if (horariosDia[k].horaFim > horariosDia[k + 1].horaInicio) {
                    throw new Error(`Horários incompatíveis no dia ${i}: ${JSON.stringify(horariosDia[k])} e ${JSON.stringify(horariosDia[k + 1])}`);
                }
            }

            horariosArrumado.push(...horariosDia)

        }
        return horariosArrumado;
    }

    async findById(userId: string) {

        const query = `
        SELECT dia_semana, hora_inicio, hora_fim
        FROM disponibilidades
        WHERE usuario_id = $1
        `;

        const result = await pool.query(query, [userId]);

        return result.rows.map(row => ({
            dia: row.dia_semana,
            horaInicio: row.hora_inicio / 60,
            horaFim: row.hora_fim / 60
        }));
    }
}