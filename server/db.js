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

    // Stores Relationships Between Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS "userChildren" (
        "parentId" TEXT NOT NULL,
        "childId" TEXT NOT NULL,
        PRIMARY KEY ("parentId", "childId")
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        "hostId" TEXT NOT NULL,
        "inviteeId" TEXT NOT NULL,
        PRIMARY KEY ("hostId", "inviteeId")
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

// saves a user request into invitations table 
const addInvitation = async (hostId, inviteeId) => {
  const query = `
    INSERT INTO invitations ("hostId", "inviteeId") 
    VALUES ($1, $2)
    ON CONFLICT ("hostId", "inviteeId") DO NOTHING
  `;
  return await pool.query(query, [hostId, inviteeId]);
};

// params: parent user id, array of children id
// do: associates list of children id into
const linkParentChildren = async (parentId, childIds) => {
  const query = `
    INSERT INTO "userChildren" ("parentId", "childId") 
    VALUES ($1, $2)
    ON CONFLICT ("parentId", "childId") DO NOTHING
  `;
  for (const childId of childIds) {
    await pool.query(query, [parentId, childId]);
  }
};

// params: parent user id, array of children id
// do: delinks parent from listed children
const delinkParentChildren = async (parentId, childIds) => {
  const query = `
    DELETE FROM "userChildren" 
    WHERE "parentId" = $1 AND "childId" = $2
  `;
  for (const childId of childIds) {
    await pool.query(query, [parentId, childId]);
  }
};

// params: parent user id, array of children id
// do: delinks parent from listed children
const setParentChildren = async (parentId, childIds) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // delete all entries with parent
    await client.query('DELETE FROM "userChildren" WHERE "parentId" = $1', [parentId]);

    // insert all new links
    const insertQuery = `
      INSERT INTO "userChildren" ("parentId", "childId") 
      VALUES ($1, $2)
      ON CONFLICT ("parentId", "childId") DO NOTHING
    `;
    for (const childId of childIds) {
      await client.query(insertQuery, [parentId, childId]);
    }
    
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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

// params: parent user id
// return: array of child profiles (id, email, name, token)
const getChildrenProfiles = async (parentId) => {
  const query = `
    SELECT u.id, u.email, u.name, u.picture
    FROM "userInfo" u
    JOIN "userChildren" c ON u.id = c."childId"
    WHERE c."parentId" = $1
  `;
  const res = await pool.query(query, [parentId]);
  return res.rows;
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

// params: parent user id
// return: array of child profiles (id, email, name, token)
const getChildrenRefreshToken = async (parentId) => {
  const query = `
    SELECT u.id, u."refreshToken"
    FROM "userInfo" u
    JOIN "userChildren" c ON u.id = c."childId"
    WHERE c."parentId" = $1
  `;
  const res = await pool.query(query, [parentId]);
  return res.rows;
};

// params: parent user id
// return: array of children associated with parentId
const getChildren = async (parentId) => {
  const query = `
    SELECT "childId" 
    FROM "userChildren" 
    WHERE "parentId" = $1
  `;
  const res = await pool.query(query, [parentId]);
  return res.rows.map(row => row.childId);
};

// ===========================================================
// INVITATION FUNCTIONS 
// ===========================================================

// params: email
// returns: user calendar id
const getIdByEmail = async (email) => {
  const query = `SELECT id FROM "userInfo" WHERE email = $1`;
  const res = await pool.query(query, [email]);
  return res.rows[0] ? res.rows[0].id : null;
};

// Removes a specific pair.
const removeInvitation = async (hostId, inviteeId) => {
  const query = `
    DELETE FROM invitations 
    WHERE "hostId" = $1 AND "inviteeId" = $2
  `;
  return await pool.query(query, [hostId, inviteeId]);
};

// Params: Invitee Id
// Gets all pairs for a specific Invitee.
// Return: [{ hostId: '...', inviteeId: '...' }]
const getInvitationsByInvitee = async (inviteeId) => {
  const query = `
    SELECT "hostId", "inviteeId" 
    FROM invitations 
    WHERE "inviteeId" = $1
  `;
  const res = await pool.query(query, [inviteeId]);
  return res.rows;
};

// Parms: host Id
// Get all pairs for a specific Host
const getInvitationsByHost = async (hostId) => {
  const query = `
    SELECT * FROM invitations 
    WHERE "hostId" = $1
  `;
  const res = await pool.query(query, [hostId]);
  return res.rows;
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
  const res = await pool.query(query, [refreshToken, userId]);
  return res.rowCount > 0; // Returns true if a row was updated
};

module.exports = { 
  getUserProfile, 
  getChildrenProfiles, 
  getChildren,
  getUserRefreshToken,
  getChildrenRefreshToken,

  saveUserProfile, 
  setParentChildren,
  linkParentChildren, 
  delinkParentChildren,
  
  getIdByEmail,
  addInvitation,
  removeInvitation,
  getInvitationsByInvitee,
  getInvitationsByHost,

  getAllData,

  updateToken,
};
