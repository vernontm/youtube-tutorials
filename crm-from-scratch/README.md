# CRM From Scratch

A CRM built from the ground up with Next.js, Supabase, and Vercel — companion code for the YouTube series.

## Stack
- **Next.js 16** (App Router, TypeScript, src dir)
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth, via `@supabase/ssr`)
- **Vercel** (hosting + envs)

## Local setup

1. Install deps:
   ```bash
   npm install
   ```
2. Create a Supabase project at https://supabase.com/dashboard and grab the project URL + anon key.
3. Copy env template and fill in values:
   ```bash
   cp .env.local.example .env.local
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```

## Structure

```
src/
  app/             # Next.js App Router pages
  lib/
    supabase/
      client.ts    # browser client
      server.ts    # server component / route handler client
      middleware.ts# session refresh helper used by proxy.ts
  proxy.ts         # Next.js 16 proxy (replaces middleware.ts) — refreshes Supabase session
```

> Heads up: Next.js 16 renamed `middleware.ts` to `proxy.ts`. The exported function is `proxy`, not `middleware`.

## Deploy

Push to GitHub, import into Vercel, add the two `NEXT_PUBLIC_SUPABASE_*` env vars, deploy.
