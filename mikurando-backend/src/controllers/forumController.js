const forumModel = require('../models/forumModel');

const listRestaurantThreads = async (req, res) => {
  const restaurantId = parseInt(req.params.id, 10);
  const rows = await forumModel.listRestaurantThreads(restaurantId);
  res.json(rows);
};

const createRestaurantThread = async (req, res) => {
  const restaurantId = parseInt(req.params.id, 10);
  const userIdRaw = req.user.userId ?? req.user.user_id;
  const userId = Number.parseInt(String(userIdRaw ?? ''), 10);
  const title = String(req.body?.title ?? '').trim();

  console.log('[forum] create new thread', { restaurantId, userIdRaw, userId });

  if (!Number.isFinite(userId) || userId <= 0) {
    return res.status(401).json({ error: 'Access denied, please log in first.' });
  }

  if (title.length < 5) {
    return res.status(400).json({ error: 'Title is too short must be 5 chars or longer' });
  }

  const thread = await forumModel.createRestaurantThread({ restaurantId, userId, title });
  res.status(201).json(thread);
};

const listThreadPosts = async (req, res) => {
  const threadId = parseInt(req.params.id, 10);
  const rows = await forumModel.listThreadPosts(threadId);
  res.json(rows);
};

const createThreadPost = async (req, res) => {
  const threadId = parseInt(req.params.id, 10);
  const userIdRaw = req.user.userId ?? req.user.user_id;
  const userId = Number.parseInt(String(userIdRaw ?? ''), 10);
  const content = String(req.body?.content ?? '').trim();

  if (!Number.isFinite(userId) || userId <= 0) {
    return res.status(401).json({ error: 'Access denied, please log in at first.' });
  }

  if (content.length < 1) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const post = await forumModel.createThreadPost({ threadId, userId, content });
    res.status(201).json(post);
  } catch (e) {
    if (e?.status) return res.status(e.status).json(e.payload ?? { error: 'Error' });
    throw e;
  }
};

const deletePostAsOwner = async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const ownerUserId = req.user.userId ?? req.user.user_id;

  if (!ownerUserId) {
    return res.status(401).json({ error: 'Access denied, please log in first .' });
  }

  try {
    const result = await forumModel.deletePostAsOwner({ ownerUserId, postId });
    res.json(result);
  } catch (e) {
    if (e?.status) return res.status(e.status).json(e.payload ?? { error: 'Error' });
    throw e;
  }
};

const listOwnerModerationPosts = async (req, res) => {
  const ownerUserId = req.user.userId ?? req.user.user_id;

  if (!ownerUserId) {
    return res.status(401).json({ error: 'Access denied, please log in first.' });
  }

  const rows = await forumModel.listPostsForOwnerRestaurants({ ownerUserId });
  res.json(rows);
};

module.exports = {
  listRestaurantThreads,
  createRestaurantThread,
  listThreadPosts,
  createThreadPost,
  deletePostAsOwner,
  listOwnerModerationPosts,
};
