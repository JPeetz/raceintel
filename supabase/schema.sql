-- ============================================================
-- RaceIntel — Complete Database Schema
-- Compatible with Supabase PostgreSQL (pgvector optional)
-- ============================================================

-- ── Racing Data ────────────────────────────────────────────────────

CREATE TABLE racecourses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT GENERATED ALWAYS AS (lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))) STORED,
  country TEXT NOT NULL CHECK (country IN ('GB', 'IE')),
  course_type TEXT CHECK (course_type IN ('flat', 'jumps', 'aw', 'dual')),
  region TEXT,
  surface TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  racecourse_id UUID NOT NULL REFERENCES racecourses(id),
  off_time TIMESTAMPTZ NOT NULL,
  name TEXT NOT NULL,
  distance_furlongs NUMERIC,
  class INT,
  going TEXT,
  race_type TEXT CHECK (race_type IN ('flat', 'jumps', 'aw')),
  age_restriction TEXT,
  sex_restriction TEXT,
  purse TEXT,
  number_of_runners INT,
  region TEXT,
  racing_api_id TEXT UNIQUE,
  status TEXT DEFAULT 'declared' CHECK (status IN ('declared', 'open', 'closed', 'resulted', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_races_off_time ON races(off_time);
CREATE INDEX idx_races_racecourse ON races(racecourse_id);

CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT GENERATED ALWAYS AS (lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))) STORED,
  location TEXT,
  racing_api_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jockeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT GENERATED ALWAYS AS (lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))) STORED,
  claiming_weight INT,
  racing_api_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT GENERATED ALWAYS AS (lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))) STORED,
  trainer_id UUID REFERENCES trainers(id),
  sire TEXT,
  dam TEXT,
  age INT,
  sex TEXT CHECK (sex IN ('colt', 'filly', 'gelding', 'horse', 'mare', 'stallion', 'rig')),
  colour TEXT,
  official_rating INT,
  racing_api_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE runners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id),
  horse_id UUID NOT NULL REFERENCES horses(id),
  jockey_id UUID REFERENCES jockeys(id),
  draw INT,
  weight_lbs INT,
  official_rating INT,
  cloth_number INT,
  early_odds NUMERIC,
  live_odds NUMERIC,
  odds_timestamp TIMESTAMPTZ,
  non_runner BOOLEAN DEFAULT FALSE,
  form_figures TEXT,
  racing_api_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_runners_race ON runners(race_id);
CREATE INDEX idx_runners_horse ON runners(horse_id);

CREATE TABLE race_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id),
  horse_id UUID NOT NULL REFERENCES horses(id),
  position INT,
  beaten_distance TEXT,
  starting_price NUMERIC,
  finish_time TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_results_race ON race_results(race_id);

CREATE TABLE horse_form (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id UUID NOT NULL REFERENCES horses(id),
  race_id UUID REFERENCES races(id),
  date DATE NOT NULL,
  course TEXT,
  distance TEXT,
  going TEXT,
  class INT,
  position INT,
  runners INT,
  weight_lbs INT,
  odds NUMERIC,
  jockey TEXT,
  comment TEXT,
  rating INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_form_horse ON horse_form(horse_id);
CREATE INDEX idx_form_date ON horse_form(date);

-- ── AI / Analysis ──────────────────────────────────────────────────

CREATE TABLE gg_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id),
  horse_id UUID REFERENCES horses(id),
  horse_name TEXT,
  score NUMERIC CHECK (score >= 0 AND score <= 100),
  form_score NUMERIC,
  class_score NUMERIC,
  pace_score NUMERIC,
  trainer_score NUMERIC,
  jockey_score NUMERIC,
  draw_score NUMERIC,
  going_score NUMERIC,
  course_score NUMERIC,
  distance_score NUMERIC,
  weight_score NUMERIC,
  age_score NUMERIC,
  market_score NUMERIC,
  head_to_head_score NUMERIC,
  reasoning TEXT,
  confidence TEXT CHECK (confidence IN ('High', 'Medium', 'Low')),
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(race_id, horse_name)
);
CREATE INDEX idx_gg_race ON gg_scores(race_id);

CREATE TABLE daily_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  race_id UUID NOT NULL REFERENCES races(id),
  top_selection TEXT,
  main_danger TEXT,
  value_pick TEXT,
  outsider_watch TEXT,
  confidence TEXT CHECK (confidence IN ('High', 'Medium', 'Low')),
  reasoning TEXT,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, race_id)
);

CREATE TABLE pace_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id),
  horse_name TEXT NOT NULL,
  predicted_position TEXT CHECK (predicted_position IN ('front-runner', 'prominent', 'mid-pack', 'held-up')),
  early_pace_score INT CHECK (early_pace_score BETWEEN 1 AND 10),
  late_pace_score INT CHECK (late_pace_score BETWEEN 1 AND 10),
  clash_detected BOOLEAN DEFAULT FALSE,
  scenario_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(race_id, horse_name)
);

CREATE TABLE course_biases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  racecourse_id UUID NOT NULL REFERENCES racecourses(id),
  distance TEXT,
  going TEXT,
  draw_bias JSONB,
  pace_bias TEXT,
  sample_size INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(racecourse_id, distance, going)
);

-- ── Validation Tracking (pre-launch accuracy measurement) ──────────

CREATE TABLE validation_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  race_id UUID REFERENCES races(id),
  race_name TEXT,
  off_time TIMESTAMPTZ,
  top_pick_name TEXT,
  top_pick_odds NUMERIC,
  top_pick_gg_score NUMERIC,
  main_danger_name TEXT,
  main_danger_odds NUMERIC,
  value_pick_name TEXT,
  value_pick_odds NUMERIC,
  outsider_watch_name TEXT,
  outsider_watch_odds NUMERIC,
  -- Results (filled after race)
  winner_name TEXT,
  winner_odds NUMERIC,
  top_pick_position INT,
  main_danger_position INT,
  value_pick_position INT,
  outsider_watch_position INT,
  top_pick_won BOOLEAN,
  top_pick_placed BOOLEAN,
  main_danger_won BOOLEAN,
  main_danger_placed BOOLEAN,
  value_pick_won BOOLEAN,
  value_pick_placed BOOLEAN,
  outsider_won BOOLEAN,
  outsider_placed BOOLEAN,
  any_pick_won BOOLEAN,
  any_pick_placed BOOLEAN,
  value_pick_return NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE validation_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_races INT,
  races_with_picks INT,
  top_pick_wins INT,
  top_pick_places INT,
  main_danger_wins INT,
  main_danger_places INT,
  value_pick_wins INT,
  value_pick_places INT,
  outsider_wins INT,
  outsider_places INT,
  any_pick_wins INT,
  any_pick_places INT,
  top_pick_win_rate NUMERIC,
  top_pick_place_rate NUMERIC,
  top2_place_rate NUMERIC,
  value_pick_roi NUMERIC,
  cumulative_roi NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Users ──────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  date_of_birth DATE,
  age_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  plan TEXT NOT NULL CHECK (plan IN ('pro_monthly', 'pro_annual')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'inactive')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  is_trialing BOOLEAN DEFAULT FALSE,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_subs_user ON user_subscriptions(user_id);

CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  follow_type TEXT NOT NULL CHECK (follow_type IN ('horse', 'trainer', 'jockey')),
  entity_id UUID NOT NULL,
  entity_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, follow_type, entity_id)
);

CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT,
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notif_user ON user_notifications(user_id);

CREATE TABLE user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  device_id TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(token)
);

CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id),
  race_alerts JSONB DEFAULT '{"enabled":true,"channels":{"push":true,"email":false}}',
  results JSONB DEFAULT '{"enabled":true,"channels":{"push":true,"email":false}}',
  ai_insights JSONB DEFAULT '{"enabled":true,"channels":{"push":true,"email":false}}',
  stables JSONB DEFAULT '{"enabled":true,"channels":{"push":true,"email":true}}',
  betting JSONB DEFAULT '{"enabled":true,"channels":{"push":false,"email":false}}',
  marketing JSONB DEFAULT '{"enabled":false,"channels":{"push":false,"email":false}}',
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  timezone TEXT DEFAULT 'Europe/London',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ── RLS Policies ───────────────────────────────────────────────────

-- Racing data: public read
ALTER TABLE racecourses ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jockeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE runners ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE horse_form ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read racecourses" ON racecourses FOR SELECT USING (true);
CREATE POLICY "Public can read races" ON races FOR SELECT USING (true);
CREATE POLICY "Public can read horses" ON horses FOR SELECT USING (true);
CREATE POLICY "Public can read trainers" ON trainers FOR SELECT USING (true);
CREATE POLICY "Public can read jockeys" ON jockeys FOR SELECT USING (true);
CREATE POLICY "Public can read runners" ON runners FOR SELECT USING (true);
CREATE POLICY "Public can read race_results" ON race_results FOR SELECT USING (true);
CREATE POLICY "Public can read horse_form" ON horse_form FOR SELECT USING (true);

-- AI data: authenticated users with active/trialing subscription
ALTER TABLE gg_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE pace_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_biases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscribers can read gg_scores" ON gg_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_id = auth.uid()
      AND status IN ('active', 'trialing')
    )
  );

CREATE POLICY "Subscribers can read daily_insights" ON daily_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_id = auth.uid()
      AND status IN ('active', 'trialing')
    )
  );

-- User data: owner only
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own their subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users own their follows" ON user_follows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_id);