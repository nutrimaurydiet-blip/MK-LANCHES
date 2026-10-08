const { connectLambda } = require('@netlify/blobs');
const { getAdminCredential, isAuthenticated, makeToken, saveAdminPassword, sessionCookie, verifyPassword } = require('./auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido.' });

  try {
    connectLambda(event);
    if (!await isAuthenticated(event)) return json(401, { error: 'Sessão inválida. Entre novamente.' });

    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'JSON inválido.' });
    }

    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');
    if (Buffer.byteLength(currentPassword, 'utf8') > 1024) {
      return json(400, { error: 'Senha atual inválida.' });
    }
    if (Buffer.byteLength(newPassword, 'utf8') < 12 || Buffer.byteLength(newPassword, 'utf8') > 1024 ||
        !/^[\x20-\x7e]+$/.test(newPassword)) {
      return json(400, { error: 'A nova senha deve ter pelo menos 12 caracteres ASCII imprimíveis.' });
    }

    const credential = await getAdminCredential();
    if (!verifyPassword(currentPassword, credential.passwordHash)) {
      return json(401, { error: 'Senha atual incorreta.' });
    }
    if (verifyPassword(newPassword, credential.passwordHash)) {
      return json(400, { error: 'Escolha uma senha diferente da atual.' });
    }

    const updated = await saveAdminPassword(newPassword);
    const token = makeToken(updated.version);
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'set-cookie': sessionCookie(token)
      },
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    console.error('MK admin-password error:', error);
    return json(500, { error: 'Não foi possível atualizar a senha agora. Verifique a configuração do painel.' });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify(body)
  };
}
