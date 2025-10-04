export const config = { runtime: 'edge' };

export default async function handler(req) {
  const VAREJO_URL  = process.env.VAREJO_URL;
  const VAREJO_USER = process.env.VAREJO_USER;
  const VAREJO_PASS = process.env.VAREJO_PASS;

  if (!VAREJO_URL || !VAREJO_USER || !VAREJO_PASS) {
    return new Response(JSON.stringify({ error: 'Missing env vars' }), { status: 500 });
  }

  try {
    const r = await fetch(`${VAREJO_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
      body: JSON.stringify({ username: VAREJO_USER, password: VAREJO_PASS })
    });
    if (!r.ok) {
      const t = await r.text();
      return new Response(JSON.stringify({ error: 'auth_failed', detail: t }), { status: r.status });
    }
    const json = await r.json();
    return new Response(JSON.stringify(json), { status: 200, headers: { 'Content-Type':'application/json' }});
  } catch (e) {
    return new Response(JSON.stringify({ error: 'auth_exception', detail: String(e) }), { status: 500 });
  }
}
