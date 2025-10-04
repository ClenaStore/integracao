export default async function handler(req, res) {
  try {
    const resp = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.MERCATTO_USER,
        password: process.env.MERCATTO_PASS
      })
    });

    if (!resp.ok) return res.status(resp.status).json({ error: "Falha no login" });
    const data = await resp.json();
    res.json({ token: data.accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
