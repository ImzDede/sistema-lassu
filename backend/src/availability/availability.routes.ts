import { Router } from "express";
import { AvailabilityController } from "./availability.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { availabilityListSchema } from "../availability/availability.schema";
import { validate } from "../middlewares/validateMiddleware";
import { userIdSchema } from "../user/user.schema";

const router = Router();
const availabilityController = new AvailabilityController();

router.use(authMiddleware);
router.use(validate(userIdSchema, 'userId'));
router.put('/', validate(availabilityListSchema), availabilityController.save);
router.get('/', availabilityController.get);

export default router;