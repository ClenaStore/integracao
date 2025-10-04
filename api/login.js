export default async function handler(req, res) {
  try {
    const response = await fetch("https://mercatto.varejofacil.com/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.MERCATTO_USER,
        password: process.env.MERCATTO_PASS
      })
    });

    if (!response.ok) throw new Error("Falha no login");

    const data = await response.json();
    res.status(200).json({ token: data.accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
