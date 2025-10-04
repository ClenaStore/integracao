export default async function handler(req,res){
  const {dataInicial,dataFinal}=req.query;
  try{
    // 1. Login automático
    const login=await fetch("https://mercatto.varejofacil.com/api/auth",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        username:process.env.API_USER,
        password:process.env.API_PASS
      })
    });
    const {accessToken}=await login.json();

    // 2. Buscar recebimentos
    const r=await fetch(`https://mercatto.varejofacil.com/api/v1/pdv/recebimentos?dataInicial=${dataInicial}&dataFinal=${dataFinal}&start=0&count=200`,{
      headers:{
        "Accept":"application/json",
        "Authorization":accessToken
      }
    });
    const dados=await r.json();
    res.status(200).json(dados);

  }catch(e){
    res.status(500).json({error:"Erro ao buscar recebimentos"});
  }
}
