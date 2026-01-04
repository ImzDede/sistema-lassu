import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware, is } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { createUserSchema, firstAccessSchema, getAvailableUsersSchema, loginUserSchema, updateProfileSchema, updateUserSchema, userIdSchema, userListSchema, UserTargetIdParamSchema } from "../user/user.schema";

const router = Router();
const userController = new UserController();

// Público
router.post('/login', validate(loginUserSchema, 'body'), userController.login);

// Autenticado
router.use(authMiddleware);
router.use(validate(userIdSchema, 'userId'));

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.patch('/first-access', validate(firstAccessSchema), userController.completeFirstAccess)
router.post('/refresh', userController.refreshToken);

// Cadastro
router.get('/available', is('cadastro'), validate(getAvailableUsersSchema, 'query'), userController.getAvailable);
router.post('/', is('cadastro'), validate(createUserSchema), userController.create);

//Admin
router.use(is('admin'));

router.get('/', validate(userListSchema, 'query'), userController.get);
router.patch('/:targetId/reset-password', validate(UserTargetIdParamSchema, 'params'), userController.resetPassword);
router.get('/:targetId', validate(UserTargetIdParamSchema, 'params'), userController.getById);
router.put('/:targetId', validate(updateUserSchema), validate(UserTargetIdParamSchema, 'params'), userController.update);

export default router;