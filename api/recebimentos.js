// /api/recebimentos.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { token, dataInicio, dataFim, horaInicio, horaFim } = req.body;
    if (!token) return res.status(400).json({ error: "Token ausente" });

    const delay = ms => new Promise(r=>setTimeout(r,ms));
    async function fetchWithRetry(url, options, retries=3){
      for(let i=0;i<retries;i++){
        const r = await fetch(url, options);
        const t = await r.text();
        if (r.ok) return JSON.parse(t);
        if (t.includes("limite de acesso")) { await delay(5000); continue; }
        throw new Error(t);
      }
      throw new Error("Falha após múltiplas tentativas");
    }

    const inicio = `${dataInicio}T${horaInicio}:00`;
    const fim    = `${dataFim}T${horaFim}:59`;
    const base   = "https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais";
    const count  = 200;

    let start=0, pagina=1, items=[];
    while(true){
      const url = `${base}?start=${start}&count=${count}&q=dataVenda=ge=${inicio};dataVenda=le=${fim}`;
      const json = await fetchWithRetry(url, { headers:{ Authorization: token, Accept:'application/json'}});
      if (!json.items || json.items.length===0) break;
      items = items.concat(json.items);
      start += count; pagina++;
      if (json.items.length < count) break;
      await delay(1000);
    }

    res.status(200).json({ total: items.length, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
