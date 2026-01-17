import { Router } from "express";
import { PatientController } from "./patient.controller";
import { authMiddleware, is } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { createReferralSchema, patientCreateSchema, patientListSchema, patientTargetIdParamSchema, patientTransferSchema, patientUpdateSchema } from "./patient.schema";
import { userIdSchema } from "../user/user.schema";
import { uploadConfig } from "../config/upload";
import multer from "multer";

const router = Router();
const patientController = new PatientController();
const upload = multer(uploadConfig);

router.use(authMiddleware);
router.use(validate(userIdSchema, 'userId'));

router.post('/', validate(patientCreateSchema), is('cadastro'), patientController.create);
router.get('/', validate(patientListSchema, 'query'), patientController.list);

router.use('/:targetId', validate(patientTargetIdParamSchema, 'params'))

router.get('/:targetId', patientController.getById);
router.put('/:targetId', validate(patientUpdateSchema), patientController.update)
router.post('/:targetId/refer', upload.single('arquivo'), validate(createReferralSchema), patientController.refer);
router.get('/:targetId/refer', patientController.getRefer);
router.delete('/:targetId', patientController.delete);
router.patch('/:targetId/restore', patientController.restore);
router.patch('/:targetId/transfer', is('cadastro'), validate(patientTransferSchema), patientController.transfer);

router.use(is('admin'));
router.patch('/:targetId/unrefer', patientController.unrefer);

export default router;