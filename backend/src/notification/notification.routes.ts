import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { NotificationController } from "./notification.controller";
import { userIdSchema } from "../user/user.schema";
import { validate } from "../middlewares/validateMiddleware";
import { notificationIdArraySchema, notificationListSchema } from "./notification.schema";

const router = Router();
const notificationController = new NotificationController();

router.use(authMiddleware);
router.use(validate(userIdSchema, 'userId'));

router.get('/', validate(notificationListSchema, 'query'), notificationController.list);
router.patch('/read', validate(notificationIdArraySchema), notificationController.markRead);
router.post('/delete', validate(notificationIdArraySchema), notificationController.delete)

export default router;