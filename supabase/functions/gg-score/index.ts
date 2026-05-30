// RaceIntel GG Score Edge Function
// Deploys to Supabase Edge Functions. Runs daily to score all today's races.
//
// Trigger: scheduled (cron) or manual HTTP POST
//
// Deploy: supabase functions deploy gg-score

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const MODEL = "deepseek/deepseek-v4-flash";

const GG_SCORE_SYSTEM_PROMPT = `You are a professional horse racing form analyst. For each runner, score 0-100 on these 13 factors and produce a composite GG Score.

Return ONLY valid JSON in this exact format:
{
  "runners": [
    {
      "horse_name": "string",
      "factors": {
        "form": 65, "class": 72, "pace": 58, "trainer": 81, "jockey": 70,
        "draw": 45, "going": 90, "course": 55, "distance": 82,
        "weight": 60, "age": 75, "market": 68, "head_to_head": 50
      },
      "composite": 72,
      "confidence": "High|Medium|Low",
      "reasoning": "one sentence"
    }
  ],
  "top_selection": "string",
  "main_danger": "string",
  "value_pick": "string",
  "outsider_watch": "string"
}`;

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get today's date from request or use server time
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");
    const today = dateParam || new Date().toISOString().split("T")[0];
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Fetch all today's races with runners
    const { data: races, error: racesErr } = await supabase
      .from("races")
      .select("id, name, off_time, distance_furlongs, going, class, race_type, racecourses(name, country, course_type)")
      .gte("off_time", `${today}T00:00:00`)
      .lt("off_time", `${tomorrowStr}T00:00:00`);

    if (racesErr || !races) {
      return new Response(JSON.stringify({ error: "No races found", detail: racesErr }), { status: 404 });
    }

    let scored = 0;
    let errors = 0;

    for (const race of races) {
      // Get runners for this race
      const { data: runners } = await supabase
        .from("runners")
        .select("id, cloth_number, draw, weight_lbs, official_rating, early_odds, live_odds, form_figures, horses(name, age, sex, sire, dam, trainer_id, trainers(name)), jockeys(name)")
        .eq("race_id", race.id);

      if (!runners || runners.length < 2) continue;

      // Skip if already scored today
      const { data: existing } = await supabase
        .from("gg_scores")
        .select("id")
        .eq("race_id", race.id)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Build payload
      const courseName = (race.racecourses as any)?.name || "Unknown";
      const runnersPayload = runners.map((r: any) => ({
        horse_name: r.horses?.name || "Unknown",
        trainer_name: r.horses?.trainers?.name || "Unknown",
        jockey_name: r.jockeys?.name || "Unknown",
        draw: r.draw,
        weight_lbs: r.weight_lbs,
        official_rating: r.official_rating,
        early_odds: r.early_odds,
        live_odds: r.live_odds,
        form_figures: r.form_figures,
        age: r.horses?.age,
        sex: r.horses?.sex,
        sire: r.horses?.sire,
        dam: r.horses?.dam,
      }));

      const racePayload = {
        race_name: race.name,
        course: courseName,
        off_time: race.off_time,
        distance_furlongs: race.distance_furlongs,
        going: race.going,
        race_class: race.class,
        race_type: race.race_type,
        number_of_runners: runners.length,
        runners: runnersPayload,
      };

      try {
        // Call OpenRouter
        const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: "system", content: GG_SCORE_SYSTEM_PROMPT },
              { role: "user", content: JSON.stringify(racePayload) },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 4096,
          }),
        });

        if (!resp.ok) {
          console.error(`OpenRouter error for race ${race.name}: ${resp.status}`);
          errors++;
          continue;
        }

        const body = await resp.json();
        const result = JSON.parse(body.choices[0].message.content);

        // Store GG Scores
        const scoreInserts = result.runners.map((r: any) => ({
          race_id: race.id,
          horse_name: r.horse_name,
          score: r.composite,
          form_score: r.factors?.form,
          class_score: r.factors?.class,
          pace_score: r.factors?.pace,
          trainer_score: r.factors?.trainer,
          jockey_score: r.factors?.jockey,
          draw_score: r.factors?.draw,
          going_score: r.factors?.going,
          course_score: r.factors?.course,
          distance_score: r.factors?.distance,
          weight_score: r.factors?.weight,
          age_score: r.factors?.age,
          market_score: r.factors?.market,
          head_to_head_score: r.factors?.head_to_head,
          reasoning: r.reasoning,
          confidence: r.confidence,
          model_used: MODEL,
        }));

        await supabase.from("gg_scores").upsert(scoreInserts, { onConflict: "race_id,horse_name" });

        // Store daily insight
        await supabase.from("daily_insights").upsert({
          date: today,
          race_id: race.id,
          top_selection: result.top_selection,
          main_danger: result.main_danger,
          value_pick: result.value_pick,
          outsider_watch: result.outsider_watch,
          confidence: result.confidence || "Medium",
        }, { onConflict: "date,race_id" });

        scored++;
        console.log(`✅ ${race.name}: ${result.top_selection} (${runnersPayload.length} runners)`);
      } catch (e: any) {
        console.error(`❌ ${race.name}: ${e.message}`);
        errors++;
        // Rate limit: wait 2s between calls
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    return new Response(JSON.stringify({
      success: true,
      date: today,
      races_total: races.length,
      races_scored: scored,
      errors,
    }), { headers: { "Content-Type": "application/json" } });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});