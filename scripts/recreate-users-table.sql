-- 사용자 테이블 재생성 스크립트
-- 이 스크립트는 기존 users 테이블을 안전하게 삭제하고 새로 생성합니다.

-- 1. 기존 데이터 백업 (선택사항)
-- CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. 기존 테이블과 관련된 모든 것을 삭제
DROP TABLE IF EXISTS public.blog_views CASCADE;
DROP TABLE IF EXISTS public.autobiographies CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. 사용자 테이블 새로 생성
CREATE TABLE public.users (
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

-- 4. 자서전 테이블 생성
CREATE TABLE public.autobiographies (
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

-- 5. 블로그 조회수 테이블 생성
CREATE TABLE public.blog_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    autobiography_id UUID REFERENCES public.autobiographies(id) ON DELETE CASCADE,
    viewer_ip TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 인덱스 생성
CREATE INDEX idx_users_google_id ON public.users(google_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_autobiographies_user_id ON public.autobiographies(user_id);
CREATE INDEX idx_autobiographies_slug ON public.autobiographies(slug);
CREATE INDEX idx_autobiographies_is_public ON public.autobiographies(is_public);
CREATE INDEX idx_blog_views_autobiography_id ON public.blog_views(autobiography_id);

-- 7. RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autobiographies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;

-- 8. RLS 정책 생성 (커스텀 인증을 위해 auth.uid() IS NULL 허용)
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = google_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = google_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = google_id OR auth.uid() IS NULL);

-- 9. 자서전 정책
DROP POLICY IF EXISTS "Users can view own autobiographies" ON public.autobiographies;
DROP POLICY IF EXISTS "Anyone can view public autobiographies" ON public.autobiographies;
DROP POLICY IF EXISTS "Users can insert own autobiographies" ON public.autobiographies;
DROP POLICY IF EXISTS "Users can update own autobiographies" ON public.autobiographies;
DROP POLICY IF EXISTS "Users can delete own autobiographies" ON public.autobiographies;

CREATE POLICY "Users can view own autobiographies" ON public.autobiographies
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        ) OR auth.uid() IS NULL
    );

CREATE POLICY "Anyone can view public autobiographies" ON public.autobiographies
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own autobiographies" ON public.autobiographies
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        ) OR auth.uid() IS NULL
    );

CREATE POLICY "Users can update own autobiographies" ON public.autobiographies
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        ) OR auth.uid() IS NULL
    );

CREATE POLICY "Users can delete own autobiographies" ON public.autobiographies
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        ) OR auth.uid() IS NULL
    );

-- 10. 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. 트리거 생성
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_autobiographies_updated_at ON public.autobiographies;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_autobiographies_updated_at
    BEFORE UPDATE ON public.autobiographies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. 테이블 생성 확인
SELECT 
    'users' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
UNION ALL
SELECT 
    'autobiographies' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'autobiographies' AND table_schema = 'public'
UNION ALL
SELECT 
    'blog_views' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'blog_views' AND table_schema = 'public';

-- 13. users 테이블 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position; 