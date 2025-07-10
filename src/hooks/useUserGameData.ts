import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { BrainAreaData } from '@/lib/supabase'

// 기본 뇌 영역 데이터
const defaultBrainAreas: BrainAreaData[] = [
  {
    key: "memory",
    name: "기억력",
    desc: "과거 경험, 정보, 사실을 저장하고 떠올리는 능력",
    level: 1,
    exp: 0,
    expToNext: 10,
    games: [
      { id: 1, name: "카드 뒤집기", rewardExp: 5, stage: 1 },
    ],
  },
  {
    key: "language",
    name: "언어능력",
    desc: "단어, 문장, 언어를 이해하고 표현하는 능력",
    level: 1,
    exp: 0,
    expToNext: 10,
    games: [
      { id: 1, name: "단어 맞추기", rewardExp: 5, stage: 1 },
    ],
  },
  {
    key: "calculation",
    name: "계산력",
    desc: "숫자와 수식을 빠르게 계산하는 능력",
    level: 1,
    exp: 0,
    expToNext: 10,
    games: [
      { id: 1, name: "수식 맞추기", rewardExp: 5, stage: 1 },
    ],
  },
]

export function useUserGameData() {
  const { data: session } = useSession()
  const [brainAreas, setBrainAreas] = useState<BrainAreaData[]>(defaultBrainAreas)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 개발 환경에서 사용할 유저 ID 생성
  const getUserId = () => {
    if (session?.user?.email) {
      return session.user.email
    }
    // 개발 환경에서는 로컬 스토리지에서 유저 ID 가져오기
    if (typeof window !== 'undefined') {
      let devUserId = localStorage.getItem('dev_user_id')
      if (!devUserId) {
        devUserId = `dev_user_${Date.now()}`
        localStorage.setItem('dev_user_id', devUserId)
      }
      return devUserId
    }
    return null
  }

  // 유저 게임 데이터 불러오기
  const loadUserGameData = useCallback(async () => {
    const userId = getUserId()
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user-game?userId=${userId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load user data')
      }

      if (result.data && result.data.length > 0) {
        // 서버에서 가져온 데이터로 뇌 영역 업데이트
        const updatedBrainAreas = defaultBrainAreas.map(area => {
          const userData = result.data.find((item: any) => item.brain_area === area.key)
          if (userData) {
            return {
              ...area,
              level: userData.level,
              exp: userData.exp,
              expToNext: userData.exp_to_next,
              games: area.games.map(game => ({
                ...game,
                stage: userData.current_stage
              }))
            }
          }
          return area
        })
        setBrainAreas(updatedBrainAreas)
      }
    } catch (err) {
      console.error('Error loading user game data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user data')
    } finally {
      setLoading(false)
    }
  }, [])

  // 유저 게임 데이터 저장
  const saveUserGameData = useCallback(async (brainAreaKey: string, level: number, exp: number, expToNext: number, currentStage: number) => {
    const userId = getUserId()
    if (!userId) return

    try {
      const response = await fetch('/api/user-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          brainArea: brainAreaKey,
          level,
          exp,
          expToNext,
          currentStage
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save user data')
      }

      // 로컬 상태 업데이트
      setBrainAreas(prev => prev.map(area => {
        if (area.key === brainAreaKey) {
          return {
            ...area,
            level,
            exp,
            expToNext,
            games: area.games.map(game => ({
              ...game,
              stage: currentStage
            }))
          }
        }
        return area
      }))

      return result
    } catch (err) {
      console.error('Error saving user game data:', err)
      setError(err instanceof Error ? err.message : 'Failed to save user data')
      throw err
    }
  }, [])

  // 게임 성공 시 XP 및 스테이지 업데이트
  const updateGameProgress = useCallback(async (brainAreaKey: string, earnedExp: number, newStage: number) => {
    const currentArea = brainAreas.find(area => area.key === brainAreaKey)
    if (!currentArea) return

    let newExp = currentArea.exp + earnedExp
    let newLevel = currentArea.level
    let newExpToNext = currentArea.expToNext

    // 레벨업 체크
    while (newExp >= newExpToNext) {
      newExp -= newExpToNext
      newLevel += 1
      newExpToNext = Math.floor(newExpToNext * 1.2) // 다음 레벨 경험치 20% 증가
    }

    await saveUserGameData(brainAreaKey, newLevel, newExp, newExpToNext, newStage)
  }, [brainAreas, saveUserGameData])

  // 세션이 변경될 때마다 데이터 불러오기 (개발 환경에서는 항상 로드)
  useEffect(() => {
    loadUserGameData()
  }, [loadUserGameData])

  return {
    brainAreas,
    loading,
    error,
    loadUserGameData,
    saveUserGameData,
    updateGameProgress
  }
} 