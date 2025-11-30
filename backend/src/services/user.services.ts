import pool from "../config/db";
import bcrypt from 'bcryptjs';
import { v4 } from "uuid";
import { User } from "../types/User";
import jwt from 'jsonwebtoken';

export class UserService {
    async create(dados: User) {

        const novoId = v4();

        const usuarioIgual = await pool.query('SELECT id FROM usuario WHERE email = $1 OR matricula = $2', [dados.email, dados.matricula])

        if (usuarioIgual.rows.length > 0) {
            throw new Error('Já existe um usuário com esse email ou matricula registrado')
        }

        //SENHA GERADA SOZINHA NO PRIMEIRO ACESSO
        const senha = 'L' + dados.matricula;

        const senhaHash = await bcrypt.hash(senha, 10)

        const query = `
        INSERT INTO usuario (
                id, matricula, nome, email, senha_hash, perm_atendimento, perm_cadastro, perm_admin
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, nome, email, matricula;
        `;

        const values = [
            novoId,
            dados.matricula,
            dados.nome,
            dados.email,
            senhaHash,
            true,
            false,
            false
        ]

        const result = await pool.query(query, values);

        return result.rows[0];

    }

    async login(email: string, senha: string) {
        const pesquisa = await pool.query('SELECT * FROM usuario WHERE email = $1', [email])

        if (pesquisa.rows.length == 0) {
            throw new Error('Email ou senha inválidos')
        }

        const usuario = pesquisa.rows[0]

        const senhaHash = usuario.senha_hash;

        if (!await bcrypt.compare(senha, senhaHash)) {
            throw new Error('Email ou senha inválidos')
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('Erro de configuração: JWT_SECRET não encontrado.');
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                permAtendimento: usuario.perm_atendimento,
                permCadastro: usuario.perm_cadastro,
                permAdmin: usuario.perm_admin
                
            },
            secret,
            { expiresIn: '1d' }
        );

        return {
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                permAtendimento: usuario.perm_atendimento,
                permCadastro: usuario.perm_cadastro,
                permAdmin: usuario.perm_admin,
                primeiroAcesso: usuario.primeiro_acesso
            },
            token: token
        };
    }

    async updateProfile(id: string, dados: Partial<User>) {
        let senhaHash = undefined;
        
        if (dados.senha) {
            senhaHash = await bcrypt.hash(dados.senha, 10);
        }

        const query = `
            UPDATE usuario
            SET 
                email = COALESCE($1, email),
                telefone = COALESCE($2, telefone),
                foto_url = COALESCE($3, foto_url),
                senha_hash = COALESCE($4, senha_hash),
                primeiro_acesso = false
            WHERE id = $5
            RETURNING id, nome, email, telefone, foto_url;
        `;

        const values = [
            dados.email || null,
            dados.telefone || null,
            dados.fotoUrl || null,
            senhaHash || null,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            throw new Error('Usuário não encontrado para edição.');
        }

        return result.rows[0];
    }

    async update(id: string, dados: Partial<User>) {
        let senhaHash = undefined;
        
        if (dados.senha) {
            senhaHash = await bcrypt.hash(dados.senha, 10);
        }

        const query = `
            UPDATE usuario
            SET 
                nome = COALESCE($1, nome),
                email = COALESCE($2, email),
                telefone = COALESCE($3, telefone),
                foto_url = COALESCE($4, foto_url),
                senha_hash = COALESCE($5, senha_hash),
                
                -- Campos sensíveis liberados aqui:
                matricula = COALESCE($6, matricula),
                perm_atendimento = COALESCE($7, perm_atendimento),
                perm_cadastro = COALESCE($8, perm_cadastro),
                perm_admin = COALESCE($9, perm_admin),
                ativo = COALESCE($10, ativo)
                
            WHERE id = $11
            RETURNING id, nome, email, matricula, perm_admin, ativo;
        `;

        const values = [
            dados.nome || null,
            dados.email || null,
            dados.telefone || null,
            dados.fotoUrl || null,
            senhaHash || null,
            dados.matricula || null,
            dados.permAtendimento ?? null,
            dados.permCadastro ?? null,
            dados.permAdmin ?? null,
            dados.ativo ?? null,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            throw new Error('Usuário não encontrado para edição.');
        }

        return result.rows[0];
    }

    async primeiroAcesso(id :string, dados: { senha?: string, telefone?: string, fotoUrl?: string }) {

        if (!dados.senha) {
            throw new Error("É obrigatório definir uma nova senha");
        }

        if (dados.senha.length < 6) {
            throw new Error("A senha deve conter no mínimo 6 caracteres");
        }

        const userAtual = await pool.query('SELECT senha_hash, primeiro_acesso FROM usuario WHERE id = $1', [id]);

        if (userAtual.rows.length === 0) {
            throw new Error('Usuário não encontrado.');
        }

        if (!userAtual.rows[0].primeiro_acesso) {
            throw new Error('Usuário já realizou primeiro acesso.');
        }

        const hashAntigo = userAtual.rows[0].senha_hash;

        if (await bcrypt.compare(dados.senha, hashAntigo)) {
            throw new Error("A nova senha deve ser diferente da senha atual.");
        }

        const senhaHash = await bcrypt.hash(dados.senha, 10);

        const query = `
            UPDATE usuario
            SET 
                telefone = COALESCE($1, telefone),
                foto_url = $2,
                senha_hash = $3,
                primeiro_acesso = false
            WHERE id = $4
            RETURNING id, nome, email, primeiro_acesso;
        `;

        const values = [
            dados.telefone || null,
            dados.fotoUrl || null,
            senhaHash,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length == 0) {
            throw new Error('Usuário não encontrado.');
        }

        return result.rows[0];
    }
}