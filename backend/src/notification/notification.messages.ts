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

type OldTherapistParams = {
    oldTherapistName: string,
    oldTherapistId: string
}

type ReferParams = {
    referId: string,
    referDestination: string
}

type FormParams = {
    formTitle: string,
    formId: string
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

type TransferPatientAdminParams =
    UserParams &
    PatientParams &
    TherapistParams &
    OldTherapistParams

type ReferralPatientAdminParams =
    UserParams &
    PatientParams &
    ReferParams

type NewPatientUserParams =
    PatientParams

type NewSessionUserParams =
    PatientParams &
    SessionParams

type TransferInParams =
    PatientParams &
    OldTherapistParams;

type TransferOutParams =
    PatientParams &
    TherapistParams;

type ReferralPatientUserParams =
    PatientParams &
    ReferParams

type DocumentPendingUserParams =
    PatientParams &
    FormParams &
    { daysLate: number };

//----------
// Funções  
//----------

export const NOTIFICATION_MESSAGE = {
    //Administrador
    ADMIN: {
        NEW_USER: (params: NewUserAdminParams) => {
            return {
                title: "Nova Usuária Cadastrada",
                message:
                    `A terapeuta [${params.userName}](user:${params.userId}) acabou de ser registrada.`
            }
        },
        NEW_FIRST_ACCESS: (params: NewUserAdminParams) => {
            return {
                title: "Nova Usuária Cadastrada",
                message:
                    `A terapeuta [${params.userName}](user:${params.userId}) realizou o primeiro acesso e ativou a conta.`
            }
        },
        NEW_PATIENT: (params: NewPatientAdminParams) => {
            return {
                title: "Nova Paciente Cadastrada",
                message:
                    `A paciente [${params.patientName}](patient:${params.patientId}) acaba de ser registrada por [${params.userName}](user:${params.userId}), com a terapeuta [${params.therapistName}](user:${params.therapistId}) como responsável.`
            }
        },
        PATIENT_TRANSFER: (params: TransferPatientAdminParams) => {
            return {
                title: "Paciente Transferida",
                message:
                    `A paciente [${params.patientName}](patient:${params.patientId}) acaba de ser transferida por [${params.userName}](user:${params.userId}), sendo movida da terapeuta [${params.oldTherapistName}](user:${params.oldTherapistId}) para [${params.therapistName}](user:${params.therapistId}).`
            }
        },
        PATIENT_REFERRAL: (params: ReferralPatientAdminParams) => {
            return {
                title: "Paciente Encaminhada",
                message:
                    `A paciente [${params.patientName}](patient:${params.patientId}) acaba de ser registrada como encaminhada para [${params.referDestination}](patient:${params.referId}) pela terapeuta [${params.userName}](user:${params.userId}).`
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
        WELCOME: (params: { userName: string }) => {
            return {
                title: "Bem-vinda!",
                message: `Olá ${params.userName}, seja bem-vinda ao Lassu! Seu cadastro foi ativado com sucesso.`
            }
        },
        NEW_PATIENT: (params: NewPatientUserParams) => {
            return {
                title: "Nova Paciente",
                message:
                    `Você tem uma nova paciente: [${params.patientName}](patient:${params.patientId}). Acesse o perfil para iniciar os formulários.`
            }
        },

        TRANSFER_IN: (params: TransferInParams) => {
            return {
                title: "Paciente Recebida",
                message:
                    `A paciente [${params.patientName}](patient:${params.patientId}) de [${params.oldTherapistName}](user:${params.oldTherapistId}) foi transferida para você.).`
            }
        },

        TRANSFER_OUT: (params: TransferOutParams) => {
            return {
                title: "Paciente Transferida",
                message:
                    `A sua paciente [${params.patientName}](patient:${params.patientId}) foi transferida para [${params.therapistName}](user:${params.therapistId}).`
            }
        },

        PATIENT_REFERRAL: (params: ReferralPatientUserParams) => {
            return {
                title: "Encaminhamento Registrado",
                message:
                    `O encaminhamento da paciente [${params.patientName}](patient:${params.patientId}) para [${params.referDestination}](patient:${params.referId}) foi concluído com sucesso. O status foi alterado para 'Encaminhada'.`
            }
        },

        NEW_SESSION: (params: NewSessionUserParams) => {
            const month = params.day.slice(5, 7);
            const dayMonth = params.day.slice(8, 10);
            return {
                title: "Sessão Agendada",
                message:
                    `Uma nova [sessão](session:${params.sessionId}) foi marcada com [${params.patientName}](patient:${params.patientId}) para o dia ${dayMonth}/${month} às ${params.hour}:00 na Sala ${params.room}.`
            }
        },

        DOCUMENT_PENDING: (params: DocumentPendingUserParams) => {
            return {
                title: "Documento Pendente",
                message:
                    `O formulário [${params.formTitle}](form:${params.formId}) da paciente [${params.patientName}](patient:${params.patientId}) está pendente há ${params.daysLate} dias.`
            }
        }
    }
}