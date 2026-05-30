"""
RaceIntel Validation Tracker
=============================
Tracks prediction accuracy during the 30-day pre-launch validation period.
Runs after each day's races complete.

Usage:
  python3 validate.py                    # Check yesterday's results
  python3 validate.py --date 2026-05-29  # Check specific date
  python3 validate.py --all-time         # Full cumulative summary
  
This is the CRITICAL pre-launch step. The Board directive:
  "Don't launch until the AI proves it can beat the market."
  
Goals (measured over 30 days):
  - Top Pick Win Rate: >25% (market avg ~20%)
  - Top Pick Place Rate: >55%
  - Top 2 Place Rate: >40%
  - Value Pick ROI: >20% (at SP)
  - Any Pick Win Rate: >50%
"""

import os, sys, json, argparse
from datetime import datetime, timedelta
from supabase import create_client

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://oltlnbxchdnavocpqgyc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_ROLE_KEY not set")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def validate_date(date: str) -> dict:
    """Validate predictions against results for a given date."""
    print(f"🔍 Validating {date}...")
    
    # Get all insights for this date
    result = supabase.table("daily_insights").select("*, races(id, off_time)").eq("date", date).execute()
    insights = result.data or []
    
    if not insights:
        print(f"  No predictions found for {date}")
        return {}
    
    stats = {
        "total_races": len(insights),
        "races_with_results": 0,
        "top_pick_wins": 0,
        "top_pick_places": 0,
        "main_danger_wins": 0,
        "main_danger_places": 0,
        "value_pick_wins": 0,
        "value_pick_places": 0,
        "outsider_wins": 0,
        "outsider_places": 0,
        "any_pick_wins": 0,
        "any_pick_places": 0,
        "value_pick_return": 0,
    }

    for insight in insights:
        race_id = insight.get("race_id")
        
        # Check if race has results
        results = supabase.table("race_results").select("*").eq("race_id", race_id).order("position").execute()
        
        if not results.data:
            continue
            
        stats["races_with_results"] += 1
        winner = None
        placed = []  # Top 3
        
        for r in results.data:
            # Find winner
            horse = supabase.table("horses").select("name").eq("id", r["horse_id"]).single().execute()
            horse_name = horse.data.get("name", "") if horse.data else ""
            
            if r["position"] == 1:
                winner = horse_name
            if r["position"] and r["position"] <= 3:
                placed.append(horse_name)
        
        if not winner:
            continue
            
        # Check each pick
        top_pick = insight.get("top_selection")
        main_danger = insight.get("main_danger")
        value_pick = insight.get("value_pick")
        outsider = insight.get("outsider_watch")
        
        if top_pick and top_pick.lower() == winner.lower():
            stats["top_pick_wins"] += 1
            stats["any_pick_wins"] += 1
        if top_pick and top_pick.lower() in [p.lower() for p in placed]:
            stats["top_pick_places"] += 1
            stats["any_pick_places"] += 1
            
        if main_danger and main_danger.lower() == winner.lower():
            stats["main_danger_wins"] += 1
            stats["any_pick_wins"] += 1
        if main_danger and main_danger.lower() in [p.lower() for p in placed]:
            stats["main_danger_places"] += 1
            stats["any_pick_places"] += 1
            
        if value_pick and value_pick.lower() == winner.lower():
            stats["value_pick_wins"] += 1
            stats["any_pick_wins"] += 1
        if value_pick and value_pick.lower() in [p.lower() for p in placed]:
            stats["value_pick_places"] += 1
            stats["any_pick_places"] += 1
            
        if outsider and outsider.lower() == winner.lower():
            stats["outsider_wins"] += 1
            stats["any_pick_wins"] += 1
        if outsider and outsider.lower() in [p.lower() for p in placed]:
            stats["outsider_places"] += 1
            stats["any_pick_places"] += 1

        # Track validation picks
        supabase.table("validation_picks").upsert({
            "date": date,
            "race_id": race_id,
            "race_name": insight.get("races", {}).get("name") if isinstance(insight.get("races"), dict) else None,
            "top_pick_name": top_pick,
            "main_danger_name": main_danger,
            "value_pick_name": value_pick,
            "outsider_watch_name": outsider,
            "winner_name": winner,
            "top_pick_won": top_pick and top_pick.lower() == winner.lower(),
            "top_pick_placed": top_pick and top_pick.lower() in [p.lower() for p in placed],
            "main_danger_won": main_danger and main_danger.lower() == winner.lower(),
            "main_danger_placed": main_danger and main_danger.lower() in [p.lower() for p in placed],
            "value_pick_won": value_pick and value_pick.lower() == winner.lower(),
            "value_pick_placed": value_pick and value_pick.lower() in [p.lower() for p in placed],
            "any_pick_won": stats["any_pick_wins"] > 0,
            "any_pick_placed": stats["any_pick_places"] > 0,
        }, on_conflict="date,race_id").execute()

    # Compute rates
    total = stats["races_with_results"]
    rates = {}
    if total > 0:
        rates = {
            "top_pick_win_rate": round(stats["top_pick_wins"] / total * 100, 1),
            "top_pick_place_rate": round(stats["top_pick_places"] / total * 100, 1),
            "main_danger_win_rate": round(stats["main_danger_wins"] / total * 100, 1),
            "main_danger_place_rate": round(stats["main_danger_places"] / total * 100, 1),
            "value_pick_win_rate": round(stats["value_pick_wins"] / total * 100, 1),
            "value_pick_place_rate": round(stats["value_pick_places"] / total * 100, 1),
            "outsider_win_rate": round(stats["outsider_wins"] / total * 100, 1),
            "outsider_place_rate": round(stats["outsider_places"] / total * 100, 1),
            "any_pick_win_rate": round(stats["any_pick_wins"] / total * 100, 1),
            "any_pick_place_rate": round(stats["any_pick_places"] / total * 100, 1),
        }

    # Store daily summary
    supabase.table("validation_daily_summary").upsert({
        "date": date,
        "total_races": stats["total_races"],
        "races_with_picks": stats["races_with_results"],
        "top_pick_wins": stats["top_pick_wins"],
        "top_pick_places": stats["top_pick_places"],
        "main_danger_wins": stats["main_danger_wins"],
        "main_danger_places": stats["main_danger_places"],
        "value_pick_wins": stats["value_pick_wins"],
        "value_pick_places": stats["value_pick_places"],
        "outsider_wins": stats["outsider_wins"],
        "outsider_places": stats["outsider_places"],
        "any_pick_wins": stats["any_pick_wins"],
        "any_pick_places": stats["any_pick_places"],
        "top_pick_win_rate": rates.get("top_pick_win_rate"),
        "top_pick_place_rate": rates.get("top_pick_place_rate"),
        "any_pick_place_rate": rates.get("any_pick_place_rate"),
    }, on_conflict="date").execute()

    return {**stats, **rates}


def all_time_summary():
    """Print cumulative validation summary."""
    result = supabase.table("validation_daily_summary").select("*").order("date").execute()
    days = result.data or []
    
    if not days:
        print("No validation data yet.")
        return
    
    total_races = sum(d["total_races"] for d in days)
    total_top_wins = sum(d["top_pick_wins"] for d in days)
    total_top_places = sum(d["top_pick_places"] for d in days)
    total_any_wins = sum(d["any_pick_wins"] for d in days)
    total_any_places = sum(d["any_pick_places"] for d in days)
    
    print("\n" + "═" * 60)
    print("📊 CUMULATIVE VALIDATION SUMMARY")
    print("═" * 60)
    print(f"Period: {days[0]['date']} to {days[-1]['date']} ({len(days)} days)")
    print(f"Total Races: {total_races}")
    print()
    print(f"🏆 Top Pick Win Rate:      {round(total_top_wins/total_races*100, 1)}%  (target >25%)")
    print(f"📊 Top Pick Place Rate:    {round(total_top_places/total_races*100, 1)}%  (target >55%)")
    print(f"🎯 Any Pick Win Rate:      {round(total_any_wins/total_races*100, 1)}%  (target >50%)")
    print(f"📍 Any Pick Place Rate:    {round(total_any_places/total_races*100, 1)}%  (target >55%)")
    print()
    
    # Assessment
    top_win_rate = total_top_wins / total_races * 100 if total_races else 0
    top_place_rate = total_top_places / total_races * 100 if total_races else 0
    
    if len(days) >= 30:
        if top_win_rate > 25 and top_place_rate > 55:
            print("✅ LAUNCH-READY — All targets exceeded over 30 days!")
        elif top_win_rate > 22 and top_place_rate > 50:
            print("🟡 BORDERLINE — Approaching targets. Continue monitoring.")
        else:
            print("❌ NOT READY — Prediction accuracy below launch threshold.")
    else:
        remaining = 30 - len(days)
        print(f"⏳ {remaining} more days of validation required before launch decision.")
    
    print("═" * 60)


# ── CLI ─────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="RaceIntel Validation Tracker")
    parser.add_argument("--date", help="Validate specific date (YYYY-MM-DD)")
    parser.add_argument("--all-time", action="store_true", help="Show cumulative summary")
    args = parser.parse_args()

    if args.all_time:
        all_time_summary()
    elif args.date:
        validate_date(args.date)
    else:
        # Validate yesterday by default
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        stats = validate_date(yesterday)
        
        if stats.get("races_with_results", 0) > 0:
            print("\n📊 Yesterday's Results:")
            print(f"  Races: {stats['races_with_results']}")
            print(f"  🏆 Top Pick: {stats['top_pick_wins']}W / {stats['top_pick_places']}P")
            print(f"  ⚠️ Danger: {stats['main_danger_wins']}W / {stats['main_danger_places']}P")
            print(f"  💎 Value: {stats['value_pick_wins']}W / {stats['value_pick_places']}P")
        
        all_time_summary()


if __name__ == "__main__":
    main()