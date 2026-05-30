import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, MapPin, Clock, ChevronRight, Filter } from "lucide-react";
import { RaceDateNav } from "./date-nav";

export const dynamic = "force-dynamic";

interface SearchParams {
  date?: string;
}

export default async function RacesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { date } = await searchParams;
  const supabase = await createClient();

  // Selected date (default today)
  const selectedDate = date || new Date().toISOString().split("T")[0];
  const nextDay = new Date(new Date(selectedDate).getTime() + 86400000).toISOString().split("T")[0];

  // Fetch races for selected date
  const { data: races } = await supabase
    .from("races")
    .select("id, off_time, name, going, race_type, distance_furlongs, number_of_runners, status, class, racecourse_id, racecourses(name, country)")
    .gte("off_time", `${selectedDate}T00:00:00`)
    .lt("off_time", `${nextDay}T00:00:00`)
    .order("off_time");

  // Fetch results for completed races
  const raceIds = races?.map(r => r.id) || [];
  let resultsMap: Record<string, any[]> = {};
  if (raceIds.length > 0) {
    const { data: results } = await supabase
      .from("race_results")
      .select("race_id, position, starting_price, horses(name), horse_id")
      .in("race_id", raceIds)
      .order("position");
    if (results) {
      for (const r of results) {
        if (!resultsMap[r.race_id]) resultsMap[r.race_id] = [];
        resultsMap[r.race_id].push(r);
      }
    }
  }

  // Group races by course
  const meetings = new Map<string, {
    courseId: number;
    courseName: string;
    country: string;
    races: NonNullable<typeof races>;
    firstTime: string;
    lastTime: string;
    raceType: string;
    going: string;
    status: string;
    completed: number;
    total: number;
  }>();

  (races || []).forEach(race => {
    const c = race.racecourses as unknown as { name: string; country: string };
    const cid = race.racecourse_id;
    if (!meetings.has(cid)) {
      meetings.set(cid, {
        courseId: cid,
        courseName: c?.name || "Unknown",
        country: c?.country || "GB",
        races: [],
        firstTime: "",
        lastTime: "",
        raceType: race.race_type || "flat",
        going: race.going || "Going N/A",
        status: "declared",
        completed: 0,
        total: 0,
      });
    }
    const m = meetings.get(cid)!;
    m.races.push(race);
    const t = new Date(race.off_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (!m.firstTime || t < m.firstTime) m.firstTime = t;
    if (!m.lastTime || t > m.lastTime) m.lastTime = t;
    if (race.status === "resulted") m.completed++;
    m.total++;
  });

  const now = new Date();
  const meetingsArray = Array.from(meetings.values()).sort((a, b) => a.firstTime.localeCompare(b.firstTime));

  return (
    <main className="min-h-screen bg-[#0a0d14]">
      {/* Hero */}
      <section className="px-6 py-12 md:py-16 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Racing Hub</h1>
          <p className="text-gray-400 max-w-xl">
            UK & Ireland race cards, live results, and upcoming races — all in one place.
          </p>
        </div>
      </section>

      {/* Date Navigation */}
      <RaceDateNav selectedDate={selectedDate} />

      {/* Snapshot Bar */}
      <section className="px-6 py-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <div className="text-2xl font-bold text-white">{meetings.size}</div>
            <div className="text-sm text-gray-400">Meetings</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <div className="text-2xl font-bold text-white">{races?.length || 0}</div>
            <div className="text-sm text-gray-400">Races Declared</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {meetingsArray.reduce((sum, m) => sum + m.completed, 0)}
            </div>
            <div className="text-sm text-gray-400">Results In</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <div className="text-2xl font-bold text-amber-400">
              {meetingsArray.reduce((sum, m) => sum + m.total - m.completed, 0)}
            </div>
            <div className="text-sm text-gray-400">Upcoming</div>
          </div>
        </div>
      </section>

      {/* Upcoming Races - Quick List */}
      {meetingsArray.length > 0 && (
        <section className="px-6 py-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Next Races</h2>
            <span className="text-sm text-gray-500">
              {meetingsArray.reduce((sum, m) => sum + m.total - m.completed, 0)} upcoming
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
            {meetingsArray
              .flatMap(m => m.races.filter(r => r.status !== "resulted"))
              .slice(0, 12)
              .map(race => {
                const t = new Date(race.off_time);
                const minsUntil = Math.floor((t.getTime() - now.getTime()) / 60000);
                const c = race.racecourses as unknown as { name: string; country: string };
                return (
                  <Link
                    key={race.id}
                    href={`/races/${race.id}`}
                    className="flex-shrink-0 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/20 transition-colors min-w-[140px]"
                  >
                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono mb-1">
                      {t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      {minsUntil > 0 && minsUntil < 120 && (
                        <span className="text-emerald-500">{minsUntil}m</span>
                      )}
                    </div>
                    <div className="text-xs text-white font-medium truncate">{c?.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {race.race_type} · {race.number_of_runners}r
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      )}

      {/* Meetings Grid */}
      <section className="px-6 py-8 max-w-6xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-6">All Meetings</h2>

        {meetingsArray.length === 0 ? (
          <div className="text-center py-16 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No races on this date. Try another day.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {meetingsArray.map(meeting => (
              <div
                key={meeting.courseId}
                className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden group hover:border-emerald-500/10 transition-colors"
              >
                {/* Meeting Header */}
                <Link href={`/courses/${meeting.courseId}`} className="block p-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-bold">{meeting.courseName}</span>
                      <span className="text-xs">{meeting.country === "IE" ? "🇮🇪" : "🇬🇧"}</span>
                    </div>
                    {meeting.completed > 0 && meeting.completed === meeting.total ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 uppercase">Resulted</span>
                    ) : meeting.races.some(r => {
                      const t = new Date(r.off_time);
                      return t <= now && r.status !== "resulted";
                    }) ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 animate-pulse uppercase">LIVE</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase">Upcoming</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="capitalize">{meeting.raceType}</span>
                    <span>{meeting.firstTime} – {meeting.lastTime}</span>
                    <span className={`${meeting.going?.toLowerCase().includes("good") ? "text-emerald-400" : "text-amber-400"}`}>
                      {meeting.going || "N/A"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {meeting.total} races · {meeting.completed} completed
                  </div>
                </Link>

                {/* Race Times */}
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {meeting.races.map(race => {
                    const t = new Date(race.off_time);
                    const raceResults = resultsMap[race.id] || [];
                    const hasResults = raceResults.length > 0;
                    const isLive = t <= now && !hasResults && race.status !== "resulted";
                    const isResulted = hasResults || race.status === "resulted";

                    return (
                      <Link
                        key={race.id}
                        href={`/races/${race.id}`}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors ${
                          isLive
                            ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                            : isResulted
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                            : "bg-white/[0.04] border border-white/[0.06] text-gray-300 hover:border-emerald-500/20"
                        }`}
                      >
                        {t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </Link>
                    );
                  })}
                </div>

                {/* Results Preview (for resulted races) */}
                {meeting.races.some(r => resultsMap[r.id]?.length > 0 || r.status === "resulted") && (
                  <div className="border-t border-white/[0.04] px-4 py-3 space-y-2">
                    {meeting.races
                      .filter(r => resultsMap[r.id]?.length > 0 || r.status === "resulted")
                      .slice(0, 3)
                      .map(race => {
                        const raceResults = resultsMap[race.id] || [];
                        const t = new Date(race.off_time);
                        return (
                          <Link
                            key={race.id}
                            href={`/races/${race.id}`}
                            className="flex items-start gap-3 text-xs hover:bg-white/[0.02] rounded-lg p-1.5 -m-1.5 transition-colors group"
                          >
                            <span className="text-gray-500 font-mono min-w-[40px]">
                              {t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium truncate">{race.name}</div>
                              {raceResults.length > 0 ? (
                                <div className="text-gray-400 mt-0.5 space-y-0.5">
                                  {raceResults.slice(0, 3).map((r: any, i: number) => {
                                    const margins = i > 0 ? ["", ".5", "2.75", "4"][i] : "";
                                    return (
                                      <div key={i} className="flex items-center gap-2">
                                        <span className="text-gray-500 w-3">{i + 1}.</span>
                                        <span className="text-white/80 truncate">
                                          {(r.horses as unknown as { name: string })?.name || "Unknown"}
                                        </span>
                                        {r.starting_price && (
                                          <span className="text-emerald-400/70">{r.starting_price}</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-gray-500 italic">Result pending</div>
                              )}
                            </div>
                            <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-emerald-400 transition-colors mt-1" />
                          </Link>
                        );
                      })}
                    {meeting.races.filter(r => resultsMap[r.id]?.length > 0).length > 3 && (
                      <div className="text-center mt-1">
                        <span className="text-[10px] text-gray-500">+ more results</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
