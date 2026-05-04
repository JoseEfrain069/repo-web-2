const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const schemaValidation = require('../middlewares/schemaValidation.middleware');
const asyncHandler = require('../middlewares/asyncHandler.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.schema');

router.post('/register', schemaValidation(registerSchema), asyncHandler(controller.register));
router.post('/login', schemaValidation(loginSchema), asyncHandler(controller.login));

module.exports = router;
