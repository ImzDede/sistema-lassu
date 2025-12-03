import { Router } from "express";
import { DisponibilidadeController } from "../controllers/disponibilidade.controllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const disponibilidadeController = new DisponibilidadeController();

router.use(authMiddleware);
router.put('/', disponibilidadeController.salvarDisponibilidades);
router.get('/', disponibilidadeController.getDisponibilidades);

export default router;