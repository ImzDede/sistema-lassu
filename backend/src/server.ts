import express, { Request, Response} from "express";
import cors from "cors";
import dotenv from 'dotenv';
import pool from "./config/db";

dotenv.config();

const app = express();

app.use(cors())
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send('API Online')
})

app.get('/teste-banco', async (req: Request, res: Response) => {
    try {
        const resultado = await pool.query('SELECT NOW()')
        res.json({ 
            status: 'OK', 
            mensagem: 'Banco conectado com sucesso', 
            hora_banco: resultado.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao conectar no banco de dados' });
    }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT)
})