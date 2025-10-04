export async function buscarRecebimentos(token, dataInicial, horaInicial, dataFinal, horaFinal) {
  const inicio = `${dataInicial}T${horaInicial}:00`;
  const fim = `${dataFinal}T${horaFinal}:59`;

  const url = `https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais?q=dataVenda=ge=${inicio};dataVenda=le=${fim}&start=0&count=1000`;

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  });

  if (!resp.ok) {
    const erro = await resp.text();
    console.error("Erro API:", resp.status, erro);
    throw new Error("Erro ao buscar dados");
  }

  const data = await resp.json();
  if (!data.items) return { rest: 0, emp: 0 };

  // 🔹 Separa lojas
  const restaurante = data.items.filter(i => i.lojaId === 1);
  const emporio = data.items.filter(i => i.lojaId === 2);

  // 🔹 Soma os valores
  const rest = restaurante.reduce((t, i) => t + (i.valor || 0), 0);
  const emp = emporio.reduce((t, i) => t + (i.valor || 0), 0);

  return { rest, emp };
}
