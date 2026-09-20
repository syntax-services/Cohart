-- Cohart Production Database Migration: Locations Schema & Expanded Ago-Iwoye Campus Dataset
-- Target: Olabisi Onabanjo University (OOU) Ago-Iwoye Permanent Site (PS)

CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    category VARCHAR(50) NOT NULL DEFAULT 'lecture_hall',
    description TEXT,
    faculty VARCHAR(150),
    department VARCHAR(150),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity INTEGER,
    orientation_tips TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_geo ON public.locations (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_faculty ON public.locations (faculty);
CREATE INDEX IF NOT EXISTS idx_locations_category ON public.locations (category);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

DO $\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'locations' AND policyname = 'Allow public read-only access to campus locations'
    ) THEN
        CREATE POLICY Allow public read-only access to campus locations
            ON public.locations
            FOR SELECT
            TO anon, authenticated
            USING (is_active = true);
    END IF;
END $\$;
