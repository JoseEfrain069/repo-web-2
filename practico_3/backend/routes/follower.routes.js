const router = require('express').Router();
const controller = require('../controllers/follower.controller');
const { authMiddleware, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const isFollower = [authMiddleware, requireRole('follower')];

router.get('/search',              ...isFollower, asyncHandler(controller.searchCreators));
router.post('/donate',             ...isFollower, asyncHandler(controller.donate));
router.get('/creator/:id/posts',   ...isFollower, asyncHandler(controller.getCreatorPosts));
router.post('/comments',           ...isFollower, asyncHandler(controller.addComment));
router.post('/favorites/:creatorId', ...isFollower, asyncHandler(controller.toggleFavorite));
router.get('/favorites',           ...isFollower, asyncHandler(controller.getFavorites));
router.get('/feed',                ...isFollower, asyncHandler(controller.getFeed));
router.get('/donations',           ...isFollower, asyncHandler(controller.getDonationHistory));

module.exports = router;
