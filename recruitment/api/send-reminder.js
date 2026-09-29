export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  // TODO: Connect to email service (SendGrid, Resend, etc.)
  const { to, name, formName } = req.body;
  console.log(`Reminder requested: to=${to}, name=${name}, form=${formName}`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({ success: true, message: "Reminder logged (email service not connected)" });
}
