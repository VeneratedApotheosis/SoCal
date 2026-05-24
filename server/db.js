const sqlite = require('better-sqlite3');
const appDb = new sqlite('data/appDb.db');

//Stores Data Per User
appDb.prepare(`
  CREATE TABLE IF NOT EXISTS userInfo (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    picture TEXT NOT NULL,
    refreshToken TEXT NOT NULL
  )
`).run();

//Stores Relationships Between Users
appDb.prepare(`
  CREATE TABLE IF NOT EXISTS userChildren (
    parentId TEXT NOT NULL,
    childId TEXT NOT NULL,
    PRIMARY KEY (parentId, childId)
  )
`).run();

appDb.prepare(`
  CREATE TABLE IF NOT EXISTS invitations (
    hostId TEXT NOT NULL,
    inviteeId TEXT NOT NULL,
    PRIMARY KEY (hostId, inviteeId)
  )
`).run();

//saves information into sqlite userInfo table
const saveUserProfile = (googleId, email, name, picture, refreshToken) => {
  const stmt = appDb.prepare(`
    INSERT INTO userInfo (id,email,name,picture,refreshToken)
    VALUES (?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET 
      email = excluded.email,
      name = excluded.name,
      refreshToken=excluded.refreshToken
  `);
  return stmt.run(googleId, email, name, picture, refreshToken);
}

//saves a user request into invitations table 
const addInvitation = (hostId, inviteeId) => {
  const stmt = appDb.prepare(`
    INSERT OR IGNORE INTO invitations (hostId, inviteeId) 
    VALUES (?, ?)
  `);
  return stmt.run(hostId, inviteeId);
};

//params: parent user id, array of children id
//do: associates list of children id into
const linkParentChildren = (parentId, childIds) => {
  const stmt = appDb.prepare(`
      INSERT OR IGNORE INTO userChildren (parentId, childId) values (?,?)
    `);
  for( const childId of childIds)
    stmt.run(parentId, childId);
};

//params: parent user id, array of children id
//do: delinks parent from listed chlidren
const delinkParentChildren = (parentId, childIds) => {
  const stmt = appDb.prepare(`
      DELETE FROM userChildren WHERE parentId = ? AND childId = ?
    `);
  for( const childId of childIds)
    stmt.run(parentId, childId);
};

//params: parent user id, array of children id
//do: delinks parent from listed chlidren
const setParentChildren = (parentId, childIds) => {
  // delete all entries with parent
  appDb.prepare('DELETE FROM userChildren WHERE parentId = ?').run(parentId);

  // insert all new links
  const insertStmt = appDb.prepare(`
      INSERT OR IGNORE INTO userChildren (parentId, childId) VALUES (?,?)
  `);
  for (const childId of childIds) {
    insertStmt.run(parentId, childId);
  }
};

//gets information from sqlite userInfo table
const getUserProfile = (googleId) => {
  const stmt = appDb.prepare(`
      SELECT id, email, name, picture FROM userInfo WHERE id = ?
  `);
  return stmt.get(googleId);
}

//params: parent user id
//return: array of child profiles (id, email, name, token)
const getChildrenProfiles = (parentId) => {
  return appDb.prepare(`
    SELECT u.id, u.email, u.name, u.picture
    FROM userInfo u
    JOIN userChildren c ON u.id = c.childId
    WHERE c.parentId = ?
  `).all(parentId);
};

//gets information from sqlite userInfo table
const getUserRefreshToken = (googleId) => {
  const stmt = appDb.prepare(`
      SELECT id, refreshToken FROM userInfo WHERE id = ?
  `);
  return stmt.get(googleId);
}
//params: parent user id
//return: array of child profiles (id, email, name, token)
const getChildrenRefreshToken = (parentId) => {
  return appDb.prepare(`
    SELECT u.id, u.refreshToken
    FROM userInfo u
    JOIN userChildren c ON u.id = c.childId
    WHERE c.parentId = ?
  `).all(parentId);
};

//params: parent user id
//return: array of children associated with parentId
const getChildren = (parentId) => {
  const rows = appDb.prepare(`
      SELECT childId FROM userChildren WHERE parentId = ?
    `).all(parentId);
  return rows.map(row => row.childId);
};

// ===========================================================
// INVITATION FUNCTIONS 
// ===========================================================

// params: email
// returns: user calendar id
const getIdByEmail = (email) => {
  const stmt = appDb.prepare(`SELECT id FROM userInfo WHERE email = ?`);
  const user = stmt.get(email);
  return user ? user.id : null;
};

// Removes a specific pair.
const removeInvitation = (hostId, inviteeId) => {
  const stmt = appDb.prepare(`
    DELETE FROM invitations 
    WHERE hostId = ? AND inviteeId = ?
  `);
  return stmt.run(hostId, inviteeId);
};

// Params: Invitee Id
// Gets all pairs for a specific Invitee.
// Return: [{ hostId: '...', inviteeId: '...' }]
const getInvitationsByInvitee = (inviteeId) => {
  const stmt = appDb.prepare(`
    SELECT hostId, inviteeId 
    FROM invitations 
    WHERE inviteeId = ?
  `);
  return stmt.all(inviteeId);
};

// Parms: host Id
// Get all pairs for a specific Host
const getInvitationsByHost = (hostId) => {
  return appDb.prepare(`SELECT * FROM invitations WHERE hostId = ?`).all(hostId);
};

//debug
function getAllData(tableName) {
    const rows = appDb.prepare(`SELECT * FROM ${tableName}`).all();
    return rows;
}
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

  getAllData
};