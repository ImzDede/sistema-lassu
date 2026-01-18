// ==========================================
// 1. ENUMS E TIPOS BÁSICOS
// ==========================================

export type QuestionType = 
    | 'texto' 
    | 'longo_texto' 
    | 'inteiro' 
    | 'data' 
    | 'unica_escolha' 
    | 'multipla_escolha';

export type FormStatus = 'rascunho' | 'finalizado';
export type FormType = 'ANAMNESE' | 'SINTESE';

//------------------
// Retorno do Banco  
//------------------

export type FormVersionRow = {
    id: string;
    modelo_id: string;
    ativo: boolean;
}

export type SectionRow = {
    id: string;
    versao_id: string;
    titulo: string;
    ordem: number;
}

export type QuestionRow = {
    id: string;
    secao_id: string;
    enunciado: string;
    obrigatoria: boolean;
    tipo: QuestionType;
    ordem: number;
    depende_de_opcao_id: string | null;
}

export type OptionRow = {
    id: string;
    pergunta_id: string;
    enunciado: string;
    ordem: number;
    requer_texto: boolean;
    label_texto: string;
}

export type AnswerRow = {
    id: string;
    formulario_id: string;
    pergunta_id: string;
    texto_resposta: string | null;
}

export type SelectedOptionRow = {
    resposta_id: string,
    opcao_id: string,
    texto_complemento: string
}

export type FormFilledRow = {
    id: string;
    paciente_id: string;
    versao_id: string;
    status: FormStatus;
    porcentagem_conclusao: number;
    updated_at: Date;
}

//--------------
// Response DTO 
//--------------

export type SelectedOptionDTO = {
    id: string;
    complemento?: string | null;
}

export type FormStructureDTO = {
    versionId: string;
    ativo: boolean;
    secoes: {
        id: string;
        titulo: string;
        ordem: number;
        perguntas: {
            id: string;
            enunciado: string;
            tipo: QuestionType;
            obrigatoria: boolean;
            dependeDeOpcaoId: string | null;
            opcoes?: {
                id: string;
                enunciado: string;
                requerTexto: boolean;
                labelTexto: string | null;
            }[];
        }[];
    }[];
}

export type SelectedOptionResponse = {
    id: string;
    complemento: string | null;
}

export type FormFilledDTO = {
    id: string;
    status: string;
    updatedAt: Date;
    versaoId: string;
    porcentagem: number;
    secoes: {
        id: string;
        titulo: string;
        ordem: number;
        perguntas: {
            id: string;
            enunciado: string;
            tipo: QuestionType;
            obrigatoria: boolean;
            dependeDeOpcaoId: string | null;
            opcoes: {
                id: string;
                enunciado: string;
                requerTexto: boolean;
                labelTexto: string | null;
            }[];
            resposta: string | SelectedOptionResponse | SelectedOptionResponse[] | null;
        }[];
    }[];
}