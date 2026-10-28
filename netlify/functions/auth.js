const crypto = require('crypto');
const { getStore } = require('@netlify/blobs');

const AUTH_STORE = 'mk-lanches-auth';
const CREDENTIAL_KEY = 'admin-credential';

// Defaults keep the existing password-only admin login working without Netlify env vars.
// Environment variables remain optional overrides, not requirements.
const DEFAULT_ADMIN_EMAIL = 'admin@mk-lanches.local';
const DEFAULT_PASSWORD_HASH = 'scrypt$epwuTW8QO4Wix+kUXWjwIw==$tSiTSzuynH1qRfYEDhzvtYeBO4GoiuwaJTTTSiUMyMalshGRNtLavzC9j+RO/QxG6d8e5QtN3it2C3AzYY7RoQ==';
const DEFAULT_SESSION_SECRET = 'mk-lanches-admin-session-v1-7f2c9b5e0d4a8c1f6e3b9a2d5c7f0e4b';

function adminEmail(){
  const value = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  if (!/^[^\s@|]+@[^\s@|]+\.[^\s@|]+$/.test(value)) {
    throw new Error('E-mail administrativo inválido.');
  }
  return value;
}
function verifyPassword(password, hash = (process.env.ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH)){
  const parts = String(hash || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    throw new Error('Credencial administrativa inválida.');
  }
  const salt = Buffer.from(parts[1], 'base64');
  const expected = Buffer.from(parts[2], 'base64');
  if (salt.length !== 16 || expected.length !== 64) {
    throw new Error('Credencial administrativa inválida.');
  }
  const actual = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}
async function getAdminCredential(){
  const store = getStore({ name: AUTH_STORE });
  const saved = await store.get(CREDENTIAL_KEY, { type: 'json' });
  if (saved !== null) {
    if (!saved || typeof saved !== 'object' || typeof saved.passwordHash !== 'string' ||
        !/^[a-f0-9-]{36}$/.test(saved.version || '') || saved.mustChangePassword !== false) {
      throw new Error('Credencial administrativa armazenada inválida.');
    }
    verifyPassword('', saved.passwordHash);
    return { passwordHash: saved.passwordHash, version: saved.version, mustChangePassword: false };
  }
  const hash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;
  return { passwordHash: hash, version: 'initial', mustChangePassword: true };
}
async function saveAdminPassword(password){
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  const credential = {
    passwordHash: `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`,
    version: crypto.randomUUID(),
    mustChangePassword: false
  };
  await getStore({ name: AUTH_STORE }).setJSON(CREDENTIAL_KEY, credential);
  return credential;
}
function sessionSecret(){
  const value = process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;
  if (value.length < 32) throw new Error('Segredo de sessão inválido.');
  return value;
}
function makeToken(version){
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const raw = `${adminEmail()}|${exp}|${version}`;
  const sig = crypto.createHmac('sha256', sessionSecret()).update(raw).digest('hex');
  return Buffer.from(`${raw}|${sig}`).toString('base64url');
}
async function getSession(event){
  try {
    const raw = Buffer.from(String(cookies(event).mk_admin || ''), 'base64url').toString();
    const [email, exp, version, sig] = raw.split('|');
    if (email !== adminEmail() || !/^\d+$/.test(exp) || Date.now() > Number(exp) ||
        !/^(?:initial|[a-f0-9-]{36})$/.test(version || '') || !/^[a-f0-9]{64}$/.test(sig || '')) {
      return { authenticated: false, mustChangePassword: false };
    }
    const expected = crypto.createHmac('sha256', sessionSecret()).update(`${email}|${exp}|${version}`).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return { authenticated: false, mustChangePassword: false };
    }
    const credential = await getAdminCredential();
    if (version !== credential.version) return { authenticated: false, mustChangePassword: false };
    return { authenticated: true, mustChangePassword: credential.mustChangePassword };
  } catch { return { authenticated: false, mustChangePassword: false }; }
}
function cookies(event){
  const raw = event?.headers?.cookie || event?.headers?.Cookie || '';
  const out = {};
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    try { out[k] = decodeURIComponent(v); } catch { out[k] = v; }
  }
  return out;
}
async function isAuthenticated(event){
  const session = await getSession(event);
  return session.authenticated;
}
async function isAdmin(event){
  const session = await getSession(event);
  return session.authenticated && !session.mustChangePassword;
}
function sessionCookie(token){
  return `mk_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
}
module.exports = {
  adminEmail,
  getAdminCredential,
  isAdmin,
  isAuthenticated,
  getSession,
  makeToken,
  saveAdminPassword,
  sessionCookie,
  verifyPassword
};
