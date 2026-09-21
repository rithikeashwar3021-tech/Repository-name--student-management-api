-- Enable pgcrypto extension to support gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    roll_number TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    year INT NOT NULL CHECK (year >= 1 AND year <= 4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- For standalone backend APIs using the anon key, disable RLS or allow full access
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Comment on table and columns for documentation
COMMENT ON TABLE students IS 'Stores student management records';
COMMENT ON COLUMN students.id IS 'Unique UUID identifier';
COMMENT ON COLUMN students.name IS 'Full name of the student';
COMMENT ON COLUMN students.roll_number IS 'Unique institutional roll number';
COMMENT ON COLUMN students.department IS 'Academic department';
COMMENT ON COLUMN students.year IS 'Current study year (1 to 4)';
