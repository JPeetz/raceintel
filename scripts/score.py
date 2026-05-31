"""
RaceIntel GG Score + Pace Simulation Pipeline
===============================================
Runs after ingest.py. For each today's race, calls OpenRouter to:
- Score every runner on 13 factors → composite GG Score
- Predict pace profile per runner (front-runner/mid-pack/held-up)
- Generate daily insights (top selection, danger, value pick, outsider)
- Store everything in Supabase (gg_scores, daily_insights, pace_simulations)

Usage:
  python3 score.py                    # Score all today's races
  python3 score.py --date 2026-05-31  # Score specific date

Env vars: OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
"""

import os, sys, json, time, argparse
from datetime import datetime, timedelta
from typing import Optional
import requests
from supabase import create_client

# ── Config ──────────────────────────────────────────────────────────
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = ***"SUPABASE_SERVICE_KEY", "")
MODEL = "deepseek/deepseek-v4-flash"
OR_URL = "https://openrouter.ai/api/v1/chat/completions"

if not all([OPENROUTER_KEY, SUPABASE_URL, SUPABASE_KEY]):
    print("❌ Missing env vars: OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── System Prompt ───────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a professional horse racing form analyst. For each runner in the race, score 0-100 on these 13 factors and produce a composite GG Score. Also analyze pace dynamics for the race as a whole.

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
      "reasoning": "one sentence explaining the score",
      "pace": {
        "predicted_position": "front-runner|prominent|mid-pack|held-up",
        "early_pace_score": 7,
        "late_pace_score": 5,
        "clash_detected": false,
        "scenario_description": "one sentence about pace scenario"
      }
    }
  ],
  "top_selection": "string - horse name most likely to win",
  "main_danger": "string - main rival",
  "value_pick": "string - best value at odds",
  "outsider_watch": "string - longshot with a chance",
  "race_pace_profile": "one sentence summary of how the race pace will unfold"
}"""


# ── Main Logic ──────────────────────────────────────────────────────

def score_races(target_date: Optional[str] = None):
    today = target_date or datetime.now().strftime("%Y-%m-%d")
    tomorrow = (datetime.strptime(today, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")

    print(f"🧠 Scoring races for {today}...")

    # Fetch today's races
    races = supabase.table("races").select(
        "id, name, off_time, distance_furlongs, going, class, race_type, "
        "racecourses(name, country, course_type)"
    ).gte("off_time", f"{today}T00:00:00").lt("off_time", f"{tomorrow}T00:00:00").execute()

    if not races.data:
        print("  ❌ No races found for today")
        return {"scored": 0, "errors": 0}

    print(f"  📋 {len(races.data)} races to score")

    scored = 0
    errors = 0
    skipped = 0

    for race in races.data:
        race_id = race["id"]
        race_name = race["name"]

        # Check if already scored
        existing = supabase.table("gg_scores").select("id").eq("race_id", race_id).limit(1).execute()
        if existing.data and len(existing.data) > 0:
            skipped += 1
            continue

        # Fetch runners
        runners = supabase.table("runners").select(
            "id, draw, weight_lbs, official_rating, form_figures, "
            "horses(name, age, sex, sire, dam, official_rating, trainer_id, trainers(name)), "
            "jockeys(name)"
        ).eq("race_id", race_id).execute()

        if not runners.data or len(runners.data) < 2:
            print(f"  ⚠️  {race_name}: too few runners, skipping")
            errors += 1
            continue

        # Build payload
        course_name = (race.get("racecourses") or {}).get("name", "Unknown")
        runners_payload = []
        for r in runners.data:
            horse = r.get("horses") or {}
            jockey = r.get("jockeys") or {}
            trainers = horse.get("trainers") or {}
            runners_payload.append({
                "horse_name": horse.get("name", "Unknown"),
                "trainer_name": trainers.get("name", "Unknown") if trainers else "Unknown",
                "jockey_name": jockey.get("name", "Unknown"),
                "draw": r.get("draw"),
                "weight_lbs": r.get("weight_lbs"),
                "official_rating": r.get("official_rating") or horse.get("official_rating"),
                "form_figures": r.get("form_figures"),
                "age": horse.get("age"),
                "sex": horse.get("sex"),
                "sire": horse.get("sire"),
                "dam": horse.get("dam"),
            })

        race_payload = {
            "race_name": race_name,
            "course": course_name,
            "off_time": race["off_time"],
            "distance_furlongs": race.get("distance_furlongs"),
            "going": race.get("going"),
            "race_class": race.get("class"),
            "race_type": race.get("race_type"),
            "number_of_runners": len(runners.data),
            "runners": runners_payload,
        }

        try:
            # Call OpenRouter
            resp = requests.post(OR_URL, headers={
                "Authorization": f"Bearer {OPENROUTER_KEY}",
                "Content-Type": "application/json",
            }, json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": json.dumps(race_payload)},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.3,
                "max_tokens": 4096,
            }, timeout=60)

            if resp.status_code == 429:
                wait = int(resp.headers.get("Retry-After", 10))
                print(f"  ⚠️  Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue

            if resp.status_code != 200:
                print(f"  ❌ {race_name}: HTTP {resp.status_code} — {resp.text[:200]}")
                errors += 1
                continue

            body = resp.json()
            content = body["choices"][0]["message"]["content"]
            result = json.loads(content)

            # ── Store GG Scores ──
            score_inserts = []
            for runner_score in result.get("runners", []):
                factors = runner_score.get("factors", {})
                score_inserts.append({
                    "race_id": race_id,
                    "horse_name": runner_score["horse_name"],
                    "score": runner_score.get("composite", 50),
                    "form_score": factors.get("form"),
                    "class_score": factors.get("class"),
                    "pace_score": factors.get("pace"),
                    "trainer_score": factors.get("trainer"),
                    "jockey_score": factors.get("jockey"),
                    "draw_score": factors.get("draw"),
                    "going_score": factors.get("going"),
                    "course_score": factors.get("course"),
                    "distance_score": factors.get("distance"),
                    "weight_score": factors.get("weight"),
                    "age_score": factors.get("age"),
                    "market_score": factors.get("market"),
                    "head_to_head_score": factors.get("head_to_head"),
                    "reasoning": runner_score.get("reasoning"),
                    "confidence": runner_score.get("confidence", "Medium"),
                    "model_used": MODEL,
                })

            supabase.table("gg_scores").upsert(
                score_inserts, on_conflict="race_id,horse_name"
            ).execute()

            # ── Store Pace Simulations ──
            pace_inserts = []
            for runner_score in result.get("runners", []):
                pace = runner_score.get("pace", {})
                if pace:
                    pace_inserts.append({
                        "race_id": race_id,
                        "horse_name": runner_score["horse_name"],
                        "predicted_position": pace.get("predicted_position", "mid-pack"),
                        "early_pace_score": pace.get("early_pace_score", 5),
                        "late_pace_score": pace.get("late_pace_score", 5),
                        "clash_detected": pace.get("clash_detected", False),
                        "scenario_description": pace.get("scenario_description"),
                    })

            if pace_inserts:
                supabase.table("pace_simulations").upsert(
                    pace_inserts, on_conflict="race_id,horse_name"
                ).execute()

            # ── Store Daily Insights ──
            supabase.table("daily_insights").upsert({
                "date": today,
                "race_id": race_id,
                "top_selection": result.get("top_selection", ""),
                "main_danger": result.get("main_danger", ""),
                "value_pick": result.get("value_pick", ""),
                "outsider_watch": result.get("outsider_watch", ""),
                "confidence": result.get("confidence", "Medium"),
                "reasoning": result.get("race_pace_profile", ""),
                "model_used": MODEL,
            }, on_conflict="date,race_id").execute()

            scored += 1
            tops = result.get("top_selection", "?")
            pace = result.get("race_pace_profile", "")[:60]
            print(f"  ✅ {race_name[:50]}: 🏆 {tops} | {len(runners.data)} scored | {pace}")

        except json.JSONDecodeError as e:
            print(f"  ❌ {race_name}: JSON parse error — {str(e)[:100]}")
            errors += 1
        except Exception as e:
            print(f"  ❌ {race_name}: {type(e).__name__} — {str(e)[:150]}")
            errors += 1

        # Rate limit: 1 req/sec for free tier OpenRouter
        time.sleep(1.0)

    print(f"\n📊 {scored} scored | {skipped} skipped | {errors} errors")
    return {"scored": scored, "skipped": skipped, "errors": errors}


# ── CLI ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="RaceIntel GG Score + Pace Pipeline")
    parser.add_argument("--date", help="Score specific date (YYYY-MM-DD)")
    args = parser.parse_args()

    start = datetime.now()
    result = score_races(args.date)
    elapsed = (datetime.now() - start).total_seconds()
    print(f"\n⏱️  Completed in {elapsed:.1f}s")


if __name__ == "__main__":
    main()