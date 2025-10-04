export async function login() {
  const url = "https://mercatto.varejofacil.com/api/auth";
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<Usuario>
  <username>NALBERT SOUZA</username>
  <password>99861</password>
</Usuario>`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
      "Accept": "application/json"
    },
    body
  });

  if (!resp.ok) throw new Error("Erro no login");

  const data = await resp.json();
  return data.accessToken;
}
