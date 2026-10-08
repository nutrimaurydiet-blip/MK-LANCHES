const { adminEmail, verifyPassword, makeToken } = require('./auth');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido' });
  try {
    const body = JSON.parse(event.body || '{}');
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (Buffer.byteLength(password, 'utf8') > 1024) return json(401, { error: 'E-mail ou senha inválidos.' });
    const ok = email === adminEmail() && verifyPassword(password);
    if (!ok) return json(401, { error: 'E-mail ou senha inválidos.' });
    const token = makeToken();
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'set-cookie': 'mk_admin=' + token + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800'
      },
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    console.error('MK admin-login error:', error);
    return json(500, { error: 'Não foi possível entrar agora. Verifique a configuração do painel.' });
  }
};
function json(status, body){ return { statusCode: status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(body) }; }
