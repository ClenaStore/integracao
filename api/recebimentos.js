export async function buscarRecebimentos(token, dataInicial, horaInicial, dataFinal, horaFinal) {
  const base = process.env.URL_BASE_MERCATTO;
  const inicio = `${dataInicial}T${horaInicial}:00`;
  const fim = `${dataFinal}T${horaFinal}:59`;

  const url = `${base}/api/v1/venda/cupons-fiscais?q=dataVenda=ge=${inicio};dataVenda=le=${fim}&start=0&count=1000`;

  const resp = await fetch(url, {
    headers: {
      "Authorization": token,
      "Accept": "application/json",
    },
  });

  if (!resp.ok) throw new Error("Erro ao buscar dados");

  const data = await resp.json();
  console.log('Total bruto:', data.total);

  // 🔹 Filtra os caixas diferentes de 1 a 5 e apenas entre 08h e 16h
  const almoco = data.items.filter(item => {
    const caixa = parseInt(item.numeroCaixa);
    const hora = parseInt(item.hora?.substring(0, 2)) || 0;
    return caixa > 5 && hora >= 8 && hora < 16;
  });

  console.log('Total de almoços filtrados:', almoco.length);
  console.table(almoco.map(i => ({ data: i.data, caixa: i.numeroCaixa, valor: i.valor })));
}
