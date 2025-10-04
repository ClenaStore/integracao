export async function buscarRecebimentos(token, dataInicial, horaInicial, dataFinal, horaFinal) {
  const base = process.env.URL_BASE_MERCATTO;

  // Formata datas e horas no padrão ISO (igual ao Postman)
  const inicio = `${dataInicial}T${horaInicial}:00`;
  const fim = `${dataFinal}T${horaFinal}:59`;

  // Corrige a query (sem "=" duplo após ge/le)
  const url = `${base}/api/v1/venda/cupons-fiscais?q=dataVenda=ge${inicio};dataVenda=le${fim}&start=0&count=1000`;

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("Erro HTTP:", resp.status, text);
    throw new Error("Erro ao buscar dados");
  }

  const data = await resp.json();

  // Caso não haja items, evita erro
  if (!data.items) return { totalRest: 0, totalEmp: 0 };

  // 🔹 Filtra apenas os caixas diferentes de 1 a 5 e horário entre 08h e 16h
  const almoco = data.items.filter(item => {
    const caixa = parseInt(item.numeroCaixa);
    const hora = parseInt(item.hora?.substring(0, 2)) || 0;
    return caixa > 5 && hora >= 8 && hora < 16;
  });

  // 🔹 Separa por lojaId
  const restaurante = almoco.filter(i => i.lojaId === 1);
  const emporio = almoco.filter(i => i.lojaId === 2);

  // 🔹 Soma os valores
  const totalRest = restaurante.reduce((acc, i) => acc + (i.valor || 0), 0);
  const totalEmp = emporio.reduce((acc, i) => acc + (i.valor || 0), 0);

  return { totalRest, totalEmp };
}
