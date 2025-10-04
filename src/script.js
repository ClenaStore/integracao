async function login() {
  const resp = await fetch("/api/login", { method: "POST" });
  const data = await resp.json();
  if (data.token) {
    localStorage.setItem("accessToken", data.token);
  } else {
    alert("Erro ao logar");
  }
}

async function filtrar() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    await login();
  }

  const dataInicial = document.getElementById("dataInicial").value;
  const dataFinal = document.getElementById("dataFinal").value;

  const resp = await fetch(`/api/recebimentos?dataInicial=${dataInicial}&dataFinal=${dataFinal}`, {
    headers: { "Authorization": localStorage.getItem("accessToken") }
  });

  const dados = await resp.json();
  console.log(dados);

  // separa restaurante e empório
  const restaurante = dados.items.filter(i => parseInt(i.numeroCaixa) > 4);
  const emporio = dados.items.filter(i => parseInt(i.numeroCaixa) <= 4);

  document.getElementById("restaurante-dados").innerText = JSON.stringify(restaurante, null, 2);
  document.getElementById("emporio-dados").innerText = JSON.stringify(emporio, null, 2);
}

window.onload = () => {
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("dataInicial").value = hoje;
  document.getElementById("dataFinal").value = hoje;
};
