-- RLS 완전 비활성화 (개발용 빠른 해결책)
ALTER TABLE user_game_data DISABLE ROW LEVEL SECURITY;

-- 확인용 쿼리
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_game_data'; 