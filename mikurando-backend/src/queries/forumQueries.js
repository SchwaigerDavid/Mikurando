const pool = require('../database/db');

const listThreadsForRestaurant = async (restaurantId) => {
  const { rows } = await pool.query(
    `SELECT
       t.thread_id,
       t.restaurant_id,
       t.user_id,
       u.name AS author_name,
       u.surname AS author_surname,
       t.title,
       t.created_at,
       t.is_closed
     FROM "Forum_Thread" t
     JOIN "User" u ON u.user_id = t.user_id
     WHERE t.restaurant_id = $1
     ORDER BY t.created_at DESC`,
    [restaurantId],
  );
  return rows;
};

const createThreadForRestaurant = async ({ restaurantId, userId, title }) => {
  const { rows } = await pool.query(
    `INSERT INTO "Forum_Thread" (restaurant_id, user_id, title)
     VALUES ($1, $2, $3)
     RETURNING thread_id, restaurant_id, user_id, title, created_at, is_closed`,
    [restaurantId, userId, title],
  );
  return rows[0];
};

const getThreadById = async (threadId) => {
  const { rows } = await pool.query(
    `SELECT thread_id, restaurant_id, user_id, title, created_at, is_closed
     FROM "Forum_Thread"
     WHERE thread_id = $1`,
    [threadId],
  );
  return rows[0] ?? null;
};

const listPostsForThread = async (threadId) => {
  const { rows } = await pool.query(
    `SELECT
       p.post_id,
       p.thread_id,
       p.user_id,
       u.name AS author_name,
       u.surname AS author_surname,
       p.content,
       p.created_at,
       p.is_approved
     FROM "Forum_Post" p
     JOIN "User" u ON u.user_id = p.user_id
     WHERE p.thread_id = $1
     ORDER BY p.created_at ASC`,
    [threadId],
  );
  return rows;
};

const createPostForThread = async ({ threadId, userId, content }) => {
  const { rows } = await pool.query(
    `INSERT INTO "Forum_Post" (thread_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING post_id, thread_id, user_id, content, created_at, is_approved`,
    [threadId, userId, content],
  );
  return rows[0];
};

const getPostById = async (postId) => {
  const { rows } = await pool.query(
    `SELECT post_id, thread_id, user_id, content, created_at, is_approved
     FROM "Forum_Post"
     WHERE post_id = $1`,
    [postId],
  );
  return rows[0] ?? null;
};

const deletePostById = async (postId) => {
  await pool.query(`DELETE FROM "Forum_Post" WHERE post_id = $1`, [postId]);
};

const getOwnerIdForPost = async (postId) => {
  const { rows } = await pool.query(
    `SELECT r.owner_id
     FROM "Forum_Post" p
     JOIN "Forum_Thread" t ON t.thread_id = p.thread_id
     JOIN "Restaurant" r ON r.restaurant_id = t.restaurant_id
     WHERE p.post_id = $1`,
    [postId],
  );
  return rows[0]?.owner_id ?? null;
};

const listPostsForOwnerRestaurants = async (ownerUserId) => {
  const { rows } = await pool.query(
    `SELECT
       p.post_id,
       p.thread_id,
       p.user_id,
       u.name AS author_name,
       u.surname AS author_surname,
       p.content,
       p.created_at,
       p.is_approved,
       r.restaurant_id,
       r.restaurant_name,
       t.title AS thread_title
     FROM "Forum_Post" p
     JOIN "Forum_Thread" t ON t.thread_id = p.thread_id
     JOIN "Restaurant" r ON r.restaurant_id = t.restaurant_id
     JOIN "User" u ON u.user_id = p.user_id
     WHERE r.owner_id = $1
     ORDER BY p.created_at DESC`,
    [ownerUserId],
  );
  return rows;
};

module.exports = {
  listThreadsForRestaurant,
  createThreadForRestaurant,
  getThreadById,
  listPostsForThread,
  createPostForThread,
  getPostById,
  deletePostById,
  getOwnerIdForPost,
  listPostsForOwnerRestaurants,
};
