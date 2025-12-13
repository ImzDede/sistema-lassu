export interface Notification {
    title: string;
    message: string;
}

export const NOTIFICATION = {
    //Administrador
    ADMIN: {
        NEW_PATIENT: (patientName: string, patientId: string, userName: string, userId: string, professionalName: string, professionalId: string) => {
            return {
                title: "Nova Paciente Cadastrada",
                message:
                    `A paciente [${patientName}](patient:${patientId}) acaba de ser registrada por [${userName}](user:${userId}), com a terapeuta [${professionalName}](user:${professionalId}) como responsável.`
            }
        },
        NEW_USER: (userName: string, userId: string) => {
            return {
                title: "Nova Usuária Cadastrada",
                message: 
                `A terapeuta [${userName}](user:${userId}) acabou de ser registrada.`
            }
        },
        NEW_SESSION: (userName: string, userId: string, patientName: string, patientId: string, sessionId: number, day: string, hour: number, room: number) => {
            const month = day.slice(5, 7);
            const dayMonth = day.slice(8, 10);
            return {
                title: "Sessão Marcada",
                message:
                    `Uma [sessão](session:${sessionId}) foi marcada com a paciente [${patientName}](patient:${patientId}), com a terapeuta [${userName}](user:${userId}), no dia ${dayMonth}/${month} às ${hour}:00 na Sala ${room}`
            }
        }
    },

    //Atendimento
    USER: {
        NEW_PATIENT: (patientName: string, patientId: string) => {
            return {
                title: "Nova Paciente Atribuida",
                message:
                    `A paciente [${patientName}](patient:${patientId}) acaba de ser atribuida a você.`
            }
        },
        NEW_SESSION: (patientName: string, patientId: string, sessionId: number, day: string, hour: number, room: number) => {
            const month = day.slice(5, 7);
            const dayMonth = day.slice(8, 10);
            return {
                title: "Sessão Marcada",
                message:
                    `Uma [sessão](session:${sessionId}) foi marcada com a paciente [${patientName}](patient:${patientId}), no dia ${dayMonth}/${month} às ${hour}:00 na Sala ${room}`
            }
        }
    }

}