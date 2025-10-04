export async function buscarRecebimentos(accessToken, dataInicial, horaInicial, dataFinal, horaFinal) {
  const di = `${dataInicial}T${horaInicial}:00`;
  const df = `${dataFinal}T${horaFinal}:59`;

  const url = `https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais?q=dataVenda=ge=${di};dataVenda=le=${df}&start=0&count=100`;

  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': accessToken,
      'Accept': 'application/json'
    }
  });

  if (!resp.ok) throw new Error('Erro ao buscar dados');
  return await resp.json();
}
