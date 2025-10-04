export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<Usuario>
    <username>NALBERT SOUZA</username>
    <password>99861</password>
</Usuario>`;

    const response = await fetch('https://mercatto.varejofacil.com/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/json'
      },
      body: xmlBody
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    return res.status(200).json(data); // { accessToken, refreshToken }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao autenticar', details: error.message });
  }
}
