require('dotenv').config();

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db.js');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use(express.json());

// ─── Setup and Cache ───────────────────────────────────────────────────────────

const oAuth2ClientWeb = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
const oAuth2ClientMobile = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, "");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY // or SUPABASE_SERVICE_ROLE_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false // Critical for backend admin clients
    }
  }
);

// Stores: Map<userId: string, {accessToken: string, expiryDate: integer}>
const accessTokenCache = new Map();

// ─── General Templates & Utilities ───────────────────────────────────────────────────────────

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

// ─── Authentication Functions ───────────────────────────────────────────────────────────

const authenticate = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.sendStatus(401);

  // Validate the JWT directly with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.error('Supabase Auth Error:', error?.message);
    return res.sendStatus(403);
  }

  // Attach user UUID to request
  req.userId = user.id; 
  next();
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

// ─── Main API Routes ───────────────────────────────────────────────────────────

app.post('/api/get-family-profiles', authenticate, handleRoute('Failed to get family data', async (req, res) => {
  console.log('/api/get-family-profiles called');
  res.json({
    parent: await db.getUserProfile(req.userId),
    children: []
  });
}));

app.post('/api/get-family-access-tokens', authenticate, handleRoute('Failed to get family tokens', async (req, res) => {
  console.log('/api/get-family-access-tokens called');
  const parentData = await db.getUserRefreshToken(req.userId);
  
  res.json({
    parent: await fetchAndFormatUserToken(req.userId, parentData.refreshToken, parentData.id),
    children: []
  });
}));

app.post('/api/update-token', async (req, res) => {
  console.log('[API] /update-token hit at', new Date().toISOString());
  const { userId, refreshToken } = req.body;

  if (!userId || !refreshToken) {
    return res.status(400).json({ error: 'Missing userId or refreshToken' });
  }

  try {
    const success = await db.updateToken(userId, refreshToken);
    
    if (success) {
      console.log(`[API] Token saved successfully for ${userId}`);
      res.status(200).json({ message: 'Token saved successfully' });
    } else {
      console.log(`[API] User profile ${userId} not found in database yet.`);
      res.status(404).json({ error: 'User profile not found' });
    }
  } catch (err) {
    console.error('[API] Error updating token:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/delete-account', authenticate, handleRoute('Failed to delete account', async (req, res) => {
  const userId = req.userId;
  const success = await db.deleteUserProfile(userId);

  if (!success) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  accessTokenCache.delete(userId);

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(`Supabase Auth deletion failed: ${error.message}`);
  }

  res.status(200).json({ message: 'Account deleted successfully' });
}));

// ─── Sharing Functions ───────────────────────────────────────────────────────────

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

// ─── Google Places Proxy Routes ───────────────────────────────────────────────────────────

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

// ─── Debug Routes ───────────────────────────────────────────────────────────

app.get('/getData', (req, res) => res.send(db.getAllData(req.query.table)));

app.get('/token', handleRoute('Failed to get family data', async (req, res) => {
  console.log("get-family-data called");
  res.json({
    parent: db.getUserProfile(req.query.id),
    children: []
  });
}));

app.get('/tokenreal', handleRoute('Failed to get family data', async (req, res) => {
  console.log("get-family-access-tokens called");
  const parentId = req.query.id;
  const parentData = db.getUserRefreshToken(parentId);

  res.json({
    parent: await fetchAndFormatUserToken(parentId, parentData.refreshToken, parentData.id),
    children: []
  });
}));

// ─── Initialization ───────────────────────────────────────────────────────────

app.listen(3001, () => console.log('Server running on port 3001'));