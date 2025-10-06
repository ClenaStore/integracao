// /api/recebimentos.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { token, dataInicio, dataFim } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token de autenticação ausente" });
    }

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: "Datas de início e fim são obrigatórias" });
    }

    // 🔧 Define horas automáticas (como no index)
    const horaInicio = "00:00:00";
    const horaFim = "23:59:59";

    // 🔧 Formata datas e horas no padrão ISO esperado pela API
    const inicioFormatado = `${dataInicio}T${horaInicio}`;
    const fimFormatado = `${dataFim}T${horaFim}`;

    console.log("🔍 Filtro de datas e horas automáticas:");
    console.log("Início:", inicioFormatado);
    console.log("Fim:", fimFormatado);

    // ✅ Nova URL do Varejo Fácil
    const baseURL = "https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais";
    const count = 200;
    let start = 0;
    let allItems = [];

    while (true) {
      const url = `${baseURL}?start=${start}&count=${count}&q=dataVenda=ge=${inicioFormatado};dataVenda=le=${fimFormatado}`;
      console.log(`📡 Buscando página: ${url}`);

      const response = await fetch(url, {
        headers: {
          Authorization: token,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const erro = await response.text();
        console.error("❌ Erro na API:", erro);
        return res.status(response.status).json({ error: erro });
      }

      const json = await response.json();

      if (!json.items || json.items.length === 0) {
        console.log("📭 Nenhum resultado encontrado nesta página.");
        break;
      }

      allItems = allItems.concat(json.items);
      start += count;

      if (json.items.length < count) break; // terminou
      if (start > 5000) break; // segurança
    }

    console.log(`✅ Total de cupons retornados: ${allItems.length}`);

    res.status(200).json({
      start: 0,
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
