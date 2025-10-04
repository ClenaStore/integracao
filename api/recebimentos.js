export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { token, dataInicio, dataFim, horaInicio, horaFim } = req.body;

  if (!token) return res.status(400).json({ error: 'Token não informado' });

  const url = `https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais?start=0&q=dataVenda=ge=${dataInicio}T${horaInicio};dataVenda=le=${dataFim}T${horaFim}&count=200`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar recebimentos', details: error.message });
  }
}
