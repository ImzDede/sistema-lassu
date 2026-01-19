import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware, is } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { createUserSchema, firstAccessSchema, getAvailableUsersSchema, loginUserSchema, updateProfileSchema, updateUserSchema, userIdSchema, userListSchema, UserTargetIdParamSchema } from "../user/user.schema";
import multer from "multer";
import { uploadConfig } from "../config/upload";

const router = Router();
const userController = new UserController();
const upload = multer(uploadConfig);

// Público
router.post('/login', validate(loginUserSchema, 'body'), userController.login);

// Autenticado
router.use(authMiddleware);
router.use(validate(userIdSchema, 'userId'));

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.patch('/first-access', validate(firstAccessSchema), userController.completeFirstAccess)
router.post('/refresh', userController.refreshToken);
router.patch('/avatar', upload.single('avatar'), userController.updateAvatar);

// Cadastro
router.get('/available', is('cadastro'), validate(getAvailableUsersSchema, 'query'), userController.getAvailable);
router.post('/', is('cadastro'), validate(createUserSchema), userController.create);
router.get('/', is('cadastro'), validate(userListSchema, 'query'), userController.get);

//Admin
router.use(is('admin'));

router.patch('/:targetId/reset-password', validate(UserTargetIdParamSchema, 'params'), userController.resetPassword);
router.get('/:targetId', validate(UserTargetIdParamSchema, 'params'), userController.getById);
router.put('/:targetId', validate(updateUserSchema), validate(UserTargetIdParamSchema, 'params'), userController.update);

export default router;