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
                    `A paciente [${patientName}](patient:${patientId}) acaba de ser registrada por [${userName}](user:${userId}), com a extensionista [${professionalName}](user:${professionalId}) como responsável.`
            }
        },
        NEW_USER: (userName: string, userId: string) => {
            return {
                title: "Nova Usuária Cadastrada",
                message: 
                `A usuária [${userName}](user:${userId}) acabou de ser criada.`
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
        }
    }

}