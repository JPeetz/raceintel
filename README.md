# RaceIntel — AI Horse Racing Intelligence

## 🏇 What Is RaceIntel?

RaceIntel is the most advanced **AI-powered horse racing intelligence platform** for UK & Irish racing. Think GallopGenius, but with SEO-native architecture, a native iOS app, and a transparent prediction engine.

## 🧠 The GG Score — 13-Factor AI Engine

Every runner in every UK & Irish race is analysed across **13 individual factors** by our proprietary AI engine:

| Factor | What It Measures |
|---|---|
| Form | Quality of last 3 runs |
| Class | Class level vs today's race |
| Pace | Running style suitability |
| Trainer | Strike rate at course/distance |
| Jockey | Effectiveness & course form |
| Draw | Stall position advantage |
| Going | Ground condition preference |
| Course | Performance at this venue |
| Distance | Optimal trip match |
| Weight | Carried relative to OR |
| Age | Age profile fit |
| Market | Odds movement signals |
| Head-to-Head | Past matchups vs rivals |

Each factor receives a **0-100 score**. Factors are weighted and combined into a single **composite GG Score** — one number that tells you how likely a horse is to perform.

Every race gets:
- 🏆 **Top Selection** — Highest GG Score
- ⚠️ **Main Danger** — Biggest threat
- 💎 **Value Pick** — Best odds-to-score ratio
- 🔭 **Outsider Watch** — Long odds, compelling stats

## 🚀 Tech Stack

- **Frontend:** Next.js 15 (App Router, SSR/ISR), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **AI:** OpenRouter → DeepSeek V4 Flash (fast, cheap, effective for structured scoring)
- **Payments:** Stripe (subscriptions, checkout, billing portal)
- **iOS:** SwiftUI native (coming Q3 2026)
- **Data:** The Racing API (theracingapi.com)

## 📊 SEO/GEO Strategy

Every race, horse, trainer, and jockey gets a fully indexed SSR page with structured data (JSON-LD SportsEvent), auto-generated meta descriptions, and ISR revalidation. Organic search is our primary acquisition channel — capturing demand from "race card" and "racing tips" keywords that GallopGenius leaves on the table.

## ⚡ Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
# Generate GG Scores (demo mode)
python3 scripts/gg_score.py

# Score with real race data
python3 scripts/gg_score.py --stdin < racecard.json
```

## 📁 Project Structure

```
raceintel/
├── src/app/           # Next.js App Router pages
│   ├── page.tsx       # Landing page (SEO-optimized)
│   ├── layout.tsx     # Root layout + structured data
│   ├── races/         # Race card pages (SSR)
│   ├── horses/        # Horse profile pages
│   └── api/           # API routes (Stripe webhooks, cron)
├── scripts/
│   └── gg_score.py    # GG Score prediction engine
├── supabase/
│   └── schema.sql     # Complete PostgreSQL schema
└── docs/              # Replication blueprints
```

## ⚠️ Disclaimer

RaceIntel is for informational and entertainment purposes only. We do not provide financial advice or guarantee returns. Past performance does not guarantee future results. Please gamble responsibly.

---
