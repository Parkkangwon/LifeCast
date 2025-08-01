-- 최소한의 users 테이블 생성 스크립트
-- 이 스크립트는 가장 기본적인 users 테이블만 생성합니다.

-- 1. 기존 테이블 삭제 (주의: 모든 데이터가 삭제됩니다)
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. 최소한의 users 테이블 생성
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    password_hash TEXT,
    birth_date TEXT,
    gender TEXT,
    location TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. 모든 작업 허용 정책
DROP POLICY IF EXISTS "Allow all operations" ON public.users;
CREATE POLICY "Allow all operations" ON public.users
    FOR ALL USING (true);

-- 5. 테스트 데이터 삽입
INSERT INTO public.users (name, password_hash, birth_date, gender, location) 
VALUES 
    ('박지은', 'test_hash', '19900101', '여성', '서울'),
    ('테스트 사용자', 'test_hash', '19900101', '기타', '테스트');

-- 6. 생성 확인
SELECT 
    'users' as table_name,
    COUNT(*) as row_count
FROM public.users;

-- 7. 컬럼 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position; 