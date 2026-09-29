export default async function handler(req, res) {
  const SB_URL = process.env.SUPABASE_URL || "https://lescdotlrpmkumlgizsi.supabase.co/rest/v1";
  const SB_KEY = process.env.SUPABASE_KEY || "";
  // Vercel's /api/sb/:path* rewrite delivers the sub-path as a `path` query param;
  // the remaining params are the real PostgREST query. Fall back to the URL path.
  const u = new URL(req.url || '', 'http://x');
  let sub;
  if (u.searchParams.has('path')) { sub = u.searchParams.getAll('path').join('/'); u.searchParams.delete('path'); }
  else { sub = u.pathname.replace(/^\/api\/sb\/?/, ''); }
  const qs = u.searchParams.toString();
  const target = `${SB_URL}/${sub}${qs ? '?' + qs : ''}`;
  const headers = { "Content-Type": "application/json", "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` };
  if (req.headers.prefer) headers["Prefer"] = req.headers.prefer;
  try {
    const r = await fetch(target, { method: req.method, headers, body: req.method !== "GET" ? JSON.stringify(req.body) : undefined });
    const data = await r.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Prefer,apikey");
    res.status(r.status).send(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
}
