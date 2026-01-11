import { Router } from "express";
import { PatientController } from "./patient.controller";
import { authMiddleware, is } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { patientCreateSchema, patientListSchema, patientTargetIdParamSchema, patientTransferSchema, patientUpdateSchema } from "./patient.schema";
import { userIdSchema } from "../user/user.schema";

const router = Router();
const patientController = new PatientController();

router.use(authMiddleware);
router.use(validate(userIdSchema, 'userId'));

router.post('/', validate(patientCreateSchema), is('cadastro'), patientController.create);

router.get('/', validate(patientListSchema, 'query'), patientController.list);

router.get('/:targetId', validate(patientTargetIdParamSchema, 'params'), patientController.getById);
router.put('/:targetId', validate(patientTargetIdParamSchema, 'params'), validate(patientUpdateSchema), patientController.update)
router.patch('/:targetId/refer', validate(patientTargetIdParamSchema, 'params'), patientController.refer);
router.delete('/:targetId', validate(patientTargetIdParamSchema), patientController.delete);
router.patch('/:targetId/restore', validate(patientTargetIdParamSchema), patientController.restore);
router.patch('/:targetId/transfer', is('cadastro'),validate(patientTargetIdParamSchema, 'params'), validate(patientTransferSchema), patientController.transfer);

router.use(is('admin'));
router.patch('/:targetId/unrefer', validate(patientTargetIdParamSchema, 'params'), patientController.unrefer);

export default router;