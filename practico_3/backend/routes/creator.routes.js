const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/creator.controller');
const { authMiddleware, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const isCreator = [authMiddleware, requireRole('creator')];

router.get('/',            asyncHandler(controller.getAllCreators));
router.get('/me/posts',    ...isCreator, asyncHandler(controller.getMyPosts));
router.get('/me/report',   ...isCreator, asyncHandler(controller.getReport));
router.post('/profile',    ...isCreator, upload.fields([{ name: 'profile_pic' }, { name: 'banner' }]), asyncHandler(controller.saveProfile));
router.post('/posts',      ...isCreator, upload.single('image'), asyncHandler(controller.createPost));
router.get('/:id',         asyncHandler(controller.getCreatorById));

module.exports = router;
