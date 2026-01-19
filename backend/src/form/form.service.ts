import { v4 } from "uuid";
import { FormRepository } from "./form.repository";
import { FormSubmitDTO, FormUpdateStructureDTO, QuestionUpdateStructureDTO } from "./form.schema";
import { withTransaction } from "../utils/withTransaction";
import { AppError } from "../errors/AppError";
import { AnswerRow, FormFilledRow, OptionRow, QuestionRow, SectionRow, SelectedOptionRow } from "./form.type";
import pool from "../config/db";
import { PatientRepository } from "../patient/patient.repository";
import { HTTP_ERRORS } from "../errors/messages";
import { UserPermDTO } from "../user/user.schema";

const repository = new FormRepository(pool);
const patientRepository = new PatientRepository(pool)

export class FormService {

    async createVersion(modelTitle: 'ANAMNESE' | 'SINTESE', data: FormUpdateStructureDTO) {
        return await withTransaction(async (client) => {
            const repository = new FormRepository(client);

            const modelId = await repository.getIdModelByTitle(modelTitle);

            await repository.disableAllVersions(modelId);

            const versionId = v4();
            const versionRow = await repository.createVersionActive(modelId, versionId);
            let sectionRows: SectionRow[] = []
            let questionRows: QuestionRow[] = []
            let optionRows: OptionRow[] = []

            const insertQuestionRecursive = async (data: QuestionUpdateStructureDTO, sectionId: string, dependeOpcaoId: string | null) => {
                const questionId = v4();

                const newData = {
                    ...data,
                    dependeOpcaoId
                }

                const questionRow = await repository.createQuestion(sectionId, questionId, newData);
                questionRows.push(questionRow)

                if (data.opcoes && data.opcoes.length > 0) {
                    for (const opt of data.opcoes) {
                        const optionId = v4();

                        const optionRow = await repository.createOption(questionId, optionId, opt);
                        optionRows.push(optionRow)

                        if (opt.perguntasDerivadas && opt.perguntasDerivadas.length > 0) {
                            for (const subQ of opt.perguntasDerivadas) {
                                await insertQuestionRecursive(subQ, sectionId, optionId);
                            }
                        }
                    }
                }
            };

            for (const section of data.secoes) {
                const sectionId = v4();

                const sectionRow = await repository.createSection(versionId, sectionId, section);
                sectionRows.push(sectionRow)

                for (const question of section.perguntas) {
                    await insertQuestionRecursive(question, sectionId, null);
                }
            }

            return {
                versionRow, sectionRows, questionRows, optionRows
            };
        });
    }

    async getVersionActive(modelTitle: 'ANAMNESE' | 'SINTESE') {
        const modelId = await repository.getIdModelByTitle(modelTitle);

        const versionId = (await repository.getVersionIdActive(modelId));

        const { versionRow, sectionRows, questionRows, optionRows } = await this.getVersion(versionId)

        return { versionRow, sectionRows, questionRows, optionRows };

    }

    private async getVersion(versionId: string) {
        const versionRow = await repository.getVersion(versionId)
        const sectionRows = await repository.getSections(versionId)

        let questionRows: QuestionRow[] = []

        for (const sectionRow of sectionRows) {
            const thisQuestionRows = await repository.getQuestions(sectionRow.id)
            questionRows = questionRows.concat(thisQuestionRows)
        }

        let optionRows: OptionRow[] = []

        for (const questionRow of questionRows) {
            const thisOptionRows = await repository.getOptions(questionRow.id)
            optionRows = optionRows.concat(thisOptionRows)
        }

        return {
            versionRow, sectionRows, questionRows, optionRows
        };
    }

    async submitResponse(modelTitle: 'ANAMNESE' | 'SINTESE', userId: string, patientId: string, data: FormSubmitDTO) {
        const patient = await patientRepository.getById(patientId);
        if (!patient) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);
        if (patient.terapeuta_id !== userId) throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        if (patient.status == 'encaminhada') throw new AppError('Paciente já encaminhada.', 400);

        return await withTransaction(async (client) => {
            const repository = new FormRepository(client);

            const modelId = await repository.getIdModelByTitle(modelTitle);

            let formRow = await repository.getFilledForm(modelId, patientId)
            if (!formRow) throw new AppError(`Formulário não encontrado`, 404)
            if (formRow.status == 'finalizado') throw new AppError('Formulário já finalizado.', 400);

            const answerIds: string[] = [];
            const questionIds: string[] = [];
            const values: (string | null)[] = [];
            const answersToDeleteQuestionIds: string[] = [];

            for (const item of data.respostas) {
                let textValue = (item.valor === "null" || item.valor === "") ? null : (item.valor ?? null);

                const hasOptions = item.opcoes && item.opcoes.length > 0;

                if (!textValue && !hasOptions) {
                    answersToDeleteQuestionIds.push(item.perguntaId);
                } else {
                    answerIds.push(v4());
                    questionIds.push(item.perguntaId);
                    values.push(textValue);
                }
            }

            if (answersToDeleteQuestionIds.length > 0) {
                await repository.deleteAnswersByQuestionIds(formRow.id, answersToDeleteQuestionIds)
            }

            let answerRows: { id: string, pergunta_id: string }[] = [];
            if (answerIds.length > 0) {
                answerRows = await repository.upsertAnswersBatch(
                    answerIds,
                    formRow.id,
                    questionIds,
                    values
                );
            }

            const answerIdByQuestion = new Map<string, string>();
            for (const row of answerRows) {
                answerIdByQuestion.set(row.pergunta_id, row.id);
            }

            const affectedAnswerIds = Array.from(answerIdByQuestion.values());
            if (affectedAnswerIds.length > 0) {
                await repository.clearSelectedOptionsBatch(affectedAnswerIds);
            }

            const selectedAnswerIds: string[] = [];
            const selectedOptionIds: string[] = [];
            const selectedComplements: (string | null)[] = [];

            for (const item of data.respostas) {
                const answerId = answerIdByQuestion.get(item.perguntaId);
                if (!answerId) continue;

                if (item.opcoes && item.opcoes.length > 0) {
                    for (const opt of item.opcoes) {
                        selectedAnswerIds.push(answerId);
                        selectedOptionIds.push(opt.id);
                        selectedComplements.push(opt.complemento ?? null);
                    }
                }
            }

            if (selectedAnswerIds.length > 0) {
                await repository.insertSelectedOptionsBatch(
                    selectedAnswerIds,
                    selectedOptionIds,
                    selectedComplements
                );
            }

            const allQuestions = await repository.getQuestionsByVersion(formRow.versao_id);
            const allAnswers = await repository.getAllAnswers(formRow.id);
            const allSelectedOptions = await repository.getAllSelectedOptions(formRow.id);

            const selectedIds = allSelectedOptions.map(o => o.opcao_id);
            const orphansToDeleteIds: string[] = [];

            for (const question of allQuestions) {
                let isActive = true;
                if (question.depende_de_opcao_id) {
                    if (!selectedIds.includes(question.depende_de_opcao_id)) {
                        isActive = false;
                    }
                }
                if (!isActive) {
                    const answerToDelete = allAnswers.find(a => a.pergunta_id === question.id);
                    if (answerToDelete) {
                        orphansToDeleteIds.push(answerToDelete.id);
                    }
                }
            }

            if (orphansToDeleteIds.length > 0) {
                await repository.deleteAnswersByIds(orphansToDeleteIds)
            }

            const { missingMandatory, percentage } = await repository.calculateFormMetadata(
                formRow.id,
                formRow.versao_id
            );

            let status: 'rascunho' | 'finalizado' = 'rascunho';
            if (data.finalizar) {
                if (missingMandatory.length > 0) {
                    throw new AppError(`Não é possível finalizar. Faltam perguntas obrigatórias.`, 400);
                }
                status = 'finalizado';
            }

            await repository.updateFilledForm(formRow.id, status, percentage);

            return {
                missing: missingMandatory
            };
        });
    }

    async reopenForm(modelTitle: 'ANAMNESE' | 'SINTESE', userId: string, patientId: string) {
        const patient = await patientRepository.getById(patientId);
        if (!patient) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);
        if (patient.terapeuta_id !== userId) throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);

        const modelId = await repository.getIdModelByTitle(modelTitle);
        let formRow = await repository.getFilledForm(modelId, patientId)
        if (!formRow) throw new AppError(`Formulário não encontrado`, 404)
        if (formRow.status != 'finalizado') throw new AppError('Formulário já está aberto.', 400);

        const filledRow = await repository.reopenFilledForm(formRow.id)

        return { filledRow }

    }

    async getPatientForm(modelTitle: 'ANAMNESE' | 'SINTESE', userId: string, patientId: string, perms: UserPermDTO) {
        const patient = await patientRepository.getById(patientId);
        if (!patient) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

        if (!perms.admin && patient.terapeuta_id !== userId) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        }

        const modelId = await repository.getIdModelByTitle(modelTitle);

        let filledRow = await repository.getFilledForm(modelId, patientId);
        let versionId;

        if (!filledRow) {
            const activeVersion = await repository.getVersionIdActive(modelId);
            filledRow = await repository.createFilledForm(v4(), patientId, activeVersion)
            versionId = activeVersion
        }

        versionId = filledRow.versao_id;

        const { sectionRows, questionRows, optionRows } = await this.getVersion(versionId);

        const answerRows = filledRow ? await repository.getAllAnswers(filledRow.id) : [];
        const selectedOptionRows = filledRow ? await repository.getAllSelectedOptions(filledRow.id) : [];

        const { missingMandatory, percentage } =
            await repository.calculateFormMetadata(
                filledRow.id,
                filledRow.versao_id
            );


        filledRow.porcentagem_conclusao = percentage;

        return { filledRow, sectionRows, questionRows, optionRows, answerRows, selectedOptionRows, missing: missingMandatory };
    }
}