const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/register', asyncHandler(controller.register));
router.post('/login',    asyncHandler(controller.login));

module.exports = router;
