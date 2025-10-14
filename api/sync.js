// /api/sync.js
import fetch from "node-fetch";

const EMPRESAS = [
  { nome: "CARNEIRO MERCATTO", chave: "VAREJO_URL_MERCATTO" },
  { nome: "DELICIA GOURMET", chave: "VAREJO_URL_DELICIA" },
  { nome: "PADARIA DELICIA", chave: "VAREJO_URL_PADARIA" },
  { nome: "VILLA GOURMET", chave: "VAREJO_URL_VILLA" },
];

function hojeISO() {
  const agora = new Date();
  return agora.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  const data = req.query.data || hojeISO();
  const resultados = [];
  const inicio = Date.now();

  try {
    for (const emp of EMPRESAS) {
      const iniEmp = Date.now();
      console.log(`🔹 Iniciando ${emp.nome} (${emp.chave})`);

      try {
        // 1️⃣ LOGIN
        const loginResp = await fetch(`${process.env.BASE_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empresa: emp.chave }),
        });
        const loginData = await loginResp.json();
        const token = loginData.accessToken || loginData.token;
        if (!token) throw new Error("Token não retornado.");

        // 2️⃣ BUSCAR CUPONS
        const cuponsResp = await fetch(`${process.env.BASE_URL}/api/recebimentos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            empresa: emp.chave,
            dataInicio: data,
            dataFim: data,
          }),
        });
        const cuponsData = await cuponsResp.json();
        if (!cuponsData.items) throw new Error("Sem retorno de itens.");

        const total = cuponsData.items.reduce(
          (acc, v) => acc + Number(v.valorTotal || 0),
          0
        );

        // 3️⃣ GRAVAR NO FIRESTORE
        const saveResp = await fetch(`${process.env.BASE_URL}/api/firestore`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa: emp.nome,
            data,
            valor_total: total,
            resumo: {
              cupons: cuponsData.items.length,
            },
          }),
        });
        const saveRes = await saveResp.json();

        resultados.push({
          empresa: emp.nome,
          total,
          cupons: cuponsData.items.length,
          status: saveRes.success ? "✅ Gravado" : "⚠️ Falha Firestore",
          tempo: ((Date.now() - iniEmp) / 1000).toFixed(1) + "s",
        });

      } catch (e) {
        console.error(`❌ Erro em ${emp.nome}:`, e.message);
        resultados.push({
          empresa: emp.nome,
          erro: e.message,
          status: "❌ ERRO",
        });
      }
    }

    const duracao = ((Date.now() - inicio) / 1000).toFixed(1);
    console.log(`🟢 Finalizado em ${duracao}s`);
    return res.status(200).json({ data, duracao, resultados });

  } catch (e) {
    console.error("🔥 Erro geral no sync:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
