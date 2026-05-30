"""
RaceIntel — Kaggle Dataset Importer
=====================================
Imports the Horse Racing Results UK/Ireland 1988-2026 dataset into Supabase.

Strategy:
1. Phase 1: Extract unique entities (courses, horses, trainers, jockeys)
2. Phase 2: Import races + results + form lines
3. Phase 3: Import latest racecards for "alive" look

Run time: ~15-30 min for full 1.5GB+ dataset
"""

import os, sys, csv, argparse
from datetime import datetime
from collections import defaultdict
import psycopg2
import psycopg2.extras

# ── Config ──────────────────────────────────────────────────────────
SUPABASE_HOST = "aws-0-eu-west-1.pooler.supabase.com"
SUPABASE_PORT = 6543
SUPABASE_USER = "postgres.oltlnbxchdnavocpqgyc"
SUPABASE_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD", "Buddy-2019-Fiona")
SUPABASE_DB = "postgres"

KAGGLE_BASE = os.path.expanduser("~/.cache/kagglehub/datasets/deltaromeo/horse-racing-results-ukireland-2015-2025/versions/114")

# ── DB Connection ───────────────────────────────────────────────────
def get_conn():
    return psycopg2.connect(
        host=SUPABASE_HOST,
        port=SUPABASE_PORT,
        user=SUPABASE_USER,
        password=SUPABASE_PASSWORD,
        dbname=SUPABASE_DB,
        sslmode="require",
        connect_timeout=10,
    )

# ── Caches ──────────────────────────────────────────────────────────
course_ids = {}
horse_ids = {}
trainer_ids = {}
jockey_ids = {}
race_ids = {}

# ── Mappings ────────────────────────────────────────────────────────
country_map = {
    "Aintree": "GB", "Ascot": "GB", "Ayr": "GB", "Bangor-on-Dee": "GB", "Bath": "GB",
    "Beverley": "GB", "Brighton": "GB", "Carlisle": "GB", "Cartmel": "GB", "Catterick": "GB",
    "Cheltenham": "GB", "Chepstow": "GB", "Chester": "GB", "Doncaster": "GB", "Epsom Downs": "GB",
    "Exeter": "GB", "Fakenham": "GB", "Ffos Las": "GB", "Fontwell": "GB", "Goodwood": "GB",
    "Hamilton": "GB", "Haydock": "GB", "Hereford": "GB", "Hexham": "GB", "Huntingdon": "GB",
    "Kelso": "GB", "Kempton": "GB", "Leicester": "GB", "Lingfield": "GB", "Ludlow": "GB",
    "Market Rasen": "GB", "Musselburgh": "GB", "Newbury": "GB", "Newcastle": "GB", "Newmarket": "GB",
    "Newton Abbot": "GB", "Nottingham": "GB", "Perth": "GB", "Plumpton": "GB", "Pontefract": "GB",
    "Redcar": "GB", "Ripon": "GB", "Salisbury": "GB", "Sandown": "GB", "Sedgefield": "GB",
    "Southwell": "GB", "Stratford": "GB", "Taunton": "GB", "Thirsk": "GB", "Towcester": "GB",
    "Uttoxeter": "GB", "Warwick": "GB", "Wetherby": "GB", "Wincanton": "GB", "Windsor": "GB",
    "Wolverhampton": "GB", "Worcester": "GB", "Yarmouth": "GB", "York": "GB",
    "Ballinrobe": "IE", "Bellewstown": "IE", "Clonmel": "IE", "Cork": "IE", "Curragh": "IE",
    "Down Royal": "IE", "Downpatrick": "IE", "Dundalk": "IE", "Fairyhouse": "IE", "Galway": "IE",
    "Gowran Park": "IE", "Kilbeggan": "IE", "Killarney": "IE", "Leopardstown": "IE",
    "Limerick": "IE", "Listowel": "IE", "Naas": "IE", "Navan": "IE", "Punchestown": "IE",
    "Roscommon": "IE", "Sligo": "IE", "Thurles": "IE", "Tipperary": "IE", "Tramore": "IE",
    "Wexford": "IE",
}

race_type_map = {
    "Flat": "flat", "Hurdle": "jumps", "Chase": "jumps", "NH Flat": "jumps",
    "Bumper": "jumps", "Hunter Chase": "jumps",
}

def country_for(course):
    return country_map.get(course, "GB")

def race_type_for(type_str):
    return race_type_map.get(type_str, "flat")


# ── Phase 1: Extract Entities ───────────────────────────────────────
def scan_form_csv(filepath: str):
    """First pass: collect unique courses, horses, trainers, jockeys."""
    print(f"🔍 Scanning: {os.path.basename(filepath)}...")

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            course = row.get("course", "").strip()
            horse = row.get("horse", "").strip()
            jockey = row.get("jockey", "").strip()
            trainer = row.get("trainer", "").strip()

            if course:
                course_ids[course] = country_for(course)
            if horse:
                horse_ids[horse] = True
            if jockey:
                jockey_ids[jockey] = True
            if trainer:
                trainer_ids[trainer] = True

    print(f"  Scanned: {len(course_ids)} courses, {len(horse_ids)} horses, {len(trainer_ids)} trainers, {len(jockey_ids)} jockeys")


def load_entities_to_db():
    """Bulk-insert unique entities into Supabase."""
    conn = get_conn()
    cur = conn.cursor()

    print("\n📦 Loading entities into Supabase...")

    # Courses
    count = 0
    for name, country_code in course_ids.items():
        try:
            cur.execute(
                "INSERT INTO racecourses (name, country) VALUES (%s, %s) ON CONFLICT (name) DO NOTHING",
                (name, country_code)
            )
            count += 1
        except:
            conn.rollback()
    conn.commit()
    print(f"  ✅ {count} courses")

    # Horses (batch)
    count = 0
    batch = []
    for name in horse_ids:
        batch.append((name,))
        if len(batch) >= 1000:
            psycopg2.extras.execute_values(
                cur,
                "INSERT INTO horses (name) VALUES %s ON CONFLICT (name) DO NOTHING",
                batch, template="(%s)"
            )
            count += len(batch)
            batch = []
            conn.commit()
    if batch:
        psycopg2.extras.execute_values(
            cur,
            "INSERT INTO horses (name) VALUES %s ON CONFLICT (name) DO NOTHING",
            batch, template="(%s)"
        )
        count += len(batch)
        conn.commit()
    print(f"  ✅ {count} horses")

    # Trainers
    count = 0
    batch = []
    for name in trainer_ids:
        batch.append((name,))
        if len(batch) >= 1000:
            psycopg2.extras.execute_values(
                cur,
                "INSERT INTO trainers (name) VALUES %s ON CONFLICT (name) DO NOTHING",
                batch, template="(%s)"
            )
            count += len(batch)
            batch = []
            conn.commit()
    if batch:
        psycopg2.extras.execute_values(cur, "INSERT INTO trainers (name) VALUES %s ON CONFLICT (name) DO NOTHING", batch, template="(%s)")
        count += len(batch)
        conn.commit()
    print(f"  ✅ {count} trainers")

    # Jockeys
    count = 0
    batch = []
    for name in jockey_ids:
        batch.append((name,))
        if len(batch) >= 1000:
            psycopg2.extras.execute_values(cur, "INSERT INTO jockeys (name) VALUES %s ON CONFLICT (name) DO NOTHING", batch, template="(%s)")
            count += len(batch)
            batch = []
            conn.commit()
    if batch:
        psycopg2.extras.execute_values(cur, "INSERT INTO jockeys (name) VALUES %s ON CONFLICT (name) DO NOTHING", batch, template="(%s)")
        count += len(batch)
        conn.commit()
    print(f"  ✅ {count} jockeys")

    # Cache IDs from DB
    print("\n📋 Caching IDs...")
    cur.execute("SELECT name, id FROM racecourses")
    for row in cur.fetchall():
        course_ids[row[0]] = row[1]

    cur.execute("SELECT name, id FROM horses")
    for row in cur.fetchall():
        horse_ids[row[0]] = row[1]

    cur.execute("SELECT name, id FROM trainers")
    for row in cur.fetchall():
        trainer_ids[row[0]] = row[1]

    cur.execute("SELECT name, id FROM jockeys")
    for row in cur.fetchall():
        jockey_ids[row[0]] = row[1]

    print(f"  Cached: courses={len(course_ids)} horses={len(horse_ids)} trainers={len(trainer_ids)} jockeys={len(jockey_ids)}")

    cur.close()
    conn.close()


# ── Phase 2: Import Races + Form ────────────────────────────────────
def import_form_to_db(filepath: str, limit: int = 0):
    """Import races, results, and form lines from a form CSV."""
    print(f"\n🏇 Importing: {os.path.basename(filepath)}...")

    conn = get_conn()
    cur = conn.cursor()

    race_count = 0
    form_count = 0
    row_count = 0

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)

        for row in reader:
            if limit and row_count >= limit:
                break
            row_count += 1

            try:
                date_str = row.get("date", "").strip()
                course = row.get("course", "").strip()
                race_id_ext = row.get("race_id", "").strip()
                off_time = row.get("off", "").strip()
                race_name = row.get("race_name", "").strip()
                race_type = row.get("type", "").strip()
                race_class = row.get("class", "").strip()
                dist_str = row.get("dist", "").strip()
                going = row.get("going", "").strip()
                ran_str = row.get("ran", "").strip()

                pos_str = row.get("pos", "").strip()
                draw_str = row.get("draw", "").strip()
                horse_name = row.get("horse", "").strip()
                age_str = row.get("age", "").strip()
                sex = row.get("sex", "").strip()
                wgt_str = row.get("wgt", "").strip()
                sp = row.get("sp", "").strip()
                jockey_name = row.get("jockey", "").strip()
                trainer_name = row.get("trainer", "").strip()
                prize_str = row.get("prize", "").strip()
                or_str = row.get("or", "").strip()
                rpr_str = row.get("rpr", "").strip()
                sire = row.get("sire", "").strip()
                dam = row.get("dam", "").strip()
                comment = row.get("comment", "").strip()

                if not date_str or not course or not race_id_ext:
                    continue

                course_id = course_ids.get(course)
                if not course_id:
                    continue

                # Parse off_time
                try:
                    off_dt = datetime.strptime(f"{date_str} {off_time}", "%Y-%m-%d %H:%M")
                except:
                    off_dt = datetime.strptime(f"{date_str} 12:00", "%Y-%m-%d %H:%M")

                # Parse distance
                dist_furlongs = None
                if dist_str:
                    try:
                        dist_furlongs = float(dist_str.replace("m", "").replace("f", " ").strip().split()[0]) if "f" in dist_str else None
                    except:
                        pass

                # Parse numbers
                try: ran = int(float(ran_str)) if ran_str else None
                except: ran = None
                try: race_class_int = int(float(race_class)) if race_class else None
                except: race_class_int = None
                try: pos_int = int(float(pos_str)) if pos_str else None
                except: pos_int = None
                try: draw = int(float(draw_str)) if draw_str else None
                except: draw = None
                try: age_int = int(float(age_str)) if age_str else None
                except: age_int = None
                try: wgt = int(float(wgt_str.split("-")[0])) * 14 + int(float(wgt_str.split("-")[1])) if wgt_str and "-" in wgt_str else (int(float(wgt_str)) if wgt_str else None)
                except: wgt = None
                try: prize = float(prize_str) if prize_str else None
                except: prize = None
                try: or_rating = int(float(or_str)) if or_str else None
                except: or_rating = None
                try: rpr = int(float(rpr_str)) if rpr_str else None
                except: rpr = None

                # Get/create race
                race_key = f"{date_str}::{race_id_ext}"
                if race_key not in race_ids:
                    cur.execute(
                        """INSERT INTO races (racecourse_id, off_time, name, distance_furlongs, class, going, race_type, number_of_runners, status)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'resulted')
                           ON CONFLICT DO NOTHING RETURNING id""",
                        (course_id, off_dt, race_name[:200], dist_furlongs, race_class_int, going, race_type_for(race_type), ran)
                    )
                    row = cur.fetchone()
                    if row:
                        race_ids[race_key] = row[0]
                        race_count += 1
                    else:
                        cur.execute("SELECT id FROM races WHERE racecourse_id=%s AND off_time=%s", (course_id, off_dt))
                        row2 = cur.fetchone()
                        if row2:
                            race_ids[race_key] = row2[0]
                        else:
                            continue
                race_id = race_ids[race_key]

                # Upsert horse (update sire/dam if available)
                horse_id = horse_ids.get(horse_name)
                if horse_id and sire:
                    try:
                        cur.execute("UPDATE horses SET sire=%s, dam=%s WHERE id=%s AND sire IS NULL", (sire, dam, horse_id))
                    except:
                        pass

                # Update horse age/sex/official_rating
                if horse_id:
                    try:
                        cur.execute(
                            "UPDATE horses SET age=%s, sex=%s, official_rating=%s WHERE id=%s",
                            (age_int, sex, or_rating, horse_id)
                        )
                    except:
                        pass

                # Insert result if position determined
                if pos_int and horse_id:
                    cur.execute(
                        """INSERT INTO race_results (race_id, horse_id, position, starting_price) 
                           VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING""",
                        (race_id, horse_id, pos_int, sp)
                    )

                # Insert form line
                if horse_id:
                    cur.execute(
                        """INSERT INTO horse_form (horse_id, race_id, date, course, distance, going, class, position, runners, weight_lbs, odds, jockey, comment, rating)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                        (horse_id, race_id, date_str, course, dist_str, going, race_class_int, pos_int, ran, wgt, sp, jockey_name, comment, rpr)
                    )
                    form_count += 1

                if row_count % 10000 == 0:
                    conn.commit()
                    print(f"  ...{row_count} rows, {race_count} races, {form_count} form lines")

            except Exception as e:
                pass  # Skip malformed rows

    conn.commit()
    print(f"  ✅ {race_count} races, {form_count} form lines imported")
    cur.close()
    conn.close()


# ── Phase 3: Latest Racecards ───────────────────────────────────────
def import_latest_racecard_csv(filepath: str):
    """Import a recent racecard CSV to make site look alive."""
    print(f"\n📋 Importing racecard: {os.path.basename(filepath)}...")
    conn = get_conn()
    cur = conn.cursor()

    rc_count = 0
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                date_str = row.get("date", "").strip()
                course = row.get("course", "").strip()
                off_time = row.get("off_time", "").strip()
                race_name = row.get("race_name", "").strip()
                horse_name = row.get("horse_name", "").strip()
                race_class = row.get("race_class", "").strip()
                going = row.get("going", "").strip()
                dist = row.get("distance", "").strip()
                draw = row.get("draw", "").strip()
                age = row.get("age", "").strip()
                weight_lbs = row.get("lbs", "").strip()
                form = row.get("form", "").strip()
                jockey_name = row.get("jockey", "").strip()
                trainer_name = row.get("trainer", "").strip()
                sp = row.get("spotlight", "").strip()
                comment = row.get("comment", "").strip()
                sex = row.get("sex", "").strip()

                if not date_str or not course or not horse_name:
                    continue

                course_id = course_ids.get(course)
                if not course_id:
                    continue

                # Parse time
                try:
                    off_dt = datetime.strptime(f"{date_str} {off_time}", "%Y-%m-%d %H:%M")
                except:
                    continue

                # Race
                race_key = f"RC::{date_str}::{course}::{off_time}::{race_name}"
                if race_key not in race_ids:
                    try:
                        race_class_int = int(float(race_class)) if race_class else None
                        cur.execute(
                            "INSERT INTO races (racecourse_id, off_time, name, class, going, status) VALUES (%s,%s,%s,%s,%s,'declared') ON CONFLICT DO NOTHING RETURNING id",
                            (course_id, off_dt, race_name[:200], race_class_int, going)
                        )
                        r = cur.fetchone()
                        race_ids[race_key] = r[0] if r else None
                    except:
                        continue
                race_id = race_ids.get(race_key)
                if not race_id:
                    continue

                # Horse
                cur.execute("INSERT INTO horses (name) VALUES (%s) ON CONFLICT (name) DO NOTHING", (horse_name,))
                cur.execute("SELECT id FROM horses WHERE name=%s", (horse_name,))
                h = cur.fetchone()
                horse_id = h[0] if h else None
                if not horse_id:
                    continue

                # Update horse
                try:
                    draw_int = int(float(draw)) if draw else None
                    weight_int = int(float(weight_lbs)) if weight_lbs else None
                    age_int = int(float(age)) if age else None
                    cur.execute("UPDATE horses SET age=%s, sex=%s, official_rating=NULL WHERE id=%s", (age_int, sex, horse_id))
                except:
                    pass

                # Runner
                try:
                    cur.execute(
                        """INSERT INTO runners (race_id, horse_id, jockey_id, draw, weight_lbs, cloth_number, form_figures)
                           VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING""",
                        (race_id, horse_id, jockey_ids.get(jockey_name), draw_int, weight_int, 0, form)
                    )
                    rc_count += 1
                except:
                    pass

            except Exception as e:
                pass

    conn.commit()
    print(f"  ✅ {rc_count} runners on racecards")
    cur.close()
    conn.close()


# ── Main ─────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--scan-only", action="store_true", help="Only scan CSVs, don't import")
    parser.add_argument("--entities-only", action="store_true", help="Only load entities (courses, horses, etc.)")
    parser.add_argument("--limit", type=int, default=0, help="Limit form rows per file (for testing)")
    parser.add_argument("--latest-only", action="store_true", help="Only import latest racecards")
    args = parser.parse_args()

    form_files = [
        os.path.join(KAGGLE_BASE, "form_2015-present/form_2015-present/raceform.csv"),
    ]

    archive_files = [
        os.path.join(KAGGLE_BASE, "archive_1988-2004/archive_1988-2004/1988-2004.csv"),
        os.path.join(KAGGLE_BASE, "archive_2005-2014/archive_2005-2014/2005-2014.csv"),
    ]

    racecard_dir = os.path.join(KAGGLE_BASE, "daily_racecards/daily_racecards")

    start = datetime.now()

    if args.latest_only:
        # Just load entities and racecards
        for f in form_files[:1]:
            scan_form_csv(f)
        load_entities_to_db()
        # Find latest racecard CSVs
        cards = sorted([f for f in os.listdir(racecard_dir) if f.endswith('.csv')], reverse=True)
        for card in cards[:3]:
            import_latest_racecard_csv(os.path.join(racecard_dir, card))
    else:
        # Phase 1: Scan all CSVs for entities
        for f in form_files:
            scan_form_csv(f)
        for f in archive_files:
            if os.path.exists(f):
                scan_form_csv(f)

        if args.scan_only:
            print(f"\n📊 Entity scan complete: {len(course_ids)} courses, {len(horse_ids)} horses, {len(trainer_ids)} trainers, {len(jockey_ids)} jockeys")
            return

        # Phase 2: Load entities
        load_entities_to_db()

        if args.entities_only:
            return

        # Phase 3: Import form (start with 2015-present, then archives)
        import_form_to_db(form_files[0], limit=args.limit)

        if not args.limit:
            for f in archive_files:
                if os.path.exists(f):
                    import_form_to_db(f)

        # Phase 4: Latest racecards
        cards = sorted([f for f in os.listdir(racecard_dir) if f.endswith('.csv')], reverse=True)
        for card in cards[:5]:
            import_latest_racecard_csv(os.path.join(racecard_dir, card))

    elapsed = (datetime.now() - start).total_seconds()
    print(f"\n⏱️ Total: {elapsed:.0f}s ({elapsed/60:.1f} min)")


if __name__ == "__main__":
    main()