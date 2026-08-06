const https = require('https');

function mpGet(path, token) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.mercadopago.com',
        path,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function sendEmail(apiKey, to, subject, html) {
  const body = JSON.stringify({
    from: 'paso · 01 <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const MP_TOKEN   = process.env.MP_ACCESS_TOKEN;
  const RESEND_KEY = process.env.MAIL_API_KEY;
  const NOTIFY_TO  = 'info.paso.ar@gmail.com';

  let notification;
  try {
    notification = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid payload' };
  }

  if (notification.type !== 'payment') {
    return { statusCode: 200, body: 'ignored' };
  }

  const paymentId = notification.data?.id;
  if (!paymentId) return { statusCode: 200, body: 'no id' };

  const payment = await mpGet(`/v1/payments/${paymentId}`, MP_TOKEN);

  if (payment.status !== 'approved') {
    return { statusCode: 200, body: 'not approved' };
  }

  const p = payment;
  const payer = p.payer || {};
  const shipping = p.additional_info?.shipments?.receiver_address || {};
  const items = (p.additional_info?.items || []).map(i =>
    `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;">${i.title}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">x${i.quantity} — $${i.unit_price}</td></tr>`
  ).join('');

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2A2623;">
  <h2 style="font-size:22px;margin-bottom:4px;">Nueva venta · paso · 01</h2>
  <p style="color:#9B8065;margin-top:0;">Orden #${p.order?.id || paymentId}</p>

  <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#9B8065;margin-top:32px;">Comprador</h3>
  <p style="margin:4px 0;">${payer.first_name || ''} ${payer.last_name || ''}</p>
  <p style="margin:4px 0;">${payer.email || ''}</p>
  <p style="margin:4px 0;">${payer.phone?.number || ''}</p>

  <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#9B8065;margin-top:24px;">Dirección de envío</h3>
  <p style="margin:4px 0;">
    ${shipping.street_name || ''} ${shipping.street_number || ''}<br>
    ${shipping.city_name || ''}, ${shipping.state_name || ''}<br>
    ${shipping.zip_code || ''}
  </p>

  <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#9B8065;margin-top:24px;">Productos</h3>
  <table style="width:100%;border-collapse:collapse;">${items}</table>

  <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#9B8065;margin-top:24px;">Total</h3>
  <p style="font-size:20px;font-weight:600;margin:4px 0;">$${p.transaction_amount} ARS</p>
  <p style="color:#9B8065;font-size:12px;">Método: ${p.payment_method_id || ''} — Cuotas: ${p.installments || 1}</p>

  <hr style="margin:32px 0;border:none;border-top:1px solid #eee;">
  <p style="font-size:11px;color:#9B8065;">paso · 01 · info.paso.ar@gmail.com</p>
</div>`;

  await sendEmail(RESEND_KEY, NOTIFY_TO, `Nueva venta · paso · 01 · #${paymentId}`, html);

  return { statusCode: 200, body: 'ok' };
};
