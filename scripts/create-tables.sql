-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.autobiographies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_views ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT,
    birth_date TEXT,
    gender TEXT,
    location TEXT,
    nationality TEXT,
    avatar_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create autobiographies table
CREATE TABLE IF NOT EXISTS public.autobiographies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '나의 이야기',
    description TEXT NOT NULL DEFAULT 'AI와 함께 써내려간 인생의 순간들',
    is_public BOOLEAN DEFAULT FALSE,
    slug TEXT UNIQUE,
    sections JSONB NOT NULL DEFAULT '[]',
    generated_images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_views table for tracking views
CREATE TABLE IF NOT EXISTS public.blog_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    autobiography_id UUID REFERENCES public.autobiographies(id) ON DELETE CASCADE,
    viewer_ip TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_autobiographies_user_id ON public.autobiographies(user_id);
CREATE INDEX IF NOT EXISTS idx_autobiographies_slug ON public.autobiographies(slug);
CREATE INDEX IF NOT EXISTS idx_autobiographies_is_public ON public.autobiographies(is_public);
CREATE INDEX IF NOT EXISTS idx_blog_views_autobiography_id ON public.blog_views(autobiography_id);

-- RLS Policies

-- Users can only see and edit their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = google_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = google_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = google_id OR auth.uid() IS NULL);

-- Autobiographies policies
CREATE POLICY "Users can view own autobiographies" ON public.autobiographies
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

CREATE POLICY "Anyone can view public autobiographies" ON public.autobiographies
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own autobiographies" ON public.autobiographies
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own autobiographies" ON public.autobiographies
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own autobiographies" ON public.autobiographies
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

-- Anonymous users can insert autobiographies with author_name (user_id is NULL)
CREATE POLICY "Anonymous can insert autobiographies with author_name" ON public.autobiographies
    FOR INSERT WITH CHECK (
        user_id IS NULL AND author_name IS NOT NULL AND author_name <> ''
    );
-- Anonymous users can select their own autobiographies by author_name and password
CREATE POLICY "Anonymous can select own autobiographies" ON public.autobiographies
    FOR SELECT USING (
        user_id IS NULL AND author_name IS NOT NULL AND author_name <> ''
    );

-- Blog views policies
CREATE POLICY "Anyone can insert blog views" ON public.blog_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view blog views for public autobiographies" ON public.blog_views
    FOR SELECT USING (
        autobiography_id IN (
            SELECT id FROM public.autobiographies WHERE is_public = true
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_autobiographies_updated_at ON public.autobiographies;
CREATE TRIGGER update_autobiographies_updated_at
    BEFORE UPDATE ON public.autobiographies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add missing columns for anonymous support
ALTER TABLE IF EXISTS public.autobiographies ADD COLUMN IF NOT EXISTS author_name text;
ALTER TABLE IF EXISTS public.autobiographies ADD COLUMN IF NOT EXISTS background_theme text;
ALTER TABLE IF EXISTS public.autobiographies ADD COLUMN IF NOT EXISTS password text;
