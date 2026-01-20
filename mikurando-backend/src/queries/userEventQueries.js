module.exports = {
  insertEvent: `
    INSERT INTO "User_Event" (user_id, event_type, created_at)
    VALUES ($1, $2::user_event_type, now())
    RETURNING id, user_id, event_type, created_at
  `,
};
