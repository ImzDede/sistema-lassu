import express, { Request, Response} from "express";
import cors from "cors";
import dotenv from 'dotenv';
import userRoutes from './user/user.routes';
import availabilityRoutes from './availability/availability.routes';
import notificationRoutes from './notification/notification.routes'
import patientRoutes from './patient/patient.routes'
import { handleError } from "./errors/handleError";
import sessionRoutes from './session/session.routes'

dotenv.config();

const app = express();

app.use(cors())
app.use(express.json())

app.use('/users', userRoutes)
app.use('/availability', availabilityRoutes);
app.use('/notifications', notificationRoutes);
app.use('/patients', patientRoutes);
app.use('/sessions', sessionRoutes);

app.use(handleError)

app.get('/', (req: Request, res: Response) => {
    res.send('API Online')
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT)
})