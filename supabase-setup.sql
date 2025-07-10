-- 유저 게임 데이터 테이블 생성
CREATE TABLE IF NOT EXISTS user_game_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  brain_area TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  exp_to_next INTEGER DEFAULT 10,
  current_stage INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, brain_area)
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_game_data_user_id ON user_game_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_data_brain_area ON user_game_data(brain_area);

-- RLS (Row Level Security) 활성화
ALTER TABLE user_game_data ENABLE ROW LEVEL SECURITY;

-- 기존 RLS 정책 삭제 (개발 환경 지원을 위해)
DROP POLICY IF EXISTS "Users can view own game data" ON user_game_data;
DROP POLICY IF EXISTS "Users can insert own game data" ON user_game_data;
DROP POLICY IF EXISTS "Users can update own game data" ON user_game_data;

-- 새로운 RLS 정책 생성 (개발 환경 지원)
CREATE POLICY "Users can view own game data" ON user_game_data
  FOR SELECT USING (
    auth.jwt() ->> 'email' = user_id OR 
    user_id LIKE 'dev_user_%'
  );

CREATE POLICY "Users can insert own game data" ON user_game_data
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = user_id OR 
    user_id LIKE 'dev_user_%'
  );

CREATE POLICY "Users can update own game data" ON user_game_data
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = user_id OR 
    user_id LIKE 'dev_user_%'
  );

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_user_game_data_updated_at 
  BEFORE UPDATE ON user_game_data 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 