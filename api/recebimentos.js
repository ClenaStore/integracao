export default async function handler(req, res) {
  const { dataInicial, dataFinal } = req.query;
  try {
    // 1. Login para pegar token
    const login = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.MERCATTO_USER,
        password: process.env.MERCATTO_PASS
      })
    });
    const { accessToken } = await login.json();

    // 2. Buscar cupons fiscais (com filtro de data + hora)
    const url = `https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais?q=dataVenda=ge=${dataInicial};dataVenda=le=${dataFinal}&start=0&count=1000`;
    const resp = await fetch(url, {
      headers: {
        "Authorization": accessToken,
        "Accept": "application/json"
      }
    });

    if (!resp.ok) return res.status(resp.status).json({ error: "Erro na API" });
    const json = await resp.json();

    // processamento simples (aqui vc adapta depois)
    const result = {
      restaurante: json.items.filter(i => parseInt(i.numeroCaixa) > 5),
      emporio: json.items.filter(i => parseInt(i.numeroCaixa) <= 5)
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
