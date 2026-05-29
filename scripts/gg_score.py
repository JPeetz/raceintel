"""
RaceIntel GG Score Generator
=============================
Calls OpenRouter with the same prompt/13-factor logic as the production
Supabase Edge Function. Use for validation and real-time scoring.

Usage:
  python3 gg_score.py --date 2026-05-29       # Score today's races
  python3 gg_score.py --race-id race_123       # Score a single race
  python3 gg_score.py --validate               # Run in validation mode (store to Supabase)

Environment:
  OPENROUTER_API_KEY    OpenRouter API key
  SUPABASE_URL          Supabase project URL  
  SUPABASE_SERVICE_KEY   Supabase service role key
"""

import json, os, sys, argparse
from datetime import datetime
from typing import Optional

import requests

# ── Config ──────────────────────────────────────────────────────────
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
MODEL = "deepseek/deepseek-v4-flash"  # Fast, cheap, effective for structured scoring

# ── Prompts ─────────────────────────────────────────────────────────
GG_SCORE_SYSTEM_PROMPT = """You are a professional horse racing form analyst working at a leading racing intelligence platform.

For each runner in the race, score them 0-100 on these 13 factors:

1. FORM — quality of last 3 runs (recency, class level of those runs, finishing positions)
2. CLASS — how the horse's typical class level compares to today's race class
3. PACE — running style suitability for today's race (front-runner, prominent, mid-pack, held-up) 
4. TRAINER — trainer's strike rate at this course, distance, and race type
5. JOCKEY — jockey's effectiveness (strike rate, course form, claim value)
6. DRAW — stall position advantage at this course/distance
7. GOING — horse's performance on today's going (ground condition)
8. COURSE — performance history at today's racecourse
9. DISTANCE — whether today's trip is optimal for this horse
10. WEIGHT — weight carried relative to Official Rating and past performances
11. AGE — age profile suitability for today's race type and conditions
12. MARKET — odds movement signals, market confidence indicators
13. HEAD_TO_HEAD — past matchups against today's rivals

For each runner, also provide:
- A COMPOSITE GG Score (0-100) — weighted combination of all factors
- CONFIDENCE level: "High", "Medium", or "Low"
- A one-sentence REASONING that explains the key factor driving this score

Then identify:
- TOP_SELECTION: Highest GG Score
- MAIN_DANGER: Second highest, biggest threat to the favorite
- VALUE_PICK: Best odds-to-score ratio (good score, higher odds)
- OUTSIDER_WATCH: Long odds but interesting factors (one compelling stat)

Return ONLY valid JSON — no explanation outside the JSON object.

Format:
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
      "confidence": "Medium",
      "reasoning": "Strong distance form and trainer strike rate outweigh poor draw."
    }
  ],
  "top_selection": "string",
  "main_danger": "string",
  "value_pick": "string",
  "outsider_watch": "string"
}"""


def call_openrouter(race_data: dict) -> dict:
    """Call OpenRouter with the GG Score prompt. Returns parsed JSON."""
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": GG_SCORE_SYSTEM_PROMPT},
                {"role": "user", "content": json.dumps(race_data, default=str)},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.3,
            "max_tokens": 4096,
        },
        timeout=60,
    )
    resp.raise_for_status()
    body = resp.json()
    content = body["choices"][0]["message"]["content"]
    return json.loads(content)


def build_race_payload(racecard: dict) -> dict:
    """Convert The Racing API racecard into the GG Score prompt payload."""
    runners = []
    for r in racecard.get("runners", []):
        runners.append({
            "horse_name": r.get("horse", "Unknown"),
            "trainer_name": r.get("trainer", "Unknown"),
            "jockey_name": r.get("jockey", "Unknown"),
            "draw": r.get("draw"),
            "weight_lbs": r.get("weight_lbs"),
            "official_rating": r.get("official_rating"),
            "early_odds": r.get("early_odds"),
            "live_odds": r.get("live_odds"),
            "form_figures": r.get("form", ""),
            "age": r.get("age"),
            "sex": r.get("sex"),
            "sire": r.get("sire"),
            "dam": r.get("dam"),
        })

    return {
        "race_name": racecard.get("race_name", "Unknown"),
        "course": racecard.get("course", "Unknown"),
        "off_time": str(racecard.get("off_time", "")),
        "distance_furlongs": racecard.get("distance_furlongs"),
        "going": racecard.get("going", "Unknown"),
        "race_class": racecard.get("class"),
        "race_type": racecard.get("race_type", "flat"),
        "number_of_runners": len(runners),
        "runners": runners,
    }


def store_to_supabase(race_data: dict, gg_result: dict, race_id: Optional[str] = None):
    """Store GG Score results in Supabase validation tables."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("⚠️  Supabase not configured — skipping storage")
        return
    
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    date = datetime.now().strftime("%Y-%m-%d")

    for r in gg_result.get("runners", []):
        supabase.table("gg_scores").upsert({
            "race_id": race_id or race_data.get("race_id"),
            "horse_id": None,  # resolved by name lookup if needed
            "horse_name": r["horse_name"],
            "score": r["composite"],
            "form_score": r["factors"].get("form"),
            "class_score": r["factors"].get("class"),
            "pace_score": r["factors"].get("pace"),
            "trainer_score": r["factors"].get("trainer"),
            "jockey_score": r["factors"].get("jockey"),
            "draw_score": r["factors"].get("draw"),
            "going_score": r["factors"].get("going"),
            "course_score": r["factors"].get("course"),
            "distance_score": r["factors"].get("distance"),
            "weight_score": r["factors"].get("weight"),
            "age_score": r["factors"].get("age"),
            "market_score": r["factors"].get("market"),
            "head_to_head_score": r["factors"].get("head_to_head"),
            "reasoning": r.get("reasoning", ""),
            "confidence": r.get("confidence", "Medium"),
            "model_used": MODEL,
        }).execute()

    # Store daily insights
    supabase.table("daily_insights").upsert({
        "date": date,
        "race_id": race_id or race_data.get("race_id"),
        "top_selection": gg_result.get("top_selection"),
        "main_danger": gg_result.get("main_danger"),
        "value_pick": gg_result.get("value_pick"),
        "outsider_watch": gg_result.get("outsider_watch"),
    }).execute()

    print(f"✅ Stored GG Scores for {len(gg_result['runners'])} runners")


# ── CLI ─────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="RaceIntel GG Score Generator")
    parser.add_argument("--racecard", help="Path to racecard JSON file")
    parser.add_argument("--stdin", action="store_true", help="Read racecard JSON from stdin")
    parser.add_argument("--store", action="store_true", help="Store results in Supabase")
    args = parser.parse_args()

    if not OPENROUTER_KEY:
        print("❌ OPENROUTER_API_KEY not set")
        sys.exit(1)

    # Load racecard
    if args.stdin:
        racecard = json.load(sys.stdin)
    elif args.racecard:
        with open(args.racecard) as f:
            racecard = json.load(f)
    else:
        # Demo mode: score a sample race
        print("ℹ️  No racecard provided — using sample data")
        racecard = {
            "race_name": "Sample Stakes",
            "course": "Cheltenham",
            "off_time": "2026-05-29T14:30:00",
            "distance_furlongs": 16,
            "going": "Good",
            "class": 2,
            "race_type": "jumps",
            "runners": [
                {"horse": "Running Wild", "trainer": "W P Mullins", "jockey": "P Townend", "draw": 3, "weight_lbs": 154, "official_rating": 145, "early_odds": 3.5, "live_odds": 3.0, "form": "1-21", "age": 7, "sex": "gelding"},
                {"horse": "Steel Dawn", "trainer": "N Henderson", "jockey": "N de Boinville", "draw": 7, "weight_lbs": 158, "official_rating": 150, "early_odds": 2.75, "live_odds": 2.5, "form": "112", "age": 6, "sex": "gelding"},
                {"horse": "Copper River", "trainer": "G Elliott", "jockey": "J Kennedy", "draw": 1, "weight_lbs": 148, "official_rating": 138, "early_odds": 8.0, "live_odds": 9.0, "form": "4-13", "age": 8, "sex": "mare"},
                {"horse": "Midnight Glory", "trainer": "D Skelton", "jockey": "H Skelton", "draw": 5, "weight_lbs": 152, "official_rating": 142, "early_odds": 6.0, "live_odds": 7.0, "form": "321", "age": 5, "sex": "gelding"},
                {"horse": "Storm Rider", "trainer": "P Hobbs", "jockey": "M G Nolan", "draw": 9, "weight_lbs": 150, "official_rating": 140, "early_odds": 20.0, "live_odds": 18.0, "form": "5-62", "age": 9, "sex": "gelding"},
            ],
        }

    print(f"🏇 Analysing: {racecard['race_name']} at {racecard['course']} ({racecard['distance_furlongs']}f, {racecard['going']})")
    print(f"   Runners: {len(racecard['runners'])}")
    print(f"   Model: {MODEL}\n")

    payload = build_race_payload(racecard)
    
    try:
        result = call_openrouter(payload)
    except Exception as e:
        print(f"❌ OpenRouter error: {e}")
        sys.exit(1)

    # Display results
    print("═" * 60)
    print(f"🏆 TOP SELECTION:  {result.get('top_selection', 'N/A')}")
    print(f"⚠️  MAIN DANGER:    {result.get('main_danger', 'N/A')}")
    print(f"💎 VALUE PICK:     {result.get('value_pick', 'N/A')}")
    print(f"🔭 OUTSIDER WATCH: {result.get('outsider_watch', 'N/A')}")
    print("═" * 60)

    print(f"\n📊 GG Scores ({len(result.get('runners', []))} runners):")
    print(f"{'Horse':<20} {'Score':>6} {'Confidence':>10}")
    print("-" * 40)
    for r in sorted(result.get("runners", []), key=lambda x: x["composite"], reverse=True):
        print(f"{r['horse_name']:<20} {r['composite']:>6} {r.get('confidence', 'Medium'):>10}")

    print(f"\n💡 Reasoning:")
    for r in result.get("runners", []):
        print(f"  {r['horse_name']}: {r.get('reasoning', 'No reasoning provided')}")

    # Store if requested
    if args.store:
        store_to_supabase(payload, result, args.race_id)

    # Output JSON for piping
    if args.stdin:
        print("\n" + json.dumps(result, indent=2))


if __name__ == "__main__":
    main()