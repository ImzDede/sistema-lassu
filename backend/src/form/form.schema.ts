import { z } from "zod";
import { HTTP_ERRORS } from "../errors/messages";

const questionTipoSchema = z.enum([
    'texto',
    'longo_texto',
    'inteiro',
    'data',
    'unica_escolha',
    'multipla_escolha'
]);

const enunciadoSchema = z.string().min(1, "Enunciado / Título obrigatório")
const obrigatoriaSchema = z.boolean().default(false)
const ordemSchema = z.number().int()

export type Question = {
  enunciado: string;
  tipo: 'texto' | 'longo_texto' | 'inteiro' | 'data' | 'unica_escolha' | 'multipla_escolha';
  obrigatoria: boolean;
  ordem: number;
  opcoes?: Option[];
};

export type Option = {
  enunciado: string;
  ordem: number;
  requerTexto: boolean;
  labelTexto?: string | null;
  perguntasDerivadas?: Question[];
};

const baseQuestionSchema = z.object({
    enunciado: enunciadoSchema,
    tipo: questionTipoSchema,
    obrigatoria: obrigatoriaSchema,
    ordem: ordemSchema,
});

const optionSchema: z.ZodType<Option> = z.object({
    enunciado: enunciadoSchema,
    ordem: ordemSchema,
    requerTexto: z.boolean().default(false),
    labelTexto: z.string().optional().nullable(),
    perguntasDerivadas: z.lazy(() => z.array(questionSchema)).optional()
});

const questionSchema: z.ZodType<Question> = baseQuestionSchema.extend({
    opcoes: z.array(optionSchema).optional()
});

export type QuestionUpdateStructureDTO = z.infer<typeof questionSchema>;

const createSectionSchema = z.object({
    titulo: enunciadoSchema,
    ordem: ordemSchema,
    perguntas: z.array(questionSchema)
});

export const formUpdateStructureSchema = z.object({
    secoes: z.array(createSectionSchema).min(1)
});

export type FormUpdateStructureDTO = z.infer<typeof formUpdateStructureSchema>;

const selectedOptionSchema = z.object({
    id: z.string().uuid(),
    complemento: z.string().optional().nullable()
});

const answerItemSchema = z.object({
    perguntaId: z.string().uuid(HTTP_ERRORS.BAD_REQUEST.VALIDATION.UUID),
    valor: z.string().optional().nullable(),
    opcoes: z.array(selectedOptionSchema).optional()
});

export const formSubmitSchema = z.object({
    versaoId: z.string().uuid(HTTP_ERRORS.BAD_REQUEST.VALIDATION.UUID),
    finalizar: z.boolean().default(false),
    respostas: z.array(answerItemSchema)
});

export type FormSubmitDTO = z.infer<typeof formSubmitSchema>;