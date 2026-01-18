export type QuestionType = 
    | 'texto' 
    | 'longo_texto' 
    | 'inteiro' 
    | 'data' 
    | 'unica_escolha' 
    | 'multipla_escolha';

export type FormStatus = 'rascunho' | 'finalizado';

// Opção de Resposta (quando a pergunta tem opções)
export interface Option {
    id: string;
    enunciado: string;
    requerTexto: boolean;
    labelTexto: string | null;
}

// Resposta Selecionada (para múltipla escolha)
export interface SelectedOptionResponse {
    id: string; // ID da opção
    complemento: string | null; // Texto extra se houver
}

// Pergunta Completa
export interface Question {
    id: string;
    enunciado: string;
    tipo: QuestionType;
    obrigatoria: boolean;
    dependeDeOpcaoId: string | null;
    opcoes?: Option[];
    resposta: string | SelectedOptionResponse | SelectedOptionResponse[] | null;
}

// Seção do Formulário
export interface Section {
    id: string;
    titulo: string;
    ordem: number;
    perguntas: Question[];
}

// O Formulário Completo (Anamnese ou Síntese)
export interface FormFilledDTO {
    id: string;
    status: FormStatus;
    updatedAt: string;
    versaoId: string;
    porcentagem: number;
    secoes: Section[];
}

// Payload de Envio
export interface FormSubmitDTO {
    respostas: {
        perguntaId: string;
        textoResposta?: string | null; // Para texto, longo_texto, data
        opcoesSelecionadas?: {
            opcaoId: string;
            textoComplemento?: string | null;
        }[]; // Para unica_escolha ou multipla_escolha
    }[];
    finalizar: boolean; // true = Enviar definitivo, false = Salvar rascunho
}