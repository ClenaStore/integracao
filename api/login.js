export async function loginVarejo() {
  const xmlBody = `
  <?xml version="1.0" encoding="UTF-8"?>
  <Usuario>
    <username>NALBERT SOUZA</username>
    <password>99861</password>
  </Usuario>
  `;

  const resp = await fetch('https://mercatto.varejofacil.com/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      'Accept': 'application/json'
    },
    body: xmlBody
  });

  if (!resp.ok) throw new Error('Falha no login');
  const data = await resp.json();
  return data.accessToken;
}
