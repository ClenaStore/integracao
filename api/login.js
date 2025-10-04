// /api/login.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<Usuario><username>${process.env.MERCATTO_USER}</username><password>${process.env.MERCATTO_PASS}</password></Usuario>`;

    const resp = await fetch('https://mercatto.varejofacil.com/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml', 'Accept': 'application/json' },
      body: xmlBody
    });

    const json = await resp.json();
    if (!resp.ok) return res.status(resp.status).json(json);
    res.status(200).json({ accessToken: json.accessToken });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
