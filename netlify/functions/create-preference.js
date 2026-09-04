exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Token no configurado' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Body inválido' }) };
  }

  const { items, payer } = body;

  const preference = {
    items: items.map(item => ({
      title: item.name,
      quantity: item.qty,
      unit_price: item.price,
      currency_id: 'ARS',
    })),
    payer: {
      name: payer.name || payer.nombre || '',
      surname: payer.surname || payer.apellido || '',
      email: payer.email || '',
      phone: { number: String(payer.phone || payer.telefono || '') },
    },
    back_urls: {
      success: 'https://paso-ar.com/orden-confirmada.html',
      failure: 'https://paso-ar.com/checkout.html',
      pending: 'https://paso-ar.com/orden-confirmada.html',
    },
    auto_return: 'approved',
    statement_descriptor: 'paso · 01',
    payment_methods: {
      installments: 12,
    },
  };

  try {
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data.message || 'Error MP' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ init_point: data.init_point }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
