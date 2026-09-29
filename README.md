# ChatStars

Two single-file front-ends backed by one shared Supabase project.

```
/                 → Chat Trial (candidate assessment)  → Vercel: chatstars-trial (root)
/recruitment      → Chat Trial Hub (admin/managers)    → Vercel: chatstars-recruitment (root = recruitment)
```

## Deploy
Each folder is a Vercel project connected to this repo; pushing to `main` auto-deploys.

## Env (set in Vercel, never committed)
- `SUPABASE_URL` (must include `/rest/v1`) + `SUPABASE_KEY` — both apps' `api/sb.js`
- `ANTHROPIC_API_KEY` — trial `api/chat-trial.js` (AI fan + grading)

No secrets live in the code; the proxies inject keys at runtime.

## Supabase tables
`creators`, `trial_sessions`, `trial_messages`, `hub_managers`.
