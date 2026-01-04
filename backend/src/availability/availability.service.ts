import { AppError } from "../errors/AppError";
import { HTTP_ERRORS } from "../errors/messages";
import { AvailabilityRepository } from "./availability.repository";
import { AvailabilityDTO } from "./availability.schema";

const repository = new AvailabilityRepository()

export class AvailabilityService {
    async save(userId: string, availabilities: AvailabilityDTO[]) {
        const availabilitiesCorrect = this.validate(availabilities)
        await repository.deleteByUser(userId)

        let availabilityRows = [];

        for (const row of availabilitiesCorrect) {
            const availabilityRow = await repository.create(userId, row)
            availabilityRows.push(availabilityRow)
        }

        return { availabilityRows }
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