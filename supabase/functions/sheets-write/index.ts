import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { GoogleJwt } from "https://deno.land/x/google_jwt@v1.0.4/mod.ts";

async function token() {
  const jwt = new GoogleJwt({
    email: Deno.env.get("GOOGLE_SA_EMAIL")!,
    key: Deno.env.get("GOOGLE_SA_PRIVATE_KEY")!,
    scopes: (Deno.env.get("GOOGLE_SA_SCOPES") || "").split(" "),
  });
  return await jwt.getToken();
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const { fileId, writes, idempotencyKey } = await req.json();
  if (!fileId || !Array.isArray(writes)) return new Response('bad body', { status: 400 });

  const body = { valueInputOption: "USER_ENTERED", data: writes };
  const t = await token();
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  if (!r.ok) return new Response(JSON.stringify({ error: j }), { status: r.status, headers: { "Content-Type": "application/json" } });
  return new Response(JSON.stringify({ ok: true, result: j, idempotencyKey }), { headers: { "Content-Type": "application/json" } });
});
