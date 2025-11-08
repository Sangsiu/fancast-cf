export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);

  const keyCategory = url.searchParams.get("keyCategory") ?? "627";
  const typeSort = url.searchParams.get("typeSort") ?? "1";
  const typePeriod = url.searchParams.get("typePeriod") ?? "1";

  const api = "https://api.fanca.io/event/nominee";
  const upstream = new URL(api);
  upstream.searchParams.set("keyCategory", keyCategory);
  upstream.searchParams.set("typeSort", typeSort);
  upstream.searchParams.set("typePeriod", typePeriod);

  const headers = {
    "user-agent": "Dart/3.7 (dart:io)",
    "x-api-token": env.X_API_TOKEN,
    "fingerprint": env.X_FINGERPRINT,
    "accept": "application/json, text/plain, */*",
    "connection": "Keep-Alive",
    "content-type": "application/json",
  };

  const r = await fetch(upstream.toString(), { headers });
  const text = await r.text();
  let parsed: any;
  try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

  const list = parsed.data || parsed.list || parsed.results || [];
  const nominee = (Array.isArray(list) ? list : []).map((it: any, i: number) => ({
    keyNominee: it.keyNominee ?? String(i + 1),
    rank: it.rank ?? i + 1,
    subject: it.subject ?? it.name ?? "-",
    etc: it.etc ?? it.brand ?? "",
    count: it.count ?? it.votes ?? 0,
    percent: it.percent ?? 0,
  }));

  return new Response(JSON.stringify({ nominee }, null, 2), {
    headers: { "content-type": "application/json" },
  });
}
