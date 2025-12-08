import { Router } from "express";
import { AvailabilityController } from "../controllers/availability.controllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const availabilityController = new AvailabilityController();

router.use(authMiddleware);
router.put('/', availabilityController.save);
router.get('/', availabilityController.get);

export default router;