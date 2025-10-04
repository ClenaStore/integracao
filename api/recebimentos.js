// /api/recebimentos.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { token, dataInicio, dataFim, horaInicio, horaFim } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token de autenticação ausente" });
    }

    // Monta base da URL (a API do Varejo Fácil usa paginação via start e count)
    const baseURL = `https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais`;
    const query = `q=dataVenda=ge=${dataInicio}T${horaInicio}:00;dataVenda=le=${dataFim}T${horaFim}:59`;
    const count = 200;

    let start = 0;
    let allItems = [];
    let loopCount = 0;

    // 🔁 Loop que busca todas as páginas até acabar
    while (true) {
      const url = `${baseURL}?start=${start}&${query}&count=${count}`;
      console.log(`🔎 Buscando página ${loopCount + 1} (${url})`);

      const response = await fetch(url, {
        headers: {
          Authorization: token,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
      }

      const json = await response.json();
      if (!json.items || json.items.length === 0) break;

      allItems = allItems.concat(json.items);
      start += count;
      loopCount++;

      // Se vier menos de 200, acabou
      if (json.items.length < count) break;

      // Evita loop infinito (limite de segurança)
      if (loopCount > 200) break;
    }

    console.log(`✅ Total de cupons retornados: ${allItems.length}`);

    res.status(200).json({
      total: allItems.length,
      items: allItems,
    });

  } catch (error) {
    console.error("❌ Erro no recebimentos.js:", error);
    res.status(500).json({
      error: "Falha ao consultar API de recebimentos",
      details: error.message,
    });
  }
}
