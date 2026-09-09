require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ─── Database Initialization ───────────────────────────────────────────────────────────

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Stores Data Per User
    await client.query(`
      CREATE TABLE IF NOT EXISTS "userInfo" (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        picture TEXT NOT NULL,
        "refreshToken" TEXT NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "userCalendarPreferences" (
      id TEXT PRIMARY KEY REFERENCES "userInfo"(id) ON DELETE CASCADE,
      palette JSONB,
      groups JSONB,
      hiddenCalendars JSONB,
      )
      `)

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing database tables:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Execute initialization
initDb().catch((err) => console.error('Failed to initialize DB:', err));

// ─── User Info ───────────────────────────────────────────────────────────

// saves information into userInfo table
const saveUserProfile = async (googleId, email, name, picture, refreshToken) => {
  const query = `
    INSERT INTO "userInfo" (id, email, name, picture, "refreshToken")
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET 
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      picture = EXCLUDED.picture,
      "refreshToken" = EXCLUDED."refreshToken"
  `;
  return await pool.query(query, [googleId, email, name, picture, refreshToken]);
};

// gets information from userInfo table
const getUserProfile = async (googleId) => {
  const query = `
    SELECT id, email, name, picture 
    FROM "userInfo" 
    WHERE id = $1
  `;
  const res = await pool.query(query, [googleId]);
  return res.rows[0] || null;
};

// gets information from userInfo table
const getUserRefreshToken = async (googleId) => {
  const query = `
    SELECT id, "refreshToken" 
    FROM "userInfo" 
    WHERE id = $1
  `;
  const res = await pool.query(query, [googleId]);
  return res.rows[0] || null;
};

// debug
// Note: Dynamic table names are vulnerable to SQL Injection.
// Ensure input validation is implemented elsewhere if tableName is user-controlled.
const getAllData = async (tableName) => {
  const query = `SELECT * FROM "${tableName}"`;
  const res = await pool.query(query);
  return res.rows;
};

// params: supabase auth user id, provider refresh token
// do: updates the refresh token for an existing user
const updateToken = async (userId, refreshToken) => {
  const query = `
    UPDATE "userInfo" 
    SET "refreshToken" = $1 
    WHERE id = $2
    RETURNING id;
  `;
  
  try {
    const res = await pool.query(query, [refreshToken, userId]);
    return res.rowCount > 0;
  } catch (err) {
    console.error('[DB] Database error during update:', err);
    throw err;
  }
};

// Deletes user profile from userInfo table
const deleteUserProfile = async (userId) => {
  const query = `
    DELETE FROM "userInfo"
    WHERE id = $1;
  `;
  const res = await pool.query(query, [userId]);
  return res.rowCount > 0; // Returns true if a row was deleted
};

// ─── User Calendar Preferences ───────────────────────────────────────────────────────────

const upsertUserCalendarPreferences = async (userId, palette, groups, hiddenCalendars) => {
  const query = `
    INSERT INTO "userCalendarPreferences" (id, palette, groups, hiddenCalendars)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE SET
      palette = EXCLUDED.palette
      groups = EXCLUDED.groups
      hiddenCalendars = ECLUDED.hiddenCalendars
  `
  return await pool.query(query, [userId, palette, groups, hiddenCalendars]);
}

const upsertUserColorPalette = async (userId, palette) => {
  const query = `
    INSERT INTO "userCalendarPreferences" (id, palette)
    VALUES ($1, $2::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      palette = EXCLUDED.palette;
  `;
  // JSON.stringify prevents pg from converting JS arrays to Postgres arrays
  return await pool.query(query, [userId, JSON.stringify(palette)]);
};

const upsertUserGroups = async (userId, groups) => {
  const query = `
    INSERT INTO "userCalendarPreferences" (id, groups)
    VALUES ($1, $2::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      groups = EXCLUDED.groups;
  `;
  return await pool.query(query, [userId, JSON.stringify(groups)]);
};

const upsertUserHiddenCalendars = async (userId, hiddenCalendars) => {
  const query = `
    INSERT INTO "userCalendarPreferences" (id, hiddenCalendars)
    VALUES ($1, $2::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      hiddenCalendars = EXCLUDED.hiddenCalendars;
  `;
  return await pool.query(query, [userId, JSON.stringify(hiddenCalendars)]);
};

const getUserColorPalette = async (userId) => {
  const query = `
    SELECT id, palette
    FROM "userCalendarPreferences" 
    WHERE id = $1
  `;
  const res = await pool.query(query, [userId]);
  return res.rows[0] || null;
}

const getUserCalendarGroups = async (userId) => {
  const query = `
    SELECT id, groups
    FROM "userCalendarPreferences" 
    WHERE id = $1
  `;
  const res = await pool.query(query, [userId]);
  return res.rows[0] || null;
}

const getUserHiddenCalendars = async (userId) => {
  const query = `
    SELECT id, hiddenCalendars
    FROM "userCalendarPreferences" 
    WHERE id = $1
  `;
  const res = await pool.query(query, [userId]);
  return res.rows[0] || null;
}

const deleteUserCalendarPreferences = async (userId) => {
  const query = `
    DELETE FROM "userCalendarPreferences"
    WHERE id = $1;
  `;
  const res = await pool.query(query, [userId]);
  return res.rowCount > 0;

}

module.exports = { 
  getUserProfile, 
  getUserRefreshToken,
  updateToken,
  saveUserProfile, 
  getAllData,
  deleteUserProfile,

  upsertUserCalendarPreferences,
  upsertUserColorPalette,
  upsertUserGroups,
  upsertUserHiddenCalendars,
  getUserColorPalette,
  getUserCalendarGroups,
  getUserHiddenCalendars,
  deleteUserCalendarPreferences,
};
