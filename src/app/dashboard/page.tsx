import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, TrendingUp, Target, Activity, Bookmark, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard");

  // Get subscription status
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("plan, status, trial_end, current_period_end")
    .eq("user_id", user.id)
    .single();

  // Upcoming races today
  const today = new Date().toISOString().split("T")[0];
  const { data: upcomingRaces } = await supabase
    .from("races")
    .select("id, name, off_time, number_of_runners, racecourses(name)")
    .gte("off_time", `${today}T00:00:00`)
    .lt("off_time", `${today}T23:59:59`)
    .order("off_time")
    .limit(10);

  // Today's insights (if subscriber)
  let insights: any[] = [];
  if (sub?.status === "active" || sub?.status === "trialing") {
    const { data: d } = await supabase
      .from("daily_insights")
      .select("*, races(name, off_time, racecourses(name))")
      .eq("date", today)
      .limit(10);
    insights = d || [];
  }

  const isSubscriber = sub?.status === "active" || sub?.status === "trialing";
  const trialEnd = sub?.trial_end ? new Date(sub.trial_end).toLocaleDateString("en-GB") : null;

  return (
    <main className="min-h-screen bg-[#0a0d14]">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg">RaceIntel</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {isSubscriber ? (
                <span className="text-emerald-400">Pro {sub?.plan === "pro_annual" ? "Annual" : "Monthly"}</span>
              ) : sub?.status === "trialing" ? (
                <span className="text-amber-400">Trial ends {trialEnd}</span>
              ) : (
                <span className="text-gray-500">Free</span>
              )}
            </span>
            <Link href="/settings" className="text-sm text-gray-400 hover:text-white transition-colors">Settings</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome{user.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""}</h1>
          <p className="text-gray-400">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Subscription Banner */}
        {!isSubscriber && sub?.status !== "trialing" && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 font-semibold mb-1">Unlock AI Analysis</p>
            <p className="text-gray-300 text-sm">
              Get GG Scores, daily selections, pace simulations, and more.{" "}
              <Link href="/#pricing" className="text-emerald-400 underline">Start your 7-day free trial →</Link>
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Insights (subscribers only) */}
            {isSubscriber && insights.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Today&apos;s Selections
                </h2>
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <Link
                      key={insight.id}
                      href={`/races/${insight.race_id}`}
                      className="block p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/20 transition-colors"
                    >
                      <div className="text-sm text-gray-400 mb-2">
                        {insight.races?.racecourses?.name} — {new Date(insight.races?.off_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="text-white font-medium mb-2">{insight.races?.name}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">🏆 Top:</span>{" "}
                          <span className="text-emerald-400 font-semibold">{insight.top_selection}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">⚠️ Danger:</span>{" "}
                          <span className="text-amber-400">{insight.main_danger}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">💎 Value:</span>{" "}
                          <span className="text-blue-400">{insight.value_pick}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Today's Races */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Today&apos;s Races
              </h2>
              {upcomingRaces && upcomingRaces.length > 0 ? (
                <div className="space-y-2">
                  {upcomingRaces.map((race) => (
                    <Link
                      key={race.id}
                      href={`/races/${race.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/20 transition-colors"
                    >
                      <span className="text-sm text-emerald-400 font-mono w-14">
                        {new Date(race.off_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{race.name}</div>
                        <div className="text-xs text-gray-400">
                          {(race.racecourses as unknown as { name: string })?.name} · {race.number_of_runners} runners
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-gray-400 text-sm">No races today. Check tomorrow.</p>
                </div>
              )}
              <Link href="/races" className="inline-flex items-center gap-1 mt-4 text-sm text-emerald-400 hover:text-emerald-300">
                View all races →
              </Link>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Quick Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Races Today</span>
                  <span className="text-white font-medium">{upcomingRaces?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">My Follows</span>
                  <span className="text-white font-medium">—</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/races" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Activity className="w-4 h-4" /> Today&apos;s Races
                </Link>
                <Link href="/festivals" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Bookmark className="w-4 h-4" /> Festival Hub
                </Link>
                <Link href="/settings" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Bell className="w-4 h-4" /> Notifications
                </Link>
              </div>
            </div>

            {/* Upgrade */}
            {!isSubscriber && (
              <div className="p-4 rounded-xl bg-gradient-to-b from-emerald-500/10 to-emerald-500/[0.02] border border-emerald-500/20">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">Upgrade to Pro</h3>
                <p className="text-xs text-gray-400 mb-4">Get GG Scores, daily selections, and full AI analysis for every race.</p>
                <Link
                  href="/#pricing"
                  className="block text-center py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}