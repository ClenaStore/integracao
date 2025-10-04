import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const response = await axios.post("https://mercatto.varejofacil.com/api/auth", {
      username: process.env.API_USER,
      password: process.env.API_PASS
    }, {
      headers: { "Content-Type": "application/json" }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ error: "Erro no login", details: error.message });
  }
}
