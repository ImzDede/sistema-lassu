import { Router } from "express";
import { SessionControllers } from "./session.controllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const sessionController = new SessionControllers();

router.use(authMiddleware);

router.post('/', sessionController.create);
router.get('/', sessionController.list);
router.get('/:id', sessionController.getById);
router.put('/:id', sessionController.update);
router.patch('/:id/status', sessionController.evolution);
router.delete('/:id', sessionController.delete);

export default router;