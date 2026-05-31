"""
RaceIntel Results Ingestion Pipeline
======================================
Fetches today's results from The Racing API (free tier) and loads into Supabase.
Runs after races finish — recommended ~17:00-18:00 daily.

The free /v1/results/today/free endpoint returns:
- position per runner
- horse, trainer, jockey, owner data
- official rating (OR), weight
- But NOT starting price (SP) — requires Standard plan for full results

Usage:
  python3 results.py                # Ingest today's results

Env vars: RACING_API_USERNAME, RACING_API_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_KEY
"""

import os, sys, json, time
from datetime import datetime
from typing import Optional
import requests
from requests.auth import HTTPBasicAuth
from supabase import create_client

RACING_API_USERNAME = os.getenv("RACING_API_USERNAME", "")
RACING_API_PASSWORD = os.getenv("RACING_API_PASSWORD", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

if not all([RACING_API_USERNAME, RACING_API_PASSWORD, SUPABASE_URL, SUPABASE_KEY]):
    print("Missing env vars")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
auth = HTTPBasicAuth(RACING_API_USERNAME, RACING_API_PASSWORD)


def ingest_results() -> dict:
    print("Fetching today's results...")
    
    resp = requests.get(
        "https://api.theracingapi.com/v1/results/today/free",
        auth=auth,
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()

    all_results = data.get("results", [])
    results = [r for r in all_results if r.get("region") in ("GB", "IRE")]
    print(f"  {len(all_results)} total, {len(results)} UK/IE")

    race_updated = 0
    result_inserted = 0
    errors = 0

    for result in results:
        race_api_id = result.get("race_id")
        if not race_api_id:
            errors += 1
            continue

        race_lookup = supabase.table("races").select("id").eq("racing_api_id", race_api_id).execute()
        if not race_lookup.data:
            print(f"  SKIP: {result.get('course')} {result.get('off')} — not in DB")
            errors += 1
            continue

        race_id = race_lookup.data[0]["id"]

        # Mark race as resulted
        supabase.table("races").update({"status": "resulted"}).eq("id", race_id).execute()
        race_updated += 1

        for runner in result.get("runners", []):
            horse_api_id = runner.get("horse_id")
            horse_name = runner.get("horse", "Unknown")
            pos_raw = runner.get("position", "")
            try:
                position = int(pos_raw) if pos_raw else None
            except (ValueError, TypeError):
                # UR, PU, NR, BD, etc.
                position = None
            if not position:
                continue

            horse_lookup = supabase.table("horses").select("id").eq("racing_api_id", horse_api_id).execute()
            if not horse_lookup.data:
                horse_lookup = supabase.table("horses").select("id").eq("name", horse_name).execute()
            horse_id = horse_lookup.data[0]["id"] if horse_lookup.data else None

            if horse_id:
                # Delete existing result for this horse in this race, then insert
                supabase.table("race_results").delete().eq("race_id", race_id).eq("horse_id", horse_id).execute()
                supabase.table("race_results").insert({
                    "race_id": race_id,
                    "horse_id": horse_id,
                    "position": position,
                }).execute()
                result_inserted += 1

        time.sleep(0.3)

    print(f"  {race_updated} races updated | {result_inserted} results stored | {errors} errors")
    return {"races_updated": race_updated, "results_stored": result_inserted, "errors": errors}


def main():
    start = datetime.now()
    result = ingest_results()
    elapsed = (datetime.now() - start).total_seconds()
    print(f"Done in {elapsed:.1f}s")
    print(json.dumps(result))


if __name__ == "__main__":
    main()
