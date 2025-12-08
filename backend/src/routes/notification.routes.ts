import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { NotificationController } from "../controllers/notification.controllers";

const router = Router();
const notificationController = new NotificationController();

router.use(authMiddleware);
router.get('/', notificationController.list);
router.patch('/:notificationId/read', notificationController.markRead);

export default router;