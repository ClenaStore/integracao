export default async function handler(req, res) {
  const BASE_URL = process.env.MERCATTO_BASE_URL || "https://mercatto.varejofacil.com/api";

  try {
    const response = await fetch(`${BASE_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.MERCATTO_USER,
        password: process.env.MERCATTO_PASS,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    return res.status(200).json({ token: data.accessToken });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
