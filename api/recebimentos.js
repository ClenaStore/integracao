export default async function handler(req, res) {
  const BASE_URL = process.env.MERCATTO_BASE_URL || "https://mercatto.varejofacil.com/api";
  const { dataInicial, horaInicial, dataFinal, horaFinal } = req.query;

  try {
    // 1️⃣ Login automático
    const login = await fetch(`${BASE_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.MERCATTO_USER,
        password: process.env.MERCATTO_PASS,
      }),
    });

    if (!login.ok) throw new Error("Falha no login");
    const { accessToken } = await login.json();

    // 2️⃣ Monta URL com filtro de data/hora
    const ini = `${dataInicial}T${horaInicial}:00`;
    const fim = `${dataFinal}T${horaFinal}:59`;
    const url = `${BASE_URL}/v1/venda/cupons-fiscais?q=dataVenda=ge=${ini};dataVenda=le=${fim}&start=0&count=1000`;

    // 3️⃣ Busca cupons
    const resp = await fetch(url, {
      headers: { Authorization: accessToken, Accept: "application/json" },
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(resp.status).json({ error: txt });
    }

    const dados = await resp.json();
    return res.status(200).json(dados);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
