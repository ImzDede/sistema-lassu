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

    async createVersion(modelTitle: string, data: FormUpdateStructureDTO) {
        return await withTransaction(async (client) => {
            const repository = new FormRepository(client);

            const modelRow = await repository.getIdModelByTitle(modelTitle);
            if (!modelRow) {
                throw new AppError(`Modelo de formulário '${modelTitle}' não encontrado.`, 404);
            }
            const modelId = modelRow.id;

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

    async getVersionActive(modelTitle: string) {
        const modelRow = await repository.getIdModelByTitle(modelTitle);
        if (!modelRow) {
            throw new AppError(`Modelo de formulário '${modelTitle}' não encontrado.`, 404);
        }
        const modelId = modelRow.id;

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

    async submitResponse(modelTitle: string, userId: string, patientId: string, data: FormSubmitDTO) {
        const patient = await patientRepository.getById(patientId);
        if (!patient) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

        if (patient.terapeuta_id !== userId) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        }

        if (patient.status == 'encaminhada') {
            throw new AppError('Paciente já encaminhada, contate a adminstração.', 403);
        }

        return await withTransaction(async (client) => {
            const repository = new FormRepository(client);

            const modelRow = await repository.getIdModelByTitle(modelTitle);
            if (!modelRow) {
                throw new AppError(`Modelo de formulário '${modelTitle}' não encontrado.`, 404);
            }
            const modelId = modelRow.id;

            let formRow = await repository.getFilledForm(modelId, patientId)

            if (!formRow) {
                throw new AppError(`Formulário não encontrado`, 404)
            }

            for (const item of data.respostas) {
                const textValue = item.valor === "null" ? null : (item.valor ?? null);

                const answerRow = await repository.upsertAnswer(
                    v4(),
                    formRow.id,
                    item.perguntaId,
                    textValue
                );

                await repository.clearSelectedOptions(answerRow.id);

                if (item.opcoes && item.opcoes.length > 0) {
                    for (const opt of item.opcoes) {
                        await repository.createSelectedOption(answerRow.id, opt.id, opt.complemento ?? null);
                    }
                }
            }

            const allQuestions = await repository.getQuestionsByVersion(formRow.versao_id);

            const answerRows = await repository.getAllAnswers(formRow.id)
            const answeredIds = answerRows.map(r => r.pergunta_id);
            const selectedOptionRows = await repository.getAllSelectedOptions(formRow.id)
            const selectedOptionIds = selectedOptionRows.map(o => o.opcao_id);

            const { missingMandatory, percentage } = this.calculateMetadata(allQuestions, answeredIds, selectedOptionIds)

            let status: 'rascunho' | 'finalizado' = 'rascunho';

            if (data.finalizar) {
                if (missingMandatory.length > 0) {
                    throw new AppError(
                        `Não é possível finalizar. Perguntas obrigatórias faltando.`,
                        400
                    );
                }
                status = 'finalizado';
            }

            await repository.updateFilledForm(formRow.id, status, percentage);

            return {
                missing: missingMandatory
            };
        });

    }

    async getPatientForm(modelTitle: string, userId: string, patientId: string, perms: UserPermDTO) {
        const patient = await patientRepository.getById(patientId);
        if (!patient) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

        if (!perms.admin && patient.terapeuta_id !== userId) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        }

        const modelRow = await repository.getIdModelByTitle(modelTitle);
        if (!modelRow) throw new AppError('Modelo não encontrado', 404);

        let filledRow = await repository.getFilledForm(modelRow.id, patientId);
        let versionId;

        if (!filledRow) {
            const activeVersion = await repository.getVersionIdActive(modelRow.id);
            filledRow = await repository.createFilledForm(v4(), patientId, activeVersion)
            versionId = activeVersion
        }

        versionId = filledRow.versao_id;

        const { sectionRows, questionRows, optionRows } = await this.getVersion(versionId);

        const answerRows = filledRow ? await repository.getAllAnswers(filledRow.id) : [];
        const answeredIds = answerRows.map(r => r.pergunta_id);
        const selectedOptionRows = filledRow ? await repository.getAllSelectedOptions(filledRow.id) : [];
        const selectedOptionIds = selectedOptionRows.map(o => o.opcao_id);

        const { missingMandatory, percentage } = this.calculateMetadata(questionRows, answeredIds, selectedOptionIds)

        filledRow.porcentagem_conclusao = percentage;

        return { filledRow, sectionRows, questionRows, optionRows, answerRows, selectedOptionRows, missing: missingMandatory };
    }

    private calculateMetadata(
        allQuestions: QuestionRow[],
        answeredIds: string[],
        selectedOptionIds: string[]
    ) {
        let totalActiveMandatory = 0;
        let totalAnsweredMandatory = 0;
        const missingMandatory: string[] = [];

        for (const question of allQuestions) {
            let isActive = true;

            if (question.depende_de_opcao_id) {
                if (!selectedOptionIds.includes(question.depende_de_opcao_id)) {
                    isActive = false;
                }
            }

            if (isActive && question.obrigatoria) {
                totalActiveMandatory++;

                const isAnswered = answeredIds.includes(question.id);

                if (isAnswered) {
                    totalAnsweredMandatory++;
                } else {
                    missingMandatory.push(question.id);
                }
            }
        }

        const percentage = totalActiveMandatory > 0
            ? Math.round((totalAnsweredMandatory / totalActiveMandatory) * 100)
            : 0;

        return { percentage, missingMandatory };
    }
}