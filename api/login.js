// api/login.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const response = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_USERNAME,
        password: process.env.VAREJO_PASSWORD
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: "Falha no login", detail: text });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Erro interno no login", detail: error.message });
  }
}
