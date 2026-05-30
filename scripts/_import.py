"""Quick import: 3 days of JSON racecards into RaceIntel Supabase."""
import json, os, sys
from datetime import datetime
import psycopg2

conn = psycopg2.connect(
    host="aws-0-eu-west-1.pooler.supabase.com", port=6543,
    user="postgres.oltlnbxchdnavocpqgyc", password="Buddy-2019-Fiona",
    dbname="postgres", sslmode="require", connect_timeout=10)
cur = conn.cursor()

BASE = os.path.expanduser("~/.cache/kagglehub/datasets/deltaromeo/horse-racing-results-ukireland-2015-2025/versions/114")
RCDIR = os.path.join(BASE, "daily_racecards/daily_racecards")
files = sorted([f for f in os.listdir(RCDIR) if f.endswith('.json')])[-3:]

cc, hc, jc, tc = {}, {}, {}, {}
s = {"course":0,"horse":0,"jockey":0,"trainer":0,"race":0,"runner":0}

for jf in files:
    data = json.load(open(os.path.join(RCDIR, jf)))
    for raw_cty, courses in data.items():
        cty = "IE" if raw_cty == "IRE" else raw_cty
        if cty not in ("GB","IE"): continue
        for cn, times in courses.items():
            if not isinstance(times,dict): continue
            if cn not in cc:
                cur.execute("INSERT INTO racecourses(name,country) VALUES(%s,%s) ON CONFLICT(name) DO NOTHING",(cn,cty))
                cur.execute("SELECT id FROM racecourses WHERE name=%s",(cn,))
                cc[cn]=cur.fetchone()[0]; s["course"]+=1
            for ot, info in times.items():
                if not isinstance(info,dict) or "runners" not in info: continue
                ds = info.get("date",jf.replace(".json",""))
                try: dt = datetime.strptime(f"{ds} {ot}","%Y-%m-%d %H:%M")
                except: continue
                rn = info.get("race_name") or info.get("course_detail") or f"Race at {cn}"
                rtype = "jumps" if any(w in rn.lower() for w in ["hurdle","chase","nh flat","bumper","steeple"]) else "flat"
                try:
                    cur.execute(
                        "INSERT INTO races(racecourse_id,off_time,name,distance_furlongs,going,race_type,number_of_runners,status) VALUES(%s,%s,%s,%s,%s,%s,%s,'declared') ON CONFLICT DO NOTHING RETURNING id",
                        (cc[cn],dt,rn[:200],info.get("distance_f"),info.get("going",""),rtype,info.get("field_size",0)))
                    rr=cur.fetchone(); rid=rr[0] if rr else None
                    if not rid:
                        cur.execute("SELECT id FROM races WHERE racecourse_id=%s AND off_time=%s LIMIT 1",(cc[cn],dt))
                        rid=cur.fetchone()[0]
                    s["race"]+=1
                except Exception as e:
                    conn.rollback(); continue
                runners = info["runners"]
                if isinstance(runners,dict): runners=list(runners.values())
                for r in runners:
                    hn = r.get("name","")
                    if not hn: continue
                    if hn not in hc:
                        cur.execute("INSERT INTO horses(name,age,sex,sire,dam,official_rating) VALUES(%s,%s,%s,%s,%s,%s) ON CONFLICT(name) DO NOTHING RETURNING id",
                            (hn,r.get("age"),r.get("sex"),r.get("sire"),r.get("dam"),r.get("ofr")))
                        rr=cur.fetchone()
                        hc[hn]=rr[0] if rr else cur.execute("SELECT id FROM horses WHERE name=%s",(hn,)) or cur.fetchone()[0]
                        s["horse"]+=1
                    hid=hc[hn]
                    jn=r.get("jockey","")
                    if jn and jn not in jc:
                        cur.execute("INSERT INTO jockeys(name) VALUES(%s) ON CONFLICT(name) DO NOTHING RETURNING id",(jn,))
                        rr=cur.fetchone()
                        jc[jn]=rr[0] if rr else cur.execute("SELECT id FROM jockeys WHERE name=%s",(jn,)) or cur.fetchone()[0]
                        s["jockey"]+=1
                    tn=r.get("trainer","")
                    if tn and tn not in tc:
                        cur.execute("INSERT INTO trainers(name) VALUES(%s) ON CONFLICT(name) DO NOTHING RETURNING id",(tn,))
                        rr=cur.fetchone()
                        tc[tn]=rr[0] if rr else cur.execute("SELECT id FROM trainers WHERE name=%s",(tn,)) or cur.fetchone()[0]
                        s["trainer"]+=1
                    if tn and hid:
                        cur.execute("UPDATE horses SET trainer_id=%s WHERE id=%s AND trainer_id IS NULL",(tc.get(tn),hid))
                    try:
                        wgt=r.get("weight") or r.get("lbs")
                        w=None
                        if wgt:
                            try:
                                w=str(wgt)
                                if "-" in w: p=w.split("-"); wv=int(p[0])*14+int(p[1])
                                else: wv=int(float(w))
                            except: wv=None
                        cur.execute("INSERT INTO runners(race_id,horse_id,jockey_id,draw,weight_lbs,official_rating,form_figures,early_odds) VALUES(%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING",
                            (rid,hid,jc.get(jn),r.get("draw"),w,r.get("ofr"),str(r.get("form",""))[:20],r.get("odds")))
                        s["runner"]+=1
                    except: pass
    conn.commit()
    print(f"DONE {jf}",flush=True)

cur.close(); conn.close()
for k,v in s.items(): print(f"{k}: {v}",flush=True)
print("COMPLETE",flush=True)