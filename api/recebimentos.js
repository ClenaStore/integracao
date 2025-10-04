// api/recebimentos.js
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { dataInicial, dataFinal } = req.query;
  if (!dataInicial || !dataFinal) {
    return res.status(400).json({ error: "Informe dataInicial e dataFinal" });
  }

  try {
    // 1. Login para pegar o token
    const loginResp = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_USERNAME,
        password: process.env.VAREJO_PASSWORD
      })
    });

    if (!loginResp.ok) {
      const text = await loginResp.text();
      return res.status(loginResp.status).json({ error: "Falha no login", detail: text });
    }

    const { accessToken } = await loginResp.json();

    // 2. Buscar recebimentos
    const url = `https://mercatto.varejofacil.com/api/v1/pdv/recebimentos?dataInicial=${dataInicial}&dataFinal=${dataFinal}&start=0&count=1000`;

   // 2. USAR ESSA URL E O FILTRO DE DATAS TEM QUE TER HORA, AJUSTA O INDEX
    https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais?q=dataVenda=ge=2025-10-01T00:00:00;dataVenda=le=2025-10-03T23:59:59&start=0&count=100

    const resp = await fetch(url, {
      headers: {
        "Authorization": accessToken,
        "Accept": "application/json"
      }
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: "Erro ao buscar recebimentos", detail: text });
    }

    const data = await resp.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Erro interno na API de recebimentos", detail: error.message });
  }
}
