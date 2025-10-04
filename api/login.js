export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const response = await fetch("https://mercatto.varejofacil.com/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: process.env.VAREJO_USER,
          password: process.env.VAREJO_PASS
        })
      });

      const data = await response.json();

      if (data.accessToken) {
        // Retorna token puro
        return res.status(200).json({ token: data.accessToken });
      } else {
        return res.status(401).json({ error: "Login falhou", data });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
