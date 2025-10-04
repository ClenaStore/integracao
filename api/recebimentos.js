import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido" });

  const { dataInicial, dataFinal } = req.query;

  try {
    // Faz login automático
    const login = await axios.post("https://mercatto.varejofacil.com/api/auth", {
      username: process.env.API_USER,
      password: process.env.API_PASS
    }, {
      headers: { "Content-Type": "application/json" }
    });

    const token = login.data.accessToken;

    // Busca os recebimentos com o token
    const response = await axios.get(
      `https://mercatto.varejofacil.com/api/v1/pdv/recebimentos?dataInicial=${dataInicial}&dataFinal=${dataFinal}&start=0&count=1000`,
      { headers: { Authorization: token, Accept: "application/json" } }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar recebimentos", details: error.message });
  }
}
