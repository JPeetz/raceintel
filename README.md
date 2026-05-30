# RaceIntel — AI Horse Racing Intelligence

**The most advanced AI-powered horse racing intelligence platform for UK & Irish racing.** Built as a GallopGenius competitor with SEO-native architecture, transparent AI prediction engine, and native iOS app strategy.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blue)](https://stripe.com)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-purple)](https://openrouter.ai)

---

## 🧠 The GG Score — 13-Factor AI Engine

Every runner in every UK & Irish race is analysed across **13 individual factors** by our proprietary AI engine. Each factor receives a 0-100 score and is combined into a single composite GG Score.

| Factor | What It Measures |
|---|---|
| Form | Quality of last 3 runs (recency, class, finishing positions) |
| Class | Horse's class level vs today's race class |
| Pace | Running style suitability (front-runner, prominent, mid-pack, held-up) |
| Trainer | Strike rate at this course, distance, and race type |
| Jockey | Effectiveness (strike rate, course form, claim value) |
| Draw | Stall position advantage at this course/distance |
| Going | Horse's performance on today's going |
| Course | Performance history at today's racecourse |
| Distance | Whether today's trip is optimal |
| Weight | Weight carried vs Official Rating |
| Age | Age profile suitability for race type |
| Market | Odds movement signals, market confidence |
| Head-to-Head | Past matchups against today's rivals |

Every race gets: 🏆 Top Selection, ⚠️ Main Danger, 💎 Value Pick, 🔭 Outsider Watch.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, SSR/ISR), TypeScript, Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions + RLS) |
| AI Engine | OpenRouter → DeepSeek V4 Flash (13-factor structured scoring) |
| Payments | Stripe (subscriptions, checkout, webhooks, 7-day trials) |
| Data | The Racing API (theracingapi.com) |
| Validation | 30-day prediction tracking pipeline with cumulative accuracy metrics |
| SEO | Next.js metadata API, sitemap.xml, robots.txt, structured data (JSON-LD) |

---

## 📁 Project Structure

```
raceintel/
├── src/
│   ├── app/
│   │   ├── auth/          # Login, signup, OAuth callback
│   │   ├── races/         # Race listing + [id] detail with GG Score table
│   │   ├── courses/       # [id] SEO-optimised course pages
│   │   ├── festivals/     # Cheltenham, Ascot, Aintree, Epsom, Goodwood
│   │   ├── dashboard/     # User dashboard (subscribers only)
│   │   ├── api/
│   │   │   ├── checkout/  # Stripe checkout session creation
│   │   │   └── webhook/   # Stripe subscription lifecycle events
│   │   ├── sitemap.ts     # Dynamic sitemap (courses + races)
│   │   └── robots.ts      # SEO crawl rules
│   ├── lib/
│   │   └── supabase/      # Browser + server + admin clients
│   └── middleware.ts       # Auth guard (public vs protected routes)
├── supabase/
│   ├── schema.sql         # 22 tables with RLS policies
│   └── functions/
│       └── gg-score/      # Edge Function — production GG Score engine
├── scripts/
│   ├── gg_score.py        # CLI GG Score generator (OpenRouter)
│   ├── ingest.py          # Data ingestion pipeline (Racing API → Supabase)
│   └── validate.py        # 30-day prediction accuracy tracker
├── .env.local             # Environment variables (gitignored)
├── next.config.ts
└── package.json
```

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Fill in Supabase, Stripe, OpenRouter keys

# Run dev server
npm run dev

# Generate GG Scores for today's races
python3 scripts/gg_score.py

# Ingest today's racing data
python3 scripts/ingest.py

# Validate prediction accuracy
python3 scripts/validate.py --all-time
```

---

## 📊 Database Schema

**22 tables** across 5 domains:

| Domain | Tables |
|---|---|
| Racing Data | `racecourses`, `races`, `trainers`, `jockeys`, `horses`, `runners`, `race_results`, `horse_form` |
| AI Analysis | `gg_scores`, `daily_insights`, `pace_simulations`, `course_biases` |
| Validation | `validation_picks`, `validation_daily_summary` |
| Users | `profiles`, `user_subscriptions`, `user_follows`, `user_notifications`, `user_push_tokens` |
| Config | `user_notification_preferences`, `user_roles` |

All tables have RLS policies: public read for racing data, subscriber-only for AI scores, owner-only for user data.

---

## 🔬 Pre-Launch Validation

**Board directive:** "Don't launch until the AI proves it can beat the market."

### 30-Day Accuracy Targets

| Metric | Target | Market Average |
|---|---|---|
| Top Pick Win Rate | >25% | ~20% |
| Top Pick Place Rate | >55% | ~45% |
| Any Pick Win Rate | >50% | — |
| Any Pick Place Rate | >55% | — |

### Validation Pipeline

```bash
# Daily: Validate yesterday's predictions
python3 scripts/validate.py

# Check cumulative accuracy
python3 scripts/validate.py --all-time
```

Results stored in `validation_picks` (per-race) and `validation_daily_summary` (daily aggregate).

---

## 💳 Monetisation

- **Free tier:** Race cards, live odds, basic form (3 runs)
- **Pro tier (£9.99/mo or £80/yr):** Full GG Score, daily selections, pace simulation, bet tracker, smart alerts, festival hub
- **7-day free trial** via Stripe with automatic subscription lifecycle management

---

## 🌐 SEO Architecture

- Dynamic `sitemap.xml` with all courses, today's races, and static pages
- JSON-LD `WebApplication` schema markup on every page
- SSR + ISR (`revalidate: 300`) for race pages
- SEO-optimised metadata per page (title, description, OpenGraph, Twitter cards)
- Racecourse and festival pages targeting long-tail keywords: "Cheltenham race card," "AI racing tips," "GG Score predictions"

---

## 📱 iOS App (Planned)

- Capacitor wrapper around Next.js web app
- RevenueCat for in-app subscription management
- Push notifications via Supabase + FCM
- Native features: biometric login, haptic feedback, Today widget

---

## 🔒 Security

- Row-Level Security (RLS) on all tables
- Supabase Auth with email/password
- Service role key for server-side only
- Stripe webhook signature verification
- Gated AI content behind subscription check

---

## ⚠️ Disclaimer

RaceIntel is for informational and entertainment purposes only. We do not provide financial advice or guarantee returns. Users are solely responsible for their own betting decisions. Past performance does not guarantee future results. Please gamble responsibly.

If you feel you may have a gambling problem, visit [BeGambleAware.org](https://www.begambleaware.org) or call the National Gambling Helpline: 0808 8020 133.

---

## 📝 License

Proprietary — All Rights Reserved. Built for AgentForge by RaceIntel. All code is private.