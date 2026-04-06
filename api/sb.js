export default async function handler(req, res) {
  const SB_URL = process.env.SUPABASE_URL || "https://lescdotlrpmkumlgizsi.supabase.co/rest/v1";
  const SB_KEY = process.env.SUPABASE_KEY || "";
  const path = (req.url || '').replace(/^\/api\/sb\/?/, '').split('?')[0];
  const qs = (req.url || '').includes('?') ? '?' + (req.url || '').split('?').slice(1).join('?') : '';
  const target = `${SB_URL}/${path}${qs}`;
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
