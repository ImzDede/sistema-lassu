import { Router } from "express";
import { UserController } from "../controllers/user.controllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.post('/login', userController.login);

router.use(authMiddleware);

router.post('/', userController.create);
router.put('/:id', userController.update);
router.patch('/primeiro-acesso', userController.primeiroAcesso)
router.get('/profile', userController.getProfile);

export default router;