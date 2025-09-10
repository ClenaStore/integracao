// /api/varejo/recebimentos.js
export default async function handler(req, res) {
  const { data, estab } = req.query;
  const baseUrl = process.env.VAREJO_FACIL_URL;
  const clientId = process.env.VAREJO_FACIL_CLIENT_ID;
  const clientSecret = process.env.VAREJO_FACIL_CLIENT_SECRET;

  try {
    // 1. Obter token
    const tokenResp = await fetch(`${baseUrl}/auth/app/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
    });
    const { access } = await tokenResp.json();

    // 2. Se não tiver estab, buscar lista de estabelecimentos
    if (!estab) {
      const estabResp = await fetch(`${baseUrl}/cadastro/v1/estabelecimento/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const estabs = await estabResp.json();
      return res.status(200).json(estabs);
    }

    // 3. Buscar vendas do dia para o estabelecimento
    const inicio = `${data} 00:00:00`;
    const fim = `${data} 23:59:59`;

    const vendasResp = await fetch(
      `${baseUrl}/financeiro/v1/estabelecimento/${estab}/venda/?dthremissao_inicio=${inicio}&dthremissao_fim=${fim}`,
      { headers: { Authorization: `Bearer ${access}` } }
    );
    const vendas = await vendasResp.json();

    // 4. Normalizar recebimentos
    let recebimentos = [];
    vendas.forEach((v) => {
      if (Array.isArray(v.formaspgto)) {
        v.formaspgto.forEach((fp) => {
          recebimentos.push({
            data: v.dtmovimento,
            forma: fp.descricao || "Desconhecido",
            valor: parseFloat(fp.valor) || 0,
            historico: v.cupom?.nomeadquirente || "Venda",
          });
        });
      } else if (v.formaspgto) {
        recebimentos.push({
          data: v.dtmovimento,
          forma: v.formaspgto.descricao || "Desconhecido",
          valor: parseFloat(v.formaspgto.valor) || 0,
          historico: v.cupom?.nomeadquirente || "Venda",
        });
      }
    });

    res.status(200).json(recebimentos);
  } catch (err) {
    console.error("Erro API:", err);
    res.status(500).json({ error: "Erro ao consultar API Varejo Fácil" });
  }
}
