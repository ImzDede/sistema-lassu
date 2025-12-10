import { Router } from "express";
import { PatientController } from "../controllers/patient.controllers";
import { authMiddleware, is } from "../middlewares/authMiddleware";

const router = Router();
const patientController = new PatientController();

router.use(authMiddleware);

router.put('/:targetId', is('cadastro'), patientController.update)
router.post('/', is('cadastro'), patientController.create);
router.get('/', patientController.list);
router.get('/:targetId', is('cadastro'), patientController.getById);

export default router;