export default async function handler(req,res){
  if(req.method!=="POST"){
    return res.status(405).json({error:"Método não permitido"});
  }
  try{
    const r=await fetch("https://mercatto.varejofacil.com/api/auth",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        username:process.env.API_USER,
        password:process.env.API_PASS
      })
    });
    const data=await r.json();
    res.status(200).json(data);
  }catch(e){
    res.status(500).json({error:"Erro no login"});
  }
}
