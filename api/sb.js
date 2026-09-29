export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Prefer,apikey");
    return res.status(200).end();
  }

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_KEY;
  if (!SB_URL || !SB_KEY) return res.status(500).json({ error: "SUPABASE_URL or SUPABASE_KEY not set" });

  // Vercel's /api/sb/:path* rewrite delivers the sub-path as a `path` query param;
  // the remaining params are the real PostgREST query. Fall back to the URL path.
  const u = new URL(req.url || '', 'http://x');
  let sub;
  if (u.searchParams.has('path')) { sub = u.searchParams.getAll('path').join('/'); u.searchParams.delete('path'); }
  else { sub = u.pathname.replace(/^\/api\/sb\/?/, ''); }
  const qs = u.searchParams.toString();
  const target = `${SB_URL}/${sub}${qs ? '?' + qs : ''}`;

  const headers = {
    "Content-Type": "application/json",
    "apikey": SB_KEY,
    "Authorization": `Bearer ${SB_KEY}`
  };
  if (req.headers.prefer) headers["Prefer"] = req.headers.prefer;

  try {
    const fetchOpts = { method: req.method, headers };
    if (req.method !== "GET" && req.method !== "HEAD") {
      fetchOpts.body = JSON.stringify(req.body);
    }
    const r = await fetch(target, fetchOpts);
    const data = await r.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(r.status).send(data);
  } catch (e) {
    res.status(500).json({ error: e.message, target });
  }
}
