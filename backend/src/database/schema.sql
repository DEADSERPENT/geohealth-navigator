-- Enable PostGIS Extension (should be first)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create the new Organizations table (independent)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- government, ngo, hospital, etc.
    location GEOMETRY(POINT, 4326),
    contact_info JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create the new Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    organization_id UUID, -- This could optionally reference organizations(id)
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Create the original Facilities table
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location GEOMETRY(POINT, 4326),
    address TEXT,
    contact_person TEXT,
    capacity_total INTEGER,
    available_beds INTEGER,
    last_updated_at TIMESTAMP DEFAULT NOW(),
    services JSONB,
    provider_metadata JSONB,
    tags TEXT[]
);

-- Create the spatial index for the Facilities table
CREATE INDEX idx_facilities_location ON facilities USING GIST (location);

-- Create the Resource Snapshots table with the new reporter_id foreign key
CREATE TABLE resource_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id),
    snapshot_time TIMESTAMP DEFAULT NOW(),
    available_beds INTEGER,
    available_icu INTEGER,
    oxygen_liters INTEGER,
    reporter_id UUID REFERENCES users(id), -- Foreign key added
    source TEXT
);

-- Create the Incidents table with the new reporter_id foreign key
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_age_range TEXT,
    gender TEXT,
    disease_code TEXT,
    reported_at TIMESTAMP DEFAULT NOW(),
    location GEOMETRY(POINT, 4326),
    reporter_id UUID REFERENCES users(id) -- Foreign key added
);

-- Create the new Audit Logs table (depends on users)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    timestamp TIMESTAMP DEFAULT NOW()
);