-- Migrate data from profiles table to users table
-- This script will move all user data from profiles to users table

-- First, let's check what data exists in both tables
SELECT 'profiles' as table_name, COUNT(*) as user_count FROM profiles
UNION ALL
SELECT 'users' as table_name, COUNT(*) as user_count FROM users;

-- Check the structure of both tables
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Migrate data from profiles to users (only if not already exists)
INSERT INTO users (id, name, email, password_hash, birth_date, gender, location, nationality, is_public, created_at)
SELECT 
    p.id,
    p.name,
    p.email,
    p.password_hash,
    p.birth_date,
    p.gender,
    p.location,
    p.nationality,
    COALESCE(p.is_public, false) as is_public,
    COALESCE(p.created_at, NOW()) as created_at
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.name = p.name OR u.email = p.email
);

-- Verify the migration
SELECT 'After migration - users table' as info, COUNT(*) as user_count FROM users;

-- Show all users in the users table
SELECT id, name, email, created_at FROM users ORDER BY created_at;

-- Optional: Drop the profiles table after confirming migration is successful
-- DROP TABLE IF EXISTS profiles CASCADE; 