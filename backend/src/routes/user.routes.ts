import { Router } from "express";
import { UserController } from "../controllers/user.controllers";
import { authMiddleware, is } from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.post('/login', userController.login);

router.use(authMiddleware);

router.get('/available', is('cadastro'), userController.getAvailable);
router.post('/', is('cadastro'), userController.create);
router.get('/profile', userController.getProfile);
router.patch('/first-acess', userController.completeFirstAcess)
router.put('/profile', userController.updateProfile);
router.post('/refresh', userController.refreshToken);
router.get('/', is('admin'), userController.get);
router.get('/:targetId', is('admin'), userController.getById);
router.put('/:targetId', is('admin'), userController.update);

export default router;