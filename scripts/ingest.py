"""
RaceIntel Data Ingestion Pipeline
==================================
Fetches UK & Irish racing data from The Racing API and loads into Supabase.
Runs daily via cron or manual invocation.

Usage:
  python3 ingest.py                  # Ingest today's data
  python3 ingest.py --date 2026-05-29  # Ingest specific date
  python3 ingest.py --full-sync      # Full historical sync

Environment (from .env):
  RACING_API_KEY        The Racing API key (theracingapi.com)
  SUPABASE_URL          Supabase project URL
  SUPABASE_SERVICE_KEY   Supabase service role key
"""

import os, sys, json, argparse
from datetime import datetime, timedelta
from typing import Optional
import requests
from supabase import create_client

# ── Config ──────────────────────────────────────────────────────────
RACING_API_KEY = os.getenv("RACING_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
RACING_API_BASE = "https://api.theracingapi.com/v1"

if not all([RACING_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    print("❌ Missing environment variables: RACING_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── API Helpers ─────────────────────────────────────────────────────
def fetch_from_racing_api(endpoint: str, params: Optional[dict] = None) -> dict:
    """Fetch data from The Racing API."""
    resp = requests.get(
        f"{RACING_API_BASE}/{endpoint}",
        params=params,
        headers={"Authorization": f"Bearer {RACING_API_KEY}"},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()

# ── Ingestion Functions ─────────────────────────────────────────────
def ingest_racecourses() -> dict:
    """Ingest all UK & Irish racecourses."""
    print("🏇 Ingesting racecourses...")
    courses = fetch_from_racing_api("courses", {"country": "GB,IRE"})
    upserted = 0
    for c in courses.get("courses", []):
        try:
            result = supabase.table("racecourses").upsert({
                "name": c.get("course"),
                "country": c.get("country", "GB"),
                "course_type": c.get("course_type", "dual").lower(),
                "region": c.get("region"),
                "surface": c.get("surface"),
                "url": c.get("url"),
            }, on_conflict="name").execute()
            upserted += 1 if result.data else 0
        except Exception as e:
            print(f"  ⚠️ Failed {c.get('course')}: {e}")
    print(f"  ✅ {upserted} racecourses")
    return {"racecourses": upserted}

def ingest_races(date: Optional[str] = None) -> dict:
    """Ingest races for a given date."""
    target_date = date or datetime.now().strftime("%Y-%m-%d")
    print(f"🏇 Ingesting races for {target_date}...")

    races = fetch_from_racing_api("races", {"date": target_date, "country": "GB,IRE"})
    race_count = 0
    horse_count = 0
    runner_count = 0

    for r in races.get("races", []):
        course_name = r.get("course")
        
        # Upsert course
        course_result = supabase.table("racecourses").upsert({
            "name": course_name,
            "country": r.get("country", "GB"),
            "course_type": r.get("race_type", "flat").lower(),
        }, on_conflict="name").execute()

        course_id = None
        if course_result.data:
            course_id = course_result.data[0]["id"]
        else:
            # Look up
            lookup = supabase.table("racecourses").select("id").eq("name", course_name).execute()
            if lookup.data:
                course_id = lookup.data[0]["id"]

        if not course_id:
            print(f"  ⚠️ Could not resolve course: {course_name}")
            continue

        # Upsert race
        race_data = {
            "racecourse_id": course_id,
            "off_time": r.get("off_time") or f"{target_date}T{r.get('off')}:00",
            "name": r.get("race_name") or r.get("race_title", ""),
            "distance_furlongs": r.get("distance_furlongs"),
            "class": r.get("class"),
            "going": r.get("going"),
            "race_type": r.get("race_type", "flat").lower(),
            "age_restriction": r.get("age_restriction"),
            "number_of_runners": r.get("number_of_runners"),
            "region": r.get("region"),
            "racing_api_id": r.get("race_id"),
        }

        race_result = supabase.table("races").upsert(
            race_data, on_conflict="racing_api_id"
        ).execute()

        race_id = race_result.data[0]["id"] if race_result.data else None
        if not race_id:
            continue

        race_count += 1

        # Ingest runners
        for run in r.get("runners", []):
            horse_name = run.get("horse") or run.get("horse_name", "Unknown")
            trainer_name = run.get("trainer") or "Unknown"
            jockey_name = run.get("jockey") or "Unknown"

            # Upsert trainer
            t_result = supabase.table("trainers").upsert({
                "name": trainer_name,
                "racing_api_id": run.get("trainer_id"),
            }, on_conflict="name").execute()

            # Upsert jockey
            j_result = supabase.table("jockeys").upsert({
                "name": jockey_name,
                "racing_api_id": run.get("jockey_id"),
            }, on_conflict="name").execute()

            # Upsert horse
            h_result = supabase.table("horses").upsert({
                "name": horse_name,
                "trainer_id": t_result.data[0]["id"] if t_result.data else None,
                "age": run.get("age"),
                "sex": run.get("sex"),
                "sire": run.get("sire"),
                "dam": run.get("dam"),
                "official_rating": run.get("official_rating"),
                "racing_api_id": run.get("horse_id"),
            }, on_conflict="name").execute()

            horse_id = h_result.data[0]["id"] if h_result.data else None
            horse_count += 1

            # Upsert runner
            supabase.table("runners").upsert({
                "race_id": race_id,
                "horse_id": horse_id,
                "jockey_id": j_result.data[0]["id"] if j_result.data else None,
                "draw": run.get("draw"),
                "weight_lbs": run.get("weight_lbs"),
                "official_rating": run.get("official_rating"),
                "cloth_number": run.get("cloth_number"),
                "early_odds": run.get("early_odds"),
                "live_odds": run.get("live_odds"),
                "form_figures": run.get("form"),
                "racing_api_id": run.get("runner_id"),
            }, on_conflict="racing_api_id").execute()

            runner_count += 1

    print(f"  ✅ {race_count} races, {runner_count} runners, {horse_count} horses")
    return {"races": race_count, "runners": runner_count, "horses": horse_count}

def full_sync():
    """Sync the last 30 days of data."""
    print("🔄 Full sync — last 30 days")
    ingest_racecourses()
    for i in range(30):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        ingest_races(date)

# ── CLI ─────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="RaceIntel Data Ingestion Pipeline")
    parser.add_argument("--date", help="Ingest specific date (YYYY-MM-DD)")
    parser.add_argument("--full-sync", action="store_true", help="Full historical sync (30 days)")
    args = parser.parse_args()

    start = datetime.now()

    if args.full_sync:
        full_sync()
    else:
        ingest_racecourses()
        ingest_races(args.date)

    elapsed = (datetime.now() - start).total_seconds()
    print(f"\n⏱️ Completed in {elapsed:.1f}s")


if __name__ == "__main__":
    main()