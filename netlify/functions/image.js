const { connectLambda, getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  try {
    connectLambda(event);
    const key = event.queryStringParameters?.key;
    if (!key || !/^img-[A-Za-z0-9_-]+$/.test(key)) return { statusCode: 400, body: 'Imagem não informada' };

    const tenant = event.queryStringParameters?.loja === 'caramelo' ? 'caramelo' : 'mk';
    const store = getStore({ name: tenant === 'caramelo' ? 'caramelo-lanches-images' : 'mk-lanches-images' });
    const item = await store.getWithMetadata(key, { type: 'arrayBuffer' });
    if (!item) return { statusCode: 404, body: 'Imagem não encontrada' };

    const contentType = item.metadata?.contentType || 'image/webp';
    return {
      statusCode: 200,
      headers: { 'content-type': contentType, 'cache-control': 'public,max-age=31536000,immutable' },
      body: Buffer.from(item.data).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('MK image error:', error);
    return { statusCode: 500, body: 'Não foi possível carregar a imagem' };
  }
};
