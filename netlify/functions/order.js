// Serverless API for generating the MK Lanches WhatsApp order link.
// This does NOT require a WhatsApp API token: click-to-chat is the safest
// option when the customer should send the order from their own WhatsApp.
const WA_NUMBER = process.env.MK_WHATSAPP_NUMBER || '5569984496963';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Método não permitido' }) };
  }
  try {
    const payload = JSON.parse(event.body || '{}');
    const { message } = payload;
    if (!message || typeof message !== 'string') {
      return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Mensagem do pedido não informada.' }) };
    }
    const storeId = event.queryStringParameters?.store === 'caramelo' ? 'caramelo' : 'mk';
    let waNumber = DEFAULT_WA_NUMBER;
    try {
      const store = getStore({ name: 'mk-lanches-data' });
      const catalog = await store.get(`catalog-${storeId}`, { type: 'json' });
      const candidate = String(catalog?.company?.whatsapp || '').replace(/\\D/g, '');
      if (/^\\d{10,15}$/.test(candidate)) waNumber = candidate;
      else if (storeId === 'caramelo') waNumber = '5569992532996';
    } catch (error) {
      if (storeId === 'caramelo') waNumber = '5569992532996';
    }
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true, whatsappUrl: url }) };
  } catch {
    return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'JSON inválido.' }) };
  }
};
