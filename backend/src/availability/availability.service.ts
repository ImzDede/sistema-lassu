import { PoolClient } from "pg";
import pool from "../config/db";
import { AppError } from "../errors/AppError";
import { HTTP_ERRORS } from "../errors/messages";
import { withTransaction } from "../utils/withTransaction";
import { AvailabilityRepository } from "./availability.repository";
import { AvailabilityDTO } from "./availability.schema";

const repository = new AvailabilityRepository(pool)

export class AvailabilityService {
    async save(userId: string, availabilities: AvailabilityDTO[], txClient?: PoolClient) {
            const executeLogic = async (client: PoolClient) => {
            const repository = new AvailabilityRepository(client);

            const availabilitiesCorrect = this.validate(availabilities);
            await repository.deleteByUser(userId);

            const promises = availabilitiesCorrect.map(row => repository.create(userId, row));
            const availabilityRows = await Promise.all(promises);

            return { availabilityRows };
        };

        if (txClient) {
            return await executeLogic(txClient);
        }

        return withTransaction(async (client) => {
            return await executeLogic(client);
        });
    }

    private validate(hours: AvailabilityDTO[]) {
        let hoursCorrect: AvailabilityDTO[] = [];
        //Percorre todos os dias
        for (let i = 0; i < 7; i++) {
            let hoursDay: AvailabilityDTO[] = [];
            //Percorre todos os horários para verificar se são do dia
            for (let j = 0; j < hours.length; j++) {
                const hour = hours[j];
                //Procura horaráios no dia
                if (hour.diaSemana == i) {
                    hoursDay.push(hour)
                }
            }
            //Ordena os horários do dia para poder realizar a validação
            hoursDay.sort((a, b) => a.horaInicio - b.horaInicio)

            //Percorre horários do dia
            for (let k = 0; k < hoursDay.length - 1; k++) {
                //Valida se nenhum horário invade outro
                if (hoursDay[k].horaFim > hoursDay[k + 1].horaInicio) {
                    throw new AppError(HTTP_ERRORS.BAD_REQUEST.AVAILABILITY.CONFLICT(i), 400);
                }
            }

            //Se tiver tudo correto integra os horários do dia na array final até chegar o ultimo dia
            hoursCorrect.push(...hoursDay)

        }
        return hoursCorrect;
    }

    async getByUser(userId: string) {
        const availabilityRows = await repository.getByUser(userId);
        return { availabilityRows }
    }
}