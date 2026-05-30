import json, os
from datetime import datetime
import psycopg2
import psycopg2.extras

SUPABASE_HOST = "aws-0-eu-west-1.pooler.supabase.com"
SUPABASE_PORT = 6543
SUPABASE_USER = "postgres.oltlnbxchdnavocpqgyc"
SUPABASE_PASSWORD = "Buddy-2019-Fiona"
SUPABASE_DB = "postgres"
KAGGLE = os.path.expanduser("~/.cache/kagglehub/datasets/deltaromeo/horse-racing-results-ukireland-2015-2025/versions/114")
RACECARD_DIR = os.path.join(KAGGLE, "daily_racecards/daily_racecards")

conn = psycopg2.connect(host=SUPABASE_HOST, port=SUPABASE_PORT, user=SUPABASE_USER,
    password=SUPABASE_PASSWORD, dbname=SUPABASE_DB, sslmode="require", connect_timeout=10)
cur = conn.cursor()

json_files = sorted([f for f in os.listdir(RACECARD_DIR) if f.endswith('.json')])[-3:]
print(f"Processing: {json_files}")

course_cache, horse_cache, jockey_cache, trainer_cache = {}, {}, {}, {}
stats = {"races": 0, "runners": 0, "courses": 0, "horses": 0, "jockeys": 0, "trainers": 0}

for jf in json_files:
    path = os.path.join(RACECARD_DIR, jf)
    print(f"\n===== {jf} =====")
    data = json.load(open(path))

    for raw_country, courses in data.items():
        # Normalize country: IRE -> IE
        country = "IE" if raw_country == "IRE" else raw_country; if country not in ("GB", "IE"): continue

        for course_name, times in courses.items():
            # Only process dict entries (skip metadata strings)
            if not isinstance(times, dict):
                continue

            # Upsert course
            if course_name not in course_cache:
                cur.execute(
                    "INSERT INTO racecourses (name, country) VALUES (%s,%s) ON CONFLICT (name) DO UPDATE SET country=EXCLUDED.country RETURNING id",
                    (course_name, country))
                course_cache[course_name] = cur.fetchone()[0]
                stats["courses"] += 1
            course_id = course_cache[course_name]

            for off_time_str, race_info in times.items():
                if not isinstance(race_info, dict) or "runners" not in race_info:
                    continue

                date_str = race_info.get("date", jf.replace(".json",""))
                going = race_info.get("going", "")
                race_name = race_info.get("race_name") or race_info.get("course_detail") or ""
                if not race_name:
                    race_name = f"Race at {course_name}"
                dist_f = race_info.get("distance_f") or race_info.get("distance_furlongs")
                field_size = race_info.get("field_size") or len(race_info.get("runners", []))
                region = race_info.get("region", "")

                try:
                    off_dt = datetime.strptime(f"{date_str} {off_time_str}", "%Y-%m-%d %H:%M")
                except:
                    continue

                race_name_lower = race_name.lower()
                race_type = "jumps" if any(w in race_name_lower for w in ["hurdle","chase","nh flat","bumper","steeple"]) else "flat"

                cur.execute(
                    """INSERT INTO races (racecourse_id, off_time, name, distance_furlongs, going, race_type, number_of_runners, region, status)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'declared') ON CONFLICT DO NOTHING RETURNING id""",
                    (course_id, off_dt, race_name[:200], dist_f, going, race_type, field_size, region))
                res = cur.fetchone()
                race_id = res[0] if res else None
                if not race_id:
                    cur.execute("SELECT id FROM races WHERE racecourse_id=%s AND off_time=%s LIMIT 1", (course_id, off_dt))
                    r2 = cur.fetchone()
                    if not r2:
                        continue
                    race_id = r2[0]
                stats["races"] += 1

                runners = race_info["runners"]
                if isinstance(runners, dict):
                    runners = list(runners.values())

                for r in runners:
                    if not isinstance(r, dict):
                        continue
                    horse_name = r.get("name") or r.get("horse") or r.get("horse_name", "")
                    if not horse_name:
                        continue

                    # Upsert horse
                    if horse_name not in horse_cache:
                        cur.execute(
                            "INSERT INTO horses (name, age, sex, sire, dam, official_rating) VALUES (%s,%s,%s,%s,%s,%s) ON CONFLICT (name) DO NOTHING RETURNING id",
                            (horse_name, r.get("age"), r.get("sex"), r.get("sire"), r.get("dam"), r.get("official_rating")))
                        res = cur.fetchone()
                        if res:
                            horse_cache[horse_name] = res[0]
                            stats["horses"] += 1
                        else:
                            cur.execute("SELECT id FROM horses WHERE name=%s", (horse_name,))
                            horse_cache[horse_name] = cur.fetchone()[0]
                    horse_id = horse_cache[horse_name]

                    # Jockey
                    jockey_name = r.get("jockey") or r.get("jockey_name", "")
                    if jockey_name:
                        if jockey_name not in jockey_cache:
                            cur.execute("INSERT INTO jockeys (name) VALUES (%s) ON CONFLICT (name) DO NOTHING RETURNING id", (jockey_name,))
                            res = cur.fetchone()
                            if res:
                                jockey_cache[jockey_name] = res[0]
                                stats["jockeys"] += 1
                            else:
                                cur.execute("SELECT id FROM jockeys WHERE name=%s", (jockey_name,))
                                jockey_cache[jockey_name] = cur.fetchone()[0]

                    # Trainer
                    trainer_name = r.get("trainer") or r.get("trainer_name", "")
                    if trainer_name:
                        if trainer_name not in trainer_cache:
                            cur.execute("INSERT INTO trainers (name) VALUES (%s) ON CONFLICT (name) DO NOTHING RETURNING id", (trainer_name,))
                            res = cur.fetchone()
                            if res:
                                trainer_cache[trainer_name] = res[0]
                                stats["trainers"] += 1
                            else:
                                cur.execute("SELECT id FROM trainers WHERE name=%s", (trainer_name,))
                                trainer_cache[trainer_name] = cur.fetchone()[0]

                    # Trainer link
                    if trainer_name and horse_id:
                        cur.execute("UPDATE horses SET trainer_id=%s WHERE id=%s AND trainer_id IS NULL",
                                     (trainer_cache.get(trainer_name), horse_id))

                    # Runner
                    try:
                        draw = r.get("draw") or r.get("stall")
                        wgt_str = r.get("weight") or r.get("lbs") or r.get("weight_lbs")
                        weight = None
                        if wgt_str:
                            try:
                                w = str(wgt_str)
                                if "-" in w:
                                    parts = w.split("-")
                                    weight = int(parts[0]) * 14 + int(parts[1])
                                else:
                                    weight = int(float(w))
                            except:
                                pass

                        or_rating = r.get("official_rating") or r.get("or")
                        form = r.get("form") or r.get("form_string") or ""

                        cur.execute(
                            """INSERT INTO runners (race_id, horse_id, jockey_id, draw, weight_lbs, official_rating, form_figures, early_odds)
                               VALUES (%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING""",
                            (race_id, horse_id, jockey_cache.get(jockey_name),
                             draw, weight, or_rating, str(form)[:20],
                             r.get("odds") or r.get("early_odds")))
                        stats["runners"] += 1
                    except:
                        pass

    conn.commit()
    print(f"  courses={stats['courses']} horses={stats['horses']} jockeys={stats['jockeys']} trainers={stats['trainers']} races={stats['races']} runners={stats['runners']}")

cur.close()
conn.close()
print("\n" + "="*50)
print("IMPORT COMPLETE")
for k, v in stats.items():
    print(f"  {k}: {v}")
