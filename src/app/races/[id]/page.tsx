import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Clock, MapPin, TrendingUp, Award, Shield } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: race } = await supabase
    .from("races")
    .select("name, off_time, racecourses(name)")
    .eq("id", (await params).id)
    .single();

  if (!race) return { title: "Race Not Found | RaceIntel" };

  return {
    title: `${race.name} ${new Date(race.off_time).toLocaleDateString("en-GB")} | RaceIntel`,
    description: `AI-powered form analysis for ${race.name} at ${(race.racecourses as unknown as { name: string })?.name}. GG Score rankings, pace simulation, and daily selections.`,
  };
}

export default async function RaceDetailPage({ params }: Props) {
  const supabase = await createClient();
  const raceId = (await params).id;

  // Race details
  const { data: race } = await supabase
    .from("races")
    .select("*, racecourses(name, country, course_type, region, surface)")
    .eq("id", raceId)
    .single();

  if (!race) notFound();

  // Runners
  const { data: runners } = await supabase
    .from("runners")
    .select("*, horses(name, age, sex, official_rating, trainer_id, trainers(name)), jockeys(name)")
    .eq("race_id", raceId)
    .order("cloth_number");

  // GG Scores
  const { data: ggScores } = await supabase
    .from("gg_scores")
    .select("*")
    .eq("race_id", raceId)
    .order("score", { ascending: false });

  // Daily insight
  const { data: insight } = await supabase
    .from("daily_insights")
    .select("*")
    .eq("race_id", raceId)
    .single();

  // Pace simulation
  const { data: paceSim } = await supabase
    .from("pace_simulations")
    .select("*")
    .eq("race_id", raceId);

  const now = new Date();
  const offTime = new Date(race.off_time);
  const hasRun = offTime < now;
  const courseName = (race.racecourses as unknown as { name: string; country: string; course_type: string; region?: string })?.name || "Unknown";

  return (
    <main className="min-h-screen bg-[#0a0d14]">
      {/* Race Header */}
      <section className="border-b border-white/[0.06] px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm text-gray-500 mb-4">
            <a href="/races" className="hover:text-gray-300">Races</a> / {courseName} / {race.name}
          </nav>
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{race.name}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {courseName}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {offTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} {offTime.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                {race.distance_furlongs && <span>{race.distance_furlongs}f</span>}
                {race.going && <span className={race.going.includes("Good") ? "text-emerald-400" : "text-amber-400"}>{race.going}</span>}
                {race.class && <span>Class {race.class}</span>}
                {race.race_type && <span className="capitalize">{race.race_type}</span>}
                <span>{race.number_of_runners} runners</span>
              </div>
            </div>
            {hasRun && <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-sm">Resulted</span>}
            {!hasRun && <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">Upcoming</span>}
          </div>
        </div>
      </section>

      {/* GG Score Leaderboard */}
      {ggScores && ggScores.length > 0 && (
        <section className="px-6 py-8 max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            GG Score Rankings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/[0.08]">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Horse</th>
                  <th className="pb-3 font-medium text-center">GG Score</th>
                  <th className="pb-3 font-medium text-center">Form</th>
                  <th className="pb-3 font-medium text-center">Class</th>
                  <th className="pb-3 font-medium text-center">Pace</th>
                  <th className="pb-3 font-medium text-center">Trainer</th>
                  <th className="pb-3 font-medium text-center">Jockey</th>
                  <th className="pb-3 font-medium text-center">Draw</th>
                  <th className="pb-3 font-medium text-center">Going</th>
                  <th className="pb-3 font-medium text-center">Distance</th>
                  <th className="pb-3 font-medium text-center">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {ggScores.map((gg, idx) => (
                  <tr key={gg.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="py-3 text-gray-400">{idx + 1}</td>
                    <td className="py-3">
                      <div className="text-white font-medium">{gg.horse_name}</div>
                      {gg.reasoning && <div className="text-xs text-gray-500 max-w-xs">{gg.reasoning}</div>}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                        gg.score >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                        gg.score >= 65 ? "bg-amber-500/20 text-amber-400" :
                        "bg-gray-700 text-gray-300"
                      }`}>
                        {Math.round(gg.score)}
                      </span>
                    </td>
                    <td className="py-3 text-center text-gray-300">{gg.form_score != null ? Math.round(gg.form_score) : "—"}</td>
                    <td className="py-3 text-center text-gray-300">{gg.class_score != null ? Math.round(gg.class_score) : "—"}</td>
                    <td className="py-3 text-center text-gray-300">{gg.pace_score != null ? Math.round(gg.pace_score) : "—"}</td>
                    <td className="py-3 text-center text-gray-300">{gg.trainer_score != null ? Math.round(gg.trainer_score) : "—"}</td>
                    <td className="py-3 text-center text-gray-300">{gg.jockey_score != null ? Math.round(gg.jockey_score) : "—"}</td>
                    <td className="py-3 text-center text-gray-300">{gg.draw_score != null ? Math.round(gg.draw_score) : "—"}</td>
                    <td className="py-3 text-center text-gray-300">{gg.going_score != null ? Math.round(gg.going_score) : "—"}</td>
                    <td className="py-3 text-center text-gray-300">{gg.distance_score != null ? Math.round(gg.distance_score) : "—"}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        gg.confidence === "High" ? "bg-emerald-500/20 text-emerald-400" :
                        gg.confidence === "Medium" ? "bg-amber-500/20 text-amber-400" :
                        "bg-gray-700 text-gray-300"
                      }`}>{gg.confidence || "Medium"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* No GG Scores — prompt upgrade */}
      {(!ggScores || ggScores.length === 0) && (
        <section className="px-6 py-12 max-w-6xl mx-auto text-center">
          <div className="max-w-md mx-auto p-8 rounded-xl bg-gradient-to-b from-emerald-500/5 to-emerald-500/[0.01] border border-emerald-500/10">
            <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Unlock GG Score Rankings</h2>
            <p className="text-gray-400 text-sm mb-6">
              See 13-factor AI rankings for every runner including form, class, pace, trainer & jockey stats, 
              draw bias, going suitability, and a composite GG Score.
            </p>
            <a href="/auth?tab=signup" className="inline-flex px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors">
              Start Free Trial
            </a>
          </div>
        </section>
      )}

      {/* Daily Insight */}
      {insight && (
        <section className="px-6 py-8 max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            AI Selection
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.03] border border-emerald-500/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500 mb-1">🏆 Top Selection</div>
                <div className="text-emerald-400 font-bold text-lg">{insight.top_selection}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">⚠️ Main Danger</div>
                <div className="text-amber-400 font-semibold">{insight.main_danger}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">💎 Value Pick</div>
                <div className="text-blue-400 font-semibold">{insight.value_pick}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">🔭 Outsider Watch</div>
                <div className="text-purple-400 font-semibold">{insight.outsider_watch}</div>
              </div>
            </div>
            {insight.reasoning && (
              <p className="text-gray-400 text-sm mt-4 leading-relaxed">{insight.reasoning}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span className={`px-2 py-0.5 rounded-full ${
                insight.confidence === "High" ? "bg-emerald-500/20 text-emerald-400" :
                insight.confidence === "Medium" ? "bg-amber-500/20 text-amber-400" : "bg-gray-700 text-gray-300"
              }`}>Confidence: {insight.confidence || "Medium"}</span>
              {insight.model_used && <span>Model: {insight.model_used}</span>}
            </div>
          </div>
        </section>
      )}

      {/* Pace Simulation */}
      {paceSim && paceSim.length > 0 && (
        <section className="px-6 py-8 max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">🏃 Pace Simulation</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {paceSim.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-white font-medium text-sm mb-1">{p.horse_name}</div>
                <div className="text-xs text-gray-400 mb-2">
                  {p.predicted_position} · Early Pace: {p.early_pace_score}/10 · Late Pace: {p.late_pace_score}/10
                </div>
                {p.clash_detected && <div className="text-xs text-red-400">⚠️ Front-runner clash</div>}
                {p.scenario_description && <div className="text-xs text-gray-500 mt-1">{p.scenario_description}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Runner Cards */}
      <section className="px-6 py-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4">Runners ({runners?.length || 0})</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {runners?.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-white font-semibold">
                    {(r.horses as unknown as { name: string })?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {(r.horses as unknown as { age: number; sex: string })?.age}yo {(r.horses as unknown as { sex: string })?.sex} · 
                    OR: {(r.horses as unknown as { official_rating: number })?.official_rating || "—"}
                  </div>
                </div>
                <div className="text-right">
                  {r.cloth_number && <div className="text-2xl font-bold text-gray-500">#{r.cloth_number}</div>}
                  {r.live_odds && <div className="text-sm text-gray-400">{Number(r.live_odds).toFixed(1)}</div>}
                </div>
              </div>
              <div className="text-xs text-gray-500 space-x-3">
                {r.jockeys && <span>J: {(r.jockeys as unknown as { name: string })?.name}</span>}
                {r.horses && <span>T: {((r.horses as unknown as { trainers?: { name: string } })?.trainers as unknown as { name: string })?.name || "—"}</span>}
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-gray-400">Draw: {r.draw || "—"}</span>
                <span className="text-gray-400">Weight: {r.weight_lbs ? `${r.weight_lbs}lbs` : "—"}</span>
                {r.form_figures && <span className="text-gray-400">Form: {r.form_figures}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}