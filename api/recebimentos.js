// /api/recebimentos.js
// Consolida cupons-fiscais por finalizadora, separando:
// - EMPÓRIO = caixas 001..005
// - RESTAURANTE = demais caixas
// "Almoço Mercatto" = vendas de caixas fora 001..005 entre 08:00 e 16:00.
// Usa FIQL: /v1/venda/cupons-fiscais?q=dataVenda=ge=...;dataVenda=le=...

const FINALIZADORAS = {
  1:"dinheiro",2:"crédito",3:"débito",4:"pix",5:"consumo interno",12:"débito",
  13:"pix",14:"dinheiro",15:"pix",16:"pix",17:"crédito",18:"débito",
  19:"online",20:"boleto",21:"boleto",22:"boleto",23:"boleto",24:"boleto",
  25:"boleto",26:"crediário",27:"consumo sócio",28:"boleto",29:"voucher",
  30:"online",31:"online",32:"online",33:"voucher",34:"marketing",35:"voucher",36:"outros"
};

export default async function handler(req, res) {
  try {
    const { dataIni, dataFim } = req.query;
    if (!dataIni || !dataFim) {
      return res.status(400).json({ error: "Parâmetros dataIni e dataFim são obrigatórios (YYYY-MM-DDTHH:mm:ss)." });
    }

    // 1) Login
    const user = process.env.MERCATTO_USER;
    const pass = process.env.MERCATTO_PASS;
    if (!user || !pass) {
      return res.status(500).json({ error: "Credenciais não configuradas (MERCATTO_USER / MERCATTO_PASS)." });
    }

    const login = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });

    if (!login.ok) {
      const msg = await login.text();
      return res.status(login.status).json({ error: "Falha no login", detail: msg });
    }

    const { accessToken } = await login.json();
    if (!accessToken) return res.status(500).json({ error: "accessToken ausente na resposta de login." });

    // 2) Paginação em /v1/venda/cupons-fiscais
    const q = `dataVenda=ge=${dataIni};dataVenda=le=${dataFim}`;
    const count = 300;
    let start = 0;
    let total = 0;
    const all = [];

    do {
      const url = `https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais?q=${encodeURIComponent(q)}&start=${start}&count=${count}`;
      const r = await fetch(url, {
        headers: {
          "Accept": "application/json",
          // IMPORTANTE: no seu Postman, Authorization usa APENAS o token (sem "Bearer")
          "Authorization": accessToken
        }
      });

      if (!r.ok) {
        const t = await r.text();
        return res.status(r.status).json({ error: "Erro ao consultar cupons-fiscais", detail: t });
      }

      const json = await r.json();
      total = json?.total ?? 0;
      const items = json?.items ?? [];
      all.push(...items);
      start += count;

      // proteção para não estourar limites involuntariamente
      if (start > 15000) break;
    } while (start < total);

    // 3) Agregação
    const out = { restaurante: {}, emporio: {}, almoco: 0, itens: all.length };

    for (const item of all) {
      const cx = parseInt(item?.numeroCaixa ?? "0", 10);
      const destino = (cx >= 1 && cx <= 5) ? "emporio" : "restaurante";

      // horário de fechamento do cupom
      const dt =
        item?.dataHoraFechamentoCupom ||
        item?.dataHoraFechamentoRecebimento ||
        item?.dataHoraFechamento ||
        item?.dataVenda; // fallback

      let hora = null;
      if (dt) {
        const h = new Date(dt);
        if (!isNaN(h)) hora = h.getHours();
      }

      // Almoço (caixas fora de 1..5) entre 08:00 e 16:00 (inclusive)
      if (cx > 5 && hora !== null && hora >= 8 && hora <= 16) {
        const vCupom = Number(item?.valor ?? 0);
        out.almoco += vCupom;
      }

      // Finalizações -> categorias
      const fins = Array.isArray(item?.finalizacoes) ? item.finalizacoes : [];
      for (const f of fins) {
        const cat = FINALIZADORAS[f?.finalizadoraId] || "outros";
        const v = Number(f?.valor ?? 0);
        out[destino][cat] = (out[destino][cat] || 0) + v;
      }
    }

    // arredonda 2 casas
    const round2 = v => Math.round((v + Number.EPSILON) * 100) / 100;
    out.almoco = round2(out.almoco);
    for (const sec of ["restaurante","emporio"]) {
      for (const k of Object.keys(out[sec])) out[sec][k] = round2(out[sec][k]);
    }

    res.status(200).json(out);
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro inesperado." });
  }
}
