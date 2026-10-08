const { connectLambda } = require('@netlify/blobs');
const { getSession } = require('./auth');
exports.handler = async (event) => {
  try {
    connectLambda(event);
    const session = await getSession(event);
    if (!session || !session.authenticated) return json(401, { authenticated: false, mustChangePassword: false });
    return json(200, { authenticated: true, mustChangePassword: session.mustChangePassword });
  } catch {
    return json(401, { authenticated: false, mustChangePassword: false });
  }
};
function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(body) };
}
