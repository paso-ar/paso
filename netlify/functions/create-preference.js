const https = require('https');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Token no configurado' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Payload inválido' }) };
  }

  const { items = [], payer = {}, external_reference = '' } = payload;

  const preference = {
    external_reference,
    items: items.map(item => ({
      id: String(item.id),
      title: item.name,
      quantity: item.qty,
      unit_price: item.price,
      currency_id: 'ARS',
    })),
    payer: {
      name:    payer.name    || '',
      surname: payer.surname || '',
      email:   payer.email   || 'comprador@paso.ar',
      phone:   { area_code: '', number: payer.phone || '' },
    },
    back_urls: {
      success: 'https://paso-ar.com/orden-confirmada.html',
      failure: 'https://paso-ar.com/carrito.html',
      pending: 'https://paso-ar.com/orden-confirmada.html',
    },
    auto_return: 'approved',
    statement_descriptor: 'paso 01',
  };

  const body = JSON.stringify(preference);

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.mercadopago.com',
        path: '/checkout/preferences',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            resolve({
              statusCode: res.statusCode,
              body: JSON.stringify({ error: parsed.message || 'Error MP' }),
            });
          } else {
            resolve({
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                init_point:         parsed.init_point,
                sandbox_init_point: parsed.sandbox_init_point,
                id:                 parsed.id,
              }),
            });
          }
        });
      }
    );
    req.on('error', (e) => {
      resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) });
    });
    req.write(body);
    req.end();
  });
};
