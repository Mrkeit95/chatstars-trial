export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });

  const { creator, fan_persona, messages, action } = req.body || {};
  const isGrade = action === "grade";
  const creatorName =
    (creator && typeof creator === "object" && creator.name) ||
    (typeof creator === "string" && creator) || "the creator";

  const systemPrompt = isGrade
    ? `You are a chat quality evaluator for an OnlyFans agency. Grade this chat trial where the chatter was managing fans for creator "${creatorName}". Evaluate: response speed, sales technique, personality matching, engagement quality. Return ONLY JSON: { "overall_grade": "A/B/C/D/F", "scores": { "speed": 1-10, "sales": 1-10, "personality": 1-10, "engagement": 1-10 }, "feedback": "detailed feedback", "strengths": ["list"], "improvements": ["list"] }`
    : `You are a fan on OnlyFans chatting with ${creatorName}'s page. Your persona: ${fan_persona || "a typical fan"}. Reply ONLY as that fan would — realistic, casual texting style, short (1-3 sentences). Sometimes interested in buying content, sometimes not. React naturally to sales attempts. Never break character, never mention you are an AI, never speak as the creator.`;

  // Flatten the transcript into a single user turn — robust to any role labels
  // ('fan'/'me'/'chatter'/'assistant') and ordering, avoiding Anthropic's
  // strict user/assistant alternation requirement.
  const transcript = Array.isArray(messages)
    ? messages.map((m) => {
        const who = m.role === "fan" || m.role === "assistant" ? "Fan" : "Chatter";
        return `${who}: ${m.content}`;
      }).join("\n")
    : "";

  const userContent = isGrade
    ? `Grade this chat trial transcript between the chatter (candidate) and the fans:\n\n${transcript || "(no messages)"}`
    : transcript
      ? `Conversation so far:\n${transcript}\n\nSend your next message as the fan.`
      : `Start the conversation as a fan who just subscribed to ${creatorName}'s page. Keep it short and casual.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    const data = await r.json();
    const text = data?.content?.[0]?.text;
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (!text) {
      // Surface the upstream error so failures are diagnosable instead of silent.
      return res.status(200).json(isGrade ? { grade: "", error: data?.error || data } : { reply: "", error: data?.error || data });
    }
    res.status(200).json(isGrade ? { grade: text } : { reply: text });
  } catch (e) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: e.message });
  }
}
