import { AnswerRow, FormFilledDTO, FormFilledRow, FormStructureDTO, FormVersionRow, OptionRow, QuestionRow, SectionRow, SelectedOptionRow } from "./form.type";

export class FormMapper {
    static toGetModel(data: { versionRow: FormVersionRow, sectionRows: SectionRow[], questionRows: QuestionRow[], optionRows: OptionRow[] }): FormStructureDTO {
        const { versionRow, sectionRows, questionRows, optionRows } = data
        return {
            versionId: versionRow.id,
            ativo: versionRow.ativo,
            secoes: sectionRows.sort((a, b) => a.ordem - b.ordem).map((sectionRow) => {
                const minhasPerguntas = questionRows.filter(q => q.secao_id === sectionRow.id);
                return {
                    id: sectionRow.id,
                    titulo: sectionRow.titulo,
                    ordem: sectionRow.ordem,
                    perguntas: minhasPerguntas.sort((a, b) => a.ordem - b.ordem).map((questionRow) => {
                        const minhasOpcoes = optionRows.filter(o => o.pergunta_id === questionRow.id);
                        return {
                            id: questionRow.id,
                            enunciado: questionRow.enunciado,
                            tipo: questionRow.tipo,
                            obrigatoria: questionRow.obrigatoria,
                            dependeDeOpcaoId: questionRow.depende_de_opcao_id,
                            opcoes: minhasOpcoes.sort((a, b) => a.ordem - b.ordem).map((optionRow) => {
                                return {
                                    id: optionRow.id,
                                    enunciado: optionRow.enunciado,
                                    requerTexto: optionRow.requer_texto,
                                    labelTexto: optionRow.label_texto
                                }
                            })
                        }
                    })
                }
            })
        }
    }

    static toReopen(data: { filledRow: FormFilledRow }) {
        const { filledRow } = data
        return {
            id: filledRow.id,
            versaoId: filledRow.versao_id,
            status: filledRow
        }
    }

    static toGetFilled(data: {
        filledRow: FormFilledRow,
        sectionRows: SectionRow[],
        questionRows: QuestionRow[],
        optionRows: OptionRow[],
        answerRows: AnswerRow[],
        selectedOptionRows: SelectedOptionRow[]
    }): FormFilledDTO {

        const { filledRow, sectionRows, questionRows, optionRows, answerRows, selectedOptionRows } = data;

        return {
            id: filledRow.id,
            status: filledRow.status,
            updatedAt: filledRow.updated_at,
            versaoId: filledRow.versao_id,
            porcentagem: filledRow.porcentagem_conclusao,

            secoes: sectionRows.sort((a, b) => a.ordem - b.ordem).map(section => {
                const questions = questionRows.filter(q => q.secao_id === section.id);

                return {
                    id: section.id,
                    titulo: section.titulo,
                    ordem: section.ordem,

                    perguntas: questions.sort((a, b) => a.ordem - b.ordem).map(question => {
                        const options = optionRows.filter(o => o.pergunta_id === question.id);
                        const myAnswer = answerRows.find(a => a.pergunta_id === question.id);

                        let formattedAnswer: any = null;

                        if (myAnswer) {
                            if (['texto', 'longo_texto', 'inteiro', 'data'].includes(question.tipo)) {
                                formattedAnswer = (myAnswer as any).texto_resposta;
                            } else if (question.tipo === 'unica_escolha') {
                                const selected = selectedOptionRows.find(s => s.resposta_id === myAnswer.id);
                                if (selected) formattedAnswer = { id: selected.opcao_id, complemento: selected.texto_complemento };
                            } else if (question.tipo === 'multipla_escolha') {
                                const selecteds = selectedOptionRows.filter(s => s.resposta_id === myAnswer.id);
                                formattedAnswer = selecteds.map(s => ({ id: s.opcao_id, complemento: s.texto_complemento }));
                            }
                        }

                        return {
                            id: question.id,
                            enunciado: question.enunciado,
                            tipo: question.tipo,
                            obrigatoria: question.obrigatoria,
                            dependeDeOpcaoId: question.depende_de_opcao_id,
                            opcoes: options.sort((a, b) => a.ordem - b.ordem).map(opt => ({
                                id: opt.id,
                                enunciado: opt.enunciado,
                                requerTexto: opt.requer_texto,
                                labelTexto: opt.label_texto
                            })),
                            resposta: formattedAnswer
                        };
                    })
                };
            })
        };
    }
}