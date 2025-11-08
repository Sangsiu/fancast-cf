// functions/api/nominee.ts
export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const keyCategory = url.searchParams.get("keyCategory") ?? "627";
  const typeSort = url.searchParams.get("typeSort") ?? "1";
  const typePeriod = url.searchParams.get("typePeriod") ?? "1";

  const FANCA = "https://api.fanca.io/event/nominee";
  const upstream = new URL(FANCA);
  upstream.searchParams.set("keyCategory", keyCategory);
  upstream.searchParams.set("typeSort", typeSort);
  upstream.searchParams.set("typePeriod", typePeriod);

  const headers: Record<string, string> = {
    "user-agent": "Dart/3.7 (dart:io)",
    "x-api-token": env.X_API_TOKEN,
    connection: "Keep-Alive",
    "community-tab-index": "0",
    "accept-encoding": "gzip",
    "system-language": "en-US",
    "content-type": "application/json",
    "community-translate-type": "true",
    "app-ver": "1.0.35",
    "device-model": "2107113SI",
    flavor: "product",
    "build-mode": "release",
    "accept-language": "en-US",
    version: "1.0.35",
    device: "1",
    package: "com.contentsmadang.fancast",
    "os-ver": "9",
    brightness: "light",
    "community-display-type": "list",
    "select-language": "en",
    accept: "application/json, text/plain, */*",
    "cache-control": "no-cache",
    pragma: "no-cache",
    "x-requested-with": "XMLHttpRequest",
  };
  if (env.X_FINGERPRINT) headers["fingerprint"] = env.X_FINGERPRINT;

  const r = await fetch(upstream.toString(), { method: "GET", headers });
  const text = await r.text();
  let parsed: any; try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

  const src = Array.isArray(parsed) ? parsed : (parsed.data || parsed.list || parsed.results || parsed.items || []);
  let nominee = (Array.isArray(src) ? src : []).map((it: any, i: number) => ({
    keyNominee: it?.keyNominee ?? it?.id ?? it?.key ?? String(i + 1),
    rank:       it?.rank ?? it?.position ?? it?.order ?? it?.sort ?? (i + 1),
    subject:    it?.subject ?? it?.name ?? it?.title ?? it?.nomineeName ?? it?.stageName ?? "-",
    etc:        it?.etc ?? it?.brand ?? it?.group ?? it?.team ?? it?.category ?? "",
    count:      it?.count ?? it?.votes ?? it?.voteCount ?? it?.point ?? it?.total ?? 0,
    percent:    typeof it?.percent === "number" ? it.percent : undefined,
  }));

  if (nominee.length && !nominee.some((n: any) => typeof n.percent === "number")) {
    const total = nominee.reduce((s: number, n: any) => s + (Number(n.count) || 0), 0);
    nominee = nominee.map((n: any) => ({
      ...n,
      percent: total ? +(((Number(n.count) || 0) / total) * 100).toFixed(2) : 0,
    }));
  }

  return new Response(JSON.stringify({ nominee }, null, 2), {
    headers: { "content-type": "application/json" }
  });
}
