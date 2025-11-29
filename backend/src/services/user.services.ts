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

        const senhaHash = await bcrypt.hash(dados.senha, 10)

        const query = `
        INSERT INTO usuario (
                id, matricula, nome, email, telefone, senha_hash, perm_atendimento, perm_cadastro, perm_admin
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, nome, email, matricula;
        `;

        const values = [
            novoId,
            dados.matricula,
            dados.nome,
            dados.email,
            dados.telefone,
            senhaHash,
            dados.permAtendimento,
            dados.permCadastro,
            dados.permAdmin
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
                permAdmin: usuario.perm_admin
            },
            token: token
        };
    }
}