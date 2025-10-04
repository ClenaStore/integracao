import { login } from "./login.js";

const API_URL = process.env.API_URL || "https://mercatto.varejofacil.com/api";

const categorias = {
  "dinheiro": "💵",
  "crédito": "💳",
  "débito": "🏧",
  "consumo interno": "🍽️",
  "online": "🌐",
  "bonificação": "🎁",
  "pix": "⚡",
  "voucher": "🎟️",
  "boleto": "📦",
  "crediário": "📒",
  "catálogo delivery": "📱",
  "consumo sócio": "👥",
  "marketing": "📢",
  "transferência bancária": "🏦",
  "erros garçom": "🧾",
  "sem faturamento": "🚫",
  "outros": "❇️"
};

const finalizadoras = {
  1:"dinheiro",2:"crédito",3:"débito",4:"pix",5:"consumo interno",12:"débito",
  13:"pix",14:"dinheiro",15:"pix",16:"pix",17:"crédito",18:"débito",
  19:"online",20:"boleto",21:"boleto",22:"boleto",23:"boleto",24:"boleto",
  25:"boleto",26:"crediário",27:"consumo sócio",28:"boleto",29:"voucher",
  30:"online",31:"online",32:"online",33:"voucher",34:"marketing",35:"voucher",36:"outros"
};

async function buscarRecebimentos(token, ini, fim) {
  const url = `${API_URL}/v1/pdv/recebimentos?q=data=ge=${ini};data=le=${fim}&sort=data&start=0&count=1000`;
  const resp = await fetch(url, {
    headers: {
      "Authorization": token,
      "Accept": "application/json"
    }
  });
  if (!resp.ok) throw new Error("Erro ao buscar recebimentos");
  return await resp.json();
}

function processar(json) {
  const result = { restaurante: {}, emporio: {}, almoco: 0 };

  json.items.forEach(item => {
    const caixa = parseInt(item.numeroCaixa);
    const destino = (caixa >= 1 && caixa <= 4) ? "emporio" : "restaurante";

    const dataHora = new Date(item.dataHoraFechamentoRecebimento);
    const hora = dataHora.getHours();

    // Almoço = caixas > 5 entre 08:00 e 16:00
    if (caixa > 5 && hora >= 8 && hora < 16) {
      result.almoco += item.valor;
    }

    item.finalizacoes.forEach(fin => {
      const cat = finalizadoras[fin.finalizadoraId] || "outros";
      if (!result[destino][cat]) result[destino][cat] = 0;
      result[destino][cat] += fin.valor;
    });
  });

  return result;
}

function render(dados) {
  document.getElementById("erro").textContent = "";

  ["restaurante","emporio"].forEach(sec => {
    const div = document.getElementById(`${sec}-valores`);
    div.innerHTML = "";
    const catVals = dados[sec];
    Object.keys(catVals).forEach(cat => {
      if (catVals[cat] > 0) {
        const linha = document.createElement("div");
        linha.className = "linha";
        linha.innerHTML = `${categorias[cat]||"❇️"} <span>${cat.toUpperCase()}:</span> R$ ${catVals[cat].toFixed(2)}`;
        div.appendChild(linha);
      }
    });
  });

  if (dados.almoco > 0) {
    document.getElementById("almoco-valores").innerHTML =
      `🍽️ ALMOÇO MERCATTO: R$ ${dados.almoco.toFixed(2)}`;
  } else {
    document.getElementById("almoco-valores").innerHTML = "";
  }
}

export async function carregar() {
  document.getElementById("overlay").style.display = "flex";
  try {
    const ini = document.getElementById("dataInicial").value;
    const fim = document.getElementById("dataFinal").value;
    const token = await login();
    const dados = await buscarRecebimentos(token, ini, fim);
    const proc = processar(dados);
    render(proc);
  } catch (err) {
    document.getElementById("erro").textContent = err.message;
  } finally {
    document.getElementById("overlay").style.display = "none";
  }
}

// inicializa datas
const hoje = new Date().toISOString().split("T")[0];
document.getElementById("dataInicial").value = hoje;
document.getElementById("dataFinal").value = hoje;
