import { Router } from "express";
import { SessionControllers } from "./session.controllers";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { userIdSchema } from "../user/user.schema";
import { sessionCreateSchema, sessionListSchema, sessionRescheduleSchema, sessionTargetIdParamSchema, sessionUpdateSchema, sessionUpdateStatusSchema } from "./session.schema";
import z from "zod";

const router = Router();
const sessionController = new SessionControllers();

router.use(authMiddleware);
router.use(validate(userIdSchema, 'userId'));

router.post('/', validate(sessionCreateSchema), sessionController.create);
router.get('/', validate(sessionListSchema, 'query'), sessionController.list);


router.use(validate(sessionTargetIdParamSchema, 'params'))

router.get('/:targetId', sessionController.getById);
router.put('/:targetId', validate(sessionUpdateSchema), sessionController.update);
router.put('/:targetId/reschedule', validate(sessionRescheduleSchema), sessionController.reschedule);
router.patch('/:targetId/status', validate(sessionUpdateStatusSchema), sessionController.updateStatus);
router.delete('/:targetId', sessionController.delete);

export default router;