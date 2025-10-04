// /api/parcelas.js
export default async function handler(req, res) {
  const INIT_TOKEN = process.env.F360_INIT_TOKEN;
  const BASE_URL = process.env.F360_BASE_URL || "https://financas.f360.com.br";

  if (!INIT_TOKEN) {
    return res.status(500).json({ error: "F360_INIT_TOKEN não definido" });
  }

  try {
    // 1. Login para obter JWT
    const loginResp = await fetch(BASE_URL + "/PublicLoginAPI/DoLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: INIT_TOKEN }),
    });

    if (!loginResp.ok) {
      const text = await loginResp.text();
      return res.status(loginResp.status).json({ error: text });
    }

    const loginData = await loginResp.json();
    const jwt = loginData.Token || loginData.token || loginData.jwt;
    if (!jwt) {
      return res.status(500).json({ error: "JWT não retornado pelo login", loginData });
    }

    // 2. Monta parâmetros da query string
    const { pagina = 1, tipo = "Despesa", inicio = "", fim = "", tipoDatas = "Emissão", empresa = "" } = req.query;
    const qs = new URLSearchParams({ pagina, tipo, inicio, fim, tipoDatas });
    if (empresa) qs.append("empresa", empresa);

    // 3. Chama a API Listar Parcelas
    const parcelasUrl = BASE_URL + "/ParcelasDeTituloPublicAPI/ListarParcelasDeTitulos?" + qs.toString();
    const parcelasResp = await fetch(parcelasUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
      },
    });

    if (!parcelasResp.ok) {
      const text = await parcelasResp.text();
      return res.status(parcelasResp.status).json({ error: text });
    }

    const parcelasData = await parcelasResp.json();
    return res.status(200).json(parcelasData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
