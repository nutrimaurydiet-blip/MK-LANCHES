exports.handler = async () => ({
  statusCode: 200,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-store',
    'set-cookie': 'mk_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  },
  body: JSON.stringify({ ok: true })
});
