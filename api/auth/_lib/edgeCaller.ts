import { signBody } from '@/app/lib/hmac';

export async function callEdge(actionPath: string, bodyObj: any) {
  const EDGE_BASE = process.env.SUPABASE_EDGE_FUNCTIONS_URL;
  const SECRET = process.env.EDGE_HMAC_SECRET;
  if (!EDGE_BASE) throw new Error('SUPABASE_EDGE_FUNCTIONS_URL not set');
  if (!SECRET) throw new Error('EDGE_HMAC_SECRET not set');

  const body = JSON.stringify(bodyObj);
  const sig = signBody(body, SECRET);
  const url = `${EDGE_BASE.replace(/\/$/, '')}/${actionPath.replace(/^\//, '')}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-edge-hmac': sig,
    },
    body,
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: res.status, body: json };
}
