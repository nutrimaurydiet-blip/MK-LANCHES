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
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true, whatsappUrl: url }) };
  } catch {
    return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'JSON inválido.' }) };
  }
};
