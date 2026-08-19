require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Database Initialization Function
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
initDb();

// saves information into userInfo table
const saveUserProfile = async (googleId, email, name, picture, refreshToken) => {
  const query = `
    INSERT INTO "userInfo" (id, email, name, picture, "refreshToken")
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET 
      email = EXCLUDED.email,
      name = EXCLUDED.name,
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
    INSERT INTO "userInfo" (id, "refreshToken")
    VALUES ($2, $1)
    ON CONFLICT (id) 
    DO UPDATE SET "refreshToken" = EXCLUDED."refreshToken"
    RETURNING id;
  `;
  
  try {
    const res = await pool.query(query, [refreshToken, userId]);
    return res.rowCount > 0;
  } catch (err) {
    console.error('Database error in updateToken:', err);
    return false;
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

module.exports = { 
  getUserProfile, 
  getUserRefreshToken,
  updateToken,
  saveUserProfile, 
  getAllData,
  deleteUserProfile,
};
