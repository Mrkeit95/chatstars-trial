export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.setHeader("Access-Control-Allow-Origin","*"); res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS"); res.setHeader("Access-Control-Allow-Headers","Content-Type"); return res.status(200).end(); }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });
  const { creator, fan_persona, messages, action, session_id } = req.body;
  const isGrade = action === "grade";
  const systemPrompt = isGrade
    ? `You are a chat quality evaluator for an OnlyFans agency. Grade this chat trial session. The chatter was managing fans for creator "${creator}". Evaluate: response speed, sales technique, personality matching, engagement quality. Return JSON: { "overall_grade": "A/B/C/D/F", "scores": { "speed": 1-10, "sales": 1-10, "personality": 1-10, "engagement": 1-10 }, "feedback": "detailed feedback", "strengths": ["list"], "improvements": ["list"] }`
    : `You are a fan on OnlyFans chatting with a creator's page. Your persona: ${fan_persona}. Respond as that fan would - be realistic. Keep messages short (1-3 sentences). Sometimes be interested in buying content, sometimes not. React naturally to sales attempts.`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: systemPrompt, messages: messages || [{ role: "user", content: "Start the conversation" }] }),
    });
    const data = await r.json();
    const reply = data.content?.[0]?.text || "No response";
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(isGrade ? { grade: reply } : { reply });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
