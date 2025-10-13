export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // ✅ Recebe o nome da empresa do front-end
    const { empresa } = req.body;

    // ✅ Mapeamento das variáveis de ambiente do Vercel
    const urls = {
      VAREJO_URL_VILLA: process.env.VAREJO_URL_VILLA,
      VAREJO_URL_PADARIA: process.env.VAREJO_URL_PADARIA,
      VAREJO_URL_DELICIA: process.env.VAREJO_URL_DELICIA,
      VAREJO_URL: process.env.VAREJO_URL // fallback
    };

    // ✅ Define qual URL usar
    const BASE_URL = urls[empresa] || process.env.VAREJO_URL;

    // ✅ Usuário e senha padrão (iguais para todas as empresas)
    const username = process.env.MERCATTO_USER;
    const password = process.env.MERCATTO_PASS;

    // ✅ Corpo XML
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<Usuario>
    <username>${username}</username>
    <password>${password}</password>
</Usuario>`;

    // ✅ Chamada à API correta da empresa
    const response = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/json'
      },
      body: xmlBody
    });

    // ✅ Tratamento de erro
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    // ✅ Retorna o token JWT da empresa selecionada
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ Erro no login:', error);
    return res.status(500).json({ error: 'Erro ao autenticar', details: error.message });
  }
}
