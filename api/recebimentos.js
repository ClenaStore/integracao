export default async function handler(req, res) {
  const { dataInicial, dataFinal } = req.query;
  const token = req.headers["authorization"]; // vem direto do front

  try {
    const response = await fetch(
      `https://mercatto.varejofacil.com/api/v1/pdv/recebimentos?dataInicial=${dataInicial}&dataFinal=${dataFinal}&start=0&count=2000`,
      {
        method: "GET",
        headers: {
          "Authorization": token,   // 🔹 aqui sem Bearer
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
