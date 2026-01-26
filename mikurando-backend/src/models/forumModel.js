const forumQueries = require('../queries/forumQueries');

const listRestaurantThreads = async (restaurantId) => {
  return forumQueries.listThreadsForRestaurant(restaurantId);
};

const createRestaurantThread = async ({ restaurantId, userId, title }) => {
  return forumQueries.createThreadForRestaurant({ restaurantId, userId, title });
};

const listThreadPosts = async (threadId) => {
  return forumQueries.listPostsForThread(threadId);
};

const createThreadPost = async ({ threadId, userId, content }) => {
  const thread = await forumQueries.getThreadById(threadId);
  if (!thread) {
    const err = new Error('NotFound');
    err.status = 404;
    err.payload = { error: 'Thread cannot be found' };
    throw err;
  }
  if (thread.is_closed) {
    const err = new Error('Conflict');
    err.status = 409;
    err.payload = { error: 'Thread has been closed' };
    throw err;
  }

  return forumQueries.createPostForThread({ threadId, userId, content });
};

const deletePostAsOwner = async ({ ownerUserId, postId }) => {
  const post = await forumQueries.getPostById(postId);
  if (!post) {
    const err = new Error('NotFound');
    err.status = 404;
    err.payload = { error: 'Post cannot bee found' };
    throw err;
  }

  const ownerId = await forumQueries.getOwnerIdForPost(postId);
  if (!ownerId || ownerId !== ownerUserId) {
    const err = new Error('Forbidden');
    err.status = 403;
    err.payload = { error: 'Forbidden' };
    throw err;
  }

  await forumQueries.deletePostById(postId);
  return { message: 'Post has been deleted' };
};

const listPostsForOwnerRestaurants = async ({ ownerUserId }) => {
  return forumQueries.listPostsForOwnerRestaurants(ownerUserId);
};

module.exports = {
  listRestaurantThreads,
  createRestaurantThread,
  listThreadPosts,
  createThreadPost,
  deletePostAsOwner,
  listPostsForOwnerRestaurants,
};
