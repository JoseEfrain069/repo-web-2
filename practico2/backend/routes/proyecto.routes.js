const router = require('express').Router();
const controller = require('../controllers/proyecto.controller');
const requireAuth = require('../middlewares/auth.middleware');
const schemaValidation = require('../middlewares/schemaValidation.middleware');
const asyncHandler = require('../middlewares/asyncHandler.middleware');
const { proyectoSchema, addUserSchema } = require('../validators/proyecto.schema');

router.get('/', requireAuth, asyncHandler(controller.getProjects));
router.post('/', requireAuth, schemaValidation(proyectoSchema), asyncHandler(controller.createProject));
router.get('/:id', requireAuth, asyncHandler(controller.getProjectById));
router.put('/:id', requireAuth, schemaValidation(proyectoSchema), asyncHandler(controller.updateProject));
router.post('/:id/usuarios', requireAuth, schemaValidation(addUserSchema), asyncHandler(controller.addUserToProject));

module.exports = router;
