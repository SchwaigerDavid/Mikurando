const express = require('express');
const router = express.Router();

const forumController = require('../controllers/forumController');
const { authenticateToken, requireOwner } = require('../middleware/JWTMiddleware');
const { validateIdParameter } = require('../middleware/requestParameterValidationMiddleware');

// read for everybody
router.get('/restaurants/:id/threads', validateIdParameter, forumController.listRestaurantThreads);
router.get('/threads/:id/posts', validateIdParameter, forumController.listThreadPosts);

// write only auth users
router.post(
  '/restaurants/:id/threads',
  authenticateToken,
  validateIdParameter,
  forumController.createRestaurantThread,
);
router.post('/threads/:id/posts', authenticateToken, validateIdParameter, forumController.createThreadPost);

// moderation for owner of restaurant
router.get('/owner/moderation/posts', authenticateToken, requireOwner, forumController.listOwnerModerationPosts);
router.delete('/posts/:id', authenticateToken, requireOwner, validateIdParameter, forumController.deletePostAsOwner);

module.exports = router;
