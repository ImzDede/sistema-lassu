//-----------------------
// Corpo da Notificação
//-----------------------
export type Notification = {
  title: string;
  message: string;
};

//------------------
// Parâmetros bases 
//------------------

type PatientParams = {
    patientName: string,
    patientId: string
}

//Quem executou a ação
type UserParams = {
    userName: string,
    userId: string
}

//Caso uma terapeuta for designida para algo e não é quem executou a ação
type TherapistParams = {
    therapistName: string,
    therapistId: string
}

type SessionParams = {
    sessionId: number,
    day: string,
    hour: number,
    room: number
}

//----------------------
// Parâmetros compostos  
//----------------------

type NewPatientAdminParams =
    PatientParams &
    UserParams &
    TherapistParams

type NewUserAdminParams =
    UserParams

type NewSessionAdminParams =
    UserParams &
    PatientParams &
    SessionParams

type NewPatientUserParams =
    PatientParams

type NewSessionUserParams =
    PatientParams &
    SessionParams

//----------
// Funções  
//----------

export const NOTIFICATION_MESSAGE = {
    //Administrador
    ADMIN: {
        NEW_PATIENT: (params: NewPatientAdminParams) => {
            return {
                title: "Nova Paciente Cadastrada",
                message:
                    `A paciente [${params.patientName}](patient:${params.patientId}) acaba de ser registrada por [${params.userName}](user:${params.userId}), com a terapeuta [${params.therapistName}](user:${params.therapistId}) como responsável.`
            }
        },
        NEW_USER: (params: NewUserAdminParams) => {
            return {
                title: "Nova Usuária Cadastrada",
                message:
                    `A terapeuta [${params.userName}](user:${params.userId}) acabou de ser registrada.`
            }
        },
        NEW_SESSION: (params: NewSessionAdminParams) => {
            const month = params.day.slice(5, 7);
            const dayMonth = params.day.slice(8, 10);
            return {
                title: "Sessão Marcada",
                message:
                    `Uma [sessão](session:${params.sessionId}) foi marcada com a paciente [${params.patientName}](patient:${params.patientId}), com a terapeuta [${params.userName}](user:${params.userId}), no dia ${dayMonth}/${month} às ${params.hour}:00 na Sala ${params.room}`
            }
        }
    },

    //Atendimento
    USER: {
        NEW_PATIENT: (params: NewPatientUserParams) => {
            return {
                title: "Nova Paciente Atribuida",
                message:
                    `A paciente [${params.patientName}](patient:${params.patientId}) acaba de ser atribuida a você.`
            }
        },
        NEW_SESSION: (params: NewSessionUserParams) => {
            const month = params.day.slice(5, 7);
            const dayMonth = params.day.slice(8, 10);
            return {
                title: "Sessão Marcada",
                message:
                    `Uma [sessão](session:${params.sessionId}) foi marcada com a paciente [${params.patientName}](patient:${params.patientId}), no dia ${dayMonth}/${month} às ${params.hour}:00 na Sala ${params.room}`
            }
        }
    }

}