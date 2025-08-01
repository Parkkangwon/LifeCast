-- 간단한 users 테이블 수정 스크립트
-- 이 스크립트는 기존 테이블을 수정하거나 새로 생성합니다.

-- 1. 현재 테이블 상태 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 기존 테이블이 있다면 삭제 (주의: 데이터 손실)
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. 새로운 users 테이블 생성 (최소 필수 컬럼만)
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT,
    birth_date TEXT,
    gender TEXT,
    location TEXT,
    nationality TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. 기본 정책 생성 (모든 작업 허용)
DROP POLICY IF EXISTS "Allow all operations" ON public.users;
CREATE POLICY "Allow all operations" ON public.users
    FOR ALL USING (true);

-- 6. 테스트 데이터 삽입 (선택사항)
INSERT INTO public.users (email, name, password_hash) 
VALUES 
    ('test@example.com', '테스트 사용자', 'test_hash'),
    ('bakj@example.com', '박지은', 'test_hash');

-- 7. 생성된 테이블 확인
SELECT 
    'users' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- 8. 컬럼 목록 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. 테스트 데이터 확인
SELECT * FROM public.users; 