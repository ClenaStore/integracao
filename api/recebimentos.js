export default async function handler(req, res) {
  try {
    const { dataIni, dataFim } = req.query;

    // 1️⃣ Login
    const loginResp = await fetch("https://mercatto.varejofacil.com/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.MERCATTO_USER,
        password: process.env.MERCATTO_PASS
      })
    });

    const loginData = await loginResp.json();
    const token = loginData.accessToken;
    if (!token) throw new Error("Token inválido");

    // 2️⃣ Endpoint correto (cupons-fiscais)
    const url = `https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais?q=dataVenda=ge=${dataIni};dataVenda=le=${dataFim}&start=0&count=1000`;

    const resp = await fetch(url, {
      headers: {
        Authorization: token,
        Accept: "application/json"
      }
    });

    if (!resp.ok) throw new Error("Erro ao consultar API");
    const dados = await resp.json();

    // 3️⃣ Processamento (separa restaurante / empório e almoço)
    const finalizadoras = {
      1:"dinheiro",2:"crédito",3:"débito",4:"pix",5:"consumo interno",12:"débito",
      13:"pix",14:"dinheiro",15:"pix",16:"pix",17:"crédito",18:"débito",
      19:"online",20:"boleto",21:"boleto",22:"boleto",23:"boleto",24:"boleto",
      25:"boleto",26:"crediário",27:"consumo sócio",28:"boleto",29:"voucher",
      30:"online",31:"online",32:"online",33:"voucher",34:"marketing",35:"voucher",36:"outros"
    };

    const resultado = { restaurante: {}, emporio: {}, almoco: 0 };

    dados.items.forEach(item => {
      const caixa = parseInt(item.numeroCaixa);
      const destino = (caixa >= 1 && caixa <= 5) ? "emporio" : "restaurante";

      const hora = new Date(item.dataHoraFechamentoCupom).getHours();
      if (caixa > 5 && hora >= 8 && hora <= 16) {
        resultado.almoco += item.valor;
      }

      item.finalizacoes.forEach(fin => {
        const cat = finalizadoras[fin.finalizadoraId] || "outros";
        if (!resultado[destino][cat]) resultado[destino][cat] = 0;
        resultado[destino][cat] += fin.valor;
      });
    });

    res.status(200).json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
