"""
RaceIntel GG Score + Pace Simulation Pipeline
Runs after ingest.py. Calls OpenRouter to score runners and predict pace.
Usage: python3 score.py [--date YYYY-MM-DD]
Env: OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
"""

import os, sys, json, time, argparse
from datetime import datetime, timedelta
from typing import Optional
import requests
from supabase import create_client

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SVC_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
MODEL = "google/gemini-2.5-flash-lite"
OR_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """You are a horse racing analyst. Return ONLY a valid JSON object with keys: runners (array with horse_name, factors{form,class,pace,trainer,jockey,draw,going,course,distance,weight,age,market,head_to_head 0-100}, composite 0-100, confidence High/Medium/Low, reasoning, pace_predicted front-runner/prominent/mid-pack/held-up, pace_early 1-10, pace_late 1-10, pace_clash boolean), top_selection, main_danger, value_pick, outsider_watch, race_pace_profile."""

if not all([OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SVC_KEY]):
    print("Missing env vars")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SVC_KEY)


def _norm_confidence(val) -> str:
    if val is None: return "Medium"
    if isinstance(val, int):
        if val >= 4: return "High"
        if val >= 2: return "Medium"
        return "Low"
    s = str(val).lower()
    if s in ("high", "4", "5"): return "High"
    if s in ("moderate", "2", "3"): return "Medium"
    return "Low" if s in ("low", "1") else "Medium"


def _norm_clash(val) -> bool:
    if isinstance(val, bool): return val
    if val is None: return False
    return str(val).lower() in ("high", "true", "yes", "1")


def score_races(target_date=None):
    today = target_date or datetime.now().strftime("%Y-%m-%d")
    tomorrow = (datetime.strptime(today, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    print(f"Scoring races for {today}...")

    races = supabase.table("races").select("id,name,off_time,distance_furlongs,going,class,race_type,racecourses(name,country,course_type)").gte("off_time", f"{today}T00:00:00").lt("off_time", f"{tomorrow}T00:00:00").execute()

    if not races.data:
        print("No races found")
        return {"scored": 0, "errors": 0}

    print(f"  {len(races.data)} races to score")
    scored = skipped = errors = 0

    for race in races.data:
        race_id = race["id"]
        race_name = race.get("name", "Unknown")[:60]

        existing = supabase.table("gg_scores").select("id").eq("race_id", race_id).limit(1).execute()
        if existing.data:
            skipped += 1
            continue

        runners = supabase.table("runners").select("id,draw,weight_lbs,official_rating,form_figures,horses(name,age,sex,sire,dam,official_rating,trainer_id,trainers(name)),jockeys(name)").eq("race_id", race_id).execute()
        if not runners.data or len(runners.data) < 2:
            errors += 1
            continue

        course_name = (race.get("racecourses") or {}).get("name", "Unknown")
        runner_data = []
        for r in runners.data:
            h = r.get("horses") or {}
            t = h.get("trainers") or {}
            j = r.get("jockeys") or {}
            runner_data.append({
                "horse_name": h.get("name", "Unknown"),
                "trainer_name": t.get("name", "Unknown") if t else "Unknown",
                "jockey_name": j.get("name", "Unknown"),
                "draw": r.get("draw"),
                "weight_lbs": r.get("weight_lbs"),
                "official_rating": r.get("official_rating") or h.get("official_rating"),
                "form_figures": r.get("form_figures"),
                "age": h.get("age"), "sex": h.get("sex"),
                "sire": h.get("sire"), "dam": h.get("dam"),
            })

        race_payload = {
            "race_name": race_name, "course": course_name,
            "off_time": race.get("off_time"),
            "distance_furlongs": race.get("distance_furlongs"),
            "going": race.get("going"), "class": race.get("class"),
            "race_type": race.get("race_type"),
            "number_of_runners": len(runners.data),
            "runners": runner_data,
        }

        try:
            resp = requests.post(OR_URL, headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            }, json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": json.dumps(race_payload)},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.3, "max_tokens": 4096,
            }, timeout=90)

            if resp.status_code == 429:
                wait = int(resp.headers.get("Retry-After", 10))
                print(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue
            if resp.status_code != 200:
                print(f"  HTTP {resp.status_code}: {resp.text[:200]}")
                errors += 1
                continue

            body = resp.json()
            content = body["choices"][0]["message"]["content"]
            result = json.loads(content)

            # GG Scores
            score_inserts = []
            for rn in result.get("runners", []):
                f = rn.get("factors", {})
                score_inserts.append({
                    "race_id": race_id, "horse_name": rn.get("horse_name", ""),
                    "score": rn.get("composite", 50),
                    "form_score": f.get("form"), "class_score": f.get("class"),
                    "pace_score": f.get("pace"), "trainer_score": f.get("trainer"),
                    "jockey_score": f.get("jockey"), "draw_score": f.get("draw"),
                    "going_score": f.get("going"), "course_score": f.get("course"),
                    "distance_score": f.get("distance"), "weight_score": f.get("weight"),
                    "age_score": f.get("age"), "market_score": f.get("market"),
                    "head_to_head_score": f.get("head_to_head"),
                    "reasoning": rn.get("reasoning", ""),
                    "confidence": _norm_confidence(rn.get("confidence")),
                    "model_used": MODEL,
                })
            supabase.table("gg_scores").upsert(score_inserts, on_conflict="race_id,horse_name").execute()

            # Pace
            pace_inserts = []
            for rn in result.get("runners", []):
                pace_inserts.append({
                    "race_id": race_id, "horse_name": rn.get("horse_name", ""),
                    "predicted_position": rn.get("pace_predicted", "mid-pack"),
                    "early_pace_score": rn.get("pace_early", 5),
                    "late_pace_score": rn.get("pace_late", 5),
                    "clash_detected": _norm_clash(rn.get("pace_clash")),
                    "scenario_description": rn.get("reasoning", ""),
                })
            supabase.table("pace_simulations").upsert(pace_inserts, on_conflict="race_id,horse_name").execute()

            # Insight
            supabase.table("daily_insights").upsert({
                "date": today, "race_id": race_id,
                "top_selection": result.get("top_selection", ""),
                "main_danger": result.get("main_danger", ""),
                "value_pick": result.get("value_pick", ""),
                "outsider_watch": result.get("outsider_watch", ""),
                "confidence": _norm_confidence(result.get("confidence")),
                "reasoning": (result.get("race_pace_profile") or "")[:500],
                "model_used": MODEL,
            }, on_conflict="date,race_id").execute()

            scored += 1
            top = result.get("top_selection", "?")
            print(f"  {race_name[:50]}: {top} | {len(runners.data)} scored")

        except json.JSONDecodeError as e:
            print(f"  JSON error [{race_name[:40]}]: {str(e)[:80]}")
            errors += 1
        except Exception as e:
            print(f"  Error [{race_name[:40]}]: {type(e).__name__}: {str(e)[:120]}")
            errors += 1

        time.sleep(1.0)

    print(f"\n{scored} scored | {skipped} skipped | {errors} errors")
    return {"scored": scored, "skipped": skipped, "errors": errors}


def main():
    p = argparse.ArgumentParser(description="RaceIntel GG Score Pipeline")
    p.add_argument("--date", help="Score specific date YYYY-MM-DD")
    args = p.parse_args()
    start = datetime.now()
    result = score_races(args.date)
    elapsed = (datetime.now() - start).total_seconds()
    print(f"Done in {elapsed:.1f}s")


if __name__ == "__main__":
    main()
