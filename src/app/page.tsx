/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import Link from "next/link";
import Image from "next/image";
import { Trophy, ArrowRight, TrendingUp, Brain, Target, BarChart3, Shield, Zap, Star, Gauge } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0d14] font-sans">
      {/* Hero — full-bleed image overlay */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/12950515/pexels-photo-12950515.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Horse Racing Intelligence"
            className="w-full h-full object-cover opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14]/70 via-transparent to-[#0a0d14]" />
        </div>
        <div className="relative z-10 space-y-6 px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-amber-500/30 backdrop-blur-sm">
            <Star size={12} fill="currentColor" /> AI-Powered UK & Ireland Racing Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white italic uppercase tracking-tighter leading-none">
            Your AI <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Racing Analyst
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Every UK & Irish race analysed by AI. GG Score rankings, daily selections, 
            pace simulation, and professional-grade form — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/auth?tab=signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 text-black font-black text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-xl shadow-amber-500/20"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/races"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-black text-sm uppercase tracking-wider hover:border-white/40 hover:bg-white/5 transition-colors backdrop-blur-sm"
            >
              View Today&apos;s Races
            </Link>
          </div>
          <p className="text-gray-500 text-xs">7 days free. No commitment. Cancel anytime.</p>
        </div>
      </section>

      {/* Stats Dashboard — white card with gold border */}
      <section className="max-w-6xl mx-auto px-6 -mt-12 relative z-30">
        <div className="bg-[#11141c] backdrop-blur-xl rounded-[2rem] shadow-2xl border border-amber-500/10 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                <TrendingUp size={28} />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Races Analysed</p>
              <p className="text-3xl font-black text-white italic">137</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400">
                <Target size={28} />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">AI Factors</p>
              <p className="text-3xl font-black text-white italic">13</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                <BarChart3 size={28} />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Horses in DB</p>
              <p className="text-3xl font-black text-white italic">493K</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-400">
                <Shield size={28} />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">UK & IE Courses</p>
              <p className="text-3xl font-black text-white italic">20+</p>
            </div>
          </div>
        </div>
      </section>

      {/* GG Score — How It Works */}
      <section className="max-w-6xl mx-auto px-6 mt-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
            The <span className="text-amber-400">GG Score</span> Engine
          </h2>
          <div className="w-20 h-1 bg-amber-400 mx-auto mt-4 rounded-full" />
          <p className="text-gray-400 text-sm mt-6 max-w-xl mx-auto leading-relaxed">
            Every morning, our AI analyses every declared runner across 13 individual factors — 
            each weighted and combined into a single composite score from 0 to 100.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: "Form Rating", icon: "📈" },
            { name: "Class Level", icon: "🏆" },
            { name: "Pace Profile", icon: "⚡" },
            { name: "Trainer Strike Rate", icon: "🎯" },
            { name: "Jockey Effectiveness", icon: "🏇" },
            { name: "Draw Position", icon: "🎲" },
            { name: "Going Preference", icon: "🌧️" },
            { name: "Course History", icon: "🗺️" },
            { name: "Optimal Distance", icon: "📏" },
            { name: "Weight Carried", icon: "⚖️" },
            { name: "Age Profile", icon: "🎂" },
            { name: "Market Signals", icon: "📊" },
            { name: "Head-to-Head", icon: "🤼" },
          ].map((factor) => (
            <div
              key={factor.name}
              className="flex items-center gap-3 p-4 rounded-xl bg-[#11141c] border border-white/[0.04] hover:border-amber-500/20 transition-colors group"
            >
              <span className="text-lg">{factor.icon}</span>
              <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">
                {factor.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
          <p className="text-amber-400/80 text-sm font-medium italic">
            &quot;Our engine surfaces a Top Selection, Main Danger, Value Pick, and Outsider
            to Watch for every race — each with confidence scoring and full written reasoning.&quot;
          </p>
        </div>
      </section>

      {/* Trust/Feature Cards */}
      <section className="max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        {[
          {
            icon: Brain,
            title: "AI-Powered Analysis",
            desc: "Every runner scored on 13 factors. One composite GG Score. One clear ranking. No guesswork — just data.",
          },
          {
            icon: Gauge,
            title: "Pace Simulation",
            desc: "See how the race unfolds. Front-runner clash detection, hold-up bias, draw advantage — modelled for every race.",
          },
          {
            icon: TrendingUp,
            title: "Performance Tracking",
            desc: "Log selections. Track P&L, ROI, strike rate. Charts, streaks, and monthly breakdowns to sharpen your edge.",
          },
        ].map((f, i) => (
          <div key={i} className="p-8 rounded-3xl bg-[#11141c] border border-white/[0.04] hover:border-amber-500/10 hover:bg-[#141820] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
              <f.icon className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-3">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Get Started */}
      <section className="max-w-4xl mx-auto px-6 mt-24 text-center">
        <div className="grid sm:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Sign Up", desc: "Create account. Set preferences. Start your 7-day free trial." },
            { step: "02", title: "Study Form", desc: "Access GG Scores, pace maps, and AI narratives for every race." },
            { step: "03", title: "Track Results", desc: "Monitor selections. Review performance. Refine your approach." },
            { step: "04", title: "Build Your Edge", desc: "Leverage data-driven insights to make more informed decisions." },
          ].map((s, i) => (
            <div key={i} className="relative text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-400 font-black text-sm">{s.step}</span>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">{s.title}</h3>
              <p className="text-gray-500 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 mt-24 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Simple Pricing</h2>
          <div className="w-16 h-1 bg-amber-400 mx-auto mt-4 rounded-full" />
          <p className="text-gray-400 text-sm mt-4">Start with a 7-day free trial. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="rounded-2xl bg-[#11141c] border border-white/[0.06] p-8">
            <h3 className="text-white font-black text-lg uppercase tracking-tighter mb-1">Free</h3>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-4">Explore races without signing up</p>
            <div className="text-4xl font-black text-white mb-6">£0</div>
            <ul className="space-y-3 mb-8">
              {["Today&apos;s race cards", "Live odds", "Horse form (last 3 runs)", "Course & going info"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-emerald-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/races" className="block text-center py-3 rounded-xl border border-white/[0.1] text-white font-semibold text-sm hover:border-white/20 transition-colors">
              View Racing Hub
            </Link>
          </div>
          <div className="rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/[0.02] border border-amber-500/20 p-8 relative">
            <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">Best Value</div>
            <h3 className="text-white font-black text-lg uppercase tracking-tighter mb-1">RaceIntel Pro</h3>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-4">Full access & AI tools</p>
            <div className="text-4xl font-black text-white mb-1">
              £9.99<span className="text-lg text-gray-400 font-normal">/mo</span>
            </div>
            <p className="text-gray-500 text-xs mb-6">or £79.99/year (save 33%)</p>
            <ul className="space-y-3 mb-8">
              {[
                "Full GG Score rankings (13 factors)",
                "Daily selections & reasoning",
                "Pace simulation maps",
                "Betting P&L tracker",
                "My Stables & smart alerts",
                "Community leaderboards (soon)",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-amber-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth?tab=signup" className="block text-center py-3 rounded-xl bg-amber-500 text-black font-black text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
              Start Free Trial
            </Link>
            <p className="text-center text-gray-600 text-xs mt-3">No charge until trial ends. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6">
          Ready to Elevate Your Form Study?
        </h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
          Join racing fans who use RaceIntel to study form, track selections, 
          and make more informed choices at the track.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/auth?tab=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-amber-500 text-black font-black text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-xl shadow-amber-500/20">
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <p className="text-gray-600 text-xs mt-4">iOS & Android apps coming 2026</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] mt-12">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-white font-black text-lg uppercase tracking-tighter">RaceIntel</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed max-w-xs">
                AI-powered UK & Irish horse racing intelligence. GG Score rankings, daily selections, 
                pace simulation, and professional-grade form analysis.
              </p>
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Product</h4>
              <ul className="space-y-2">
                {["Racing Hub", "Features", "Pricing", "Festivals"].map((l) => (
                  <li key={l}>
                    <Link href={`/${l.toLowerCase().replace(/\s/g, "-")}`} className="text-gray-500 text-xs hover:text-amber-400 transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-500 text-xs hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-500 text-xs hover:text-amber-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/responsible-gambling" className="text-gray-500 text-xs hover:text-amber-400 transition-colors">Responsible Gambling</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row justify-between gap-4">
            <p className="text-gray-600 text-xs">© 2026 RaceIntel. All rights reserved.</p>
            <p className="text-gray-700 text-[11px] max-w-md leading-relaxed">
              RaceIntel provides information and entertainment. We do not offer financial advice. 
              Past performance does not guarantee future results. 18+ only. Please gamble responsibly.{" "}
              <a href="https://www.begambleaware.org" className="text-amber-400 hover:underline">BeGambleAware.org</a>
              {" "}· Helpline: 0808 8020 133
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
