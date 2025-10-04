// /api/login.js
// Faz login no Mercatto e retorna o accessToken.
// Credenciais vêm das variáveis da Vercel: MERCATTO_USER e MERCATTO_PASS.

export default async function handler(req, res) {
  try {
    const user = process.env.MERCATTO_USER;
    const pass = process.env.MERCATTO_PASS;
    if (!user || !pass) {
      return res.status(500).json({ error: "Credenciais não configuradas (MERCATTO_USER / MERCATTO_PASS)." });
    }

    const login = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });

    if (!login.ok) {
      const msg = await login.text();
      return res.status(login.status).json({ error: "Falha no login", detail: msg });
    }

    const data = await login.json();
    if (!data?.accessToken) {
      return res.status(500).json({ error: "Login OK, mas accessToken ausente." });
    }

    res.status(200).json({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro inesperado no login." });
  }
}
