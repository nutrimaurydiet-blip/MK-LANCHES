const { connectLambda } = require('@netlify/blobs');
const { adminEmail, getAdminCredential, makeToken, sessionCookie, verifyPassword } = require('./auth');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido' });
  try {
    connectLambda(event);
    const body = JSON.parse(event.body || '{}');
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (Buffer.byteLength(password, 'utf8') > 1024) return json(401, { error: 'E-mail ou senha inválidos.' });
    if (email !== adminEmail()) return json(401, { error: 'E-mail ou senha inválidos.' });
    const credential = await getAdminCredential();
    const ok = verifyPassword(password, credential.passwordHash);
    if (!ok) return json(401, { error: 'E-mail ou senha inválidos.' });
    const token = makeToken(credential.version);
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'set-cookie': sessionCookie(token)
      },
      body: JSON.stringify({ ok: true, mustChangePassword: credential.mustChangePassword })
    };
  } catch (error) {
    console.error('MK admin-login error:', error);
    return json(500, { error: 'Não foi possível entrar agora. Verifique a configuração do painel.' });
  }
};
function json(status, body){ return { statusCode: status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(body) }; }
