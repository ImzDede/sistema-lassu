import { Router } from "express";
import { FormController } from "./form.controller";
import { authMiddleware, is } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware"; 
import { formSubmitSchema, formUpdateStructureSchema } from "./form.schema";
import { patientTargetIdParamSchema } from "../patient/patient.schema";
import { userIdSchema } from "../user/user.schema";

const router = Router();
const controller = new FormController();

router.use(authMiddleware);
router.use(validate(userIdSchema, 'userId'));

router.post('/anamnese', validate(formUpdateStructureSchema), is('admin'), controller.createVersionAnamnese);
router.post('/sintese', validate(formUpdateStructureSchema), is('admin'), controller.createVersionSintese);
router.get('/anamnese', is('admin'), controller.getVersionActiveAnamnese);
router.get('/sintese', is('admin'), controller.getVersionActiveSintese);

router.put('/anamnese/:targetId', validate(patientTargetIdParamSchema, 'params'),  validate(formSubmitSchema),controller.submitAnamnese);
router.put('/sintese/:targetId', validate(patientTargetIdParamSchema, 'params'), validate(formSubmitSchema), controller.submitSintese);
router.get('/anamnese/:targetId', validate(patientTargetIdParamSchema, 'params'), controller.getAnamnese);
router.get('/sintese/:targetId', validate(patientTargetIdParamSchema, 'params'), controller.getSintese);
router.patch('/anamnese/:targetId/reopen', validate(patientTargetIdParamSchema, 'params'), controller.reopenAnamnese);
router.patch('/sintese/:targetId/reopen', validate(patientTargetIdParamSchema, 'params'), controller.reopenSintese);

export default router;