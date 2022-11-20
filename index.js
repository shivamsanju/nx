import NC from 'node-cache';
import { randomUUID, randomBytes } from 'crypto';

const userCache = new NC();

const forceUpdateSessionKey = (token, sessionRefresh) => {
  const sessionKey = randomUUID?.() ?? randomBytes(32).toString('hex');
  const sessionKeyExpiry = new Date(Date.now() + Number(sessionRefresh));
  const sessionKeyObj = { sessionKey, sessionKeyExpiry };
  userCache.set(token.email, sessionKeyObj);
  token.sessionKey = sessionKey;
  token.sessionKeyExpiry = sessionKeyExpiry;
  token.authenticated = true;
  return token;
};

const validateAndUpdate = (token, sessionRefresh) => {
  if (!token || !token.sessionKey || !token.sessionKeyExpiry) {
    token.authenticated = false;
    return token;
  }

  // get the session key from user cache and validate with session key from token
  const validSessionObj = userCache.get(token.email);
  if (!validSessionObj) {
    token.authenticated = false;
    return token;
  }

  if (validSessionObj.sessionKey != token.sessionKey) {
    token.authenticated = false;
    return token;
  }

  // update the session key if expired
  if (new Date(validSessionObj.sessionKeyExpiry) <= new Date()) {
    token = forceUpdateSessionKey(token, sessionRefresh);
  }
  return token;
};

const allowSingleSession = (
  token,
  account,
  sessionRefresh = 60000,
  dev = false
) => {
  // if environment is dev don't use session key
  if (dev) {
    token.authenticated = true;
    return token;
  }

  if (isNaN(Number(sessionRefresh))) {
    throw new Error('sessionRefresh must be a number');
  }

  // for login
  if (account) {
    token = forceUpdateSessionKey(token, sessionRefresh);
    return token;
  }

  // for subsequent session check - if session key is not expired return previous token
  if (token.sessionKeyExpiry && new Date(token.sessionKeyExpiry) > new Date()) {
    return token;
  }

  token = validateAndUpdate(token, sessionRefresh);
  return token;
};

export default allowSingleSession;

// tsc --declaration --allowJs --emitDeclarationOnly index.js
