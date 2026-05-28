require('dotenv').config();

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db.js');

const app = express();
app.use(cors());
app.use(express.json());

// ===========================================================
// SETUP & CACHE
// ===========================================================

const oAuth2ClientWeb = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
const oAuth2ClientMobile = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, "");

// Stores: Map<userId: string, {accessToken: string, expiryDate: integer}>
const accessTokenCache = new Map();

// ===========================================================
// GENERAL TEMPLATES & UTILITIES
// ===========================================================

// Template wrapper for centralized route error handling
const handleRoute = (errMsg, fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    console.error(`${errMsg}:`, error.message || error);
    
    // Pass through exact Google API error statuses if they exist
    if (error.isGoogleAPIError) return res.status(error.status).json(error.data);
    
    res.status(500).json({ error: errMsg });
  }
};

// Generalized template for Google Calendar API requests
const googleFetch = async (endpoint, method, token, body = null) => {
  const options = {
    method,
    headers: { 'Authorization': `Bearer ${token}` }
  };
  
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`https://www.googleapis.com/calendar/v3/${endpoint}`, options);
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw { isGoogleAPIError: true, status: response.status, data };
  }
  
  // Google returns 204 No Content for successful deletions
  return response.status === 204 ? null : response.json();
};

// ===========================================================
// AUTHENTICATION FUNCTIONS
// ===========================================================

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.userId = decoded.userId; 
    next();
  });
};

const getAccessToken = async (userId, refreshToken) => {
  if (!refreshToken) {
    throw new Error('Missing refresh token for user ${userId}');
  }

  const cachedToken = accessTokenCache.get(userId);
  if (cachedToken && cachedToken.expiryDate > (Date.now() + 60000)) return cachedToken;

  // Provisioning a fresh client prevents race conditions between concurrent requests
  const tempClient = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
  tempClient.setCredentials({ refresh_token: refreshToken });
  
  try {
    await tempClient.getAccessToken();;

    const token = tempClient.credentials.access_token;
    const expiryDate = tempClient.credentials.expiry_date;
    
    const newToken = { accessToken: token, expiryDate };
    accessTokenCache.set(userId, newToken);
    return newToken;
  } catch (error) {
    console.error(`Google API Error for user ${userId}:`, error.message);
    throw new Error(`Failed to refresh token: ${error.message}`);
  }
};

const getJWTToken = (userId) => {
  const sessionToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const { exp: expiryDate } = jwt.verify(sessionToken, process.env.JWT_SECRET);
  return { sessionToken, expiryDate };
};

const fetchAndFormatUserToken = async (userId, refreshToken, id) => {
  const { accessToken, expiryDate } = await getAccessToken(userId, refreshToken);
  return { id, accessToken, expiryDate };
};

// ===========================================================
// MAIN API ROUTES
// ===========================================================

app.post('/api/google-exchange', handleRoute('Failed to exchange code', async (req, res) => {
  console.log('/api/google-exchange called');
  const { code, codeVerifier, redirectUri } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  // 1. Dynamic client & payload fetching
  const client = redirectUri ? oAuth2ClientWeb : oAuth2ClientMobile;
  const { tokens } = await client.getToken(redirectUri ? { code, codeVerifier, redirect_uri: redirectUri } : { code });

  const ticket = await oAuth2ClientWeb.verifyIdToken({ idToken: tokens.id_token, audience: process.env.CLIENT_ID });
  const { sub: googleId, email, name, picture } = ticket.getPayload();
  
  // 2. Generate Session
  const sessionTokenObj = getJWTToken(googleId);
  console.log(sessionTokenObj);

  // 3. Respond & Save
  res.status(200).json(sessionTokenObj);
  db.saveUserProfile(googleId, email, name, picture, tokens.refresh_token);
}));

app.post('/api/get-family-profiles', authenticate, handleRoute('Failed to get family data', async (req, res) => {
  console.log('/api/get-family-profiles called');
  res.json({
    parent: db.getUserProfile(req.userId),
    children: db.getChildrenProfiles(req.userId)
  });
}));

app.post('/api/get-family-access-tokens', authenticate, handleRoute('Failed to get family tokens', async (req, res) => {
  console.log('/api/get-family-access-tokens called');
  const parentData = await db.getUserRefreshToken(req.userId);
  const childrenData = await db.getChildrenRefreshToken(req.userId);
  
  res.json({
    parent: await fetchAndFormatUserToken(req.userId, parentData.refreshToken, parentData.id),
    children: await Promise.all(childrenData.map(c => fetchAndFormatUserToken(c.id, c.refreshToken, c.id)))
  });
}));

// ===========================================================
// SHARING FUNCTIONS
// ===========================================================

app.post('/api/share-calendar', authenticate, handleRoute('Internal server error during sharing', async (req, res) => {
  const { calId, email, role = 'reader' } = req.body;
  if (!calId || !email) return res.status(400).json({ error: "Missing calendarId or email" });

  const userData = db.getUserRefreshToken(req.userId);
  if (!userData?.refreshToken) return res.status(404).json({ error: 'User refresh token not found' });

  const { accessToken } = await getAccessToken(req.userId, userData.refreshToken);
  const data = await googleFetch(`calendars/${encodeURIComponent(calId)}/acl`, 'POST', accessToken, {
    role, scope: { type: 'user', value: email }
  });

  res.status(200).json({ message: 'Calendar shared successfully', data });
}));

app.delete('/api/unshare-calendar', authenticate, handleRoute('Internal server error during unsharing', async (req, res) => {
  const { calId, email } = req.body;
  if (!calId || !email) return res.status(400).json({ error: "Missing calendarId or email" });

  const userData = db.getUserRefreshToken(req.userId);
  if (!userData?.refreshToken) return res.status(404).json({ error: 'User refresh token not found' });

  const { accessToken } = await getAccessToken(req.userId, userData.refreshToken);
  await googleFetch(`calendars/${encodeURIComponent(calId)}/acl/user:${email}`, 'DELETE', accessToken);

  res.status(200).json({ message: 'Access revoked successfully' });
}));

app.delete('/api/unsuscribe-calendar', authenticate, handleRoute('Internal server error during unsubscribe', async (req, res) => {
  const { calId } = req.body;
  if (!calId) return res.status(400).json({ error: "user calendar not found" });

  const userData = db.getUserRefreshToken(req.userId);
  if (!userData?.refreshToken) return res.status(404).json({ error: "user refresh token not found" });

  const { accessToken } = await getAccessToken(req.userId, userData.refreshToken);
  await googleFetch(`users/me/calendarList/${encodeURIComponent(calId)}`, 'DELETE', accessToken);

  res.status(200).json({ message: 'Unsubscribed from calendar successfully' });
}));

// ===========================================================
// GOOGLE PLACES PROXY ROUTES
// ===========================================================

app.get('/api/places/autocomplete', authenticate, handleRoute('Autocomplete failed', async (req, res) => {
  const { input } = req.query;
  if (!input) return res.status(400).json({ error: 'Input parameter required' });

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log("aC:",data.predictions);

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    return res.status(400).json({ error: data.error_message || data.status });
  }
  res.json(data.predictions || []);
}));

app.get('/api/places/details', authenticate, handleRoute('Details failed', async (req, res) => {
  const { placeId } = req.query;
  if (!placeId) return res.status(400).json({ error: 'PlaceId parameter required' });

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address&key=${process.env.GOOGLE_PLACES_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log("DET:",data);

  if (data.status !== 'OK') {
    return res.status(400).json({ error: data.error_message || data.status });
  }
  res.json(data.result || {});
}));

// ===========================================================
// DEBUG ROUTES
// ===========================================================

app.get('/getData', (req, res) => res.send(db.getAllData(req.query.table)));

app.get('/token', handleRoute('Failed to get family data', async (req, res) => {
  console.log("get-family-data called");
  res.json({
    parent: db.getUserProfile(req.query.id),
    children: db.getChildrenProfiles(req.query.id)
  });
}));

app.get('/tokenreal', handleRoute('Failed to get family data', async (req, res) => {
  console.log("get-family-access-tokens called");
  const parentId = req.query.id;
  const parentData = db.getUserRefreshToken(parentId);
  const childrenData = db.getChildrenRefreshToken(parentId);

  res.json({
    parent: await fetchAndFormatUserToken(parentId, parentData.refreshToken, parentData.id),
    children: await Promise.all(childrenData.map(c => fetchAndFormatUserToken(c.id, c.refreshToken, c.id)))
  });
}));

// ===========================================================
// INITIALIZATION
// ===========================================================

app.listen(3001, () => console.log('Server running on port 3001'));