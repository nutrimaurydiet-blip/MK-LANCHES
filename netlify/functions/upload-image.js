const { connectLambda, getStore } = require('@netlify/blobs');
const { isAdmin } = require('./auth');

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp']);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido' });

  try {
    connectLambda(event);
    if (!await isAdmin(event)) return json(401, { error: 'Não autorizado.' });
    const body = JSON.parse(event.body || '{}');
    const dataUrl = String(body.data || '');
    const match = dataUrl.match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/i);
    if (!match) return json(400, { error: 'Imagem inválida. Use PNG, JPG ou WEBP.' });

    const contentType = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
    if (!ALLOWED.has(contentType)) return json(400, { error: 'Formato de imagem não permitido.' });

    const bytes = Buffer.from(match[2], 'base64');
    if (!bytes.length) return json(400, { error: 'Imagem vazia.' });
    if (bytes.length > MAX_BYTES) return json(413, { error: 'A imagem ficou muito grande. Tente uma foto menor.' });

    // Netlify Blobs documenta ArrayBuffer/Blob/string como valores válidos.
    // Não passamos Buffer diretamente para evitar incompatibilidade de runtime.
    const blob = new Blob([bytes], { type: contentType });
    const key = `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const store = getStore({ name: 'mk-lanches-images' });
    await store.set(key, blob, { metadata: { contentType } });

    return json(200, { ok: true, url: `/api/image?key=${encodeURIComponent(key)}`, key });
  } catch (error) {
    console.error('MK upload-image error:', error);
    return json(500, { error: 'Não foi possível salvar a imagem agora. Tente novamente.' });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify(body),
  };
}
