# ⚡ SMMPanel Nigeria — Setup Guide

Nigeria's #1 Social Media Growth Platform — built with Next.js 14, Supabase, Paystack, and Claude AI.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Inline styles + CSS Variables |
| Auth & DB | Supabase (PostgreSQL + RLS) |
| State | Zustand |
| Payments | Paystack |
| SMM Provider | JustAnotherPanel / SMMKings API |
| AI Support | Anthropic Claude (claude-sonnet-4-6) |
| Deployment | Vercel |

---

## Step-by-Step Setup

### 1. Extract & Install

```bash
unzip smm-panel.zip
cd smm-panel
npm install
```

---

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Copy your project URL and anon key from **Settings → API**
3. Go to **SQL Editor** → paste and run `supabase/migrations/001_schema.sql`
4. Go to **Authentication → Providers** → enable **Email** provider

---

### 3. Set Up Paystack

1. Go to [paystack.com](https://paystack.com) → create account
2. Go to **Settings → API Keys** → copy Secret and Public keys
3. Go to **Settings → Webhooks** → add:
   ```
   https://yourdomain.com/api/wallet/verify
   ```

---

### 4. Get SMM Provider API Key

1. Sign up at [justanotherpanel.com](https://justanotherpanel.com) or similar
2. Go to API section → copy your API key and endpoint URL

---

### 5. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. **API Keys** → create a new key

---

### 6. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

ANTHROPIC_API_KEY=sk-ant-...

PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...

SMM_PROVIDER_API_KEY=your-smm-key
SMM_PROVIDER_URL=https://justanotherpanel.com/api/v2

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### 8. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Then add all `.env.local` variables in **Vercel → Project → Settings → Environment Variables**.

Update `NEXT_PUBLIC_APP_URL` to your live domain.

---

## Project Structure

```
src/
├── app/
│   ├── auth/           # Login, Register, Forgot Password
│   ├── dashboard/      # All dashboard pages + shared layout
│   └── api/            # REST API routes
├── components/         # Reusable UI components
├── hooks/              # useAuth, useOrders, useWallet
├── lib/                # Supabase, Paystack, SMM, Claude wrappers
├── store/              # Zustand global state
└── types/              # TypeScript interfaces
supabase/
└── migrations/         # SQL schema (run in Supabase SQL editor)
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Redirects to `/dashboard` or `/auth/login` |
| `/auth/login` | Login page |
| `/auth/register` | Registration page |
| `/dashboard` | Stats overview + recent orders |
| `/services` | Browse + order services |
| `/orders` | Full order history |
| `/wallet` | Add funds (Paystack) |
| `/support` | Claude AI chat support |
| `/settings` | User account settings |

---

## Common Issues

**Supabase auth not working** → Check your anon key and that RLS policies were applied.

**Orders not saving** → Ensure `001_schema.sql` was fully run and all tables exist.

**Paystack redirect not working** → Make sure `NEXT_PUBLIC_APP_URL` matches your actual domain exactly.

**SMM provider errors** → Comment out the provider call in `/api/orders/route.ts` for local testing.
