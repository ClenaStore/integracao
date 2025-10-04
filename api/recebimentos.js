export const config = { runtime: 'edge' };

// cache simples por instância do runtime (pode expirar a qualquer momento)
let cachedToken = null;
let tokenTime = 0;
const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutos

async function getToken() {
  const now = Date.now();
  if (cachedToken && now - tokenTime < TOKEN_TTL_MS) return cachedToken;

  const r = await fetch(`${new URL(reqUrl('/api/login')).toString()}`);
  // OBS: em runtime Edge não temos base URL. Construiremos de forma robusta no handler abaixo.
  return null;
}

// como estamos no edge, vamos chamar /api/login via URL absoluta construída no handler
async function doLoginAbsolute(origin) {
  const r = await fetch(`${origin}/api/login`);
  if (!r.ok) throw new Error(`login_failed_${r.status}`);
  const j = await r.json();
  return j?.accessToken;
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const dataInicial = searchParams.get('dataInicial');
  const dataFinal   = searchParams.get('dataFinal');
  const start       = searchParams.get('start') || '0';
  const count       = searchParams.get('count') || '100';

  const VAREJO_URL = process.env.VAREJO_URL;
  if (!VAREJO_URL) {
    return new Response(JSON.stringify({ error: 'Missing VAREJO_URL' }), { status: 500 });
  }

  try {
    // garante token
    const origin = new URL(req.url).origin;
    if (!cachedToken || (Date.now() - tokenTime) > TOKEN_TTL_MS) {
      cachedToken = await doLoginAbsolute(origin);
      tokenTime = Date.now();
    }

    const qs = new URLSearchParams({
      datainicial: dataInicial,
      dataFinal: dataFinal,
      start: String(start),
      count: String(count)
    });

    let r = await fetch(`${VAREJO_URL}/api/v1/pdv/recebimentos?${qs.toString()}`, {
      headers: {
        'Authorization': `Bearer ${cachedToken}`,
        'Accept': 'application/json'
      }
    });

    // token expirou? tenta uma vez renovar
    if (r.status === 401) {
      cachedToken = await doLoginAbsolute(origin);
      tokenTime = Date.now();
      r = await fetch(`${VAREJO_URL}/api/v1/pdv/recebimentos?${qs.toString()}`, {
        headers: { 'Authorization': `Bearer ${cachedToken}`, 'Accept':'application/json' }
      });
    }

    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: 'fetch_failed', status: r.status, detail: txt }), { status: r.status });
    }

    const json = await r.json();
    return new Response(JSON.stringify(json), { status: 200, headers: { 'Content-Type':'application/json' }});
  } catch (e) {
    return new Response(JSON.stringify({ error: 'exception', detail: String(e) }), { status: 500 });
  }
}
