import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('Banco de dados conectado')
})
export default pool;