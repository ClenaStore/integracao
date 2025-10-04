// Camada de front que chama as rotas serverless hospedadas no Vercel

export async function buscarRecebimentos({ dataInicial, dataFinal, start=0, count=100 }) {
  const qs = new URLSearchParams({ dataInicial, dataFinal, start, count });
  const res = await fetch(`/api/recebimentos?${qs.toString()}`, {
    headers: { 'Accept':'application/json' },
  });
  if (!res.ok) throw new Error(`Recebimentos falharam: ${res.status}`);
  return res.json();
}

export function formatBRL(v) {
  try {
    return Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch { return String(v); }
}
