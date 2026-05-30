import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 300; // ISR every 5 min

export default async function RacesPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data: races } = await supabase
    .from("races")
    .select("*, racecourses(name, country, course_type)")
    .gte("off_time", `${today}T00:00:00`)
    .lt("off_time", `${today}T23:59:59`)
    .order("off_time")
    .limit(100);

  const { data: meetings } = await supabase
    .from("races")
    .select("racecourse_id, racecourses(name, country)")
    .gte("off_time", `${today}T00:00:00`)
    .lt("off_time", `${today}T23:59:59`)
    .order("off_time");

  // Group by course
  const grouped = (meetings || []).reduce((acc: Record<string, { name: string; country: string; count: number }>, r) => {
    const c = r.racecourses as unknown as { name: string; country: string };
    if (!acc[r.racecourse_id]) {
      acc[r.racecourse_id] = { name: c?.name || "Unknown", country: c?.country || "GB", count: 0 };
    }
    acc[r.racecourse_id].count++;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#0a0d14]">
      {/* Hero */}
      <section className="px-6 py-16 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Racing Hub</h1>
          <p className="text-gray-400">
            UK & Ireland race cards, live results, AI-powered form analysis — all in one place.
          </p>
        </div>
      </section>

      {/* Today's Meetings */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Today&apos;s Meetings — {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</h2>
        </div>

        {Object.entries(grouped).length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No races today. Check back tomorrow.</p>
            <Link href="/races" className="inline-flex items-center gap-2 mt-4 px-6 py-2 rounded-xl bg-emerald-500 text-black font-semibold">
              View Upcoming Races <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(grouped).map(([courseId, info]) => (
              <Link
                key={courseId}
                href={`/courses/${courseId}`}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-semibold">{info.name}</span>
                  <span className="text-xs text-gray-500">{info.country === "IE" ? "🇮🇪" : "🇬🇧"}</span>
                </div>
                <div className="text-sm text-gray-400">{info.count} races today</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Race List */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-6">All Today&apos;s Races</h2>

        {!races || races.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-gray-400">No races scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {races.map((race) => (
              <Link
                key={race.id}
                href={`/races/${race.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-colors group"
              >
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-emerald-400 font-mono">
                    {new Date(race.off_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="text-white font-medium truncate">{race.name}</div>
                  <div className="text-sm text-gray-400">
                    {race.going} · {race.race_type} · {race.distance_furlongs}f · {race.number_of_runners}r
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-gray-400">
                    {((race.racecourses as unknown as { name: string })?.name || "")}
                  </div>
                  {race.class && (
                    <div className="text-xs text-emerald-500/70">Class {race.class}</div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-6 py-16 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Unlock Full AI Analysis</h2>
          <p className="text-gray-400 mb-6">
            Sign up for free to access GG Scores, daily selections, pace simulations, and professional-grade 
            form tools for every UK & Irish race.
          </p>
          <Link
            href="/signup"
            className="inline-flex px-8 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors"
          >
            Start 7-Day Free Trial
          </Link>
        </div>
      </section>
    </main>
  );
}