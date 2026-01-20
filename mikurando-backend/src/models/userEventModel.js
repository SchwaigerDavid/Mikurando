const db = require('../database/db');
const queries = require('../queries/userEventQueries');

exports.recordEvent = async (userId, eventType) => {
  if (!userId) return;
  if (!eventType) return;

  try {
    const { rows } = await db.query(queries.insertEvent, [userId, eventType]);
    if (process.env.DEBUG_USER_EVENTS === 'true') {
      const ev = rows?.[0];
      console.debug('[userEventModel] recorded event:', ev);
    }
  } catch (err) {
    console.warn('[userEventModel] recordEvent failed:', err?.message ?? err);
  }
};
