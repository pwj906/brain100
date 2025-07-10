import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 유저 게임 데이터 타입 정의
export interface UserGameData {
  id?: string
  user_id: string
  brain_area: string
  level: number
  exp: number
  exp_to_next: number
  current_stage: number
  updated_at?: string
  created_at?: string
}

// 뇌 영역별 게임 데이터 타입
export interface BrainAreaData {
  key: string
  name: string
  desc: string
  level: number
  exp: number
  expToNext: number
  games: {
    id: number
    name: string
    rewardExp: number
    stage: number
  }[]
} 