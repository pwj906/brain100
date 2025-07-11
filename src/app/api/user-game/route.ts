import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 유저의 모든 뇌 영역 게임 데이터 가져오기
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_game_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user game data:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/user-game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 유저 게임 데이터 저장/업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, brainArea, level, exp, expToNext, currentStage } = body

    if (!userId || !brainArea) {
      return NextResponse.json({ error: 'userId and brainArea are required' }, { status: 400 })
    }

    // 기존 데이터 확인
    const { data: existingData } = await supabase
      .from('user_game_data')
      .select('*')
      .eq('user_id', userId)
      .eq('brain_area', brainArea)
      .single()

    let result
    if (existingData) {
      // 기존 데이터 업데이트
      const { data, error } = await supabase
        .from('user_game_data')
        .update({
          level,
          exp,
          exp_to_next: expToNext,
          current_stage: currentStage,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('brain_area', brainArea)
        .select()

      if (error) {
        console.error('Error updating user game data:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      result = data
    } else {
      // 새 데이터 생성
      const { data, error } = await supabase
        .from('user_game_data')
        .insert({
          user_id: userId,
          brain_area: brainArea,
          level,
          exp,
          exp_to_next: expToNext,
          current_stage: currentStage
        })
        .select()

      if (error) {
        console.error('Error creating user game data:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error in POST /api/user-game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 