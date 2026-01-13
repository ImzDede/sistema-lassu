import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    logger.info("Banco de dados conectado");
})
export default pool;