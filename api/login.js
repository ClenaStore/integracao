export async function login() {
  const user = process.env.MERCATTO_USER;
  const pass = process.env.MERCATTO_PASS;
  const url = `${process.env.URL_BASE_MERCATTO}/api/auth`;

  const xml = `
  <Usuario>
    <username>${user}</username>
    <password>${pass}</password>
  </Usuario>`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
      "Accept": "application/json",
    },
    body: xml,
  });

  if (!resp.ok) throw new Error("Falha no login");
  const data = await resp.json();
  return data.accessToken;
}
