import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from 'dotenv';
import userRoutes from './user/user.routes';
import availabilityRoutes from './availability/availability.routes';
import notificationRoutes from './notification/notification.routes'
import patientRoutes from './patient/patient.routes'
import { handleError } from "./errors/handleError";
import sessionRoutes from './session/session.routes';
import formRoutes from './form/form.routes';
import helmet from "helmet";
import logger from "./utils/logger";
import { uploadConfig } from "./config/upload";

dotenv.config();

const app = express();

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/users', userRoutes)
app.use('/availability', availabilityRoutes);
app.use('/notifications', notificationRoutes);
app.use('/patients', patientRoutes);
app.use('/sessions', sessionRoutes);
app.use('/forms', formRoutes);

app.use(handleError)
app.use('/arquivos', express.static(uploadConfig.directory));

app.get('/', (req: Request, res: Response) => {
    res.send('API Online')
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
    logger.info("Servidor Rodando");
})