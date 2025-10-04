export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { token, dataInicio, dataFim, horaInicio, horaFim } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Token não informado' });

  // Monta o intervalo pedido (a API aceita com tempo; se ignorar o tempo, a gente filtra no front)
  const q = `dataVenda=ge=${dataInicio}T${(horaInicio || '00:00')}:00;dataVenda=le=${dataFim}T${(horaFim || '23:59')}:59`;

  const base = `https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais`;
  const pageSize = 200;

  let start = 0;
  let allItems = [];
  let totalEsperado = null;

  try {
    while (true) {
      const url = `${base}?start=${start}&q=${encodeURIComponent(q)}&count=${pageSize}`;
      const r = await fetch(url, { headers: { 'Authorization': token, 'Accept': 'application/json' } });
      if (!r.ok) {
        const t = await r.text();
        return res.status(r.status).send(t);
      }
      const data = await r.json();
      const items = data.items || [];
      allItems = allItems.concat(items);

      // total vem da API; usamos para saber quando parar
      totalEsperado = totalEsperado ?? data.total;
      start += data.count || items.length;

      if (allItems.length >= totalEsperado || items.length === 0) break;
    }

    // Retorno compatível com o “json puro” esperado no index
    return res.status(200).json({
      start: 0,
      count: allItems.length,
      total: allItems.length,
      items: allItems
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao buscar recebimentos', details: e.message });
  }
}
