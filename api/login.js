// /api/login.js
export default async function handler(req, res) {
  const INIT_TOKEN = process.env.F360_INIT_TOKEN;
  const BASE_URL = process.env.F360_BASE_URL || "https://financas.f360.com.br";

  if (!INIT_TOKEN) {
    return res.status(500).json({ error: "F360_INIT_TOKEN não definido" });
  }

  try {
    const r = await fetch(BASE_URL + "/PublicLoginAPI/DoLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: INIT_TOKEN }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: text });
    }

    const data = await r.json();
    return res.status(200).json({ ...data, baseUrl: BASE_URL });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
