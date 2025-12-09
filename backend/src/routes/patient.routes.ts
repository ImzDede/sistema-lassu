import { Router } from "express";
import { PatientController } from "../controllers/patient.controllers";
import { authMiddleware, is } from "../middlewares/authMiddleware";

const router = Router();
const patientController = new PatientController();

router.use(authMiddleware);

router.post('/', is('cadastro'), patientController.create);

export default router;