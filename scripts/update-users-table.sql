-- Update users table to add missing columns
-- This script adds the missing columns for user registration

-- Add missing columns to users table
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS birth_date TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Make google_id nullable (since we're using local authentication)
ALTER TABLE IF EXISTS public.users 
ALTER COLUMN google_id DROP NOT NULL;

-- Update RLS policies to allow local authentication
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

-- Create new policies that allow local authentication
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = google_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = google_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = google_id OR auth.uid() IS NULL);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON public.users(password_hash);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position; 