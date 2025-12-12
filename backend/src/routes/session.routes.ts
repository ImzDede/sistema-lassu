import { Router } from "express";
import { SessionControllers } from "../controllers/session.controllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const sessionController = new SessionControllers();

router.use(authMiddleware);

router.get('/', sessionController.create);

export default router;