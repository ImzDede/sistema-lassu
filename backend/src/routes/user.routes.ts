import { Router } from "express";
import { UserController } from "../controllers/user.controllers";

const router = Router();
const userController = new UserController();

router.post('/', userController.create);
router.post('/login', userController.login);

export default router;