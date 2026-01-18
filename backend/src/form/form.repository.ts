import { Pool, PoolClient } from "pg";
import { AnswerRow, FormFilledRow, FormVersionRow, OptionRow, QuestionRow, SectionRow, SelectedOptionRow } from "./form.type";

export class FormRepository {

    constructor(private readonly client: PoolClient | Pool) { }

    async getIdModelByTitle(modelTitle: string): Promise<{ id: string } | null> {
        const result = await this.client.query(`SELECT id FROM formulario_modelos WHERE titulo = $1`, [modelTitle]);
        return result.rows[0] ?? null
    }

    async getVersionIdActive(modelId: string): Promise<string> {
        const result = await this.client.query(`SELECT id FROM formulario_versoes WHERE modelo_id = $1 AND ativo = true LIMIT 1`, [modelId]);
        return result.rows[0].id
    }

    async getVersion(versionId: string): Promise<FormVersionRow> {
        const result = await this.client.query(`SELECT * FROM formulario_versoes WHERE id = $1`, [versionId]);
        return result.rows[0]
    }

    async disableAllVersions(modelId: string) {
        const result = await this.client.query(`UPDATE formulario_versoes SET ativo = FALSE WHERE modelo_id = $1`, [modelId]);
        return result.rows[0] ?? null
    }

    async createVersionActive(modelId: string, versionId: string): Promise<FormVersionRow> {
        const result = await this.client.query(
            `INSERT INTO formulario_versoes (id, modelo_id, ativo) VALUES ($1, $2, TRUE) RETURNING *`,
            [versionId, modelId]
        );
        return result.rows[0]
    }

    async createSection(
        versionId: string,
        sectionId: string,
        data: {
            titulo: string,
            ordem: number
        }
    ): Promise<SectionRow> {

        const query = `
            INSERT INTO formulario_secoes (id, titulo, ordem, versao_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *     
        `

        const values = [sectionId, data.titulo, data.ordem, versionId]

        const result = await this.client.query(query, values);
        return result.rows[0]
    }

    async createQuestion(
        sessionId: string,
        questionId: string,
        data: {
            enunciado: string,
            tipo: 'texto' | 'longo_texto' | 'inteiro' | 'data' | 'unica_escolha' | 'multipla_escolha',
            obrigatoria: boolean,
            ordem: number,
            dependeOpcaoId: string | null
        }): Promise<QuestionRow> {
        const query = `
            INSERT INTO formulario_perguntas (id, secao_id, enunciado, tipo, obrigatoria, ordem, depende_de_opcao_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `
        const values = [questionId, sessionId, data.enunciado, data.tipo, data.obrigatoria, data.ordem, data.dependeOpcaoId]

        const result = await this.client.query(query, values)
        return result.rows[0]
    }

    async createOption(
        questionId: string,
        optionId: string,
        data: {
            enunciado: string,
            ordem: number,
            requerTexto: boolean,
            labelTexto?: string | null
        }
    ): Promise<OptionRow> {
        const query = `
            INSERT INTO formulario_opcoes (id, pergunta_id, enunciado, ordem, requer_texto, label_texto)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `
        const values = [optionId, questionId, data.enunciado, data.ordem, data.requerTexto, data.labelTexto]

        const result = await this.client.query(query, values)
        return result.rows[0]
    }

    async getSections(versionId: string): Promise<SectionRow[]> {
        const query = `
            SELECT *
            FROM formulario_secoes
            WHERE versao_id = $1
        `
        const result = await this.client.query(query, [versionId])
        return result.rows
    }

    async getQuestions(sectionId: string): Promise<QuestionRow[]> {
        const query = `
            SELECT *
            FROM formulario_perguntas
            WHERE secao_id = $1
        `
        const result = await this.client.query(query, [sectionId])
        return result.rows
    }

    async getOptions(questionId: string): Promise<OptionRow[]> {
        const query = `
            SELECT *
            FROM formulario_opcoes
            WHERE pergunta_id = $1
        `
        const result = await this.client.query(query, [questionId])
        return result.rows
    }

    async getFilledForm(modelId: string, patientId: string): Promise<FormFilledRow | null> {
        const query = `
            SELECT fp.*
            FROM formulario_preenchidos AS fp, formulario_versoes AS fv
            WHERE fp.versao_id = fv.id AND fp.paciente_id = $1 AND fv.modelo_id = $2
        `;
        const result = await this.client.query(query, [patientId, modelId]);
        return result.rows[0] ?? null;
    }

    async createFilledForm(id: string, patientId: string, versionId: string): Promise<FormFilledRow> {
        const query = `
            INSERT INTO formulario_preenchidos (id, paciente_id, versao_id, status, updated_at)
            VALUES ($1, $2, $3, 'rascunho', NOW())
            RETURNING *;
        `;
        const result = await this.client.query(query, [id, patientId, versionId]);
        return result.rows[0]
    }

    async updateFilledForm(id: string, status: 'rascunho' | 'finalizado',  percentage: number): Promise<FormFilledRow> {
        const query = `
            UPDATE formulario_preenchidos
            SET status = $1,
                updated_at = NOW(),
                porcentagem_conclusao = $2
            WHERE id = $3
            RETURNING *;
        `;
        const result = await this.client.query(query, [status, percentage, id]);
        return result.rows[0]
    }

    async clearSelectedOptions(answerId: string) {
        await this.client.query(`DELETE FROM formulario_selecionados WHERE resposta_id = $1`, [answerId]);
    }

    async createSelectedOption(answerId: string, optionId: string, complemento: string | null): Promise<SelectedOptionRow> {
        const result = await this.client.query(
            `INSERT INTO formulario_selecionados (resposta_id, opcao_id, texto_complemento) VALUES ($1, $2, $3)`,
            [answerId, optionId, complemento]
        );
        return result.rows[0]
    }

    async upsertAnswer(answerId: string, formId: string, questionId: string, textValue: string | null): Promise<AnswerRow> {
        const query = `
            INSERT INTO formulario_respostas (id, formulario_id, pergunta_id, texto_resposta)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (formulario_id, pergunta_id) 
            DO UPDATE SET 
                texto_resposta = $4
            RETURNING *;
        `;
        const values = [answerId, formId, questionId, textValue];
        const result = await this.client.query(query, values);
        return result.rows[0];
    }

    async getQuestionsByVersion(versionId: string): Promise<QuestionRow[]> {
        const query = `
            SELECT * FROM formulario_perguntas 
            WHERE secao_id IN (SELECT id FROM formulario_secoes WHERE versao_id = $1)
        `;
        const result = await this.client.query(query, [versionId]);
        return result.rows;
    }

    async getAllAnswers(formId: string): Promise<AnswerRow[]> {
        const query = `SELECT * FROM formulario_respostas WHERE formulario_id = $1`;
        const result = await this.client.query(query, [formId]);
        return result.rows;
    }

    async getAllSelectedOptions(formId: string): Promise<SelectedOptionRow[]> {
        const query = `
            SELECT fs.*
            FROM formulario_selecionados fs
            JOIN formulario_respostas fr ON fs.resposta_id = fr.id
            WHERE fr.formulario_id = $1
        `;
        const result = await this.client.query(query, [formId]);
        return result.rows;
    }
}