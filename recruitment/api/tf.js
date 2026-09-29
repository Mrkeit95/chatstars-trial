export default async function handler(req, res) {
  const TF = process.env.TYPEFORM_TOKEN;
  const path = (req.url || '').replace(/^\/api\/tf\/?/, '');
  const target = `https://api.typeform.com/${path}`;
  const headers = { "Content-Type": "application/json" };
  if (TF) headers["Authorization"] = `Bearer ${TF}`;
  try {
    const r = await fetch(target, { method: req.method, headers, body: req.method !== "GET" ? JSON.stringify(req.body) : undefined });
    const data = await r.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.status(r.status).send(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
}
