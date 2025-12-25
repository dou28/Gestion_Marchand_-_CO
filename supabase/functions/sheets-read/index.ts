import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { GoogleJwt } from "https://deno.land/x/google_jwt@v1.0.4/mod.ts";

async function getAccessToken() {
  const jwt = new GoogleJwt({
    email: Deno.env.get("GOOGLE_SA_EMAIL")!,
    key: Deno.env.get("GOOGLE_SA_PRIVATE_KEY")!,
    scopes: (Deno.env.get("GOOGLE_SA_SCOPES") || "").split(" "),
  });
  return await jwt.getToken();
}

serve(async (req) => {
  const fileId = req.headers.get('x-file-id');
  const range = req.headers.get('x-range') ?? 'A:Z';
  if (!fileId) return new Response("missing fileId", { status: 400 });

  const token = await getAccessToken();
  const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await resp.json();
  if (!resp.ok) return new Response(JSON.stringify(json), { status: resp.status });
  return new Response(JSON.stringify({ values: json.values ?? [] }), { headers: { "Content-Type": "application/json" } });
});
