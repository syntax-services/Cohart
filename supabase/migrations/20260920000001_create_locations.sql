-- Cohart Production Database Migration: Locations Schema
-- Target: OOU Ago-Iwoye Main Campus Locations & Navigation Layer

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    category VARCHAR(50) NOT NULL DEFAULT 'lecture_hall', -- lecture_hall, faculty, library, admin, lab, amenity
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

-- 2. Indexes for geo queries and search
CREATE INDEX IF NOT EXISTS idx_locations_geo ON public.locations (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_faculty ON public.locations (faculty);
CREATE INDEX IF NOT EXISTS idx_locations_category ON public.locations (category);

-- 3. Row Level Security (RLS)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Allow read-only access for all authenticated and anonymous student sessions
CREATE POLICY "Allow public read-only access to campus locations"
    ON public.locations
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- 4. Initial Seed Data: Olabisi Onabanjo University (OOU) Ago-Iwoye Permanent Site
-- Tailored for Economics & Social and Management Sciences (SMS) Students
INSERT INTO public.locations (name, code, category, description, faculty, department, latitude, longitude, capacity, orientation_tips)
VALUES
(
    'SMS Lecture Theatre (SLR 1)',
    'SMS-LT1',
    'lecture_hall',
    'Primary lecture theatre for large undergraduate Economics and Accounting cohorts. Equipped with dual projection and tiered seating.',
    'Faculty of Social and Management Sciences',
    'Economics',
    6.92295,
    3.87180,
    550,
    'Located on the eastern wing of the SMS Complex ground floor. Use the central walkway facing the departmental quad.'
),
(
    'Economics Departmental Hall (ECO-H1)',
    'ECO-H1',
    'lecture_hall',
    'Dedicated lecture and seminar hall for Economics 200L to 400L core courses (Macroeconomics, Econometrics, Quantitative Analysis).',
    'Faculty of Social and Management Sciences',
    'Economics',
    6.92320,
    3.87155,
    220,
    'Directly adjacent to the Head of Department (HOD) office corridor on the 1st floor.'
),
(
    'Otunba Gbenga Daniel (OGD) Lecture Theatre',
    'OGD-LT',
    'lecture_hall',
    'Major multidisciplinary lecture theatre hosting university-wide general studies (GNS), joint faculty electives, and symposiums.',
    'Central Campus',
    'General Studies',
    6.92180,
    3.87250,
    1200,
    'South of the Senate roundabout. Arrive 15 minutes early for general courses to secure front-tier audio clarity.'
),
(
    'Education Trust Fund (ETF) Complex',
    'ETF-HALL',
    'lecture_hall',
    'Spacious lecture complex used for inter-departmental tutorials, economics statistics courses, and continuous assessments.',
    'Faculty of Social and Management Sciences',
    'Economics / Management',
    6.92380,
    3.87110,
    400,
    'Situated north of the SMS block. Shaded outdoor benches available nearby for pre-class revision.'
),
(
    'OOU Main Campus Library (Ago-Iwoye)',
    'OOU-LIB',
    'library',
    'Central university repository featuring the Social Sciences reference section, Economics academic journals, and quiet e-library cubicles.',
    'University Academic Core',
    'Library Services',
    6.92120,
    3.87080,
    800,
    'Library card registration is required at the front desk. E-learning hub is on the upper level with power backup.'
),
(
    'Faculty of Social Sciences Secretariat',
    'SMS-SEC',
    'faculty',
    'Administrative Dean’s office, Faculty Officer, Sub-Dean, and student affairs desk for course registration sign-offs and inquiries.',
    'Faculty of Social and Management Sciences',
    'Administration',
    6.92305,
    3.87140,
    150,
    'Ground floor administrative wing. Notice boards outside display official lecture timetables and exam allocations.'
),
(
    'OOU ICT & CBT Testing Centre',
    'ICT-CBT',
    'lab',
    'Central computer laboratory for computer-based testing, portal registration, matriculation verification, and computational coursework.',
    'Information Technology Services',
    'ICT Directorate',
    6.92050,
    3.87320,
    600,
    'Ensure you have your student matriculation slip and biometric verification ready at the entry gate.'
),
(
    'Senate Building & Student Affairs Complex',
    'SENATE-ADM',
    'admin',
    'The university landmark administrative tower housing the Vice Chancellor’s office, Registrar, Bursary, and Academic Affairs.',
    'University Administration',
    'Central Registry',
    6.91980,
    3.87190,
    300,
    'Front fountain and roundabout serve as the main campus transit and shuttle drop-off point.'
)
ON CONFLICT DO NOTHING;
