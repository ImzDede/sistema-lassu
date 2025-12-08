import express, { Request, Response} from "express";
import cors from "cors";
import dotenv from 'dotenv';
import pool from "./config/db";
import userRoutes from './routes/user.routes';
import availabilityRoutes from './routes/availability.routes';
import notificationRoutes from './routes/notification.routes'

dotenv.config();

const app = express();

app.use(cors())
app.use(express.json())

app.use('/users', userRoutes)
app.use('/availability', availabilityRoutes);
app.use('/notification', notificationRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('API Online')
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT)
})