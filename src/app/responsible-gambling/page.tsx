import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsible Gambling | RaceIntel",
  description:
    "RaceIntel is an informational platform, not a gambling service. Resources, tools, and guidance for responsible gambling. If you need help, we're here to point you in the right direction.",
};

export default function ResponsibleGamblingPage() {
  return (
    <main className="min-h-screen bg-[#0a0d14]">
      <section className="border-b border-white/[0.06] px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Responsible Gambling</h1>
          <p className="text-gray-400">
            RaceIntel is an informational platform, not a gambling service. Here's our commitment to keeping it that way.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="prose prose-invert prose-gray max-w-none space-y-12 text-gray-300 leading-relaxed">

          {/* 1. Our Position */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">1. Our Position</h2>

            <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <p className="text-emerald-300 font-semibold">
                RaceIntel is not a gambling platform. We do not accept bets, provide odds comparison, recommend
                bookmakers, or receive commissions from gambling operators.
              </p>
            </div>
            <p>
              RaceIntel is an <strong className="text-white">AI-powered form analysis and intelligence platform</strong>{" "}
              for UK & Irish horse racing. Our GG Scores, daily selections, and pace simulations are designed to help
              racing enthusiasts study form and understand the sport more deeply — not to encourage gambling.
            </p>
            <p>We take responsible gambling seriously because:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>We know our AI predictions could be used to inform betting decisions</li>
              <li>We want users to engage with racing as a sport, not just a betting medium</li>
              <li>Problem gambling devastates lives — we will not contribute to it</li>
            </ul>
          </div>

          {/* 2. Our Built-in Safeguards */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">2. Built-in Safeguards</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-white font-semibold mb-2">🔞 Age Gate</h3>
                <p className="text-sm">
                  You must be 18+ to create an account. We collect date of birth during registration and verify it.
                  Underage accounts are immediately terminated.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-white font-semibold mb-2">📊 Transparency</h3>
                <p className="text-sm">
                  Every AI prediction includes a confidence score (High/Medium/Low) and explicit written reasoning.
                  We never present predictions as "sure things" or "guaranteed winners."
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-white font-semibold mb-2">🔕 No Bookmaker Links</h3>
                <p className="text-sm">
                  We do not link to, promote, or affiliate with any bookmaker or gambling operator.
                  RaceIntel has zero commercial relationships with the gambling industry.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-white font-semibold mb-2">🚫 No Odds Comparison</h3>
                <p className="text-sm">
                  We display market odds for form context only, not as a betting tool. We do not compare odds
                  across bookmakers or encourage odds shopping.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-white font-semibold mb-2">🧠 Bet Tracker = Self-Awareness</h3>
                <p className="text-sm">
                  Our bet tracking feature is designed for honest self-assessment — showing you your real P&L, ROI,
                  and strike rate. It's a mirror, not an encouragement to bet more.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-white font-semibold mb-2">📵 Quiet Hours</h3>
                <p className="text-sm">
                  You can set notification quiet hours in your settings. By default, push notifications are
                  suppressed between 22:00 and 07:00.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Warning Signs */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">3. Warning Signs of Problem Gambling</h2>
            <p>Ask yourself honestly:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Do you spend more money on betting than you can afford to lose?</li>
              <li>Do you chase losses — betting more to try to recover what you've lost?</li>
              <li>Has betting affected your relationships, work, or mental health?</li>
              <li>Do you lie to family or friends about how much you gamble?</li>
              <li>Do you feel anxious, irritable, or depressed when you're not betting?</li>
              <li>Have you borrowed money or sold possessions to fund betting?</li>
            </ul>
            <p className="mt-4">
              If you answered <strong className="text-white">yes</strong> to any of these, please seek help.
              Problem gambling is a recognised mental health condition — it is treatable, and help is available
              right now.
            </p>
          </div>

          {/* 4. Staying in Control */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">4. Practical Tips for Staying in Control</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Set a Budget", desc: "Decide how much you can afford to lose before you start. Never exceed it. Treat it like an entertainment expense, not an investment." },
                { title: "Set Time Limits", desc: "Decide how long you'll spend on racing analysis. When that time is up, step away. Racing will be there tomorrow." },
                { title: "Don't Chase Losses", desc: "The fastest way to compound losses is to bet more to recover them. Accept losses as the cost of entertainment and walk away." },
                { title: "Don't Bet Under Influence", desc: "Alcohol, stress, fatigue, and emotional turbulence impair judgment. Make betting decisions with a clear head — or not at all." },
                { title: "Use Deposit Limits", desc: "Most UK-licensed bookmakers offer deposit limits. Set them. They're one of the most effective safeguards available." },
                { title: "Take Regular Breaks", desc: "Use self-exclusion tools like GAMSTOP if you need a complete break from all UK-licensed gambling sites for a set period." },
                { title: "Separate Analysis from Betting", desc: "Enjoy studying form for its own sake. You don't have to bet on every race you analyse. The sport is worth appreciating without money on the line." },
                { title: "Talk to Someone", desc: "If you're worried about your gambling — or someone else's — talk about it. Silence makes it worse. The helplines below are confidential and free." },
              ].map((tip) => (
                <div key={tip.title} className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <h3 className="text-white font-semibold text-sm mb-1">{tip.title}</h3>
                  <p className="text-sm text-gray-400">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Get Help Now */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">5. Get Help Now — Free &amp; Confidential</h2>

            <div className="space-y-4">
              <div className="p-5 rounded-lg bg-red-500/10 border border-red-500/20">
                <h3 className="text-red-300 font-bold text-lg mb-2">🇬🇧 UK — National Gambling Helpline</h3>
                <p className="text-2xl font-bold text-white mb-1">0808 8020 133</p>
                <p className="text-sm">
                  Free, confidential, 24/7. Run by GamCare.{" "}
                  <a href="https://www.begambleaware.org" className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">
                    BeGambleAware.org
                  </a>
                </p>
              </div>

              <div className="p-5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-white font-bold text-lg mb-2">🇮🇪 Ireland — GamblingCare.ie</h3>
                <p className="text-sm">
                  Helpline: <strong className="text-white">1800 936 725</strong> (Freephone)<br />
                  <a href="https://www.gamblingcare.ie" className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">
                    GamblingCare.ie
                  </a>{" "}
                  — counselling, support, and resources for problem gambling in Ireland.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-white font-bold text-lg mb-2">🇪🇺 EU / International — GamCare</h3>
                <p className="text-sm">
                  Live chat and resources at{" "}
                  <a href="https://www.gamcare.org.uk" className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">
                    GamCare.org.uk
                  </a>
                </p>
              </div>

              <div className="p-5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-white font-bold text-lg mb-2">🛑 Self-Exclusion — GAMSTOP</h3>
                <p className="text-sm">
                  Free service that lets you exclude yourself from all UK-licensed gambling websites for 6 months,
                  1 year, or 5 years.{" "}
                  <a href="https://www.gamstop.co.uk" className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">
                    GAMSTOP.co.uk
                  </a>
                </p>
              </div>

              <div className="p-5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-white font-bold text-lg mb-2">🧠 Mental Health Support</h3>
                <p className="text-sm">
                  <strong className="text-white">Samaritans:</strong>{" "}
                  <a href="tel:116123" className="text-emerald-400 underline">116 123</a> (UK/IE, free, 24/7) —{" "}
                  <a href="https://www.samaritans.org" className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">samaritans.org</a><br />
                  <strong className="text-white">Mind:</strong> Mental health charity —{" "}
                  <a href="https://www.mind.org.uk" className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">mind.org.uk</a><br />
                  <strong className="text-white">NHS:</strong> Problem gambling support —{" "}
                  <a href="https://www.nhs.uk/live-well/addiction-support/gambling-addiction" className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">
                    nhs.uk/gambling-addiction
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* 6. Our Commitment */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">6. Our Commitment</h2>
            <p>
              RaceIntel commits to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Never presenting AI predictions as guaranteed outcomes</li>
              <li>Never partnering with or promoting gambling operators</li>
              <li>Never using language that encourages risky betting behaviour ("can't lose," "banker," "sure thing")</li>
              <li>Always displaying confidence levels and uncertainty on AI predictions</li>
              <li>Always linking to responsible gambling resources prominently</li>
              <li>Reviewing this policy annually and updating it as best practices evolve</li>
            </ul>
          </div>

          <div className="pt-8 border-t border-white/[0.06] mt-12">
            <p className="text-gray-500 text-sm">
              If you have suggestions for how we can improve our responsible gambling practices, please contact us at{" "}
              <strong className="text-white">support@raceintel.com</strong>.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              This page was last reviewed on 30 May 2026. We are committed to keeping it accurate and actionable.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}