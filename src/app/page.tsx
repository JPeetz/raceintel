import Link from "next/link";
import { ArrowRight, TrendingUp, Brain, Target, BarChart3, Shield, Star, Gauge, Trophy } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0d14] font-sans overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[60vh] md:h-[80vh] overflow-hidden flex items-center justify-center text-center py-12 md:py-0">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/12950515/pexels-photo-12950515.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Horse Racing Intelligence"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14]/80 via-[#0a0d14]/30 to-[#0a0d14]" />
        </div>
        <div className="relative z-10 space-y-4 md:space-y-6 px-4 max-w-4xl mx-auto pt-4 md:pt-0">
          <div className="inline-flex items-center gap-1.5 md:gap-2 bg-amber-500/20 text-amber-400 px-2.5 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-wider md:tracking-widest border border-amber-500/30 backdrop-blur-sm">
            <Star size={10} className="md:size-3" fill="currentColor" /> AI-Powered UK & Ireland Racing Intelligence
          </div>
          <h1 className="text-3xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[1.1] md:leading-none">
            Your AI{" "}
            <br className="md:hidden" />
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Racing Analyst
            </span>
          </h1>
          <p className="text-white/70 text-xs md:text-lg max-w-xl mx-auto font-medium leading-relaxed px-2 md:px-0">
            Every UK & Irish race analysed by AI. GG Score rankings, daily selections, 
            pace simulation, and professional-grade form — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 md:gap-4 justify-center pt-2 md:pt-4">
            <Link
              href="/auth?tab=signup"
              className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl bg-amber-500 text-black font-black text-xs md:text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Start Free Trial <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Link>
            <Link
              href="/races"
              className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl border border-white/20 text-white font-black text-xs md:text-sm uppercase tracking-wider hover:border-white/40 hover:bg-white/5 transition-colors"
            >
              View Today&apos;s Races
            </Link>
          </div>
          <p className="text-gray-500 text-[10px] md:text-xs">7 days free. No commitment. Cancel anytime.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 -mt-6 md:-mt-12 relative z-30">
        <div className="bg-[#11141c] rounded-2xl md:rounded-[2rem] shadow-2xl border border-amber-500/10 p-5 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: TrendingUp, value: "137", label: "Races Analysed", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { icon: Target, value: "13", label: "AI Factors", color: "text-amber-400", bg: "bg-amber-500/10" },
              { icon: BarChart3, value: "493K", label: "Horses in DB", color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: Shield, value: "20+", label: "UK & IE Courses", color: "text-violet-400", bg: "bg-violet-500/10" },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center text-center space-y-1 md:space-y-2">
                <div className={`w-9 h-9 md:w-14 md:h-14 ${s.bg} rounded-xl md:rounded-2xl flex items-center justify-center ${s.color}`}>
                  <s.icon size={18} className="md:size-7" />
                </div>
                <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider md:tracking-widest">{s.label}</p>
                <p className="text-xl md:text-3xl font-black text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GG Score */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 mt-12 md:mt-24">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
            The <span className="text-amber-400">GG Score</span> Engine
          </h2>
          <div className="w-12 md:w-20 h-1 bg-amber-400 mx-auto mt-3 md:mt-4 rounded-full" />
          <p className="text-gray-400 text-xs md:text-sm mt-3 md:mt-6 max-w-xl mx-auto leading-relaxed">
            Every morning, our AI analyses every declared runner across 13 individual factors — 
            each weighted and combined into a single composite score from 0 to 100.
          </p>
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-3">
          {[
            { name: "Form Rating", icon: "📈" }, { name: "Class Level", icon: "🏆" },
            { name: "Pace Profile", icon: "⚡" }, { name: "Trainer Strike Rate", icon: "🎯" },
            { name: "Jockey", icon: "🏇" }, { name: "Draw Position", icon: "🎲" },
            { name: "Going", icon: "🌧️" }, { name: "Course History", icon: "🗺️" },
            { name: "Optimal Distance", icon: "📏" }, { name: "Weight", icon: "⚖️" },
            { name: "Age Profile", icon: "🎂" }, { name: "Market Signals", icon: "📊" },
            { name: "Head-to-Head", icon: "🤼" },
          ].map(f => (
            <div key={f.name} className="flex items-center gap-2 md:gap-3 p-2.5 md:p-4 rounded-lg md:rounded-xl bg-[#11141c] border border-white/[0.04] hover:border-amber-500/20 transition-colors group">
              <span className="text-sm md:text-lg">{f.icon}</span>
              <span className="text-gray-300 text-[11px] md:text-sm font-medium group-hover:text-white transition-colors leading-tight">{f.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 md:mt-8 p-3 md:p-5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
          <p className="text-amber-400/80 text-[11px] md:text-sm font-medium italic">
            &quot;Top Selection, Main Danger, Value Pick, and Outsider to Watch for every race.&quot;
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto mt-12 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8 px-4 md:px-6">
        {[
          { icon: Brain, title: "AI-Powered Analysis", desc: "Every runner scored on 13 factors. One composite GG Score. One clear ranking." },
          { icon: Gauge, title: "Pace Simulation", desc: "See how the race unfolds. Front-runner clash detection, hold-up bias, draw advantage." },
          { icon: TrendingUp, title: "Performance Tracking", desc: "Track P&L, ROI, strike rate. Charts, streaks, and monthly breakdowns." },
        ].map((f, i) => (
          <div key={i} className="p-5 md:p-8 rounded-2xl md:rounded-3xl bg-[#11141c] border border-white/[0.04] hover:border-amber-500/10 transition-all">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 md:mb-6">
              <f.icon className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
            </div>
            <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-tighter mb-2 md:mb-3">{f.title}</h3>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 mt-12 md:mt-24 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { step: "01", title: "Sign Up", desc: "Free account. 7-day trial." },
            { step: "02", title: "Study Form", desc: "GG Scores, pace maps, AI picks." },
            { step: "03", title: "Track Results", desc: "Monitor performance. Refine." },
            { step: "04", title: "Build Your Edge", desc: "Data-driven insights always." },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-2 md:mb-4">
                <span className="text-amber-400 font-black text-xs md:text-sm">{s.step}</span>
              </div>
              <h3 className="text-white font-bold text-xs md:text-sm mb-1">{s.title}</h3>
              <p className="text-gray-500 text-[10px] md:text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 mt-12 md:mt-24 mb-12">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Simple Pricing</h2>
          <div className="w-12 md:w-16 h-1 bg-amber-400 mx-auto mt-3 md:mt-4 rounded-full" />
          <p className="text-gray-400 text-xs md:text-sm mt-3 md:mt-4">Start with a 7-day free trial. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
          <div className="rounded-2xl bg-[#11141c] border border-white/[0.06] p-6 md:p-8">
            <h3 className="text-white font-black text-base md:text-lg uppercase tracking-tighter mb-1">Free</h3>
            <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wider mb-3 md:mb-4">Explore without signing up</p>
            <div className="text-3xl md:text-4xl font-black text-white mb-5 md:mb-6">£0</div>
            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {["Race cards & results", "Live odds", "Horse form (last 3 runs)", "Course & going info"].map(f => (
                <li key={f} className="flex items-center gap-2 text-gray-400 text-xs md:text-sm">
                  <span className="text-emerald-400 text-xs">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/races" className="block text-center py-2.5 md:py-3 rounded-xl border border-white/[0.1] text-white font-semibold text-xs md:text-sm hover:border-white/20 transition-colors">
              View Racing Hub
            </Link>
          </div>
          <div className="rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/[0.02] border border-amber-500/20 p-6 md:p-8 relative">
            <div className="absolute -top-2.5 right-3 md:-top-3 md:right-4 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-amber-500 text-black text-[9px] md:text-[10px] font-black uppercase tracking-wider">Best Value</div>
            <h3 className="text-white font-black text-base md:text-lg uppercase tracking-tighter mb-1">RaceIntel Pro</h3>
            <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wider mb-3 md:mb-4">Full AI access</p>
            <div className="text-3xl md:text-4xl font-black text-white mb-1">
              £9.99<span className="text-base md:text-lg text-gray-400 font-normal">/mo</span>
            </div>
            <p className="text-gray-500 text-[10px] md:text-xs mb-5 md:mb-6">or £79.99/year (save 33%)</p>
            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {["GG Score rankings (13 factors)", "Daily AI selections", "Pace simulation maps", "P&L tracker", "Stables & alerts", "Priority support"].map(f => (
                <li key={f} className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                  <span className="text-amber-400 text-xs">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth?tab=signup" className="block text-center py-2.5 md:py-3 rounded-xl bg-amber-500 text-black font-black text-xs md:text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
              Start Free Trial
            </Link>
            <p className="text-center text-gray-600 text-[10px] md:text-xs mt-2 md:mt-3">No charge until trial ends.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center">
        <h2 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 md:mb-6">
          Ready to Elevate Your Form Study?
        </h2>
        <p className="text-gray-400 text-xs md:text-base mb-6 md:mb-8 max-w-lg mx-auto leading-relaxed">
          Join racing fans who use RaceIntel to study form, track selections, 
          and make more informed choices at the track.
        </p>
        <Link href="/auth?tab=signup" className="inline-flex items-center gap-2 px-8 md:px-10 py-3 md:py-4 rounded-xl bg-amber-500 text-black font-black text-xs md:text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-xl shadow-amber-500/20">
          Start Your Journey <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
        </Link>
        <p className="text-gray-600 text-[10px] md:text-xs mt-3 md:mt-4">iOS & Android apps coming 2026</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                <span className="text-white font-black text-sm md:text-lg uppercase tracking-tighter">RaceIntel</span>
              </div>
              <p className="text-gray-500 text-[10px] md:text-xs leading-relaxed max-w-xs">
                AI-powered UK & Irish horse racing intelligence. GG Score rankings, daily selections, 
                pace simulation, and professional-grade form analysis.
              </p>
            </div>
            <div>
              <h4 className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest mb-3 md:mb-4">Product</h4>
              <ul className="space-y-1.5 md:space-y-2">
                {["Racing Hub", "Features", "Pricing", "Festivals"].map(l => (
                  <li key={l}><Link href={`/${l.toLowerCase().replace(/\s/g, "-")}`} className="text-gray-500 text-[10px] md:text-xs hover:text-amber-400 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest mb-3 md:mb-4">Legal</h4>
              <ul className="space-y-1.5 md:space-y-2">
                <li><Link href="/privacy" className="text-gray-500 text-[10px] md:text-xs hover:text-amber-400 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-500 text-[10px] md:text-xs hover:text-amber-400 transition-colors">Terms</Link></li>
                <li><Link href="/responsible-gambling" className="text-gray-500 text-[10px] md:text-xs hover:text-amber-400 transition-colors">Responsible Gambling</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.04] pt-6 md:pt-8 flex flex-col md:flex-row justify-between gap-3 md:gap-4">
            <p className="text-gray-600 text-[10px] md:text-xs">© 2026 RaceIntel. All rights reserved.</p>
            <p className="text-gray-700 text-[10px] md:text-[11px] max-w-md leading-relaxed">
              Information and entertainment only. 18+ only.{" "}
              <a href="https://www.begambleaware.org" className="text-amber-400 hover:underline">BeGambleAware.org</a>
              {" "}· 0808 8020 133
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
