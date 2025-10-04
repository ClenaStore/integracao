export default async function handler(req, res) {
  const { dataInicial, dataFinal } = req.query;

  try {
    // 1. Login para pegar token
    const login = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.API_USER,
        password: process.env.API_PASS,
      }),
    });

    const loginData = await login.json();

    if (!login.ok || !loginData.accessToken) {
      console.error("Erro no login:", loginData);
      return res.status(401).json({ error: "Falha no login", detalhes: loginData });
    }

    const token = loginData.accessToken;

    // 2. Buscar recebimentos
    const url = `https://mercatto.varejofacil.com/api/v1/pdv/recebimentos?dataInicial=${dataInicial}&dataFinal=${dataFinal}&start=0&count=200`;
    const r = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": token   // 🔥 se não der, troque para `Bearer ${token}`
      }
    });

    const dados = await r.json();

    if (!r.ok) {
      console.error("Erro recebimentos:", dados);
      return res.status(500).json({ error: "Falha recebimentos", detalhes: dados });
    }

    res.status(200).json(dados);

  } catch (e) {
    console.error("Erro geral:", e);
    res.status(500).json({ error: "Erro no servidor", detalhes: e.message });
  }
}
