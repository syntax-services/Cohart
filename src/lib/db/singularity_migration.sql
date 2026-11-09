-- ============================================================================
-- COHART & STRING SINGULARITY DATABASE ARCHITECTURE & MIGRATION SCRIPT
-- Unified PostgreSQL / Supabase Schema for Direct VPS (Self-Hosted) Deployment
-- Designed to eliminate $20/mo Cloud vendor fees and unify user identity,
-- academic intelligence, and campus commerce into a single database instance.
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS & TYPES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('customer', 'business', 'student', 'coordinator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'scholar', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.reading_zone_type AS ENUM ('deep_focus', 'active_revision', 'needs_warmup');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. UNIFIED PROFILES TABLE (Merges String Profiles & Cohart Student Profiles)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT,
    avatar_url TEXT,
    user_type public.user_role NOT NULL DEFAULT 'student',
    
    -- Academic / Cohart Fields
    matric_number TEXT,
    institution TEXT DEFAULT 'Olabisi Onabanjo University',
    faculty TEXT,
    department TEXT,
    level TEXT DEFAULT '100L',
    reading_speed_wpm INTEGER DEFAULT 240,
    learning_style TEXT DEFAULT 'visual_analogies',
    reading_zone public.reading_zone_type DEFAULT 'active_revision',
    is_verified_coordinator BOOLEAN DEFAULT false,
    
    -- Shared Financial & Subscription Fields
    wallet_balance NUMERIC(14, 2) DEFAULT 0.00,
    referral_code TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    
    -- Realtime Theme & Appearance Settings (Adopted from String)
    theme_palette TEXT DEFAULT 'deepblue',
    custom_theme_hex TEXT DEFAULT '#3B82F6',
    icon_pack TEXT DEFAULT 'rounded',
    glass_transparency INTEGER DEFAULT 85,
    glass_blur INTEGER DEFAULT 24,
    space_mode_enabled BOOLEAN DEFAULT false,
    
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexing for rapid queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_matric_number ON public.profiles(matric_number);
CREATE INDEX IF NOT EXISTS idx_profiles_institution_dept ON public.profiles(institution, department);

-- ----------------------------------------------------------------------------
-- 3. AUTOMATIC AUTH USER PROFILE SYNC TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        user_type,
        theme_palette,
        institution
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        COALESCE((new.raw_user_meta_data->>'user_type')::public.user_role, 'student'),
        COALESCE(new.raw_user_meta_data->>'theme_palette', 'deepblue'),
        COALESCE(new.raw_user_meta_data->>'institution', 'Olabisi Onabanjo University')
    )
    ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5. CAMPUS LOCATIONS & LECTURE HALLS (Cohart Venue Engine)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    faculty TEXT,
    department TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity INTEGER,
    orientation_tips TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations readable by all authenticated users"
    ON public.locations FOR SELECT
    TO authenticated
    USING (is_active = true);

-- ----------------------------------------------------------------------------
-- 6. SAVED EXPLANATIONS & PERSONAL VAULT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_code TEXT NOT NULL,
    topic TEXT NOT NULL,
    concept_title TEXT NOT NULL,
    explanation_text TEXT NOT NULL,
    key_points TEXT[] DEFAULT '{}',
    exam_tip TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.saved_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own saved vault"
    ON public.saved_explanations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 7. AI CONVERSATIONS & CHAT HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Study Session',
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    workspace_mode TEXT DEFAULT 'academic',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own AI study chats"
    ON public.ai_conversations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 8. UNIFIED EMAIL DISPATCH QUEUE (Resend Integration)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
    resend_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    sent_at TIMESTAMPTZ
);

ALTER TABLE public.email_dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages email dispatch"
    ON public.email_dispatches FOR ALL
    TO service_role
    USING (true);

-- ----------------------------------------------------------------------------
-- 9. STANDALONE VPS DEPLOYMENT DOCKER-COMPOSE REFERENCE
-- (Ready to run on any Ubuntu VPS with Coolify or Docker Compose)
-- ----------------------------------------------------------------------------
/*
# Save as docker-compose.yml on your VPS:
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: cohart_singularity_db
    restart: always
    environment:
      POSTGRES_DB: cohart_singularity
      POSTGRES_USER: cohart_admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./pgdata:/var/lib/postgresql/data
      - ./singularity_migration.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  postgrest:
    image: postgrest/postgrest:v12.0.2
    container_name: cohart_rest_api
    restart: always
    environment:
      PGRST_DB_URI: postgres://cohart_admin:${POSTGRES_PASSWORD}@postgres:5432/cohart_singularity
      PGRST_DB_SCHEMAS: public
      PGRST_DB_ANON_ROLE: web_anon
      PGRST_JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3001:3000"
    depends_on:
      - postgres
*/
