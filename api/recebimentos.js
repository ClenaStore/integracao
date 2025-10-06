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

    // 🔧 Formata datas e horas no padrão ISO esperado pela API
    // Exemplo: 2025-10-01T08:00:00
    const inicioFormatado = `${dataInicio}T${horaInicio}:00`;
    const fimFormatado = `${dataFim}T${horaFim}:59`;

    // Garante que o formato tenha 2 dígitos
    const normalizar = (v) => (v.length === 1 ? `0${v}` : v);

    console.log("🔍 Filtro de datas e horas:");
    console.log("Início:", inicioFormatado);
    console.log("Fim:", fimFormatado);

    // Monta a query da API com o formato exato usado pelo Varejo Fácil
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
