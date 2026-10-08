const { isAdmin } = require('./auth');
exports.handler = async (event) => {
  try {
    const authenticated = isAdmin(event);
    return { statusCode: authenticated ? 200 : 401, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify({ authenticated }) };
  } catch {
    return { statusCode: 401, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify({ authenticated: false }) };
  }
};
