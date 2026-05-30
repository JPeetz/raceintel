import Link from "next/link";
import { ArrowRight, TrendingUp, Brain, Target, BarChart3, Bell, Users, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "GG Score — 13-Factor AI Engine",
    desc: "Every runner scored on form, class, pace, trainer & jockey strike rates, draw bias, going, distance, weight, age, market signals, and head-to-head records. One composite score. One clear ranking.",
    live: true,
  },
  {
    icon: Target,
    title: "Daily Insights & Selections",
    desc: "Our 5-stage AI surfaces a Top Selection, Main Danger, Value Pick, and Outsider to Watch for every UK & Irish race — each with confidence scoring and full written reasoning.",
    live: true,
  },
  {
    icon: TrendingUp,
    title: "Race Pace Simulation",
    desc: "See how the race unfolds before the stalls open. Front-runner clash detection, hold-up bias, draw advantage modelling — run for every race, every day.",
    live: true,
  },
  {
    icon: BarChart3,
    title: "Betting Performance Tracker",
    desc: "Log every bet. Track P&L, ROI, strike rate, and average odds across all bookmakers. Charts, streaks, and monthly breakdowns included.",
    live: true,
  },
  {
    icon: Bell,
    title: "Smart Alerts & My Stables",
    desc: "Follow horses, trainers, and jockeys. Get push notifications for declarations, odds movements, and race results. Your racing portfolio, always up to date.",
    live: true,
  },
  {
    icon: Users,
    title: "Community Spaces",
    desc: "Join racing communities built around trainers, yards, festivals, or betting systems. Live tip sharing with tracked P&L and reputation leaderboards.",
    live: false,
  },
];

const steps = [
  { num: "01", title: "Sign Up", desc: "Create your free account. Set your racing preferences, favourite tracks, and notification settings." },
  { num: "02", title: "Follow Your Favourites", desc: "Track horses, trainers, and jockeys you care about. Build your personal stable." },
  { num: "03", title: "Study AI-Powered Form", desc: "Access GG Scores, pace maps, draw bias heatmaps, and AI narratives for every single race." },
  { num: "04", title: "Track Performance", desc: "Monitor your selections, review results, and refine your approach with data-driven insights." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0d14]">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/3 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm mb-8">
            <Shield className="w-4 h-4" />
            AI-Powered UK & Irish Horse Racing Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Your AI{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
              Racing Analyst
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Every UK & Ireland race, scored by AI. GG Score rankings, daily selections, 
            pace simulation, and professional-grade form analysis — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth?tab=signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors"
            >
              Start 7-Day Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/races"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-700 text-gray-300 font-semibold hover:border-gray-500 transition-colors"
            >
              View Today&apos;s Races
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">No charge until your trial ends. Cancel anytime.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "13", label: "AI Factors per Runner" },
            { value: "137", label: "Races This Week" },
            { value: "20+", label: "UK & Irish Courses" },
            { value: "493K", label: "Horses in Database" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-3xl font-bold text-emerald-400">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-600 text-xs mt-4">
          Data last refreshed: 30 May 2026 · RaceIntel v1.0.3
        </p>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Everything You Need to Study Form
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-xl mx-auto">
          Comprehensive tools designed for racing enthusiasts at every level — from casual fans to serious form students.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/20 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-semibold">{f.title}</h3>
                {f.live && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">LIVE</span>}
                {!f.live && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">SOON</span>}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Get Started in Minutes
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-xl mx-auto">
          From account creation to AI-powered form study — four simple steps.
        </p>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="relative text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-400 font-bold">{s.num}</span>
              </div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-emerald-500/40 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* The GG Score */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.01] border border-emerald-500/10 p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            The <span className="text-emerald-400">GG Score</span> — How It Works
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl">
            Every morning, our 5-stage AI engine analyses every declared runner using 13 individual 
            factors — each weighted and combined into a single composite GG Score from 0 to 100. 
            Higher scores have historically correlated with stronger race performance.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {["Form Rating", "Class Level", "Pace Profile", "Trainer Strike Rate", "Jockey Effectiveness", "Draw Position", "Going Preference", "Course History", "Optimal Distance", "Weight Carried", "Age Profile", "Market Signals", "Head-to-Head"].map(
              (factor) => (
                <div key={factor} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-gray-300 text-sm">{factor}</span>
                </div>
              )
            )}
          </div>
          <div className="mt-8 p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <p className="text-emerald-400 text-sm font-mono">
              &quot;Our 5-stage AI engine produces a Top Selection, Main Danger, Value Pick, and Outsider 
              to Watch for every race — each with confidence scoring and full written reasoning.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-400 mb-4">Start with a 7-day free trial. Cancel anytime.</p>
        <div className="flex justify-center gap-2 items-center mb-12">
          <span className="text-sm text-gray-500">Monthly</span>
          <span className="text-sm text-emerald-400 font-semibold">Save 33% with annual</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-8">
            <h3 className="text-white font-semibold mb-1">Free</h3>
            <p className="text-gray-400 text-sm mb-4">Explore race cards with no sign-up</p>
            <div className="text-4xl font-bold text-white mb-6">£0</div>
            <ul className="space-y-3 mb-8">
              {["Today's race cards & results", "Live odds", "Horse form (last 3 runs)", "Course & going info"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-emerald-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/races" className="block text-center py-3 rounded-xl border border-gray-700 text-gray-300 font-semibold hover:border-gray-500 transition-colors">
              View Racing Hub
            </Link>
          </div>
          <div className="rounded-xl bg-gradient-to-b from-emerald-500/10 to-emerald-500/[0.02] border border-emerald-500/20 p-8 relative">
            <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-bold">BEST VALUE</div>
            <h3 className="text-white font-semibold mb-1">RaceIntel Pro</h3>
            <p className="text-gray-400 text-sm mb-4">Full AI analysis & pro tools</p>
            <div className="text-4xl font-bold text-white mb-1">£9.99<span className="text-lg text-gray-400 font-normal">/mo</span></div>
            <p className="text-emerald-400 text-sm mb-6">or £80/year — save £39.88</p>
            <ul className="space-y-3 mb-8">
              {[
                "GG Score — 13-factor AI ranking",
                "Daily Insights — Top Pick, Value Pick & more",
                "Pace Simulation per race",
                "My Stables — follow horses, trainers, jockeys",
                "Betting Performance Tracker",
                "Smart Alerts & push notifications",
                "Full form history & course bias data",
                "Festival Hub — Cheltenham, Ascot, Aintree",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-emerald-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth?tab=signup" className="block text-center py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors">
              Start 7-Day Free Trial
            </Link>
            <p className="text-center text-gray-500 text-xs mt-3">No charge until trial ends. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Elevate Your Racing Research?
          </h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            Join racing fans who use RaceIntel to study form, track performance, 
            and make more informed decisions at the track.
          </p>
          <Link href="/auth?tab=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors text-lg">
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-500 text-sm mt-4">iOS & Android apps coming soon</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">RaceIntel</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              The intelligent UK & Irish horse racing platform. AI-powered form analysis, 
              real-time odds, and professional-grade tools.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "Racing Hub", "Roadmap", "FAQ"].map((l) => (
                  <li key={l}><Link href={`#${l.toLowerCase().replace(/\s/g, "-")}`} className="text-gray-400 text-sm hover:text-gray-300 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 text-sm hover:text-gray-300 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 text-sm hover:text-gray-300 transition-colors">Terms of Service</Link></li>
                <li><Link href="/responsible-gambling" className="text-gray-400 text-sm hover:text-gray-300 transition-colors">Responsible Gambling</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 RaceIntel. All rights reserved.</p>
          <p className="text-gray-600 text-xs max-w-md">
            RaceIntel is for informational and entertainment purposes only. We do not provide financial 
            advice or guarantee returns. Users are solely responsible for their own betting decisions. 
            Past performance does not guarantee future results. Please gamble responsibly. 
            If you feel you may have a gambling problem, visit{" "}
            <a href="https://www.begambleaware.org" className="text-emerald-400 underline">BeGambleAware.org</a>{" "}
            or call the National Gambling Helpline: 0808 8020 133.
          </p>
        </div>
      </footer>
    </main>
  );
}