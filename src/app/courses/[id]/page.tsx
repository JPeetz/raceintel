import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, TrendingUp } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("racecourses")
    .select("name, country, course_type, region")
    .eq("id", (await params).id)
    .single();

  if (!course) return { title: "Course Not Found | RaceIntel" };

  return {
    title: `${course.name} Racecourse — Today's Races, Tips & Form Guide | RaceIntel`,
    description: `Today's ${course.name} race cards, AI-powered GG Score rankings, daily selections, and professional form analysis. ${course.country === "IE" ? "Irish" : "UK"} ${course.course_type || ""} racing.`,
  };
}

export default async function CoursePage({ params }: Props) {
  const supabase = await createClient();
  const courseId = (await params).id;

  const { data: course } = await supabase
    .from("racecourses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const today = new Date().toISOString().split("T")[0];
  
  const { data: races } = await supabase
    .from("races")
    .select("*")
    .eq("racecourse_id", courseId)
    .gte("off_time", `${today}T00:00:00`)
    .order("off_time")
    .limit(20);

  const { data: upcomingRaces } = await supabase
    .from("races")
    .select("*")
    .eq("racecourse_id", courseId)
    .gte("off_time", new Date().toISOString())
    .order("off_time")
    .limit(20);

  return (
    <main className="min-h-screen bg-[#0a0d14]">
      <section className="border-b border-white/[0.06] px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/races" className="hover:text-gray-300">Races</Link> / {course.name}
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{course.country === "IE" ? "🇮🇪" : "🇬🇧"}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{course.name} Racecourse</h1>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
            {course.region && <span>📍 {course.region}</span>}
            {course.course_type && <span className="capitalize">🏇 {course.course_type} racing</span>}
            {course.surface && <span>🟢 {course.surface}</span>}
          </div>
        </div>
      </section>

      {/* Today's Races */}
      <section className="px-6 py-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          {races && races.length > 0 ? `Today's Races (${races.length})` : "Upcoming Races"}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {(races && races.length > 0 ? races : upcomingRaces || []).map((race) => (
            <Link
              key={race.id}
              href={`/races/${race.id}`}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/20 transition-colors"
            >
              <div className="text-sm text-emerald-400 font-mono mb-1">
                {new Date(race.off_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                {" · "}
                {new Date(race.off_time).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
              <div className="text-white font-medium">{race.name}</div>
              <div className="text-sm text-gray-400 mt-1">
                {race.distance_furlongs}f · {race.going} · Class {race.class} · {race.number_of_runners}r
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}