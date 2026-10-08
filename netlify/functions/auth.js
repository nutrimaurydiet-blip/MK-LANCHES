const crypto = require('crypto');

function adminEmail(){
  const value = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!value || !/^[^\s@|]+@[^\s@|]+\.[^\s@|]+$/.test(value)) {
    throw new Error('ADMIN_EMAIL não configurado corretamente.');
  }
  return value;
}
function verifyPassword(password){
  const parts = String(process.env.ADMIN_PASSWORD_HASH || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    throw new Error('ADMIN_PASSWORD_HASH não configurado corretamente.');
  }
  const salt = Buffer.from(parts[1], 'base64');
  const expected = Buffer.from(parts[2], 'base64');
  if (salt.length !== 16 || expected.length !== 64) {
    throw new Error('ADMIN_PASSWORD_HASH não configurado corretamente.');
  }
  const actual = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}
function sessionSecret(){
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('ADMIN_SESSION_SECRET não configurado corretamente.');
  return value;
}
function makeToken(){
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const raw = `${adminEmail()}|${exp}`;
  const sig = crypto.createHmac('sha256', sessionSecret()).update(raw).digest('hex');
  return Buffer.from(`${raw}|${sig}`).toString('base64url');
}
function validToken(token){
  try {
    const raw = Buffer.from(String(token || ''), 'base64url').toString();
    const [email, exp, sig] = raw.split('|');
    if (email !== adminEmail() || !/^\d+$/.test(exp) || Date.now() > Number(exp) || !/^[a-f0-9]{64}$/.test(sig || '')) return false;
    const expected = crypto.createHmac('sha256', sessionSecret()).update(`${email}|${exp}`).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch { return false; }
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
function isAdmin(event){ return validToken(cookies(event).mk_admin); }
module.exports = { adminEmail, verifyPassword, makeToken, isAdmin };
