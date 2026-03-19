-- ============================================================
-- Striking Showcase — Row-Level Security Policies
-- Run ONCE after Supabase schema is created.
-- ============================================================

-- Helper: get the role from the users table for the currently authenticated user.
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM "User" WHERE id = auth.uid()::text;
$$;

-- ─────────────────────────────────────────────────────────────
-- profiles (AthleteProfile)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "AthleteProfile" ENABLE ROW LEVEL SECURITY;

-- Athletes read/write own row
CREATE POLICY athlete_own_profile ON "AthleteProfile"
  FOR ALL USING ("userId" = auth.uid()::text);

-- Coaches can read all public profiles
CREATE POLICY coach_read_public_profiles ON "AthleteProfile"
  FOR SELECT USING (
    "profileVisibility" = 'PUBLIC'
    AND public.get_user_role() = 'COACH'
  );

-- Public (anon) can read public profiles
CREATE POLICY anon_read_public_profiles ON "AthleteProfile"
  FOR SELECT USING ("profileVisibility" = 'PUBLIC');

-- ─────────────────────────────────────────────────────────────
-- media_items (Media)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "Media" ENABLE ROW LEVEL SECURITY;

-- Athletes manage own media
CREATE POLICY athlete_own_media ON "Media"
  FOR ALL USING (
    "athleteId" IN (SELECT id FROM "AthleteProfile" WHERE "userId" = auth.uid()::text)
  );

-- Public can see highlighted/public media
CREATE POLICY anon_read_public_media ON "Media"
  FOR SELECT USING ("isPublic" = true);

-- Coaches can read all media
CREATE POLICY coach_read_all_media ON "Media"
  FOR SELECT USING (public.get_user_role() = 'COACH');

-- ─────────────────────────────────────────────────────────────
-- messages (Message) — IMMUTABLE: insert + select only
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Sender can insert
CREATE POLICY message_insert ON "Message"
  FOR INSERT WITH CHECK ("senderId" = auth.uid()::text);

-- Both participants can read thread messages
CREATE POLICY message_read ON "Message"
  FOR SELECT USING (
    "threadId" IN (
      SELECT id FROM "MessageThread"
      WHERE "athleteId" IN (SELECT id FROM "AthleteProfile" WHERE "userId" = auth.uid()::text)
         OR "coachId" IN (SELECT id FROM "CoachProfile" WHERE "userId" = auth.uid()::text)
    )
  );

-- No UPDATE or DELETE — messages are immutable

-- ─────────────────────────────────────────────────────────────
-- message_threads (MessageThread)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "MessageThread" ENABLE ROW LEVEL SECURITY;

CREATE POLICY thread_participant_access ON "MessageThread"
  FOR SELECT USING (
    "athleteId" IN (SELECT id FROM "AthleteProfile" WHERE "userId" = auth.uid()::text)
    OR "coachId" IN (SELECT id FROM "CoachProfile" WHERE "userId" = auth.uid()::text)
  );

-- Only coaches can create threads
CREATE POLICY coach_create_thread ON "MessageThread"
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'COACH'
    AND "coachId" IN (SELECT id FROM "CoachProfile" WHERE "userId" = auth.uid()::text)
  );

-- ─────────────────────────────────────────────────────────────
-- recruiting_board (Watchlist — maps to spec recruiting_board)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "Watchlist" ENABLE ROW LEVEL SECURITY;

-- Coach manages own watchlist rows ONLY
CREATE POLICY coach_own_watchlist ON "Watchlist"
  FOR ALL USING (
    "coachId" IN (SELECT id FROM "CoachProfile" WHERE "userId" = auth.uid()::text)
  );

-- Athletes CANNOT read the watchlist/recruiting board — ever
-- (no SELECT policy for athletes)

-- Admin can read all
CREATE POLICY admin_read_all_watchlist ON "Watchlist"
  FOR SELECT USING (public.get_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────────────────────
-- subscriptions (Subscription) — NEVER writable from client
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

-- User can read own subscription
CREATE POLICY user_read_own_sub ON "Subscription"
  FOR SELECT USING ("userId" = auth.uid()::text);

-- Admin can read all
CREATE POLICY admin_read_all_subs ON "Subscription"
  FOR SELECT USING (public.get_user_role() = 'ADMIN');

-- No INSERT/UPDATE/DELETE from client — only Stripe webhook via service role

-- ─────────────────────────────────────────────────────────────
-- coach_profiles (CoachProfile)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "CoachProfile" ENABLE ROW LEVEL SECURITY;

-- Coach manages own row
CREATE POLICY coach_own_profile ON "CoachProfile"
  FOR ALL USING ("userId" = auth.uid()::text);

-- Public read
CREATE POLICY anon_read_coach_profiles ON "CoachProfile"
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────
-- profile_views (ProfileView)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "ProfileView" ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a profile view
CREATE POLICY insert_profile_view ON "ProfileView"
  FOR INSERT WITH CHECK (true);

-- Athlete reads own views
CREATE POLICY athlete_read_own_views ON "ProfileView"
  FOR SELECT USING (
    "athleteId" IN (SELECT id FROM "AthleteProfile" WHERE "userId" = auth.uid()::text)
  );

-- ─────────────────────────────────────────────────────────────
-- family_access (FamilyAccess)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "FamilyAccess" ENABLE ROW LEVEL SECURITY;

-- Athlete manages family access
CREATE POLICY athlete_manage_family ON "FamilyAccess"
  FOR ALL USING (
    "athleteId" IN (SELECT id FROM "AthleteProfile" WHERE "userId" = auth.uid()::text)
  );

-- Family member can read own row
CREATE POLICY family_read_own ON "FamilyAccess"
  FOR SELECT USING ("parentId" = auth.uid()::text);

-- ─────────────────────────────────────────────────────────────
-- tournaments (Tournament)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "Tournament" ENABLE ROW LEVEL SECURITY;

-- Athletes manage own
CREATE POLICY athlete_own_tournaments ON "Tournament"
  FOR ALL USING (
    "athleteId" IN (SELECT id FROM "AthleteProfile" WHERE "userId" = auth.uid()::text)
  );

-- Public read
CREATE POLICY anon_read_tournaments ON "Tournament"
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────
-- ball_arsenal (BallArsenal)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "BallArsenal" ENABLE ROW LEVEL SECURITY;

-- Athletes manage own
CREATE POLICY athlete_own_arsenal ON "BallArsenal"
  FOR ALL USING (
    "athleteId" IN (SELECT id FROM "AthleteProfile" WHERE "userId" = auth.uid()::text)
  );

-- Public read
CREATE POLICY anon_read_arsenal ON "BallArsenal"
  FOR SELECT USING (true);
