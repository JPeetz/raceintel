"""
RaceIntel Data Ingestion Pipeline
==================================
Fetches UK & Irish racing data from The Racing API (free tier) and loads into Supabase.
Runs daily via cron or manual invocation.

Usage:
  python3 ingest.py                  # Ingest today's data
  python3 ingest.py --full-sync      # Ingest today + seed racecourses

Environment (from .env):
  RACING_API_USERNAME   The Racing API username
  RACING_API_PASSWORD   The Racing API password
  SUPABASE_URL          Supabase project URL
  SUPABASE_SERVICE_KEY   Supabase service role key
"""

import os, sys, json, argparse
from datetime import datetime, timedelta
from typing import Optional
import requests
from requests.auth import HTTPBasicAuth
from supabase import create_client

# ── Config ──────────────────────────────────────────────────────────
RACING_API_USERNAME = os.getenv("RACING_API_USERNAME", "")
RACING_API_PASSWORD = os.getenv("RACING_API_PASSWORD", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
RACING_API_BASE = "https://api.theracingapi.com/v1"

if not all([RACING_API_USERNAME, RACING_API_PASSWORD, SUPABASE_URL, SUPABASE_KEY]):
    print("❌ Missing env vars: RACING_API_USERNAME, RACING_API_PASSWORD, "
          "SUPABASE_URL, SUPABASE_SERVICE_KEY")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
auth = HTTPBasicAuth(RACING_API_USERNAME, RACING_API_PASSWORD)

# ── API Helpers ─────────────────────────────────────────────────────

def fetch_free_racecards(retries: int = 3) -> dict:
    """Fetch today's racecards from the free tier endpoint."""
    url = f"{RACING_API_BASE}/racecards/free"
    for attempt in range(retries):
        try:
            resp = requests.get(url, auth=auth, timeout=30)
            if resp.status_code == 429:
                wait = max(int(resp.headers.get("Retry-After", 5)), 1)
                print(f"  ⚠️ Rate-limited, waiting {wait}s...")
                import time; time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as e:
            if attempt < retries - 1:
                print(f"  ⚠️ Attempt {attempt+1} failed: {e}, retrying...")
                import time; time.sleep(2)
            else:
                raise
    return {"racecards": []}


def fetch_courses() -> list:
    """Fetch all courses from API."""
    resp = requests.get(f"{RACING_API_BASE}/courses", auth=auth, timeout=30)
    resp.raise_for_status()
    return resp.json().get("courses", [])


# ── Ingestion Functions ─────────────────────────────────────────────

def ingest_racecourses() -> dict:
    """Ingest all UK & Irish racecourses from the courses endpoint."""
    print("🏇 Ingesting racecourses...")
    courses = fetch_courses()

    # Filter to GB + IRE only
    gb_ire = [c for c in courses if c.get("region_code") in ("gb", "ire")]

    upserted = 0
    for c in gb_ire:
        try:
            supabase.table("racecourses").upsert({
                "name": c.get("course"),
                "country": _normalize_country(c.get("region_code", "gb")),
                "region": c.get("region"),
                "surface": c.get("surface"),
            }, on_conflict="name").execute()
            upserted += 1
        except Exception as e:
            print(f"  ⚠️ Failed {c.get('course')}: {e}")
    print(f"  ✅ {upserted} UK/IE racecourses")
    return {"racecourses": upserted}


def ingest_racecards() -> dict:
    """Ingest today's UK/IE racecards into Supabase."""
    print("🏇 Fetching today's racecards...")
    data = fetch_free_racecards()
    all_cards = data.get("racecards", [])

    # Filter to GB + IRE only
    cards = [c for c in all_cards if c.get("region") in ("GB", "IRE")]
    print(f"  📋 {len(all_cards)} total racecards, {len(cards)} UK/IE")

    race_count = 0
    runner_count = 0
    horse_count = 0
    errors = 0

    for r in cards:
        course_name = r.get("course")

        # ── Course ──
        # Upsert racecourse (gentle upsert — might already exist from seed)
        try:
            course_result = supabase.table("racecourses").upsert({
                "name": course_name,
                "country": _normalize_country(r.get("region", "GB")),
                "course_type": _map_course_type(r),
                "surface": r.get("surface"),
            }, on_conflict="name").execute()

            if course_result.data:
                course_id = course_result.data[0]["id"]
            else:
                lookup = supabase.table("racecourses").select("id").eq("name", course_name).execute()
                course_id = lookup.data[0]["id"] if lookup.data else None
        except Exception as e:
            print(f"  ⚠️ Course error [{course_name}]: {e}")
            errors += 1
            continue

        if not course_id:
            print(f"  ⚠️ Could not resolve course: {course_name}")
            errors += 1
            continue

        # ── Race ──
        race_data = {
            "racecourse_id": course_id,
            "off_time": r.get("off_dt"),  # ISO datetime from API
            "name": r.get("race_name", "Unknown"),
            "distance_furlongs": _safe_float(r.get("distance_f")),
            "class": _safe_int(_parse_class(r.get("race_class"))),
            "going": r.get("going"),
            "race_type": _map_race_type(r),
            "age_restriction": r.get("age_band"),
            "sex_restriction": r.get("sex_restriction"),
            "purse": r.get("prize"),
            "number_of_runners": r.get("field_size"),
            "region": r.get("region"),
            "racing_api_id": r.get("race_id"),
            "status": _map_status(r.get("race_status", "declared")),
        }

        try:
            race_result = supabase.table("races").upsert(
                race_data, on_conflict="racing_api_id"
            ).execute()
            race_id = race_result.data[0]["id"] if race_result.data else None
        except Exception as e:
            print(f"  ⚠️ Race error [{r.get('race_name')}]: {e}")
            errors += 1
            continue

        if not race_id:
            errors += 1
            continue

        race_count += 1

        # ── Runners ──
        for run in r.get("runners", []):
            horse_name = run.get("horse", "Unknown")
            trainer_name = run.get("trainer", "Unknown")
            jockey_name = run.get("jockey", "Unknown")

            try:
                # Trainer
                t_result = supabase.table("trainers").upsert({
                    "name": trainer_name,
                    "racing_api_id": run.get("trainer_id") or None,
                }, on_conflict="racing_api_id").execute()
                trainer_id = t_result.data[0]["id"] if t_result.data else None

                # Jockey
                j_result = supabase.table("jockeys").upsert({
                    "name": jockey_name,
                    "racing_api_id": run.get("jockey_id") or None,
                }, on_conflict="racing_api_id").execute()
                jockey_id = j_result.data[0]["id"] if j_result.data else None

                # Horse
                h_result = supabase.table("horses").upsert({
                    "name": horse_name,
                    "trainer_id": trainer_id,
                    "age": _safe_int(run.get("age")),
                    "sex": run.get("sex"),
                    "sire": run.get("sire"),
                    "dam": run.get("dam"),
                    "official_rating": _safe_int(run.get("ofr")),
                    "racing_api_id": run.get("horse_id"),
                }, on_conflict="name").execute()
                horse_id = h_result.data[0]["id"] if h_result.data else None
                horse_count += 1

                # Runner
                supabase.table("runners").upsert({
                    "race_id": race_id,
                    "horse_id": horse_id,
                    "jockey_id": jockey_id,
                    "draw": _safe_int(run.get("draw")),
                    "weight_lbs": _safe_int(float(run.get("lbs")) if run.get("lbs") else None),
                    "official_rating": _safe_int(run.get("ofr")),
                    "cloth_number": _safe_int(run.get("number")),
                    "form_figures": run.get("form"),
                    "racing_api_id": f"{r.get('race_id')}-{run.get('horse_id')}",
                }, on_conflict="racing_api_id").execute()
                runner_count += 1

            except Exception as e:
                print(f"  ⚠️ Runner error [{horse_name}]: {e}")
                errors += 1

    print(f"  ✅ {race_count} races | {runner_count} runners | {horse_count} horses | {errors} errors")
    return {
        "races": race_count,
        "runners": runner_count,
        "horses": horse_count,
        "errors": errors,
    }


# ── Helpers ─────────────────────────────────────────────────────────

def _safe_int(val) -> Optional[int]:
    try:
        return int(val) if val is not None and str(val).strip() else None
    except (ValueError, TypeError):
        return None

def _safe_float(val) -> Optional[float]:
    try:
        return float(val) if val is not None and str(val).strip() else None
    except (ValueError, TypeError):
        return None

def _parse_class(cls_str: str) -> Optional[str]:
    """Extract class number from 'Class 5' etc."""
    if not cls_str:
        return None
    import re
    m = re.search(r"(\d+)", str(cls_str))
    return m.group(1) if m else None

def _map_race_type(race: dict) -> str:
    """Map API type to our schema."""
    typ = (race.get("type") or "flat").lower()
    mapping = {
        "flat": "flat",
        "hurdle": "jumps",
        "chase": "jumps",
        "bumper": "jumps",
        "nhf": "jumps",
        "nh flat": "jumps",
    }
    return mapping.get(typ, typ)

def _map_course_type(race: dict) -> Optional[str]:
    """Infer course type from race type."""
    typ = _map_race_type(race)
    surface = (race.get("surface") or "").lower()
    if surface in ("all-weather", "aw", "fibresand", "polytrack"):
        return "aw"
    return "flat" if typ == "flat" else "dual"

def _normalize_country(code: str) -> str:
    """Normalize country code to our schema's GB/IE constraint."""
    code = str(code or "GB").strip().upper()
    mapping = {"IRE": "IE", "GB": "GB", "UK": "GB", "ENG": "GB", "SCO": "GB", "WAL": "GB"}
    return mapping.get(code, code)


def _map_status(status: str) -> str:
    mapping = {
        "declared": "declared",
        "open": "open",
        "closed": "closed",
        "resulted": "resulted",
        "abandoned": "abandoned",
    }
    return mapping.get(str(status).lower(), "declared")


# ── CLI ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="RaceIntel Data Ingestion Pipeline")
    parser.add_argument("--full-sync", action="store_true",
                        help="Seed racecourses + ingest today's racecards")
    args = parser.parse_args()

    start = datetime.now()
    results = {}

    if args.full_sync:
        results["courses"] = ingest_racecourses()

    results["ingest"] = ingest_racecards()

    elapsed = (datetime.now() - start).total_seconds()
    print(f"\n⏱️  Completed in {elapsed:.1f}s")
    print(f"📊 {json.dumps(results, indent=2)}")


if __name__ == "__main__":
    main()
